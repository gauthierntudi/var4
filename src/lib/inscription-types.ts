export type ExistingInscriptionRecord = {
  id: string;
  fullName: string;
  communityTitle: string;
  contact: string;
  photoUrl: string | null;
};

export type InscriptionSubmitResponse =
  | { ok: true; duplicate: false; id: string; createdAt: string }
  | { ok: true; duplicate: true; inscription: ExistingInscriptionRecord }
  | { ok?: false; error: string };
