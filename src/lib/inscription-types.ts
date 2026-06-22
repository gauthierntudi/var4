export type ExistingInscriptionRecord = {
  id: string;
  fullName: string;
  communityTitle: string;
  contact: string;
  city: string;
  socialNetwork: string;
  photoUrl: string | null;
};

export type InscriptionSubmitResponse =
  | { ok: true; duplicate: false; id: string; createdAt: string }
  | { ok: true; duplicate: true; inscription: ExistingInscriptionRecord }
  | { ok?: false; error: string };

export type InscriptionUpdateResponse =
  | {
      ok: true;
      id: string;
      fullName: string;
      communityTitle: string;
      photoUrl: string | null;
    }
  | { ok?: false; error: string };

export type InscriptionLookupResponse =
  | { ok: true; inscription: ExistingInscriptionRecord }
  | { ok?: false; error: string };
