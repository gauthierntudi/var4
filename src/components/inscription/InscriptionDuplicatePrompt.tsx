"use client";

import { Icon } from "@iconify/react/offline";
import mailIcon from "@iconify-icons/lucide/mail";
import smartphoneIcon from "@iconify-icons/lucide/smartphone";
import type { ExistingInscriptionRecord } from "@/lib/inscription-types";
import {
  formatContactDisplay,
  getContactKind,
} from "@/lib/inscription-contact";
import { formatInscriptionDisplayName } from "@/lib/inscription-badge-name";
import { getInscriptionInitials } from "@/lib/inscription-feed";

type InscriptionDuplicatePromptProps = {
  record: ExistingInscriptionRecord;
  onConfirm: () => void;
  onDecline: () => void;
  onEdit?: () => void;
};

export function InscriptionDuplicatePrompt({
  record,
  onConfirm,
  onDecline,
  onEdit,
}: InscriptionDuplicatePromptProps) {
  const contactKind = getContactKind(record.contact);
  const contactDisplay = formatContactDisplay(record.contact);
  const initials = getInscriptionInitials(record.fullName);
  const canEdit = Boolean(onEdit);

  return (
    <div
      className="inscription-duplicate-prompt"
      role="alertdialog"
      aria-labelledby="inscription-duplicate-title"
      aria-describedby="inscription-duplicate-desc"
    >
      <div className="inscription-duplicate-prompt__header">
        <span className="inscription-duplicate-prompt__badge" aria-hidden>
          Inscrit
        </span>
        <h3 id="inscription-duplicate-title" className="inscription-duplicate-prompt__title">
          Participation déjà enregistrée
        </h3>
        <p id="inscription-duplicate-desc" className="inscription-duplicate-prompt__lead">
          Nous avons retrouvé votre profil VAR 4. Souhaitez-vous générer à nouveau votre badge ?
        </p>
      </div>

      <article className="inscription-duplicate-prompt__profile" aria-label="Profil enregistré">
        <div className="inscription-duplicate-prompt__avatar" aria-hidden>
          {record.photoUrl ? (
            <img src={record.photoUrl} alt="" className="inscription-duplicate-prompt__avatar-image" />
          ) : (
            <span className="inscription-duplicate-prompt__avatar-fallback">{initials || "?"}</span>
          )}
        </div>

        <div className="inscription-duplicate-prompt__profile-body">
          <p className="inscription-duplicate-prompt__name">
            {formatInscriptionDisplayName(record.fullName)}
          </p>

          <p className="inscription-duplicate-prompt__contact">
            <Icon
              icon={contactKind === "email" ? mailIcon : smartphoneIcon}
              className="inscription-duplicate-prompt__contact-icon"
              aria-hidden
            />
            <span>{contactDisplay}</span>
          </p>

          {record.communityTitle ? (
            <p className="inscription-duplicate-prompt__title-role">{record.communityTitle}</p>
          ) : null}
        </div>
      </article>

      <div className="inscription-duplicate-prompt__actions">
        {canEdit ? (
          <button type="button" className="inscription-modal__edit" onClick={onEdit}>
            Modifier mes informations
          </button>
        ) : null}

        <div className="inscription-duplicate-prompt__actions-row">
          <button type="button" className="inscription-modal__cancel" onClick={onDecline}>
            Non, fermer
          </button>
          <button type="button" className="inscription-modal__submit" onClick={onConfirm}>
            Oui, générer le badge
          </button>
        </div>
      </div>
    </div>
  );
}
