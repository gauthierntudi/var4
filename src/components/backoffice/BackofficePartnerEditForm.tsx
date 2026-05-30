"use client";

import { Icon } from "@iconify/react/offline";
import { DragEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { BACKOFFICE_PARTNER_ICONS } from "@/lib/backoffice-partner-icons";
import type { PartnerRecord } from "@/lib/partners";

const ACCEPTED_LOGO_TYPES = "image/png,image/jpeg,image/webp,image/svg+xml";

type BackofficePartnerEditFormProps = {
  partner: PartnerRecord;
  onCancel: () => void;
  onSaved: () => void | Promise<void>;
  onError: (message: string) => void;
};

export function BackofficePartnerEditForm({
  partner,
  onCancel,
  onSaved,
  onError,
}: BackofficePartnerEditFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(partner.name);
  const [sortOrder, setSortOrder] = useState(String(partner.sortOrder));
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearNewLogo = useCallback(() => {
    setLogoFile(null);
    setLogoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const applyLogoFile = useCallback(
    (file: File | null) => {
      if (!file) {
        clearNewLogo();
        return;
      }

      const allowedTypes = ACCEPTED_LOGO_TYPES.split(",");
      if (!allowedTypes.includes(file.type)) {
        onError("Format non supporté. Utilisez PNG, JPG, WEBP ou SVG.");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        onError("Le logo ne doit pas dépasser 2 Mo.");
        return;
      }

      setLogoFile(file);
      setLogoPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(file);
      });
    },
    [clearNewLogo, onError],
  );

  useEffect(() => () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    applyLogoFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("sortOrder", sortOrder);
      if (logoFile) {
        formData.set("logo", logoFile);
      }

      const response = await fetch(`/api/backoffice/partners/${partner.id}`, {
        method: "PUT",
        body: formData,
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Impossible de modifier le partenaire.");
      }

      await onSaved();
    } catch (submitError) {
      onError(submitError instanceof Error ? submitError.message : "Impossible de modifier le partenaire.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="backoffice-partner-edit" onSubmit={handleSubmit}>
      <div className="backoffice-partner-edit__header">
        <p className="backoffice-partner-edit__title">Modifier {partner.name}</p>
        <button
          type="button"
          className="backoffice-icon-button backoffice-icon-button--ghost"
          onClick={onCancel}
          aria-label="Annuler la modification"
          title="Annuler"
        >
          <Icon icon={BACKOFFICE_PARTNER_ICONS.close} width={18} height={18} aria-hidden />
        </button>
      </div>

      <div className="backoffice-partner-edit__layout">
        <label className="backoffice-field">
          <span className="backoffice-field__label">Nom du partenaire</span>
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="backoffice-field__input"
          />
        </label>

        <label className="backoffice-field backoffice-field--compact">
          <span className="backoffice-field__label">Ordre d&apos;affichage</span>
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="backoffice-field__input backoffice-field__input--number"
          />
        </label>

        <div className="backoffice-partner-edit__upload">
          <span className="backoffice-field__label">Logo</span>
          <span className="backoffice-field__hint">Laissez vide pour conserver le logo actuel</span>

          <div className="backoffice-partner-edit__logos">
            <div className="backoffice-partner-edit__current">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={partner.logoUrl} alt="" className="backoffice-partner-edit__current-image" />
              <span className="backoffice-partner-edit__current-label">Actuel</span>
            </div>

            <div
              className={`backoffice-dropzone backoffice-dropzone--compact${isDragging ? " is-dragging" : ""}${logoPreview ? " has-preview" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Choisir un nouveau logo"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_LOGO_TYPES}
                className="backoffice-dropzone__input"
                onChange={(event) => applyLogoFile(event.target.files?.[0] ?? null)}
              />

              {logoPreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoPreview} alt="" className="backoffice-dropzone__preview" />
                  <p className="backoffice-dropzone__filename">{logoFile?.name}</p>
                </>
              ) : (
                <>
                  <span className="backoffice-dropzone__icon" aria-hidden />
                  <p className="backoffice-dropzone__title">Nouveau logo</p>
                </>
              )}
            </div>
          </div>

          {logoPreview ? (
            <button
              type="button"
              className="backoffice-dropzone__clear"
              onClick={(event) => {
                event.stopPropagation();
                clearNewLogo();
              }}
            >
              Retirer le nouveau logo
            </button>
          ) : null}
        </div>
      </div>

      <div className="backoffice-partner-edit__footer">
        <button
          type="button"
          className="backoffice-button backoffice-button--ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button type="submit" className="backoffice-button backoffice-button--primary" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
