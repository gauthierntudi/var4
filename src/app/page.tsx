import { HeroSection } from "@/components/sections/HeroSection";
import { AdutArchiveSection } from "@/components/sections/AdutArchiveSection";
import { VarHorizontalStorySection } from "@/components/sections/VarHorizontalStorySection";
import { RevealSection } from "@/components/sections/RevealSection";
import { InscriptionCtaSection } from "@/components/sections/InscriptionCtaSection";
import { FooterSection } from "@/components/sections/FooterSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AdutArchiveSection />
      <VarHorizontalStorySection />
      <RevealSection />
      <InscriptionCtaSection />
      <FooterSection />
    </main>
  );
}
