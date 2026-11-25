"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "p" | "h2" | "h3";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 1, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </Tag>
  );
}

export function SectionLabel({ index, ar, en }: { index: string; ar: string; en: string }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="font-latin text-gold" dir="ltr">{index}</span>
      <span className="h-px w-10 bg-gold/40" />
      <span className="text-sand">{ar}</span>
      <span className="font-latin text-sand/60" dir="ltr">{en}</span>
    </div>
  );
}

// Soft golden light that trails the pointer (desktop only); the native cursor stays.
export function CursorGlow() {
  const el = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduce);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const pos = { x: -500, y: -500 };
    const cur = { x: -500, y: -500 };
    let hot = 0;
    let target = 0;
    let raf = 0;
    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      target = (e.target as Element)?.closest?.("a, button") ? 1 : 0;
    };
    const tick = () => {
      cur.x += (pos.x - cur.x) * 0.14;
      cur.y += (pos.y - cur.y) * 0.14;
      hot += (target - hot) * 0.12;
      if (el.current) {
        el.current.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) scale(${1 + hot * 0.8})`;
        el.current.style.opacity = String(0.55 + hot * 0.45);
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div
      ref={el}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] -ml-4 -mt-4 h-8 w-8 rounded-full border border-gold/50 mix-blend-screen"
      style={{ boxShadow: "0 0 24px rgba(217,174,95,0.35), inset 0 0 10px rgba(217,174,95,0.25)" }}
    />
  );
}

export function LiteYouTube({
  id,
  title,
  vertical = false,
  className = "",
}: {
  id: string;
  title: string;
  vertical?: boolean;
  className?: string;
}) {
  const [play, setPlay] = useState(false);
  useEffect(() => setPlay(false), [id]);
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-line bg-coal ${vertical ? "aspect-[9/16]" : "aspect-video"} ${className}`}>
      {play ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="absolute inset-0 h-full w-full cursor-pointer" aria-label={`شغّل: ${title}`}>
          <img
            src={`https://i.ytimg.com/vi/${id}/${vertical ? "hqdefault" : "maxresdefault"}.jpg`}
            alt=""
            loading="lazy"
            onError={(e) => (e.currentTarget.style.display = "none")}
            className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gold/60 bg-ink/50 backdrop-blur transition group-hover:scale-110 group-hover:bg-gold/20">
            <svg viewBox="0 0 24 24" className="h-6 w-6 translate-x-0.5 fill-gold"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span className="absolute inset-x-0 bottom-0 p-4 text-start text-sm font-medium leading-snug text-cream md:p-5 md:text-base">
            {title}
          </span>
        </button>
      )}
    </div>
  );
}
