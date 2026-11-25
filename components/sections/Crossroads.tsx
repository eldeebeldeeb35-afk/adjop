import { Reveal } from "@/components/ui";

const doors = [
  {
    href: "#professional",
    ar: "شغلي",
    en: "My Professional Work",
    text: "الحرفة: إزاي الفكرة بتتحول لقصة، والقصة لفيديو يوصل.",
  },
  {
    href: "#journey",
    ar: "رحلتي",
    en: "My Creative Journey",
    text: "الرسالة: «لسه في رجوع» — حكايات الرجوع لربنا.",
  },
];

export default function Crossroads() {
  return (
    <section id="crossroads" className="relative mx-auto max-w-[1240px] px-6 py-28 md:py-40">
      <Reveal>
        <p className="text-center font-display text-[clamp(2rem,5vw,3.6rem)] leading-snug text-cream">
          إنسان واحد… <span className="gold-text">وجانبين</span>.
        </p>
      </Reveal>
      <Reveal delay={0.15}>
        <p className="mx-auto mt-4 max-w-xl text-center text-sand">
          جانب بيشتغل بإيده وعينه، وجانب بيحكي اللي في قلبه. الاتنين بيكمّلوا بعض.
        </p>
      </Reveal>
      <div className="mt-16 grid gap-5 md:grid-cols-2">
        {doors.map((d, i) => (
          <Reveal key={d.href} delay={0.2 + i * 0.12}>
            <a
              href={d.href}
              className="group relative block overflow-hidden rounded-3xl border border-line bg-coal/60 p-8 transition duration-500 hover:border-gold/60 md:p-12"
            >
              <span className="pointer-events-none absolute -top-24 start-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/0 blur-3xl transition duration-700 group-hover:bg-gold/15" />
              <span className="font-latin text-sm text-sand/70" dir="ltr">{d.en}</span>
              <h2 className="mt-2 font-display text-5xl text-cream transition group-hover:text-gold md:text-6xl">{d.ar}</h2>
              <p className="mt-4 max-w-sm text-sand">{d.text}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm text-gold">
                ادخل
                <span className="transition group-hover:-translate-x-2">←</span>
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
