import { isValidEmailOrPhone, normalizeContact } from "@/lib/inscription-contact";

export const INSCRIPTION_FULL_NAME_MIN = 3;
export const INSCRIPTION_FULL_NAME_MAX = 25;
export const INSCRIPTION_COMMUNITY_TITLE_MIN = 3;
export const INSCRIPTION_COMMUNITY_TITLE_MAX = 20;

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

  if (payload.fullName.length < INSCRIPTION_FULL_NAME_MIN) {
    throw new Error(`Le nom doit contenir au moins ${INSCRIPTION_FULL_NAME_MIN} caractères.`);
  }

  if (payload.fullName.length > INSCRIPTION_FULL_NAME_MAX) {
    throw new Error(`Le nom ne peut pas dépasser ${INSCRIPTION_FULL_NAME_MAX} caractères.`);
  }

  if (!SOCIAL_NETWORKS.has(payload.socialNetwork)) {
    throw new Error("Réseau social invalide");
  }

  if (payload.communityTitle.length < INSCRIPTION_COMMUNITY_TITLE_MIN) {
    throw new Error(
      `Le titre dans la communauté doit contenir au moins ${INSCRIPTION_COMMUNITY_TITLE_MIN} caractères.`,
    );
  }

  if (payload.communityTitle.length > INSCRIPTION_COMMUNITY_TITLE_MAX) {
    throw new Error(
      `Le titre dans la communauté ne peut pas dépasser ${INSCRIPTION_COMMUNITY_TITLE_MAX} caractères.`,
    );
  }

  if (!payload.pseudo || payload.pseudo.length > INSCRIPTION_COMMUNITY_TITLE_MAX) {
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
