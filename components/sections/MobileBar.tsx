"use client";

import { useEffect, useState } from "react";
import { subscribeUrl } from "@/content/site";

// Phone-only bar that appears once the hero has been scrolled past: one tap to
// the latest episode, one tap to subscribe.
export default function MobileBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.getElementById("crossroads");
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setShow(e.boundingClientRect.top < window.innerHeight * 0.5), {
      threshold: [0, 0.1, 0.5, 1],
    });
    io.observe(target);
    const onScroll = () => setShow(target.getBoundingClientRect().top < window.innerHeight * 0.5);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-ink/85 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-transform duration-500 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-2">
        <a href="#episodes" className="flex-1 rounded-full border border-gold/40 py-2.5 text-center text-sm text-gold">
          ▶ أحدث حلقة
        </a>
        <a href={subscribeUrl} target="_blank" rel="noopener" className="flex-1 rounded-full bg-gold py-2.5 text-center text-sm font-bold text-ink">
          اشترك في القناة
        </a>
      </div>
    </div>
  );
}
