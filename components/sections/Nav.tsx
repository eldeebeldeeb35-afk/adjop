"use client";

import { useEffect, useState } from "react";
import { person } from "@/content/site";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const items = [
  { href: "#professional", label: "شغلي" },
  { href: "#journey", label: "رحلتي" },
  { href: "#episodes", label: "الحلقات" },
  { href: "#contact", label: "تواصل" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open ? "border-b border-line/60 bg-ink/75 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-3 font-display text-xl text-gold">
          <img src={`${base}/brand/logo.png`} alt="" width={36} height={34} className="h-9 w-auto" />
          {person.name}
        </a>
        <nav className="hidden gap-9 text-sm text-sand md:flex">
          {items.map((i) => (
            <a key={i.href} href={i.href} className="relative transition hover:text-cream after:absolute after:-bottom-1 after:start-0 after:h-px after:w-0 after:bg-gold after:transition-all hover:after:w-full">
              {i.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center md:hidden"
          aria-label={open ? "اقفل القايمة" : "افتح القايمة"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`block h-px w-6 bg-cream transition ${open ? "translate-y-[3px] rotate-45" : "-translate-y-1"}`} />
          <span className={`block h-px w-6 bg-cream transition ${open ? "-translate-y-[3px] -rotate-45" : "translate-y-1"}`} />
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 px-6 pb-6 md:hidden">
          {items.map((i) => (
            <a key={i.href} href={i.href} onClick={() => setOpen(false)} className="border-b border-line/50 py-3 font-display text-2xl text-cream">
              {i.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
