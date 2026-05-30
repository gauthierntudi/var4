export type InscriptionPayload = {
  fullName: string;
  socialNetwork: string;
  link: string;
  pseudo: string;
  city: string;
  email: string;
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
  const payload: InscriptionPayload = {
    fullName: readField(formData, "fullName"),
    socialNetwork: readField(formData, "socialNetwork"),
    link: readField(formData, "link"),
    pseudo: readField(formData, "pseudo"),
    city: readField(formData, "city"),
    email: readField(formData, "email"),
  };

  if (!payload.fullName || payload.fullName.length > 120) {
    throw new Error("Nom complet invalide");
  }

  if (!SOCIAL_NETWORKS.has(payload.socialNetwork)) {
    throw new Error("Réseau social invalide");
  }

  try {
    const url = new URL(payload.link);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Lien invalide");
    }
  } catch {
    throw new Error("Lien invalide");
  }

  if (!payload.pseudo || payload.pseudo.length > 80) {
    throw new Error("Pseudo invalide");
  }

  if (!payload.city || payload.city.length > 80) {
    throw new Error("Ville invalide");
  }

  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    throw new Error("Adresse mail invalide");
  }

  return payload;
}

export function getPhotoFromFormData(formData: FormData) {
  const photo = formData.get("photo");
  if (!photo) return null;
  if (!(photo instanceof File) || photo.size === 0) return null;
  return photo;
}
