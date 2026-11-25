import { links, person } from "@/content/site";
import { Reveal } from "@/components/ui";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const platforms = [
  { key: "youtube", name: "يوتيوب", note: "الحلقات الكاملة والشورتس", path: "M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .6 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-4.8 31 31 0 0 0-.4-4.8ZM9.7 15.1V8.9l5.8 3.1-5.8 3.1Z" },
  { key: "facebook", name: "فيسبوك", note: "صفحة المحتوى", path: "M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z" },
  { key: "work", name: "صفحة الشغل · dip", note: "الشغل المهني والتعاون", path: "M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z" },
  { key: "tiktok", name: "تيك توك", note: "ريلز كل يوم", path: "M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z" },
  { key: "instagram", name: "إنستجرام", note: "ريلز وبوستات", path: "M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8C2.4 4 3.9 2.4 7.2 2.3c1.2-.1 1.6-.1 4.8-.1ZM12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9Z" },
  { key: "email", name: "تواصل معايا", note: "للتعاون والشغل", path: "M2 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v.5l10 6.3 10-6.3V6H2Zm20 2.9-10 6.3-10-6.3V18h20V8.9Z" },
] as const;

export default function Contact() {
  const available = platforms.filter((p) => links[p.key]);
  return (
    <>
      <section id="contact" className="mx-auto max-w-[1240px] scroll-mt-20 px-6 py-28 md:py-36">
        <Reveal>
          <h2 className="font-display text-[clamp(2.4rem,6vw,4.2rem)] text-cream">
            خلّينا <span className="gold-text">نفضل قريبين</span>.
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1">
          {available.map((p, i) => {
            const url = links[p.key];
            return (
              <Reveal key={p.key} delay={i * 0.08}>
                <a
                  href={p.key === "email" ? `mailto:${url}` : url}
                  target={p.key === "email" ? undefined : "_blank"}
                  rel="noopener"
                  className="group flex h-full flex-col gap-1 rounded-2xl border border-line bg-coal/60 p-5 transition hover:-translate-y-1 hover:border-gold/60"
                >
                  <svg viewBox="0 0 24 24" className="mb-4 h-7 w-7 fill-gold" aria-hidden>
                    <path d={p.path} />
                  </svg>
                  <span className="text-lg font-bold text-cream">{p.name}</span>
                  <span className="text-sm text-sand">{p.note}</span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="relative border-t border-line/60 px-6 py-28 text-center md:py-36">
        <Reveal>
          <p className="mx-auto max-w-3xl font-quran text-[clamp(1.6rem,4vw,2.6rem)] leading-[1.9] text-cream">
            ﴿ قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ﴾
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-3 text-sm text-sand">الزمر: ٥٣</p>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="mt-10 text-gold">مهما بعدت… لسه في رجوع.</p>
        </Reveal>
      </section>

      <footer className="flex flex-col items-center gap-4 border-t border-line/60 px-6 py-12 text-center text-sm text-sand/70">
        <img src={`${base}/brand/logo.png`} alt={`شعار ${person.name}`} width={88} height={82} className="h-20 w-auto opacity-90" />
        <p>
          © {new Date().getFullYear()} {person.name} · <span dir="ltr">#لسه_في_رجوع</span>
        </p>
      </footer>
    </>
  );
}
