import { HeroSection } from "@/components/sections/HeroSection";
import { AdutArchiveSection } from "@/components/sections/AdutArchiveSection";
import { VarHorizontalStorySection } from "@/components/sections/VarHorizontalStorySection";
import { CollaborateSection } from "@/components/sections/CollaborateSection";
import { InscriptionCtaSection } from "@/components/sections/InscriptionCtaSection";
import { FooterSection } from "@/components/sections/FooterSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AdutArchiveSection />
      <VarHorizontalStorySection />
      <CollaborateSection />
      <InscriptionCtaSection />
      <FooterSection />
    </main>
  );
}
