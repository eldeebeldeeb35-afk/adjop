"use client";

import { useMemo, useState } from "react";
import { journey, series, shorts, links, whatsappShare } from "@/content/site";
import { LiteYouTube, Reveal, SectionLabel } from "@/components/ui";

const DAY = 86_400_000;
const fmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long" });
const ar = (n: number) => n.toLocaleString("ar-EG");
const arDigits = (t: string) => t.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
const watch = (id: string) => `https://www.youtube.com/watch?v=${id}`;

function ShareButton({ title, url, label = "ابعتها لحد محتاج يسمعها" }: { title: string; url: string; label?: string }) {
  return (
    <a
      href={whatsappShare(title, url)}
      target="_blank"
      rel="noopener"
      className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-sm text-gold transition hover:border-gold hover:bg-gold/10"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.2 1.1 2.2 1.4 2.5 1.6.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3.1.2.1.8-.2 1.5Z" /></svg>
      {label}
    </a>
  );
}

function useEpisodes() {
  return useMemo(() => {
    const start = new Date(series.firstEpisode + "T00:00:00");
    const today = new Date();
    return Array.from({ length: series.total }, (_, i) => {
      const meta = series.episodes.find((e) => e.n === i + 1);
      const date = new Date(start.getTime() + i * series.everyDays * DAY);
      return {
        n: i + 1,
        title: meta?.title,
        videoId: meta?.videoId,
        duration: meta?.duration,
        date,
        out: !!meta?.videoId,
        due: date <= today,
      };
    });
  }, []);
}

export default function Journey() {
  const episodes = useEpisodes();
  const released = episodes.filter((e) => e.out);
  const [current, setCurrent] = useState(released[released.length - 1]);

  return (
    <section id="journey" className="cinema-bg grain relative overflow-hidden border-t border-line/60 py-28 md:py-40">
      <div className="relative mx-auto max-w-[1240px] px-6">
        <Reveal>
          <SectionLabel index="٠٢" ar="رحلتي" en="My Creative Journey" />
        </Reveal>

        {/* title card */}
        <div className="mx-auto mt-16 max-w-3xl text-center">
          <Reveal>
            <p className="text-sm tracking-[0.3em] text-gold/80">سلسلة من {ar(series.total)} حلقة</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="gold-text mt-4 font-display text-[clamp(3.4rem,11vw,8rem)] leading-[1.05]">{journey.title}</h2>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-8 text-xl leading-loose text-cream/90 md:text-2xl">{journey.intro}</p>
          </Reveal>
        </div>

        {/* philosophy */}
        <div className="mt-24 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {journey.philosophy.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1} className="bg-night/95 p-8">
              <span className="block h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_12px_#d9ae5f]" />
              <h3 className="mt-5 font-display text-2xl text-cream">{p.title}</h3>
              <p className="mt-2 text-sand">{p.text}</p>
            </Reveal>
          ))}
        </div>

        {/* player + episode list */}
        <div id="episodes" className="mt-28 scroll-mt-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <h3 className="font-display text-4xl text-cream md:text-5xl">الحلقات</h3>
            <p className="text-sand">
              نزل {ar(released.length)} من {ar(series.total)} · حلقة جديدة كل أسبوع
            </p>
          </Reveal>

          {current?.videoId && (
            <Reveal className="mt-10">
              <LiteYouTube id={current.videoId} title={`الحلقة ${ar(current.n)} — ${current.title}`} />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-sand">لو الحلقة لمستك، ابعتها لحد محتاج يسمعها.</p>
                <ShareButton title={`لسه في رجوع · الحلقة ${ar(current.n)}: ${current.title}`} url={watch(current.videoId)} />
              </div>
            </Reveal>
          )}

          {/* released episodes: real covers */}
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {released.map((e) => (
              <li key={e.n}>
                <button
                  type="button"
                  onClick={() => setCurrent(e)}
                  className={`group flex w-full items-center gap-4 rounded-2xl border p-3 text-start transition ${
                    current?.n === e.n ? "border-gold bg-gold/10" : "border-line bg-card hover:border-gold/60"
                  }`}
                >
                  <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-coal">
                    <img src={`https://i.ytimg.com/vi/${e.videoId}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" onError={(ev) => (ev.currentTarget.style.display = "none")} />
                    <span className="absolute bottom-1 start-1 rounded bg-ink/80 px-1.5 text-[11px] text-cream">{arDigits(e.duration ?? "")}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-gold">الحلقة {ar(e.n)} · {fmt.format(e.date)}</span>
                    <span className="mt-1 block font-medium leading-snug text-cream">{e.title}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>

          {/* upcoming episodes: one compact timeline instead of eleven empty cards */}
          {(() => {
            const upcoming = episodes.filter((e) => !e.out);
            const next = upcoming[0];
            if (!next) return null;
            return (
              <Reveal className="mt-8 rounded-2xl border border-line bg-night/70 p-5 md:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-cream">
                    <span className="text-gold">الحلقة الجاية:</span> الحلقة {ar(next.n)} · {fmt.format(next.date)}
                  </p>
                  <p className="text-sm text-sand">حلقة جديدة كل أسبوع</p>
                </div>
                <ol className="mt-5 flex items-center gap-1.5" aria-label="مواعيد الحلقات">
                  {episodes.map((e) => (
                    <li
                      key={e.n}
                      title={`الحلقة ${ar(e.n)} · ${fmt.format(e.date)}`}
                      className={`h-1.5 flex-1 rounded-full ${e.out ? "bg-gold shadow-[0_0_10px_#d9ae5f]" : e.n === next.n ? "bg-gold/50" : "bg-line"}`}
                    />
                  ))}
                </ol>
                <div className="mt-2 flex justify-between text-xs text-sand/70">
                  <span>الحلقة ١</span>
                  <span>الحلقة {ar(series.total)}</span>
                </div>
              </Reveal>
            );
          })()}
        </div>

        {/* shorts */}
        {shorts.length > 0 && (
          <div className="mt-28">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h3 className="font-display text-4xl text-cream md:text-5xl">لحظات قصيرة</h3>
                <p className="mt-2 text-sand">دقيقة واحدة ممكن تغيّر يوم حد. ابعتها لحد محتاج يسمعها.</p>
              </div>
              <a href={`${links.youtube}/shorts`} target="_blank" rel="noopener" className="text-sm text-gold hover:underline">
                كل الشورتس ←
              </a>
            </Reveal>
            <div className="-mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
              {shorts.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.08} className="w-[62vw] max-w-[260px] shrink-0 snap-start lg:w-auto lg:max-w-none">
                  <LiteYouTube id={s.id} title={s.title} vertical />
                  <a
                    href={whatsappShare(s.title, `https://www.youtube.com/shorts/${s.id}`)}
                    target="_blank"
                    rel="noopener"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-gold hover:underline"
                  >
                    ابعتها على واتساب ←
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
