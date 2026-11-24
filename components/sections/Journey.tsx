"use client";

import { useMemo, useState } from "react";
import { journey, series, shorts, links } from "@/content/site";
import { LiteYouTube, Reveal, SectionLabel } from "@/components/ui";

const DAY = 86_400_000;
const fmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long" });
const ar = (n: number) => n.toLocaleString("ar-EG");

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
          <SectionLabel index="02" ar="رحلتي" en="My Creative Journey" />
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
          <div className="mt-6 h-[3px] overflow-hidden rounded-full bg-coal">
            <div className="h-full rounded-full bg-gold shadow-[0_0_14px_#d9ae5f]" style={{ width: `${(released.length / series.total) * 100}%` }} />
          </div>

          {current?.videoId && (
            <Reveal className="mt-10">
              <LiteYouTube id={current.videoId} title={`الحلقة ${ar(current.n)} — ${current.title}`} />
            </Reveal>
          )}

          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {episodes.map((e, i) => {
              const selected = current?.n === e.n;
              return (
                <Reveal as="li" key={e.n} delay={Math.min(i, 6) * 0.05}>
                  <button
                    type="button"
                    disabled={!e.out}
                    onClick={() => e.out && setCurrent(e)}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-start transition ${
                      selected
                        ? "border-gold bg-gold/10"
                        : e.out
                          ? "border-line bg-card hover:border-gold/60"
                          : "cursor-default border-dashed border-line/70 bg-transparent text-sand/60"
                    }`}
                  >
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border font-bold ${
                        e.out ? "border-gold bg-gold text-ink" : "border-line"
                      }`}
                    >
                      {ar(e.n)}
                    </span>
                    <span className="min-w-0">
                      <span className={`block truncate font-medium ${e.out ? "text-cream" : ""}`}>{e.title ?? `الحلقة ${ar(e.n)}`}</span>
                      <span className="block text-xs text-sand">
                        {e.out ? `${e.duration ?? ""} · ${fmt.format(e.date)}` : `${e.due ? "قريب جدًا" : "قريبًا"} · ${fmt.format(e.date)}`}
                      </span>
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </ol>
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
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
