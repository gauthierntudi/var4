export type PartnerRecord = {
  id: string;
  name: string;
  websiteUrl: string | null;
  logoUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

export function partnerLogoProxyUrl(id: string, version?: string | number) {
  const params = new URLSearchParams({ id });
  if (version !== undefined) {
    params.set("v", String(version));
  }
  return `/api/partners/logo?${params.toString()}`;
}

export function parsePartnerFormData(formData: FormData) {
  const name = typeof formData.get("name") === "string" ? formData.get("name")!.toString().trim() : "";
  const websiteUrlRaw =
    typeof formData.get("websiteUrl") === "string" ? formData.get("websiteUrl")!.toString().trim() : "";
  const sortOrderRaw =
    typeof formData.get("sortOrder") === "string" ? formData.get("sortOrder")!.toString().trim() : "0";

  if (!name || name.length > 120) {
    throw new Error("Nom du partenaire invalide.");
  }

  let websiteUrl: string | null = null;

  if (websiteUrlRaw) {
    try {
      const url = new URL(websiteUrlRaw);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("URL du site invalide.");
      }
      websiteUrl = url.toString();
    } catch {
      throw new Error("URL du site invalide.");
    }
  }

  const sortOrder = Number.parseInt(sortOrderRaw, 10);

  return {
    name,
    websiteUrl,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
}

export function parsePartnerUpdateFormData(formData: FormData) {
  const name = typeof formData.get("name") === "string" ? formData.get("name")!.toString().trim() : "";
  const sortOrderRaw =
    typeof formData.get("sortOrder") === "string" ? formData.get("sortOrder")!.toString().trim() : "0";

  if (!name || name.length > 120) {
    throw new Error("Nom du partenaire invalide.");
  }

  const sortOrder = Number.parseInt(sortOrderRaw, 10);

  return {
    name,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
}

export function getOptionalPartnerLogoFromFormData(formData: FormData) {
  const logo = formData.get("logo");

  if (!(logo instanceof File) || logo.size === 0) {
    return null;
  }

  return logo;
}

export function getPartnerLogoFromFormData(formData: FormData) {
  const logo = formData.get("logo");

  if (!(logo instanceof File) || logo.size === 0) {
    throw new Error("Logo requis.");
  }

  return logo;
}

export function mapPartnerRecord(partner: {
  id: string;
  name: string;
  websiteUrl: string | null;
  logoUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): PartnerRecord {
  return {
    id: partner.id,
    name: partner.name,
    websiteUrl: partner.websiteUrl,
    logoUrl: partnerLogoProxyUrl(partner.id, partner.updatedAt.getTime()),
    sortOrder: partner.sortOrder,
    isActive: partner.isActive,
    createdAt: partner.createdAt.toISOString(),
  };
}
