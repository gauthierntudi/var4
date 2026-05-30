import {
  resolveInscriptionFeedPhotoUrl,
  shuffleInscriptionFeed,
} from "@/lib/inscription-feed";
import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export const COLLABORATE_PHOTO_THRESHOLD = 25;
export const COLLABORATE_SLOT_COUNT = 12;

export const COLLABORATE_PERSON_SLOTS = [
  { key: "outer-1", ring: "outer", top: "2%", left: "50%", fallbackSrc: "/img/persons/person01.png" },
  { key: "outer-2", ring: "outer", top: "12%", left: "80%", fallbackSrc: "/img/persons/person02.png" },
  { key: "outer-3", ring: "outer", top: "50%", left: "98%", fallbackSrc: "/img/persons/person03.png" },
  { key: "outer-4", ring: "outer", top: "84%", left: "80%", fallbackSrc: "/img/persons/person04.png" },
  { key: "outer-5", ring: "outer", top: "98%", left: "50%", fallbackSrc: "/img/persons/person05.png" },
  { key: "outer-6", ring: "outer", top: "84%", left: "20%", fallbackSrc: "/img/persons/person06.png" },
  { key: "outer-7", ring: "outer", top: "50%", left: "2%", fallbackSrc: "/img/persons/person07.png" },
  { key: "outer-8", ring: "outer", top: "12%", left: "20%", fallbackSrc: "/img/persons/person08.png" },
  { key: "inner-1", ring: "inner", top: "24%", left: "66%", fallbackSrc: "/img/persons/person09.png" },
  { key: "inner-2", ring: "inner", top: "58%", left: "72%", fallbackSrc: "/img/persons/person010.png" },
  { key: "inner-3", ring: "inner", top: "68%", left: "40%", fallbackSrc: "/img/persons/person011.png" },
  { key: "inner-4", ring: "inner", top: "34%", left: "30%", fallbackSrc: "/img/persons/person012.png" },
] as const;

export type CollaboratePersonRing = (typeof COLLABORATE_PERSON_SLOTS)[number]["ring"];

export type CollaborateCommunityPerson = {
  key: string;
  ring: CollaboratePersonRing;
  top: string;
  left: string;
  src: string;
  fullName: string;
  isDynamic: boolean;
};

export type CollaborateCommunityData = {
  mode: "static" | "dynamic";
  totalInscriptions: number;
  persons: CollaborateCommunityPerson[];
};

function buildStaticPersons(): CollaborateCommunityPerson[] {
  return COLLABORATE_PERSON_SLOTS.map((slot) => ({
    key: slot.key,
    ring: slot.ring,
    top: slot.top,
    left: slot.left,
    src: slot.fallbackSrc,
    fullName: "",
    isDynamic: false,
  }));
}

function mapSlotsToPersons(
  selected: Array<{ id: string; fullName: string; photoUrl: string | null }>,
): CollaborateCommunityPerson[] {
  return COLLABORATE_PERSON_SLOTS.map((slot, index) => {
    const dynamic = selected[index];

    if (dynamic?.photoUrl) {
      return {
        key: `${slot.key}-${dynamic.id}`,
        ring: slot.ring,
        top: slot.top,
        left: slot.left,
        src: dynamic.photoUrl,
        fullName: dynamic.fullName,
        isDynamic: true,
      };
    }

    return {
      key: slot.key,
      ring: slot.ring,
      top: slot.top,
      left: slot.left,
      src: slot.fallbackSrc,
      fullName: "",
      isDynamic: false,
    };
  });
}

export async function getCollaborateCommunityPhotos(): Promise<CollaborateCommunityData> {
  noStore();

  const staticPersons = buildStaticPersons();

  if (!process.env.DATABASE_URL) {
    return {
      mode: "static",
      totalInscriptions: 0,
      persons: staticPersons,
    };
  }

  try {
    const totalInscriptions = await prisma.inscription.count();

    if (totalInscriptions <= COLLABORATE_PHOTO_THRESHOLD) {
      return {
        mode: "static",
        totalInscriptions,
        persons: staticPersons,
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

    const eligible = rows
      .map((row) => ({
        id: row.id,
        fullName: row.fullName,
        photoUrl: resolveInscriptionFeedPhotoUrl(row.id, row.photoKey, row.photoUrl),
      }))
      .filter((row): row is { id: string; fullName: string; photoUrl: string } => Boolean(row.photoUrl));

    const selected = shuffleInscriptionFeed(eligible).slice(0, COLLABORATE_SLOT_COUNT);

    return {
      mode: "dynamic",
      totalInscriptions,
      persons: mapSlotsToPersons(selected),
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getCollaborateCommunityPhotos]", error);
    }

    return {
      mode: "static",
      totalInscriptions: 0,
      persons: staticPersons,
    };
  }
}
