import { links, professional } from "@/content/site";
import { Reveal, SectionLabel } from "@/components/ui";

const toArabic = (n: number) => n.toLocaleString("ar-EG", { minimumIntegerDigits: 2 });

export default function Professional() {
  const p = professional;
  return (
    <section id="professional" className="relative overflow-hidden border-t border-line/60 bg-ink py-28 md:py-36">
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-[1240px] px-6">
        <Reveal>
          <SectionLabel index="01" ar="شغلي" en="My Professional Work" />
        </Reveal>

        <div className="mt-10 grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-end">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.1] text-cream">{p.role}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg text-sand">{p.intro}</p>
            {links.work && (
              <a
                href={links.work}
                target="_blank"
                rel="noopener"
                className="mt-6 inline-flex items-center gap-3 rounded-full border border-gold/40 px-5 py-2.5 text-sm text-gold transition hover:border-gold hover:bg-gold/10"
              >
                صفحة الشغل على فيسبوك
                <span className="font-latin text-base italic" dir="ltr">{p.pageName}</span>
                <span aria-hidden>←</span>
              </a>
            )}
          </Reveal>
        </div>

        {/* skills: a ruled, numbered grid — deliberately more "technical" than the journey section */}
        <div className="mt-20 grid border-t border-line md:grid-cols-2">
          {p.skills.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08} className="group border-b border-line py-8 md:px-8 md:odd:border-e md:first:ps-0 md:[&:nth-child(3)]:ps-0">
              <div className="flex items-baseline gap-5">
                <span className="font-latin text-lg text-gold/70 transition group-hover:text-gold">{toArabic(i + 1)}</span>
                <div>
                  <h3 className="text-xl font-bold text-cream">{s.title}</h3>
                  <p className="mt-2 text-sand">{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* workflow */}
        <Reveal className="mt-24">
          <p className="text-sm tracking-widest text-sand/70">طريقة الشغل</p>
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

        {/* case study */}
        <Reveal className="mt-24">
          <a href="#journey" className="group block rounded-3xl border border-line bg-coal/70 p-8 transition hover:border-gold/50 md:p-12">
            <p className="text-sm tracking-widest text-gold">مشروع مختار</p>
            <h3 className="mt-3 font-display text-3xl text-cream md:text-4xl">{p.caseStudy.title}</h3>
            <p className="mt-4 max-w-2xl text-sand">{p.caseStudy.text}</p>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-8">
              {p.caseStudy.stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dd className="gold-text font-display text-4xl md:text-5xl">{s.value}</dd>
                  <dt className="text-xs text-sand md:text-sm">{s.label}</dt>
                </div>
              ))}
            </dl>
            <span className="mt-8 inline-flex items-center gap-2 text-sm text-gold">
              شوف المشروع <span className="transition group-hover:-translate-x-2">←</span>
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
