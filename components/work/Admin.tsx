"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { fb, firebaseReady } from "@/lib/firebase";
import { FLOW, STATUS, dateAr, egp, type Customer, type Order, type OrderStatus } from "@/lib/orders";
import { NotConfigured, StatusPill, btnGhost, btnGold, card, field, useAuth } from "./Account";

const wa = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return `https://wa.me/${d.startsWith("0") ? "2" + d : d}`;
};

function PriceBox({ o }: { o: Order }) {
  const [price, setPrice] = useState(o.pricePerPiece ?? 0);
  const [busy, setBusy] = useState(false);
  const qty = o.qty ?? 0;
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor={`pp-${o.id}`} className="text-xs text-sand">سعر القطعة (ج)</label>
        <input id={`pp-${o.id}`} type="number" min={0} inputMode="decimal" value={price || ""} onChange={(e) => setPrice(Math.max(0, +e.target.value || 0))} className={`${field} mt-1 w-28 py-1.5`} />
      </div>
      <span className="pb-2 text-sm text-sand tabular-nums">× {qty.toLocaleString("ar-EG")} = <b className="text-gold">{egp(price * qty)}</b></span>
      <button
        type="button"
        disabled={busy || !price}
        onClick={async () => {
          setBusy(true);
          await updateDoc(doc(fb()!.db, "orders", o.id), {
            pricePerPiece: price,
            total: price * qty,
            status: o.status === "new" ? "priced" : o.status,
          }).finally(() => setBusy(false));
        }}
        className={`${btnGold} py-2`}
      >
        {o.pricePerPiece != null ? "عدّل السعر" : "ابعت السعر للعميل"}
      </button>
    </div>
  );
}

function AdminOrder({ o, customer, onZoom }: { o: Order; customer?: Customer; onZoom: (src: string) => void }) {
  return (
    <article className="grid gap-3 rounded-2xl border border-line bg-night/60 p-4 md:grid-cols-[96px_1fr]">
      {o.design ? (
        <button type="button" onClick={() => onZoom(o.design!)} className="h-24 w-24 overflow-hidden rounded-lg bg-white" aria-label="كبّر الرسمة">
          <img src={o.design} alt="" className="h-full w-full object-contain" />
        </button>
      ) : (
        <span className="h-24 w-24 rounded-lg bg-card" />
      )}
      <div className="grid min-w-0 gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-cream">
            {o.title} <span className="text-sm font-normal text-sand">· {o.customerName}</span>
          </h3>
          <StatusPill s={o.status} />
        </div>
        <p className="text-sm text-sand">
          {dateAr(o.createdAt)} ·{" "}
          {o.kind === "separation"
            ? `فصل ${o.colors?.toLocaleString("ar-EG")} ألوان${o.paper !== "none" ? ` + ${o.sheets?.toLocaleString("ar-EG")} ورقة ${o.paper === "calc" ? "كلك" : "أبيض"}` : ""} · ${egp(o.total ?? 0)}`
            : `طباعة ${o.qty?.toLocaleString("ar-EG")} قطعة${o.total != null ? ` · ${egp(o.total)}` : ""}`}
          {customer?.phone && (
            <>
              {" · "}
              <a href={wa(customer.phone)} target="_blank" rel="noopener" className="text-gold hover:underline" dir="ltr">
                {customer.phone}
              </a>
            </>
          )}
        </p>
        {o.notes && <p className="whitespace-pre-line rounded-xl bg-coal px-3 py-2 text-sm text-cream">{o.notes}</p>}
        {o.kind === "print" && o.status !== "cancelled" && o.status !== "done" && <PriceBox o={o} />}
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={`st-${o.id}`} className="text-xs text-sand">المرحلة</label>
          <select
            id={`st-${o.id}`}
            value={o.status}
            onChange={(e) => updateDoc(doc(fb()!.db, "orders", o.id), { status: e.target.value as OrderStatus })}
            className="rounded-lg border border-line bg-coal px-3 py-1.5 text-sm text-cream"
          >
            {[...FLOW, "cancelled" as const].map((s) => (
              <option key={s} value={s}>
                {STATUS[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </article>
  );
}

export default function Admin() {
  const user = useAuth();
  const [allowed, setAllowed] = useState<boolean | undefined>(undefined);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tab, setTab] = useState<"orders" | "customers">("orders");
  const [filter, setFilter] = useState<"open" | OrderStatus | "all">("open");
  const [who, setWho] = useState<string | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return setAllowed(user === null ? false : undefined);
    const { db } = fb()!;
    let unsubs: (() => void)[] = [];
    getDoc(doc(db, "admins", user.uid))
      .then((s) => {
        setAllowed(s.exists());
        if (!s.exists()) return;
        unsubs = [
          onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snap) =>
            setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order)),
          ),
          onSnapshot(collection(db, "customers"), (snap) => setCustomers(snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as Customer))),
        ];
      })
      .catch(() => setAllowed(false));
    return () => unsubs.forEach((u) => u());
  }, [user]);

  const byUid = useMemo(() => Object.fromEntries(customers.map((c) => [c.uid, c])), [customers]);
  const shown = orders.filter(
    (o) => (!who || o.uid === who) && (filter === "all" || (filter === "open" ? !["done", "cancelled"].includes(o.status) : o.status === filter)),
  );
  const count = (s: OrderStatus) => orders.filter((o) => o.status === s).length;
  const openValue = orders.filter((o) => !["done", "cancelled"].includes(o.status)).reduce((a, o) => a + (o.total ?? 0), 0);

  if (!firebaseReady) return <NotConfigured />;
  if (user === undefined || allowed === undefined) return <p className="text-center text-sand">بيحمّل…</p>;
  if (!user || !allowed)
    return (
      <div className={`${card} mx-auto max-w-md text-center`}>
        <h2 className="font-display text-2xl text-cream">الصفحة دي للإدارة بس</h2>
        <p className="mt-3 text-sand">{user ? "الحساب ده مش متسجل كأدمن." : "ادخل بحساب الإدارة الأول."}</p>
        <Link href="/work/account/" className={`${btnGold} mt-6 inline-block`}>
          صفحة الحساب
        </Link>
      </div>
    );

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl text-cream">لوحة الإدارة</h2>
        <button type="button" onClick={() => signOut(fb()!.auth)} className="rounded-full border border-line px-4 py-2 text-sm text-sand hover:text-cream">
          خروج
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          [count("new"), "طلب جديد محتاج مراجعة"],
          [count("priced"), "مستني موافقة العميل"],
          [count("approved") + count("working"), "في الشغل"],
          [customers.length, "عميل"],
        ].map(([n, l]) => (
          <div key={l as string} className="rounded-2xl border border-line bg-coal/70 p-4">
            <b className="block font-display text-3xl text-gold tabular-nums">{(n as number).toLocaleString("ar-EG")}</b>
            <span className="text-sm text-sand">{l}</span>
          </div>
        ))}
      </div>
      <p className="-mt-3 text-sm text-sand">قيمة الطلبات المفتوحة: <b className="text-cream">{egp(openValue)}</b></p>

      <div className="flex gap-2">
        {(
          [
            ["orders", "الطلبات"],
            ["customers", "العملاء"],
          ] as const
        ).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-full border px-5 py-2 text-sm ${tab === k ? "border-gold bg-gold/10 text-gold" : "border-line text-cream"}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === "orders" ? (
        <section className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(["open", "new", "priced", "approved", "working", "ready", "done", "all"] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full border px-3 py-1 text-xs ${filter === f ? "border-gold text-gold" : "border-line text-sand"}`}>
                {f === "open" ? "المفتوحة" : f === "all" ? "الكل" : STATUS[f].label.split(" · ")[0]}
              </button>
            ))}
            {who && (
              <button type="button" onClick={() => setWho(null)} className={btnGhost}>
                {byUid[who]?.name} ✕
              </button>
            )}
          </div>
          {shown.length ? shown.map((o) => <AdminOrder key={o.id} o={o} customer={byUid[o.uid]} onZoom={setZoom} />) : <p className="text-sand">مفيش طلبات هنا.</p>}
        </section>
      ) : (
        <section className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-coal text-sand">
              <tr>
                <th className="p-3 text-start font-normal">الاسم</th>
                <th className="p-3 text-start font-normal">النوع</th>
                <th className="p-3 text-start font-normal">الموبايل</th>
                <th className="p-3 text-start font-normal">الطلبات</th>
                <th className="p-3 text-start font-normal">من</th>
              </tr>
            </thead>
            <tbody>
              {customers
                .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
                .map((c) => (
                  <tr key={c.uid} className="border-t border-line">
                    <td className="p-3 text-cream">
                      <button type="button" className="hover:text-gold" onClick={() => { setWho(c.uid); setTab("orders"); setFilter("all"); }}>
                        {c.name}
                        {c.shop && <span className="text-sand"> · {c.shop}</span>}
                      </button>
                      {c.email && <span className="block text-xs text-sand" dir="ltr">{c.email}</span>}
                    </td>
                    <td className="p-3">{c.type === "printshop" ? "مطبعة" : "عميل طباعة"}</td>
                    <td className="p-3">
                      <a href={wa(c.phone)} target="_blank" rel="noopener" className="text-gold hover:underline" dir="ltr">
                        {c.phone}
                      </a>
                    </td>
                    <td className="p-3 tabular-nums">{orders.filter((o) => o.uid === c.uid).length.toLocaleString("ar-EG")}</td>
                    <td className="p-3 text-sand">{dateAr(c.createdAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      )}

      {zoom && (
        <button type="button" onClick={() => setZoom(null)} className="fixed inset-0 z-[70] grid place-items-center bg-ink/90 p-6" aria-label="اقفل">
          <img src={zoom} alt="الرسمة" className="max-h-full max-w-full rounded-xl bg-white" />
        </button>
      )}
    </div>
  );
}
