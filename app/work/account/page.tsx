import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Account from "@/components/work/Account";

export const metadata: Metadata = {
  title: "حسابي | D.I.P",
  description: "حساب عملاء D.I.P: اطلب فصل ألوان أو طباعة سلك سكرين وتابع طلباتك.",
};

export default function Page() {
  return (
    <>
      <Nav
        items={[
          { href: "/work/#separation", label: "أسعار الفصل" },
          { href: "/work/#printing", label: "الطباعة" },
        ]}
        cta={{ href: "/work/", label: "صفحة D.I.P" }}
      />
      <main className="mx-auto min-h-[100svh] max-w-[880px] px-6 pb-24 pt-28">
        <Account />
      </main>
    </>
  );
}
