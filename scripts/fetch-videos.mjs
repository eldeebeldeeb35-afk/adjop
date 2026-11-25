// Pulls the channel's public YouTube feed and merges new uploads into
// content/videos.json, so new episodes and shorts reach the site without a
// manual edit. Runs in the deploy workflow before `next build`.
//
// - Episodes: titles that mention «لسه في رجوع» with an episode number
//   ("ح2", "الحلقة 2"), and no #shorts tag.
// - Shorts: titles tagged #shorts.
// The feed only lists the latest ~15 uploads, so existing entries are kept.
// If the feed can't be fetched, the file is left as it is and the build goes on.
import { readFile, writeFile } from "node:fs/promises";

const CHANNEL_ID = "UCbmQG5ZloQge0MkvPRsVxRw";
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const FILE = new URL("../content/videos.json", import.meta.url);

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const arabicToLatin = (s) => s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

export function parseFeed(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
    id: e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1],
    title: decode(e.match(/<title>([^<]*)<\/title>/)?.[1] ?? "").trim(),
    published: e.match(/<published>([^<]+)<\/published>/)?.[1],
  })).filter((v) => v.id && v.title);
}

// "عنوان الحلقة | لسه في رجوع ح2" -> "عنوان الحلقة"; drops hashtags and emoji
function cleanTitle(t) {
  return t
    .split("|")[0]
    .replace(/#\S+/g, "")
    .replace(/[\p{Extended_Pictographic}\u{FE0F}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function classify(v) {
  if (/#shorts?\b/i.test(v.title)) return { kind: "short", id: v.id, title: cleanTitle(v.title), published: v.published };
  const t = arabicToLatin(v.title);
  const n = t.match(/(?:^|[^\p{L}])(?:ح|الحلقة)\s*(\d+)/u)?.[1];
  if (n && /لسه\s*في\s*رجوع/.test(t)) {
    return { kind: "episode", n: Number(n), videoId: v.id, title: cleanTitle(v.title), published: v.published };
  }
  return null;
}

export function merge(data, feed) {
  const episodes = [...data.episodes];
  const shorts = [...data.shorts];
  for (const v of feed) {
    const c = classify(v);
    if (!c) continue;
    if (c.kind === "episode") {
      const i = episodes.findIndex((e) => e.n === c.n || e.videoId === c.videoId);
      const { kind, ...ep } = c;
      if (i === -1) episodes.push(ep);
      else episodes[i] = { ...episodes[i], videoId: ep.videoId, published: ep.published };
    } else if (!shorts.some((s) => s.id === c.id)) {
      const { kind, ...sh } = c;
      shorts.push(sh);
    }
  }
  episodes.sort((a, b) => a.n - b.n);
  shorts.sort((a, b) => (b.published ?? "").localeCompare(a.published ?? ""));
  return { episodes, shorts };
}

async function main() {
  const data = JSON.parse(await readFile(FILE, "utf8"));
  let xml;
  try {
    const res = await fetch(FEED, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (err) {
    console.warn(`videos: feed not reachable (${err.message}); keeping content/videos.json as is`);
    return;
  }
  const next = merge(data, parseFeed(xml));
  const added =
    next.episodes.length - data.episodes.length + (next.shorts.length - data.shorts.length);
  await writeFile(FILE, JSON.stringify(next, null, 2) + "\n");
  console.log(`videos: ${next.episodes.length} episodes, ${next.shorts.length} shorts (${added} new)`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
