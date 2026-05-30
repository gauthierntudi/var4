import { shuffleInscriptionFeed } from "@/lib/inscription-feed";

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

export type CollaborateCommunityCandidate = {
  id: string;
  fullName: string;
  photoUrl: string;
};

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

export type CollaborateCommunityApiResponse =
  | {
      mode: "static";
      totalInscriptions: number;
    }
  | {
      mode: "dynamic";
      totalInscriptions: number;
      candidates: CollaborateCommunityCandidate[];
    };

export const COLLABORATE_COMMUNITY_PHOTOS_URL = "/api/inscriptions/community-photos";

export function buildStaticCommunityData(totalInscriptions = 0): CollaborateCommunityData {
  return {
    mode: "static",
    totalInscriptions,
    persons: buildStaticPersons(),
  };
}

export function buildStaticPersons(): CollaborateCommunityPerson[] {
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

export function mapSlotsToPersons(
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

export function pickRandomCommunityPersons(
  candidates: CollaborateCommunityCandidate[],
): CollaborateCommunityPerson[] {
  const selected = shuffleInscriptionFeed(candidates).slice(0, COLLABORATE_SLOT_COUNT);
  return mapSlotsToPersons(selected);
}

export function resolveCommunityDataFromApi(
  payload: CollaborateCommunityApiResponse,
): CollaborateCommunityData {
  if (payload.mode === "dynamic" && payload.candidates.length > 0) {
    return {
      mode: "dynamic",
      totalInscriptions: payload.totalInscriptions,
      persons: pickRandomCommunityPersons(payload.candidates),
    };
  }

  return buildStaticCommunityData(payload.totalInscriptions);
}
