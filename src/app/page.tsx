import { HeroSection } from "@/components/sections/HeroSection";
import { AdutArchiveSection } from "@/components/sections/AdutArchiveSection";
import { VarHorizontalStorySection } from "@/components/sections/VarHorizontalStorySection";
import { CollaborateSection } from "@/components/sections/CollaborateSection";
import { InscriptionCtaSection } from "@/components/sections/InscriptionCtaSection";
import { FooterSection } from "@/components/sections/FooterSection";
import { getCollaborateCommunityPhotos } from "@/lib/collaborate-community";

export default async function Home() {
  const communityData = await getCollaborateCommunityPhotos();

  return (
    <main>
      <HeroSection />
      <AdutArchiveSection />
      <VarHorizontalStorySection />
      <CollaborateSection communityData={communityData} />
      <InscriptionCtaSection />
      <FooterSection />
    </main>
  );
}
