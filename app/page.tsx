import Hero from "@/components/hero/Hero";
import Nav from "@/components/sections/Nav";
import Crossroads from "@/components/sections/Crossroads";
import Professional from "@/components/sections/Professional";
import Journey from "@/components/sections/Journey";
import Contact from "@/components/sections/Contact";
import MobileBar from "@/components/sections/MobileBar";
import { CursorGlow } from "@/components/ui";

export default function Page() {
  return (
    <>
      <Nav />
      <CursorGlow />
      <main>
        <Hero />
        <Crossroads />
        <Professional />
        <Journey />
        <Contact />
      </main>
      <MobileBar />
    </>
  );
}
