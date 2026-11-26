"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { addDoc, collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { fb, firebaseReady } from "@/lib/firebase";
import { dipPricing } from "@/content/site";
import {
  STATUS,
  compressImage,
  dateAr,
  egp,
  separationTotal,
  type Customer,
  type CustomerType,
  type FilmPaper,
  type Order,
  type OrderKind,
} from "@/lib/orders";

export const field = "w-full rounded-xl border border-line bg-night px-4 py-2.5 text-cream placeholder:text-sand/50";
export const btnGold = "rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-ink transition hover:brightness-110 disabled:opacity-50";
export const btnGhost = "rounded-full border border-gold/40 px-5 py-2 text-sm text-gold transition hover:border-gold hover:bg-gold/10";
export const card = "rounded-3xl border border-line bg-coal/70 p-6 md:p-8";

const toneClass = { gold: "border-gold/60 text-gold", warn: "border-[#e3a54a] text-[#e3a54a]", ok: "border-[#7fbf8a] text-[#7fbf8a]", muted: "border-line text-sand" };
export function StatusPill({ s }: { s: Order["status"] }) {
  return <span className={`rounded-full border px-3 py-0.5 text-xs ${toneClass[STATUS[s].tone]}`}>{STATUS[s].label}</span>;
}

const authError = (code: string) =>
  ({
    "auth/invalid-credential": "الإيميل أو الباسورد غلط.",
    "auth/invalid-email": "الإيميل مكتوب غلط.",
    "auth/email-already-in-use": "الإيميل ده عليه حساب. ادخل بيه بدل ما تعمل حساب جديد.",
    "auth/weak-password": "الباسورد لازم يبقى 6 حروف أو أكتر.",
    "auth/popup-closed-by-user": "اتقفلت نافذة جوجل قبل ما تخلص. جرّب تاني.",
    "auth/network-request-failed": "النت فاصل. اتأكد من الاتصال وجرّب تاني.",
  })[code] ?? "حصلت مشكلة. جرّب تاني.";

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    const f = fb();
    if (!f) return setUser(null);
    return onAuthStateChanged(f.auth, setUser);
  }, []);
  return user;
}

export function NotConfigured() {
  return (
    <div className={card}>
      <h2 className="font-display text-2xl text-cream">التسجيل لسه ما اتفعّلش</h2>
      <p className="mt-3 text-sand">
        الحسابات محتاجة قاعدة بيانات Firebase. أول ما تتحط بيانات المشروع في <code dir="ltr">content/site.ts</code> الصفحة دي هتشتغل.
      </p>
    </div>
  );
}

function SignIn() {
  const [mode, setMode] = useState<"in" | "up">("up");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const f = fb()!;

  const run = async (fn: () => Promise<unknown>) => {
    setErr("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setErr(authError((e as { code?: string }).code ?? ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`${card} mx-auto max-w-md`}>
      <h2 className="font-display text-3xl text-cream">{mode === "up" ? "اعمل حساب عميل" : "ادخل على حسابك"}</h2>
      <p className="mt-2 text-sm text-sand">عشان تطلب فصل ألوان أو طباعة وتتابع طلباتك.</p>
      <button type="button" disabled={busy} onClick={() => run(() => signInWithPopup(f.auth, new GoogleAuthProvider()))} className={`${btnGold} mt-6 w-full`}>
        كمّل بحساب جوجل
      </button>
      <div className="my-5 flex items-center gap-3 text-xs text-sand">
        <span className="h-px flex-1 bg-line" />أو بالإيميل<span className="h-px flex-1 bg-line" />
      </div>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => (mode === "up" ? createUserWithEmailAndPassword : signInWithEmailAndPassword)(f.auth, email.trim(), pass));
        }}
      >
        <label className="sr-only" htmlFor="acc-email">الإيميل</label>
        <input id="acc-email" type="email" required dir="ltr" placeholder="الإيميل" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        <label className="sr-only" htmlFor="acc-pass">الباسورد</label>
        <input id="acc-pass" type="password" required minLength={6} dir="ltr" placeholder="الباسورد" value={pass} onChange={(e) => setPass(e.target.value)} className={field} />
        {err && <p className="text-sm text-[#e07a6a]">{err}</p>}
        <button type="submit" disabled={busy} className={btnGhost}>
          {mode === "up" ? "اعمل الحساب" : "ادخل"}
        </button>
      </form>
      <button type="button" onClick={() => setMode(mode === "up" ? "in" : "up")} className="mt-5 text-sm text-gold hover:underline">
        {mode === "up" ? "عندك حساب؟ ادخل" : "أول مرة؟ اعمل حساب"}
      </button>
    </div>
  );
}

function Profile({ user, onSaved }: { user: User; onSaved: (c: Customer) => void }) {
  const [name, setName] = useState(user.displayName ?? "");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<CustomerType>("customer");
  const [shop, setShop] = useState("");
  const [err, setErr] = useState("");
  return (
    <form
      className={`${card} mx-auto grid max-w-md gap-4`}
      onSubmit={async (e) => {
        e.preventDefault();
        const data = { name: name.trim(), phone: phone.trim(), type, shop: shop.trim(), email: user.email ?? null, createdAt: serverTimestamp() };
        try {
          await setDoc(doc(fb()!.db, "customers", user.uid), data);
          onSaved({ uid: user.uid, ...data, createdAt: null });
        } catch {
          setErr("ما اتحفظش. اتأكد إن الاسم مكتوب وجرّب تاني.");
        }
      }}
    >
      <h2 className="font-display text-3xl text-cream">بياناتك</h2>
      <p className="-mt-2 text-sm text-sand">مرة واحدة بس، عشان نعرف نكلمك.</p>
      <div>
        <label htmlFor="p-name" className="text-sm text-sand">الاسم</label>
        <input id="p-name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className={`${field} mt-1`} />
      </div>
      <div>
        <label htmlFor="p-phone" className="text-sm text-sand">رقم الموبايل (واتساب)</label>
        <input id="p-phone" required type="tel" dir="ltr" inputMode="tel" placeholder="01xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${field} mt-1`} />
      </div>
      <div>
        <span className="text-sm text-sand">انت</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["customer", "عميل طباعة"],
              ["printshop", "مطبعة (فصل ألوان)"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setType(k)} className={`rounded-full border px-4 py-2 text-sm ${type === k ? "border-gold bg-gold/10 text-gold" : "border-line text-cream"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      {type === "printshop" && (
        <div>
          <label htmlFor="p-shop" className="text-sm text-sand">اسم المطبعة</label>
          <input id="p-shop" value={shop} onChange={(e) => setShop(e.target.value)} className={`${field} mt-1`} />
        </div>
      )}
      {err && <p className="text-sm text-[#e07a6a]">{err}</p>}
      <button type="submit" className={btnGold}>احفظ وكمّل</button>
    </form>
  );
}

function NewOrder({ customer, onDone }: { customer: Customer; onDone: () => void }) {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const [kind, setKind] = useState<OrderKind>((params?.get("new") as OrderKind) || (customer.type === "printshop" ? "separation" : "print"));
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [design, setDesign] = useState<string | null>(null);
  const [colors, setColors] = useState(Math.min(12, Math.max(1, Number(params?.get("colors")) || 4)));
  const [paper, setPaper] = useState<FilmPaper>(((params?.get("paper") as FilmPaper) in dipPricing.film ? params?.get("paper") : "none") as FilmPaper);
  const [sheets, setSheets] = useState(Number(params?.get("sheets")) || colors);
  const [qty, setQty] = useState(50);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const total = separationTotal(colors, paper, paper === "none" ? 0 : sheets);

  const submit = async () => {
    setErr("");
    if (!design) return setErr("ارفع الرسمة الأول.");
    setBusy(true);
    const common = { uid: customer.uid, customerName: customer.shop || customer.name, status: "new", title: title.trim() || "طلب بدون اسم", notes: notes.trim(), design, createdAt: serverTimestamp() };
    const data =
      kind === "separation"
        ? { ...common, kind, colors, paper, sheets: paper === "none" ? 0 : sheets, total }
        : { ...common, kind, qty, pricePerPiece: null, total: null };
    try {
      await addDoc(collection(fb()!.db, "orders"), data);
      onDone();
    } catch {
      setErr("الطلب ما اتبعتش. لو الصورة كبيرة قوي جرّب صورة أصغر.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`${card} grid gap-5`}>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["separation", "فصل ألوان"],
            ["print", "طباعة سلك سكرين"],
          ] as const
        ).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setKind(k)} className={`rounded-full border px-5 py-2 text-sm ${kind === k ? "border-gold bg-gold/10 text-gold" : "border-line text-cream"}`}>
            {l}
          </button>
        ))}
      </div>
      <div>
        <label htmlFor="o-title" className="text-sm text-sand">اسم الطلب</label>
        <input id="o-title" maxLength={120} placeholder="مثلاً: تيشيرت فريق الكورة" value={title} onChange={(e) => setTitle(e.target.value)} className={`${field} mt-1`} />
      </div>
      <label htmlFor="o-file" className="block cursor-pointer rounded-2xl border border-dashed border-line p-5 text-center hover:border-gold/60">
        <input
          id="o-file"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              setDesign(await compressImage(file));
            } catch (x) {
              setErr((x as Error).message);
            }
          }}
        />
        {design ? <img src={design} alt="الرسمة" className="mx-auto max-h-56 rounded-lg" /> : <span className="text-cream">ارفع الرسمة</span>}
        <span className="mt-2 block text-xs text-sand">{design ? "دوس عشان تغيّرها" : "PNG أو JPG"}</span>
      </label>

      {kind === "separation" ? (
        <div className="grid gap-4">
          <div>
            <label htmlFor="o-colors" className="text-sm text-sand">عدد الألوان: <b className="text-cream">{colors.toLocaleString("ar-EG")}</b></label>
            <input id="o-colors" type="range" min={1} max={12} value={colors} onChange={(e) => { setColors(+e.target.value); setSheets(+e.target.value); }} className="mt-2 w-full accent-[#d9ae5f]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(dipPricing.film) as FilmPaper[]).map((k) => (
              <button key={k} type="button" onClick={() => setPaper(k)} className={`rounded-full border px-4 py-2 text-sm ${paper === k ? "border-gold bg-gold/10 text-gold" : "border-line text-cream"}`}>
                {dipPricing.film[k].label}
              </button>
            ))}
          </div>
          {paper !== "none" && (
            <div>
              <label htmlFor="o-sheets" className="text-sm text-sand">عدد الورق ({dipPricing.filmSize})</label>
              <input id="o-sheets" type="number" min={1} inputMode="numeric" value={sheets} onChange={(e) => setSheets(Math.max(1, +e.target.value || 1))} className={`${field} mt-1 w-32`} />
            </div>
          )}
          <p className="text-sand">
            الإجمالي: <b className="font-display text-2xl text-gold">{egp(total)}</b>
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          <label htmlFor="o-qty" className="text-sm text-sand">عدد القطع</label>
          <input id="o-qty" type="number" min={1} inputMode="numeric" value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} className={`${field} w-40`} />
          <p className="text-sm text-sand">سعر القطعة هيتحدد بعد ما نشوف الرسمة، وهيوصلك هنا توافق عليه.</p>
        </div>
      )}

      <div>
        <label htmlFor="o-notes" className="text-sm text-sand">ملاحظات</label>
        <textarea id="o-notes" rows={3} maxLength={2000} placeholder="نوع القماش ولونه، مكان الطباعة، أي تفاصيل" value={notes} onChange={(e) => setNotes(e.target.value)} className={`${field} mt-1`} />
      </div>
      {err && <p className="text-sm text-[#e07a6a]">{err}</p>}
      <button type="button" disabled={busy} onClick={submit} className={btnGold}>
        {busy ? "بيتبعت…" : "ابعت الطلب"}
      </button>
    </div>
  );
}

function OrderCard({ o }: { o: Order }) {
  const [busy, setBusy] = useState(false);
  const set = async (status: Order["status"]) => {
    setBusy(true);
    try {
      await updateDoc(doc(fb()!.db, "orders", o.id), { status });
    } finally {
      setBusy(false);
    }
  };
  return (
    <article className="flex gap-4 rounded-2xl border border-line bg-night/60 p-4">
      {o.design && <img src={o.design} alt="" className="h-20 w-20 shrink-0 rounded-lg bg-white object-contain" />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-cream">{o.title}</h3>
          <StatusPill s={o.status} />
        </div>
        <p className="mt-1 text-sm text-sand">
          {dateAr(o.createdAt)} ·{" "}
          {o.kind === "separation"
            ? `فصل ${o.colors?.toLocaleString("ar-EG")} ألوان${o.paper !== "none" ? ` + ${o.sheets?.toLocaleString("ar-EG")} ورقة ${o.paper === "calc" ? "كلك" : "أبيض"}` : ""}`
            : `طباعة ${o.qty?.toLocaleString("ar-EG")} قطعة`}
        </p>
        <p className="mt-1 text-sm">
          {o.total != null ? (
            <>
              الإجمالي <b className="text-gold">{egp(o.total)}</b>
              {o.pricePerPiece != null && <span className="text-sand"> ({egp(o.pricePerPiece)} للقطعة)</span>}
            </>
          ) : (
            <span className="text-sand">مستني تحديد سعر القطعة</span>
          )}
        </p>
        {(o.status === "priced" || o.status === "new") && (
          <div className="mt-3 flex flex-wrap gap-2">
            {o.status === "priced" && (
              <button type="button" disabled={busy} onClick={() => set("approved")} className={btnGold}>
                موافق على السعر
              </button>
            )}
            <button type="button" disabled={busy} onClick={() => set("cancelled")} className="rounded-full border border-line px-4 py-2 text-sm text-sand hover:text-cream">
              إلغاء الطلب
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Account() {
  const user = useAuth();
  const [customer, setCustomer] = useState<Customer | null | undefined>(undefined);
  const [admin, setAdmin] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!user) return setCustomer(user === null ? null : undefined);
    const { db } = fb()!;
    getDoc(doc(db, "customers", user.uid)).then((s) => setCustomer(s.exists() ? ({ uid: user.uid, ...s.data() } as Customer) : null));
    getDoc(doc(db, "admins", user.uid)).then((s) => setAdmin(s.exists())).catch(() => setAdmin(false));
    if (new URLSearchParams(window.location.search).get("new")) setShowNew(true);
    return onSnapshot(query(collection(db, "orders"), where("uid", "==", user.uid)), (snap) =>
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order)),
    );
  }, [user]);

  const sorted = useMemo(() => [...orders].sort((a, b) => (b.createdAt?.seconds ?? 9e12) - (a.createdAt?.seconds ?? 9e12)), [orders]);

  if (!firebaseReady) return <NotConfigured />;
  if (user === undefined || (user && customer === undefined)) return <p className="text-center text-sand">بيحمّل…</p>;
  if (!user) return <SignIn />;
  if (!customer) return <Profile user={user} onSaved={setCustomer} />;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-sand">أهلاً</p>
          <h2 className="font-display text-3xl text-cream">{customer.shop || customer.name}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {admin && (
            <Link href="/work/admin/" className={btnGhost}>
              لوحة الإدارة
            </Link>
          )}
          <button type="button" onClick={() => signOut(fb()!.auth)} className="rounded-full border border-line px-4 py-2 text-sm text-sand hover:text-cream">
            خروج
          </button>
        </div>
      </div>

      {showNew ? (
        <NewOrder customer={customer} onDone={() => { setShowNew(false); history.replaceState(null, "", location.pathname); }} />
      ) : (
        <button type="button" onClick={() => setShowNew(true)} className={`${btnGold} justify-self-start`}>
          + طلب جديد
        </button>
      )}

      <section className="grid gap-3">
        <h2 className="font-display text-2xl text-cream">طلباتي</h2>
        {sorted.length ? sorted.map((o) => <OrderCard key={o.id} o={o} />) : <p className="text-sand">لسه ما عندكش طلبات. اعمل أول طلب من الزرار اللي فوق.</p>}
      </section>
    </div>
  );
}
