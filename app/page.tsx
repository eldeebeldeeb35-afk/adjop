import Hero from "@/components/hero/Hero";
import Nav from "@/components/sections/Nav";
import About from "@/components/sections/About";
import Journey from "@/components/sections/Journey";
import Contact from "@/components/sections/Contact";
import MobileBar from "@/components/sections/MobileBar";
import { CursorGlow } from "@/components/ui";

export default function Page() {
  return (
    <>
      <Nav
        items={[
          { href: "#about", label: "مين أنا" },
          { href: "#journey", label: "رحلتي" },
          { href: "#episodes", label: "الحلقات" },
          { href: "#contact", label: "تواصل" },
        ]}
        cta={{ href: "/work/", label: "شغلي ←" }}
      />
      <CursorGlow />
      <main>
        <Hero />
        <About />
        <Journey />
        <Contact />
      </main>
      <MobileBar variant="story" />
    </>
  );
}
