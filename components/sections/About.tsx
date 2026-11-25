import Link from "next/link";
import { person, work } from "@/content/site";
import { Reveal } from "@/components/ui";

// A short CV-style introduction right after the hero, with the doorway to the
// separate work page (D.I.P).
export default function About() {
  const rows = [
    { k: "الاسم", v: person.fullName },
    { k: "الوظيفة", v: `${person.job} · ${person.workplace}` },
    { k: "الشغل الحر", v: `${work.role} · ${work.brand}` },
    { k: "المحتوى", v: "سلسلة «لسه في رجوع»" },
  ];
  return (
    <section id="about" className="relative mx-auto max-w-[1240px] scroll-mt-20 px-6 py-28 md:py-36">
      <div className="grid gap-12 md:grid-cols-[1fr_1.15fr] md:items-center">
        <Reveal>
          <p className="text-sm tracking-widest text-gold">مين أنا</p>
          <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.2] text-cream">
            إنسان واحد… <span className="gold-text">وأكتر من حكاية</span>.
          </h2>
          <p className="mt-5 max-w-md text-sand">
            شغلي بين الأجهزة الطبية في المستشفى، والتصميم والطباعة في D.I.P، وبين الاتنين بحكي قصص الرجوع لربنا.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/work/"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-ink transition hover:brightness-110"
            >
              شغلي في التصميم والطباعة
              <span aria-hidden>←</span>
            </Link>
            <a href="#journey" className="rounded-full border border-gold/40 px-6 py-2.5 text-sm text-gold transition hover:border-gold hover:bg-gold/10">
              رحلتي والمحتوى
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <dl className="rounded-3xl border border-line bg-coal/60 p-6 md:p-8">
            {rows.map((r, i) => (
              <div key={r.k} className={`grid gap-1 py-4 sm:grid-cols-[110px_1fr] sm:gap-6 ${i ? "border-t border-line/70" : ""}`}>
                <dt className="text-sm text-gold">{r.k}</dt>
                <dd className="text-cream">{r.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
