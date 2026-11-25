"use client";

import { useEffect, useState } from "react";
import { links, subscribeUrl } from "@/content/site";

type Track = "hidden" | "work" | "content";

// Phone-only bar that appears once the hero has been scrolled past. Its two
// actions follow the track being read: the work pages (dip, print shop) while in
// "شغلي", the latest episode and subscribe everywhere else.
export default function MobileBar() {
  const [track, setTrack] = useState<Track>("hidden");

  useEffect(() => {
    const crossroads = document.getElementById("crossroads");
    const work = document.getElementById("professional");
    if (!crossroads || !work) return;
    const update = () => {
      const mid = window.innerHeight * 0.5;
      if (crossroads.getBoundingClientRect().top > mid) return setTrack("hidden");
      const w = work.getBoundingClientRect();
      setTrack(w.top < mid && w.bottom > mid ? "work" : "content");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const ghost = "flex-1 rounded-full border border-gold/40 py-2.5 text-center text-sm text-gold";
  const solid = "flex-1 rounded-full bg-gold py-2.5 text-center text-sm font-bold text-ink";

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-ink/85 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-transform duration-500 md:hidden ${
        track === "hidden" ? "translate-y-full" : "translate-y-0"
      }`}
    >
      {track === "work" ? (
        <div className="flex items-center gap-2">
          {links.printShop && (
            <a href={links.printShop} target="_blank" rel="noopener" className={ghost}>
              صفحة المطبعة
            </a>
          )}
          <a href={links.work} target="_blank" rel="noopener" className={solid}>
            شغل فصل الألوان · <span dir="ltr">dip</span>
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
