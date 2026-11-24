import type { Metadata, Viewport } from "next";
import { Amiri, Cormorant_Garamond, Tajawal } from "next/font/google";
import "./globals.css";

const amiri = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-amiri", display: "swap" });
const tajawal = Tajawal({ subsets: ["arabic"], weight: ["300", "400", "500", "700"], variable: "--font-tajawal", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });

export const metadata: Metadata = {
  title: "حمدي الديب | Hamdy Eldeeb",
  description: "حمدي الديب — صناعة فيديو وحكي بصري، وسلسلة «لسه في رجوع»: قصص توبة ورجوع لله بلهجة مصرية، صادقة وهادية، من غير وعظ.",
  openGraph: {
    title: "حمدي الديب | لسه في رجوع",
    description: "نفس الإنسان، اتبنى من جديد.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0d0b09", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} ${tajawal.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
