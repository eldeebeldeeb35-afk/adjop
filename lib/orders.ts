import { dipPricing } from "@/content/site";

export type FilmPaper = keyof typeof dipPricing.film;
export type CustomerType = "customer" | "printshop";
export type OrderKind = "separation" | "print";
export type OrderStatus = "new" | "priced" | "approved" | "working" | "ready" | "done" | "cancelled";

export type Customer = {
  uid: string;
  name: string;
  phone: string;
  shop?: string;
  type: CustomerType;
  email?: string | null;
  createdAt?: { seconds: number } | null;
};

export type Order = {
  id: string;
  uid: string;
  customerName: string;
  kind: OrderKind;
  status: OrderStatus;
  title: string;
  notes: string;
  design: string | null; // compressed preview image (data URL)
  // separation
  colors?: number;
  paper?: FilmPaper;
  sheets?: number;
  // print
  qty?: number;
  pricePerPiece?: number | null;
  total: number | null;
  createdAt?: { seconds: number } | null;
};

export const STATUS: Record<OrderStatus, { label: string; tone: "gold" | "warn" | "ok" | "muted" }> = {
  new: { label: "جديد · بيتراجع", tone: "gold" },
  priced: { label: "اتسعّر · مستني موافقتك", tone: "warn" },
  approved: { label: "اتوافق عليه", tone: "gold" },
  working: { label: "شغالين فيه", tone: "gold" },
  ready: { label: "جاهز للاستلام", tone: "ok" },
  done: { label: "اتسلّم", tone: "muted" },
  cancelled: { label: "اتلغى", tone: "muted" },
};

// what the workshop can move an order to, in order
export const FLOW: OrderStatus[] = ["new", "priced", "approved", "working", "ready", "done"];

export function separationTotal(colors: number, paper: FilmPaper, sheets: number) {
  return colors * dipPricing.separationPerColor + (paper === "none" ? 0 : sheets * dipPricing.film[paper].price);
}

export const egp = (n: number) => `${Math.round(n).toLocaleString("ar-EG")} ج`;

export function dateAr(ts?: { seconds: number } | null) {
  if (!ts) return "دلوقتي";
  return new Date(ts.seconds * 1000).toLocaleDateString("ar-EG", { day: "numeric", month: "long" });
}

// Shrink an uploaded design to a preview that fits inside a Firestore document (< ~600 KB).
export function compressImage(file: File, max = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      const g = c.getContext("2d")!;
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      let q = 0.85;
      let out = c.toDataURL("image/jpeg", q);
      while (out.length > 600_000 && q > 0.4) out = c.toDataURL("image/jpeg", (q -= 0.1));
      resolve(out);
    };
    img.onerror = () => reject(new Error("الملف ده مش صورة. ارفع PNG أو JPG."));
    img.src = url;
  });
}
