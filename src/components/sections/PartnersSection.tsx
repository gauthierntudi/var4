import { getActivePartners } from "@/lib/partners.server";
import { PartnersSectionView } from "@/components/sections/PartnersSectionView";

export async function PartnersSection() {
  const partners = await getActivePartners();

  if (partners.length === 0) {
    return null;
  }

  return <PartnersSectionView partners={partners} />;
}
