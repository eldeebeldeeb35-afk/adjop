"use client";

import { useEffect, useState } from "react";
import { subscribeUrl } from "@/content/site";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Phone-only bar that slides up once the visitor has scrolled past the first
// screen. The story page offers the latest episode and subscribe; the work page
// offers the D.I.P page.
export default function MobileBar({ variant }: { variant: "story" | "work" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(variant === "story" ? "about" : "services");
    if (!anchor) return;
    const update = () => setShow(anchor.getBoundingClientRect().top < window.innerHeight * 0.5);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [variant]);

  const ghost = "flex-1 rounded-full border border-gold/40 py-2.5 text-center text-sm text-gold";
  const solid = "flex-1 rounded-full bg-gold py-2.5 text-center text-sm font-bold text-ink";

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-ink/85 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-transform duration-500 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {variant === "work" ? (
        <div className="flex items-center gap-2">
          <a href="#separation" className={ghost}>
            أسعار الفصل
          </a>
          <a href={`${base}/work/account/`} className={solid}>
            اطلب دلوقتي
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <a href="#episodes" className={ghost}>
            ▶ أحدث حلقة
          </a>
          <a href={subscribeUrl} target="_blank" rel="noopener" className={solid}>
            اشترك في القناة
          </a>
        </div>
      )}
    </div>
  );
}
