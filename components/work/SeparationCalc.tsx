"use client";

import Link from "next/link";
import { useState } from "react";
import { dipPricing } from "@/content/site";
import { egp, separationTotal, type FilmPaper } from "@/lib/orders";

export default function SeparationCalc() {
  const [colors, setColors] = useState(4);
  const [paper, setPaper] = useState<FilmPaper>("none");
  const [sheets, setSheets] = useState<number | null>(null);
  const n = sheets ?? colors; // one film per colour unless changed
  const total = separationTotal(colors, paper, n);
  const sepCost = colors * dipPricing.separationPerColor;

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_320px]">
      <div className="rounded-3xl border border-line bg-coal/70 p-6 md:p-8">
        <label htmlFor="sep-colors" className="text-sm text-sand">
          عدد ألوان التصميم: <b className="text-cream">{colors.toLocaleString("ar-EG")}</b>
        </label>
        <input id="sep-colors" type="range" min={1} max={12} value={colors} onChange={(e) => setColors(+e.target.value)} className="mt-3 w-full accent-[#d9ae5f]" />

        <p className="mt-7 text-sm text-sand">طباعة الأفلام (ورق {dipPricing.filmSize})</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(dipPricing.film) as FilmPaper[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setPaper(k)}
              className={`rounded-full border px-4 py-2 text-sm transition ${paper === k ? "border-gold bg-gold/10 text-gold" : "border-line text-cream hover:border-gold/50"}`}
            >
              {dipPricing.film[k].label}
              {dipPricing.film[k].price > 0 && <span className="text-sand"> · {egp(dipPricing.film[k].price)} للورقة</span>}
            </button>
          ))}
        </div>

        {paper !== "none" && (
          <div className="mt-6">
            <label htmlFor="sep-sheets" className="text-sm text-sand">عدد الورق (ورقة لكل لون)</label>
            <input
              id="sep-sheets"
              type="number"
              min={1}
              inputMode="numeric"
              value={n}
              onChange={(e) => setSheets(Math.max(1, +e.target.value || 1))}
              className="mt-2 w-32 rounded-xl border border-line bg-night px-4 py-2 text-cream tabular-nums"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-gold/60 bg-gradient-to-b from-[#221a10] to-coal p-6 md:p-8">
        <span className="text-sm text-sand">الإجمالي</span>
        <span className="font-display text-5xl leading-none text-gold tabular-nums">{egp(total)}</span>
        <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-sm tabular-nums">
          <dt className="text-sand">فصل {colors.toLocaleString("ar-EG")} ألوان × {egp(dipPricing.separationPerColor)}</dt>
          <dd>{egp(sepCost)}</dd>
          {paper !== "none" && (
            <>
              <dt className="text-sand">{n.toLocaleString("ar-EG")} ورقة {paper === "calc" ? "كلك" : "أبيض"} × {egp(dipPricing.film[paper].price)}</dt>
              <dd>{egp(total - sepCost)}</dd>
            </>
          )}
        </dl>
        <Link
          href={`/work/account/?new=separation&colors=${colors}&paper=${paper}&sheets=${n}`}
          className="mt-auto rounded-full bg-gold px-6 py-2.5 text-center text-sm font-bold text-ink transition hover:brightness-110"
        >
          اطلب الفصل
        </Link>
      </div>
    </div>
  );
}
