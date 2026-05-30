import { SiteHeader } from "@/components/layout/SiteHeader";
import { FooterSection } from "@/components/sections/FooterSection";
import { InscriptionCtaSection } from "@/components/sections/InscriptionCtaSection";
import { ContactPageContent } from "@/components/contact/ContactPageContent";

export function ContactPageShell() {
  return (
    <>
      <SiteHeader subpage />
      <ContactPageContent />
      <InscriptionCtaSection variant="solid" solidColor="#4c98d2" />
      <FooterSection />
    </>
  );
}
