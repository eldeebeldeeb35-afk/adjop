// ============================================================
//  إعدادات الموقع — عدّل هنا بس
//  أي رابط فاضي ("") الزرار بتاعه هيختفي تلقائيًا.
// ============================================================
const SITE = {
  youtubeChannelId: "UCbmQG5ZloQge0MkvPRsVxRw",

  links: {
    youtube: "https://www.youtube.com/@hamdyeldee",
    facebook: "", // TODO: رابط صفحة الفيسبوك
    tiktok: "",   // TODO: مثال https://www.tiktok.com/@username
    instagram: "", // TODO: مثال https://www.instagram.com/username
    email: "",     // TODO: إيميل للتواصل (اختياري)
  },

  series: {
    firstEpisode: "2026-11-17", // تاريخ نزول الحلقة الأولى
    episodes: 12,
    everyDays: 7,
    // عناوين الحلقات (اختياري) — لو فاضي هيكتب "الحلقة N"
    titles: [],
  },
};

// ============================================================

const DAY = 24 * 60 * 60 * 1000;
const arabicDate = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long" });

function applyLinks() {
  document.querySelectorAll("[data-link]").forEach((el) => {
    const key = el.dataset.link;
    const url = SITE.links[key];
    if (!url) {
      el.hidden = true;
      return;
    }
    el.href = key === "email" ? `mailto:${url}` : url;
  });
}

function embedLatestUploads() {
  const frame = document.getElementById("latest-frame");
  if (!frame) return;
  const uploads = "UU" + SITE.youtubeChannelId.slice(2);
  frame.src = `https://www.youtube-nocookie.com/embed/videoseries?list=${uploads}`;
}

function renderEpisodes() {
  const list = document.getElementById("episodes");
  if (!list) return;
  const { firstEpisode, episodes, everyDays, titles } = SITE.series;
  const start = new Date(firstEpisode + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let released = 0;

  for (let i = 0; i < episodes; i++) {
    const date = new Date(start.getTime() + i * everyDays * DAY);
    const isOut = date <= today;
    if (isOut) released++;

    const li = document.createElement("li");
    li.className = "episode" + (isOut ? " is-out" : "");
    li.innerHTML = `
      <span class="episode-num">${(i + 1).toLocaleString("ar-EG")}</span>
      <span class="episode-title">${titles[i] || "الحلقة " + (i + 1).toLocaleString("ar-EG")}</span>
      <span class="episode-date">${isOut ? "نزلت" : "قريبًا"} · ${arabicDate.format(date)}</span>`;
    list.appendChild(li);
  }

  const progress = document.getElementById("series-progress");
  if (progress) {
    progress.textContent = `${released.toLocaleString("ar-EG")} من ${episodes.toLocaleString("ar-EG")} حلقة`;
  }
  const bar = document.getElementById("series-bar");
  if (bar) bar.style.setProperty("--done", `${(released / episodes) * 100}%`);
}

document.getElementById("year").textContent = new Date().getFullYear().toLocaleString("ar-EG", { useGrouping: false });
applyLinks();
embedLatestUploads();
renderEpisodes();
