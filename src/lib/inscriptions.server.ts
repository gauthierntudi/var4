import type { ExistingInscriptionRecord } from "@/lib/inscription-types";
import type { InscriptionPayload } from "@/lib/inscription-validation";
import { getContactLookupValues } from "@/lib/inscription-contact";
import { resolveInscriptionFeedPhotoUrl } from "@/lib/inscription-feed";
import { prisma } from "@/lib/prisma";
import { deleteInscriptionPhoto, uploadInscriptionPhoto } from "@/lib/s3";

export type { ExistingInscriptionRecord } from "@/lib/inscription-types";

const INSCRIPTION_SELECT = {
  id: true,
  fullName: true,
  communityTitle: true,
  contact: true,
  city: true,
  socialNetwork: true,
  photoKey: true,
  photoUrl: true,
} as const;

function toExistingInscriptionRecord(row: {
  id: string;
  fullName: string;
  communityTitle: string;
  contact: string;
  city: string;
  socialNetwork: string;
  photoKey: string | null;
  photoUrl: string | null;
}): ExistingInscriptionRecord {
  return {
    id: row.id,
    fullName: row.fullName,
    communityTitle: row.communityTitle,
    contact: row.contact,
    city: row.city,
    socialNetwork: row.socialNetwork,
    photoUrl: resolveInscriptionFeedPhotoUrl(row.id, row.photoKey, row.photoUrl),
  };
}

export async function findInscriptionByContact(contact: string) {
  const lookupValues = getContactLookupValues(contact);

  const row = await prisma.inscription.findFirst({
    where: {
      contact: { in: lookupValues },
    },
    orderBy: { createdAt: "desc" },
    select: INSCRIPTION_SELECT,
  });

  if (!row) return null;

  return toExistingInscriptionRecord(row);
}

export async function findInscriptionByIdForContact(id: string, contact: string) {
  const lookupValues = getContactLookupValues(contact);

  const row = await prisma.inscription.findFirst({
    where: {
      id,
      contact: { in: lookupValues },
    },
    select: INSCRIPTION_SELECT,
  });

  if (!row) return null;

  return toExistingInscriptionRecord(row);
}

export async function updateInscriptionById(
  id: string,
  payload: InscriptionPayload,
  photo: File | null,
) {
  const existing = await prisma.inscription.findUnique({ where: { id } });

  if (!existing) {
    throw new Error("Inscription introuvable");
  }

  const existingLookup = getContactLookupValues(existing.contact);
  const payloadLookup = getContactLookupValues(payload.contact);

  if (!payloadLookup.some((value) => existingLookup.includes(value))) {
    throw new Error("L'e-mail ou le numéro de téléphone ne peut pas être modifié");
  }

  const other = await findInscriptionByContact(payload.contact);
  if (other && other.id !== id) {
    throw new Error("Ce contact est déjà utilisé par un autre profil");
  }

  let photoUrl = existing.photoUrl;
  let photoKey = existing.photoKey;

  if (photo) {
    const uploaded = await uploadInscriptionPhoto(photo);
    if (existing.photoKey) {
      await deleteInscriptionPhoto(existing.photoKey);
    }
    photoUrl = uploaded.url;
    photoKey = uploaded.key;
  }

  const updated = await prisma.inscription.update({
    where: { id },
    data: {
      ...payload,
      photoUrl,
      photoKey,
    },
    select: {
      id: true,
      fullName: true,
      communityTitle: true,
      photoKey: true,
      photoUrl: true,
    },
  });

  return {
    id: updated.id,
    fullName: updated.fullName,
    communityTitle: updated.communityTitle,
    photoUrl: resolveInscriptionFeedPhotoUrl(updated.id, updated.photoKey, updated.photoUrl),
  };
}
