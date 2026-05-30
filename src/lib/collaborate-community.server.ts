import { resolveInscriptionFeedPhotoUrl } from "@/lib/inscription-feed";
import { prisma } from "@/lib/prisma";
import {
  COLLABORATE_PHOTO_THRESHOLD,
  type CollaborateCommunityApiResponse,
} from "@/lib/collaborate-community";

export async function getCollaborateCommunityState(): Promise<CollaborateCommunityApiResponse> {
  if (!process.env.DATABASE_URL) {
    return {
      mode: "static",
      totalInscriptions: 0,
    };
  }

  try {
    const totalInscriptions = await prisma.inscription.count();

    if (totalInscriptions <= COLLABORATE_PHOTO_THRESHOLD) {
      return {
        mode: "static",
        totalInscriptions,
      };
    }

    const rows = await prisma.inscription.findMany({
      select: {
        id: true,
        fullName: true,
        photoKey: true,
        photoUrl: true,
      },
    });

    const candidates = rows
      .map((row) => ({
        id: row.id,
        fullName: row.fullName,
        photoUrl: resolveInscriptionFeedPhotoUrl(row.id, row.photoKey, row.photoUrl),
      }))
      .filter((row): row is { id: string; fullName: string; photoUrl: string } => Boolean(row.photoUrl));

    if (candidates.length === 0) {
      return {
        mode: "static",
        totalInscriptions,
      };
    }

    return {
      mode: "dynamic",
      totalInscriptions,
      candidates,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getCollaborateCommunityState]", error);
    }

    return {
      mode: "static",
      totalInscriptions: 0,
    };
  }
}
