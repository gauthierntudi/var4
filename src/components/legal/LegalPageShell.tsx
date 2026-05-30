import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LegalPageHeader } from "@/components/legal/LegalPageHeader";
import { LegalPageContent } from "@/components/legal/LegalPageContent";
import { InscriptionCtaSection } from "@/components/sections/InscriptionCtaSection";
import { FooterSection } from "@/components/sections/FooterSection";

type LegalPageShellProps = {
  title: string;
  updatedAt: string;
  headerImage?: string;
  children: ReactNode;
};

export function LegalPageShell({
  title,
  updatedAt,
  headerImage,
  children,
}: LegalPageShellProps) {
  return (
    <>
      <SiteHeader subpage />
      <LegalPageHeader title={title} image={headerImage} />
      <LegalPageContent updatedAt={updatedAt}>{children}</LegalPageContent>
      <InscriptionCtaSection />
      <FooterSection />
    </>
  );
}
