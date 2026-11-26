import Link from "next/link";
import { dipPricing, links, person, work } from "@/content/site";
import { Reveal, SectionLabel } from "@/components/ui";
import DipHero from "./DipHero";
import SeparationCalc from "./SeparationCalc";

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
      <DipHero />

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

      {/* colour separation: fixed prices */}
      <section id="separation" className="scroll-mt-20 border-t border-line/60 py-24 md:py-32">
        <div className="mx-auto max-w-[1240px] px-6">
          <Reveal>
            <SectionLabel index="٠٣" ar="فصل الألوان للمطابع" en="Colour separation" />
          </Reveal>
          <Reveal className="mt-8 max-w-2xl">
            <h2 className="font-display text-4xl leading-tight text-cream md:text-5xl">
              ابعت التصميم، وخد الفصل جاهز للحرق
            </h2>
            <p className="mt-4 text-sand">
              سعر الفصل <b className="text-gold">{dipPricing.separationPerColor.toLocaleString("ar-EG")} ج للون</b> (ملفات الفصل).
              ولو عايز الأفلام مطبوعة: ورقة الكلك {dipPricing.film.calc.price.toLocaleString("ar-EG")} ج، والورقة البيضا{" "}
              {dipPricing.film.white.price.toLocaleString("ar-EG")} ج، مقاس {dipPricing.filmSize}.
            </p>
          </Reveal>
          <Reveal className="mt-10">
            <SeparationCalc />
          </Reveal>
        </div>
      </section>

      {/* silk-screen printing: priced per design */}
      <section id="printing" className="scroll-mt-20 border-t border-line/60 py-24 md:py-32">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-6 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <Reveal>
              <SectionLabel index="٠٤" ar="طباعة سلك سكرين" en="Printing" />
            </Reveal>
            <Reveal className="mt-8">
              <h2 className="font-display text-4xl leading-tight text-cream md:text-5xl">سعر القطعة على حسب الرسمة</h2>
              <p className="mt-4 max-w-xl text-sand">
                ارفع الرسمة واكتب عدد القطع. بعد ما نشوف الرسمة وعدد ألوانها، بنحدد سعر القطعة ويوصلك في حسابك، ولما توافق نبدأ الشغل.
              </p>
            </Reveal>
          </div>
          <Reveal>
            <ol className="grid gap-3">
              {["ترفع الرسمة وتكتب عدد القطع", "نراجع الرسمة ونحدد سعر القطعة", "توافق على السعر من حسابك", "نطبع ونبلغك لما يجهز"].map((t, i) => (
                <li key={t} className="flex items-center gap-4 rounded-2xl border border-line bg-coal/60 px-5 py-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/50 text-sm text-gold">{toArabic(i + 1)}</span>
                  <span className="text-cream">{t}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* customer accounts */}
      <section id="account" className="scroll-mt-20 border-t border-line/60 py-24 md:py-32">
        <div className="mx-auto max-w-[1240px] px-6">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-8 rounded-3xl border border-gold/40 bg-gradient-to-l from-[#221a10] to-coal p-8 md:p-12">
              <div className="max-w-xl">
                <p className="text-sm tracking-widest text-gold">حساب العميل</p>
                <h2 className="mt-3 font-display text-4xl text-cream md:text-5xl">اعمل حسابك وتابع طلباتك</h2>
                <p className="mt-4 text-sand">سجّل مرة واحدة، وبعدها تطلب فصل أو طباعة، وتشوف سعر كل طلب ومرحلته من مكان واحد.</p>
              </div>
              <Link href="/work/account/" className="rounded-full bg-gold px-8 py-3 font-bold text-ink transition hover:brightness-110">
                سجّل دخول أو اعمل حساب
              </Link>
            </div>
          </Reveal>
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
