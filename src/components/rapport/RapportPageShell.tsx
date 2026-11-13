import { SiteHeader } from "@/components/layout/SiteHeader";
import { LegalPageHeader } from "@/components/legal/LegalPageHeader";
import { InscriptionCtaSection } from "@/components/sections/InscriptionCtaSection";
import { FooterSection } from "@/components/sections/FooterSection";
import { RapportFlipbook } from "@/components/rapport/RapportFlipbook";
import { RAPPORT_PDF_FILENAME, RAPPORT_PDF_URL, RAPPORT_TITLE } from "@/lib/rapport";

export function RapportPageShell() {
  return (
    <>
      <SiteHeader subpage />
      <LegalPageHeader title={RAPPORT_TITLE} image="/img/img05.jpg" />
      <section className="rapport-page" aria-label="Lecture du rapport">
        <RapportFlipbook src={RAPPORT_PDF_URL} downloadName={RAPPORT_PDF_FILENAME} />
      </section>
      <InscriptionCtaSection />
      <FooterSection />
    </>
  );
}
