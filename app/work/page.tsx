import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import MobileBar from "@/components/sections/MobileBar";
import WorkPage from "@/components/work/WorkPage";
import { CursorGlow } from "@/components/ui";

export const metadata: Metadata = {
  title: "D.I.P | تصميم وفصل ألوان وطباعة سلك سكرين",
  description: "D.I.P: تصميم للملابس، وفصل ألوان لمطابع السلك سكرين، وطباعة على الملابس. حمدي الديب.",
  openGraph: {
    title: "D.I.P | تصميم وفصل ألوان وطباعة سلك سكرين",
    description: "تصميم للملابس، وفصل ألوان للمطابع، وطباعة سلك سكرين.",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <Nav
        items={[
          { href: "#services", label: "الخدمات" },
          { href: "#steps", label: "خطوات الشغل" },
          { href: "#contact", label: "تواصل" },
        ]}
        cta={{ href: "/", label: "القصة والمحتوى" }}
      />
      <CursorGlow />
      <WorkPage />
      <MobileBar variant="work" />
    </>
  );
}
