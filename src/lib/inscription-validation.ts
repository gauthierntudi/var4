import { isValidEmailOrPhone, normalizeContact } from "@/lib/inscription-contact";

export type InscriptionPayload = {
  fullName: string;
  socialNetwork: string;
  communityTitle: string;
  pseudo: string;
  city: string;
  contact: string;
};

const SOCIAL_NETWORKS = new Set<string>([
  "Instagram",
  "Facebook",
  "TikTok",
  "X (Twitter)",
  "YouTube",
  "LinkedIn",
  "Autre",
]);

function readField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function parseInscriptionFormData(formData: FormData): InscriptionPayload {
  const communityTitle = readField(formData, "communityTitle");
  const contactRaw = readField(formData, "contact");

  const payload: InscriptionPayload = {
    fullName: readField(formData, "fullName"),
    socialNetwork: readField(formData, "socialNetwork"),
    communityTitle,
    pseudo: readField(formData, "pseudo") || communityTitle,
    city: readField(formData, "city"),
    contact: normalizeContact(contactRaw),
  };

  if (!payload.fullName || payload.fullName.length > 120) {
    throw new Error("Nom complet invalide");
  }

  if (!SOCIAL_NETWORKS.has(payload.socialNetwork)) {
    throw new Error("Réseau social invalide");
  }

  if (!payload.communityTitle || payload.communityTitle.length > 120) {
    throw new Error("Titre dans la communauté invalide");
  }

  if (!payload.pseudo || payload.pseudo.length > 80) {
    throw new Error("Titre dans la communauté invalide");
  }

  if (!payload.city || payload.city.length > 80) {
    throw new Error("Ville invalide");
  }

  if (!isValidEmailOrPhone(contactRaw)) {
    throw new Error("Adresse e-mail ou numéro de téléphone invalide");
  }

  return payload;
}

export function getPhotoFromFormData(formData: FormData) {
  const photo = formData.get("photo");
  if (!photo) return null;
  if (!(photo instanceof File) || photo.size === 0) return null;
  return photo;
}
