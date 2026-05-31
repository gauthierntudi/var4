"use client";

import { Icon } from "@iconify/react/offline";
import downloadIcon from "@iconify-icons/lucide/download";
import { useCallback, useEffect, useState } from "react";
import { generateInscriptionBadge } from "@/lib/inscription-badge";
import {
  BADGE_SHARE_NETWORKS,
  downloadBadgeBlob,
  getVar4ShareText,
  getVar4ShareUrl,
  shareBadgeOnNetwork,
  SOCIAL_BRAND_ICONS,
  type BadgeShareNetwork,
} from "@/lib/social-icons";

type InscriptionBadgeSuccessProps = {
  fullName: string;
  communityTitle: string;
  photoUrl: string | null;
  photoFile: File | null;
  onClose: () => void;
};

export function InscriptionBadgeSuccess({
  fullName,
  communityTitle,
  photoUrl,
  photoFile,
  onClose,
}: InscriptionBadgeSuccessProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [badgeBlob, setBadgeBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState("var4-badge.png");
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [sharingNetwork, setSharingNetwork] = useState<BadgeShareNetwork | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function buildBadge() {
      setIsGenerating(true);
      setError(null);

      try {
        const result = await generateInscriptionBadge({
          fullName,
          communityTitle,
          photoUrl,
          photoBlob: photoFile,
        });

        if (cancelled) return;

        objectUrl = URL.createObjectURL(result.blob);
        setPreviewUrl(objectUrl);
        setBadgeBlob(result.blob);
        setFileName(result.fileName);
      } catch (generationError) {
        if (!cancelled) {
          setError(
            generationError instanceof Error
              ? generationError.message
              : "Impossible de générer le badge.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsGenerating(false);
        }
      }
    }

    void buildBadge();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [communityTitle, fullName, photoFile, photoUrl]);

  const handleDownload = useCallback(() => {
    if (!badgeBlob) return;
    downloadBadgeBlob(badgeBlob, fileName);
  }, [badgeBlob, fileName]);

  const handleNativeShare = useCallback(async () => {
    if (!badgeBlob) return;

    setShareHint(null);

    if (!navigator.share) {
      handleDownload();
      setShareHint("Badge téléchargé — partagez l'image depuis votre galerie.");
      return;
    }

    const file = new File([badgeBlob], fileName, { type: "image/png" });

    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Mon badge VAR 4",
          text: getVar4ShareText(),
          url: getVar4ShareUrl(),
        });
        return;
      }

      await navigator.share({
        title: "Mon badge VAR 4",
        text: getVar4ShareText(),
        url: getVar4ShareUrl(),
      });
    } catch {
      // Annulation utilisateur ou partage indisponible.
    }
  }, [badgeBlob, fileName, handleDownload]);

  const handleNetworkShare = useCallback(
    async (network: BadgeShareNetwork) => {
      if (!badgeBlob) return;

      setShareHint(null);
      setSharingNetwork(network);

      try {
        await shareBadgeOnNetwork(network, badgeBlob, fileName);
      } catch (shareError) {
        setShareHint(
          shareError instanceof Error
            ? shareError.message
            : "Partage indisponible pour ce réseau.",
        );
      } finally {
        setSharingNetwork(null);
      }
    },
    [badgeBlob, fileName],
  );

  return (
    <div className="inscription-badge-success" data-lenis-prevent>
      <div className="inscription-badge-success__intro">
        <p className="inscription-badge-success__eyebrow">Inscription confirmée</p>
        <h3 className="inscription-badge-success__title">Ton badge VAR 4</h3>
        <p className="inscription-badge-success__text">
          Partage ta participation avec la communauté.
        </p>
      </div>

      <div className="inscription-badge-success__preview-wrap">
        {isGenerating ? (
          <div className="inscription-badge-success__loading" role="status">
            Génération du badge…
          </div>
        ) : null}

        {error ? (
          <p className="inscription-badge-success__error" role="alert">
            {error}
          </p>
        ) : null}

        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Badge VAR 4 — ${fullName}`}
            className="inscription-badge-success__preview"
            width={325}
            height={502}
          />
        ) : null}
      </div>

      <div className="inscription-badge-success__actions">
        <button
          type="button"
          className="inscription-badge-success__download"
          onClick={handleDownload}
          disabled={!badgeBlob || isGenerating}
        >
          <Icon icon={downloadIcon} aria-hidden />
          Télécharger
        </button>

        {"share" in navigator ? (
          <button
            type="button"
            className="inscription-badge-success__share-native"
            onClick={() => void handleNativeShare()}
            disabled={!badgeBlob || isGenerating}
          >
            Partager
          </button>
        ) : null}
      </div>

      <div className="inscription-badge-success__networks" aria-label="Partager sur les réseaux sociaux">
        {BADGE_SHARE_NETWORKS.map((network) => (
          <button
            key={network.id}
            type="button"
            className={`inscription-badge-success__network inscription-badge-success__network--${network.id}`}
            onClick={() => void handleNetworkShare(network.id)}
            disabled={!badgeBlob || isGenerating || sharingNetwork === network.id}
            aria-label={`Partager sur ${network.label}`}
            title={network.label}
          >
            <Icon icon={SOCIAL_BRAND_ICONS[network.id]} aria-hidden />
          </button>
        ))}
      </div>

      {shareHint ? (
        <p className="inscription-badge-success__hint" role="status">
          {shareHint}
        </p>
      ) : null}

      <button type="button" className="inscription-modal__submit" onClick={onClose}>
        Fermer
      </button>
    </div>
  );
}
