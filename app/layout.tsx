import type { Metadata, Viewport } from "next";
import { Amiri, Noto_Kufi_Arabic, Reem_Kufi } from "next/font/google";
import "./globals.css";

// Kufic faces to match the square-Kufic channel logo. Amiri stays only for the
// Quran verse, which needs full tashkeel support.
const reemKufi = Reem_Kufi({ subsets: ["arabic", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-reem", display: "swap" });
const notoKufi = Noto_Kufi_Arabic({ subsets: ["arabic", "latin"], weight: ["300", "400", "500", "700"], variable: "--font-noto-kufi", display: "swap" });
const amiri = Amiri({ subsets: ["arabic"], weight: ["400"], variable: "--font-amiri", display: "swap" });

export const metadata: Metadata = {
  // absolute base for the share image and icons (GitHub Pages serves under /adjop)
  metadataBase: new URL("https://eldeebeldeeb35-afk.github.io"),
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
    <html lang="ar" dir="rtl" className={`${reemKufi.variable} ${notoKufi.variable} ${amiri.variable}`}>
      <body>{children}</body>
    </html>
  );
}
