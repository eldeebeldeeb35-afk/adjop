"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const DipStars = dynamic(() => import("./DipStars"), { ssr: false });
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Mode = { kind: "pending" } | { kind: "stars"; count: number } | { kind: "static" };

export default function DipHero() {
  const [mode, setMode] = useState<Mode>({ kind: "pending" });
  const [ready, setReady] = useState(false);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = document.createElement("canvas");
    const webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setTouch(coarse);
    setMode(!webgl || reduced ? { kind: "static" } : { kind: "stars", count: coarse || window.innerWidth < 700 ? 30000 : 48000 });
  }, []);

  const onReady = useCallback(() => setReady(true), []);

  return (
    <section className="relative h-[min(100svh,940px)] min-h-[600px] overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,#1d160d_0%,var(--color-ink)_65%)]">
      {mode.kind === "stars" && <DipStars count={mode.count} onReady={onReady} />}
      {mode.kind === "static" && (
        <img
          src={`${base}/dip/logo-3d.webp`}
          alt="لوجو D.I.P"
          className="absolute left-1/2 top-[12%] h-[62%] w-auto -translate-x-1/2 object-contain"
        />
      )}
      {mode.kind === "stars" && ready && (
        <p className="pointer-events-none absolute inset-x-0 top-20 text-center text-xs text-sand/80">
          {touch ? "المس النجوم · انزل بالسكرول وشوفها بتتبعتر" : "حرّك الماوس على النجوم · اضغط عشان تبعترها"}
        </p>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 pb-[clamp(24px,5vh,56px)]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-6 px-6">
          <div className="reveal-up">
            <h1 className="font-display text-[clamp(2rem,5vw,3.6rem)] leading-tight text-cream">
              من الفكرة <span className="text-gold">للطباعة</span>
            </h1>
            <p className="mt-2 text-sand">تصميم وفصل ألوان وطباعة سلك سكرين</p>
          </div>
          <div className="pointer-events-auto flex flex-wrap gap-3 reveal-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/work/account/" className="rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-ink transition hover:brightness-110">
              اطلب دلوقتي
            </Link>
            <a href="#separation" className="rounded-full border border-gold/40 px-6 py-2.5 text-sm text-gold transition hover:border-gold hover:bg-gold/10">
              فصل ألوان للمطابع
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
