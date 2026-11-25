import { links, professional } from "@/content/site";
import { Reveal, SectionLabel } from "@/components/ui";

const toArabic = (n: number) => n.toLocaleString("ar-EG", { minimumIntegerDigits: 2 });

// Overlapping ink swatches: the visual shorthand for "one colour per screen".
function Separation() {
  const inks = [
    { c: "#d9ae5f", x: 0 },
    { c: "#b4553a", x: 34 },
    { c: "#3f6f8a", x: 68 },
    { c: "#f1e9dc", x: 102 },
  ];
  return (
    <svg viewBox="0 0 190 90" className="h-20 w-auto" aria-hidden>
      {inks.map((ink, i) => (
        <rect key={i} x={ink.x} y={i * 4} width="84" height="84" rx="10" fill={ink.c} opacity="0.85" style={{ mixBlendMode: "screen" }} />
      ))}
    </svg>
  );
}

export default function Professional() {
  const p = professional;
  return (
    <section id="professional" className="relative overflow-hidden border-t border-line/60 bg-ink py-28 md:py-36">
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-[1240px] px-6">
        <Reveal>
          <SectionLabel index="٠١" ar="شغلي" en="Design & Screen Printing" />
        </Reveal>

        <div className="mt-10 grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-end">
          <Reveal>
            <h2 className="font-display text-[clamp(2.3rem,5.6vw,4.4rem)] leading-[1.15] text-cream">{p.role}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Separation />
            <p className="mt-5 text-lg text-sand">{p.intro}</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-sm text-sand">
              <span className="text-gold">الدراسة:</span> {p.study}
            </p>
          </Reveal>
        </div>

        {/* services: a ruled, numbered grid — deliberately more "technical" than the content track */}
        <div className="mt-20 grid border-t border-line md:grid-cols-3">
          {p.services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08} className="group border-b border-line py-8 md:border-e md:px-8 md:first:ps-0 md:last:border-e-0">
              <span className="font-latin text-lg text-gold/70 transition group-hover:text-gold">{toArabic(i + 1)}</span>
              <h3 className="mt-3 text-xl font-bold text-cream">{s.title}</h3>
              <p className="mt-2 text-sand">{s.text}</p>
            </Reveal>
          ))}
        </div>

        {/* print workflow */}
        <Reveal className="mt-24">
          <p className="text-sm tracking-widest text-sand/70">من التصميم للقطعة المطبوعة</p>
        </Reveal>
        <ol className="relative mt-6 grid gap-4 sm:grid-cols-5">
          <span className="absolute inset-x-0 top-[22px] hidden h-px bg-gradient-to-l from-gold/0 via-gold/50 to-gold/0 sm:block" aria-hidden />
          {p.workflow.map((step, i) => (
            <Reveal as="li" key={step} delay={i * 0.1} className="relative flex items-center gap-4 sm:flex-col sm:items-start sm:gap-3">
              <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/50 bg-ink text-sm text-gold">
                {toArabic(i + 1)}
              </span>
              <span className="text-cream">{step}</span>
            </Reveal>
          ))}
        </ol>

        {p.experience.length > 0 && (
          <div className="mt-24">
            <Reveal>
              <p className="text-sm tracking-widest text-sand/70">الخبرات</p>
            </Reveal>
            <ul className="mt-6 border-t border-line">
              {p.experience.map((e, i) => (
                <Reveal as="li" key={i} delay={i * 0.06} className="grid gap-1 border-b border-line py-6 md:grid-cols-[200px_1fr_auto] md:items-baseline">
                  <span className="text-sm text-gold" dir="ltr">{e.period}</span>
                  <span className="text-lg text-cream">{e.title}</span>
                  <span className="text-sand">{e.place}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        )}

        {/* the two work pages: dip (colour separation) and the print shop */}
        <div className="mt-24 grid gap-5 md:grid-cols-2">
          {p.pages.map((page, i) => {
            const url = links[page.key];
            const body = (
              <>
                <p className="text-sm tracking-widest text-gold">{page.role}</p>
                <h3 className="mt-3 font-display text-4xl text-cream md:text-5xl" dir={page.key === "work" ? "ltr" : undefined}>
                  {page.name}
                </h3>
                <p className="mt-4 text-sand">{page.text}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm text-gold">
                  {url ? (
                    <>
                      افتح الصفحة على فيسبوك <span className="transition group-hover:-translate-x-2">←</span>
                    </>
                  ) : (
                    <span className="rounded-full border border-line px-3 py-1 text-sand">قريبًا</span>
                  )}
                </span>
              </>
            );
            return (
              <Reveal key={page.key} delay={i * 0.1}>
                {url ? (
                  <a href={url} target="_blank" rel="noopener" className="group block h-full rounded-3xl border border-line bg-coal/70 p-8 transition hover:border-gold/60 md:p-10">
                    {body}
                  </a>
                ) : (
                  <div className="h-full rounded-3xl border border-dashed border-line bg-coal/40 p-8 md:p-10">{body}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
