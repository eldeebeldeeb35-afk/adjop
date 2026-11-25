import Link from "next/link";
import { links, person, work } from "@/content/site";
import { Reveal, SectionLabel } from "@/components/ui";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const toArabic = (n: number) => n.toLocaleString("ar-EG", { minimumIntegerDigits: 2 });

// Overlapping ink swatches: the visual shorthand for "one colour per screen".
function Separation({ className = "h-24" }: { className?: string }) {
  const inks = ["#d9ae5f", "#b4553a", "#3f6f8a", "#f1e9dc"];
  return (
    <svg viewBox="0 0 190 92" className={`${className} w-auto`} aria-hidden>
      {inks.map((c, i) => (
        <rect key={c} x={i * 34} y={i * 2.5} width="84" height="84" rx="10" fill={c} opacity="0.85" style={{ mixBlendMode: "screen" }} />
      ))}
    </svg>
  );
}

export default function WorkPage() {
  return (
    <main>
      {/* hero */}
      <section className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-[1240px] gap-12 px-6 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <p className="font-latin text-xs tracking-[0.25em] text-gold/80 md:text-sm md:tracking-[0.4em] reveal-up" dir="ltr">
              DESIGN · COLOR SEPARATION · SCREEN PRINTING
            </p>
            <h1 className="mt-5 font-display text-[clamp(4rem,12vw,8.5rem)] leading-none text-cream reveal-up" style={{ animationDelay: "0.2s" }} dir="ltr">
              {work.brand}
            </h1>
            <p className="mt-6 font-display text-[clamp(1.5rem,3.2vw,2.4rem)] leading-snug text-gold reveal-up" style={{ animationDelay: "0.35s" }}>
              {work.role}
            </p>
            <p className="mt-6 max-w-xl text-lg text-sand reveal-up" style={{ animationDelay: "0.5s" }}>
              {work.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 reveal-up" style={{ animationDelay: "0.65s" }}>
              <a href={links.work} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-ink transition hover:brightness-110">
                شوف الشغل على صفحة <span dir="ltr">D.I.P</span> <span aria-hidden>←</span>
              </a>
              <a href="#services" className="rounded-full border border-gold/40 px-6 py-2.5 text-sm text-gold transition hover:border-gold hover:bg-gold/10">
                الخدمات
              </a>
            </div>
          </div>
          <div className="order-first flex justify-start md:order-none md:justify-end reveal-up" style={{ animationDelay: "0.4s" }}>
            <Separation className="h-24 md:h-56" />
          </div>
        </div>
      </section>

      {/* services */}
      <section id="services" className="relative scroll-mt-20 border-t border-line/60 py-24 md:py-32">
        <div className="mx-auto max-w-[1240px] px-6">
          <Reveal>
            <SectionLabel index="٠١" ar="الخدمات" en="Services" />
          </Reveal>
          <div className="mt-12 grid border-t border-line md:grid-cols-3">
            {work.services.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08} className="group border-b border-line py-8 md:border-e md:px-8 md:first:ps-0 md:last:border-e-0">
                <span className="font-latin text-lg text-gold/70 transition group-hover:text-gold">{toArabic(i + 1)}</span>
                <h2 className="mt-3 text-xl font-bold text-cream">{s.title}</h2>
                <p className="mt-2 text-sand">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* steps */}
      <section id="steps" className="scroll-mt-20 border-t border-line/60 py-24 md:py-32">
        <div className="mx-auto max-w-[1240px] px-6">
          <Reveal>
            <SectionLabel index="٠٢" ar="من التصميم للقطعة المطبوعة" en="Process" />
          </Reveal>
          <ol className="relative mt-12 grid gap-4 sm:grid-cols-5">
            <span className="absolute inset-x-0 top-[22px] hidden h-px bg-gradient-to-l from-gold/0 via-gold/50 to-gold/0 sm:block" aria-hidden />
            {work.workflow.map((step, i) => (
              <Reveal as="li" key={step} delay={i * 0.1} className="relative flex items-center gap-4 sm:flex-col sm:items-start sm:gap-3">
                <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/50 bg-ink text-sm text-gold">
                  {toArabic(i + 1)}
                </span>
                <span className="text-cream">{step}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* contact */}
      <section id="contact" className="scroll-mt-20 border-t border-line/60 py-24 md:py-32">
        <div className="mx-auto max-w-[1240px] px-6">
          <Reveal>
            <a href={links.work} target="_blank" rel="noopener" className="group block rounded-3xl border border-line bg-coal/70 p-8 transition hover:border-gold/60 md:p-12">
              <div className="flex flex-wrap items-center justify-between gap-8">
                <div>
                  <p className="text-sm tracking-widest text-gold">عندك تصميم عايز تطبعه أو تفصل ألوانه؟</p>
                  <h2 className="mt-3 font-display text-4xl text-cream md:text-5xl">كلّمني على صفحة <span dir="ltr">D.I.P</span></h2>
                  <p className="mt-4 max-w-xl text-sand">ابعت التصميم وعدد الألوان ونوع القماش، وهرد عليك بالتفاصيل.</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm text-gold">
                    افتح الصفحة على فيسبوك <span className="transition group-hover:-translate-x-2">←</span>
                  </span>
                </div>
                <Separation className="h-24 opacity-80" />
              </div>
            </a>
          </Reveal>
          {links.email && (
            <p className="mt-6 text-center text-sand">
              أو على الإيميل: <span dir="ltr" className="text-cream">{links.email}</span>
            </p>
          )}
        </div>
      </section>

      <footer className="flex flex-col items-center gap-4 border-t border-line/60 px-6 py-12 text-center text-sm text-sand/70">
        <img src={`${base}/brand/logo.png`} alt={`شعار ${person.name}`} width={88} height={82} className="h-20 w-auto opacity-90" />
        <p>
          © {new Date().getFullYear()} <span dir="ltr">{work.brand}</span> · {person.name}
        </p>
        <Link href="/" className="text-gold hover:underline">
          ← الرجوع لصفحة القصة والمحتوى
        </Link>
      </footer>
    </main>
  );
}
