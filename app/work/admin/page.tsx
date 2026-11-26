import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Admin from "@/components/work/Admin";

export const metadata: Metadata = {
  title: "لوحة الإدارة | D.I.P",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <Nav items={[]} cta={{ href: "/work/account/", label: "حسابي" }} />
      <main className="mx-auto min-h-[100svh] max-w-[1100px] px-6 pb-24 pt-28">
        <Admin />
      </main>
    </>
  );
}
