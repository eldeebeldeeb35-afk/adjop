"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { person } from "@/content/site";
import type { MorphState } from "./ParticleScene";

const ParticleScene = dynamic(() => import("./ParticleScene"), { ssr: false });

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const BEFORE_VIEWS = [0, 1, 2].map((i) => `${base}/portraits/before-${i}.webp`);
const AFTER_VIEWS = [0, 1, 2].map((i) => `${base}/portraits/after-${i}.webp`);
const BEFORE = BEFORE_VIEWS[1];
const AFTER = AFTER_VIEWS[1];

type Mode = "pending" | "hover" | "scroll" | "static";

function detectMode(): { mode: Mode; count: number } {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const c = document.createElement("canvas");
  const webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  if (!webgl || reduced) return { mode: "static", count: 0 };
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const weak = cores <= 4 || memory <= 4;
  const count = finePointer ? (weak ? 30000 : 50000) : weak ? 14000 : 22000;
  return { mode: finePointer ? "hover" : "scroll", count };
}

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const morph = useRef<MorphState>({ progress: 0 }).current;
  const [{ mode, count }, setSetup] = useState<{ mode: Mode; count: number }>({ mode: "pending", count: 0 });
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const settled = useRef<0 | 1>(0);
  const busy = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => setSetup(detectMode()), []);

  // pause the WebGL loop while the hero is off screen
  useEffect(() => {
    if (!section.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(section.current);
    return () => io.disconnect();
  }, []);

  // reflect progress in the captions ("زمان" / "النهارده") without React re-renders
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      caption.current?.style.setProperty("--p", morph.progress.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [morph]);

  const playTo = useCallback(
    (target: 0 | 1) => {
      busy.current = true;
      gsap.to(morph, {
        progress: target,
        duration: 6.5,
        ease: "power2.inOut",
        onComplete: () => {
          settled.current = target;
          busy.current = false;
          setDone(target === 1);
        },
      });
    },
    [morph],
  );

  // desktop: entering the portrait rebuilds it; leaving and entering again reverses
  const onPortraitHover = useCallback(() => {
    if (mode !== "hover" || busy.current) return;
    playTo(settled.current === 0 ? 1 : 0);
  }, [mode, playTo]);

  // mobile: scroll through the pinned hero drives the morph
  useEffect(() => {
    if ((mode !== "scroll" && mode !== "static") || !section.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,
      onUpdate: (self) => {
        morph.progress = Math.min(1, self.progress / 0.8);
      },
    });
    return () => st.kill();
  }, [mode, morph]);

  const onReady = useCallback(() => setReady(true), []);
  const tall = mode === "scroll" || mode === "static";

  return (
    <section ref={section} id="top" className={`relative ${tall ? "h-[340svh]" : "h-svh min-h-[640px]"}`}>
      <div className="sticky top-0 h-svh min-h-[560px] overflow-hidden">
        <div className="hero-glow" aria-hidden />

        {(mode === "hover" || mode === "scroll") && (
          <ParticleScene
            morph={morph}
            count={count}
            beforeSrcs={BEFORE_VIEWS}
            afterSrcs={AFTER_VIEWS}
            active={visible}
            onReady={onReady}
            onPortraitHover={onPortraitHover}
          />
        )}

        {mode === "static" && <StaticPortrait progressRef={morph} />}

        {mode !== "static" && !ready && mode !== "pending" && (
          <div className="absolute inset-0 grid place-items-center text-gold/60 text-sm tracking-widest">
            <span className="animate-pulse">النجوم بتتجمع…</span>
          </div>
        )}

        {/* text */}
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-[1240px] flex-col justify-end px-6 pb-16 md:justify-center md:pb-0">
          <div className="max-w-[480px] md:me-auto text-center md:text-start">
            <p className="font-latin text-sm uppercase tracking-[0.4em] text-gold/80 reveal-up" style={{ animationDelay: "0.2s" }} dir="ltr">
              {person.latinName}
            </p>
            <h1 className="mt-3 font-display text-[clamp(3rem,7.2vw,5.6rem)] leading-[1.15] whitespace-nowrap text-cream reveal-up" style={{ animationDelay: "0.4s" }}>
              {person.name}
            </h1>
            <p className="mt-5 text-lg text-sand md:text-xl reveal-up" style={{ animationDelay: "0.7s" }}>
              {person.tagline}
            </p>

            <div ref={caption} className="morph-caption mt-8 reveal-up" style={{ animationDelay: "1s" }}>
              <div className="flex items-center justify-center gap-4 md:justify-start">
                <span className="cap-before">زمان</span>
                <span className="cap-line" />
                <span className="cap-after">النهارده</span>
              </div>
            </div>

            {mode === "hover" && (
              <button
                type="button"
                onClick={() => !busy.current && playTo(settled.current === 0 ? 1 : 0)}
                className="pointer-events-auto mt-6 rounded-full border border-gold/30 px-5 py-2 text-sm text-gold transition hover:border-gold hover:bg-gold/10"
              >
                {done ? "رجّع الصورة القديمة ↺" : "ابدأ التحوّل ✦"}
              </button>
            )}
          </div>
        </div>

        <a href="#crossroads" className="scroll-cue" aria-label="انزل للمحتوى">
          <span />
        </a>
      </div>
    </section>
  );
}

// No WebGL or reduced motion: the two real photos, gold-toned, cross-fading on scroll.
function StaticPortrait({ progressRef }: { progressRef: MorphState }) {
  const after = useRef<HTMLImageElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (after.current) after.current.style.opacity = String(progressRef.progress);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);
  return (
    <div className="absolute inset-0 flex items-start justify-center pt-[10svh] md:items-center md:justify-start md:ps-[8vw] md:pt-0">
      <div className="relative aspect-[4/5] h-[62svh] md:h-[86svh]">
        <img src={BEFORE} alt="حمدي الديب زمان" className="static-portrait absolute inset-0 h-full w-full" />
        <img ref={after} src={AFTER} alt="حمدي الديب النهارده" className="static-portrait absolute inset-0 h-full w-full opacity-0" />
      </div>
    </div>
  );
}
