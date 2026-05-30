"use client";

import { Icon } from "@iconify/react/offline";
import { DragEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BACKOFFICE_PARTNER_ICONS } from "@/lib/backoffice-partner-icons";
import type { PartnerRecord } from "@/lib/partners";
import { BackofficePartnerEditForm } from "@/components/backoffice/BackofficePartnerEditForm";

type PartnersResponse = {
  items: PartnerRecord[];
  error?: string;
};

const ACCEPTED_LOGO_TYPES = "image/png,image/jpeg,image/webp,image/svg+xml";

export function BackofficePartnersPanel() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PartnerRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);

  const clearLogoSelection = useCallback(() => {
    setLogoFile(null);
    setLogoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const applyLogoFile = useCallback((file: File | null) => {
    if (!file) {
      clearLogoSelection();
      return;
    }

    const allowedTypes = ACCEPTED_LOGO_TYPES.split(",");
    if (!allowedTypes.includes(file.type)) {
      setError("Format non supporté. Utilisez PNG, JPG, WEBP ou SVG.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Le logo ne doit pas dépasser 2 Mo.");
      return;
    }

    setError(null);
    setLogoFile(file);
    setLogoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }, [clearLogoSelection]);

  useEffect(() => () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  const loadPartners = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/backoffice/partners", { cache: "no-store" });
      const payload = (await response.json()) as PartnersResponse;

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/backoffice/login");
          return;
        }

        throw new Error(payload.error ?? "Impossible de charger les partenaires.");
      }

      setItems(payload.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Impossible de charger les partenaires.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadPartners();
  }, [loadPartners]);

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
    setError(null);

    if (!logoFile) {
      setError("Ajoutez un logo pour publier le partenaire.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("websiteUrl", websiteUrl);
      formData.set("sortOrder", sortOrder);
      formData.set("logo", logoFile);

      const response = await fetch("/api/backoffice/partners", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/backoffice/login");
          return;
        }

        throw new Error(payload.error ?? "Impossible d'ajouter le partenaire.");
      }

      setName("");
      setWebsiteUrl("");
      setSortOrder("0");
      clearLogoSelection();
      await loadPartners();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Impossible d'ajouter le partenaire.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(partner: PartnerRecord) {
    setError(null);

    try {
      const response = await fetch(`/api/backoffice/partners/${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !partner.isActive }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Mise à jour impossible.");
      }

      await loadPartners();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Mise à jour impossible.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer ce partenaire ?")) return;

    setError(null);

    if (editingPartnerId === id) {
      setEditingPartnerId(null);
    }

    try {
      const response = await fetch(`/api/backoffice/partners/${id}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Suppression impossible.");
      }

      await loadPartners();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Suppression impossible.");
    }
  }

  const activeCount = items.filter((item) => item.isActive).length;

  return (
    <div className="backoffice-panel">
      <section className="backoffice-panel__section backoffice-partner-form-card" aria-labelledby="partner-form-title">
        <div className="backoffice-panel__section-head">
          <div>
            <p className="backoffice-panel__section-eyebrow">Nouveau</p>
            <h2 id="partner-form-title" className="backoffice-panel__section-title">
              Ajouter un partenaire
            </h2>
            <p className="backoffice-panel__section-lead">
              Le logo est envoyé sur S3 et affiché sur la page d&apos;accueil, après la section Collaborate.
            </p>
          </div>
        </div>

        <form className="backoffice-partner-form" onSubmit={handleSubmit}>
          <div className="backoffice-partner-form__layout">
            <div className="backoffice-partner-form__fields">
              <label className="backoffice-field">
                <span className="backoffice-field__label">Nom du partenaire</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="backoffice-field__input"
                  placeholder="Ex. Miteka, Orange, …"
                />
              </label>

              <label className="backoffice-field">
                <span className="backoffice-field__label">Site web</span>
                <span className="backoffice-field__hint">Optionnel — rend le logo cliquable sur le site</span>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(event) => setWebsiteUrl(event.target.value)}
                  className="backoffice-field__input"
                  placeholder="https://exemple.com"
                />
              </label>

              <label className="backoffice-field backoffice-field--compact">
                <span className="backoffice-field__label">Ordre d&apos;affichage</span>
                <span className="backoffice-field__hint">Plus petit = affiché en premier</span>
                <input
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="backoffice-field__input backoffice-field__input--number"
                  placeholder="0"
                />
              </label>
            </div>

            <div className="backoffice-partner-form__upload">
              <span className="backoffice-field__label">Logo</span>
              <span className="backoffice-field__hint">PNG, JPG, WEBP ou SVG · max 2 Mo</span>

              <div
                className={`backoffice-dropzone${isDragging ? " is-dragging" : ""}${logoPreview ? " has-preview" : ""}`}
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
                aria-label="Choisir ou déposer un logo"
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
                    <p className="backoffice-dropzone__title">Glissez votre logo ici</p>
                    <p className="backoffice-dropzone__text">ou cliquez pour parcourir</p>
                  </>
                )}
              </div>

              {logoPreview ? (
                <button
                  type="button"
                  className="backoffice-dropzone__clear"
                  onClick={(event) => {
                    event.stopPropagation();
                    clearLogoSelection();
                  }}
                >
                  Retirer le logo
                </button>
              ) : null}
            </div>
          </div>

          <div className="backoffice-partner-form__footer">
            <button
              type="submit"
              className="backoffice-button backoffice-button--primary backoffice-button--wide"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Envoi en cours…" : "Publier le partenaire"}
            </button>
          </div>
        </form>
      </section>

      {error ? (
        <p className="backoffice-dashboard__error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="backoffice-panel__section" aria-labelledby="partners-list-title">
        <div className="backoffice-panel__section-head backoffice-panel__section-head--split">
          <div>
            <p className="backoffice-panel__section-eyebrow">Gestion</p>
            <h2 id="partners-list-title" className="backoffice-panel__section-title">
              Partenaires enregistrés
            </h2>
          </div>

          <div className="backoffice-stat-chips" aria-live="polite">
            <span className="backoffice-stat-chip">
              <strong>{isLoading ? "—" : items.length}</strong> total
            </span>
            <span className="backoffice-stat-chip backoffice-stat-chip--mint">
              <strong>{isLoading ? "—" : activeCount}</strong> visibles
            </span>
          </div>
        </div>

        <div className="backoffice-partners-list">
          {isLoading ? (
            <div className="backoffice-empty-state backoffice-empty-state--loading">
              <span className="backoffice-empty-state__spinner" aria-hidden />
              <p>Chargement des partenaires…</p>
            </div>
          ) : null}

          {!isLoading && items.length === 0 ? (
            <div className="backoffice-empty-state">
              <span className="backoffice-empty-state__icon" aria-hidden />
              <p>Aucun partenaire pour le moment.</p>
              <p className="backoffice-empty-state__hint">Utilisez le formulaire ci-dessus pour en ajouter un.</p>
            </div>
          ) : null}

          {!isLoading
            ? items.map((partner) =>
                editingPartnerId === partner.id ? (
                  <BackofficePartnerEditForm
                    key={partner.id}
                    partner={partner}
                    onCancel={() => setEditingPartnerId(null)}
                    onSaved={async () => {
                      setEditingPartnerId(null);
                      setError(null);
                      await loadPartners();
                    }}
                    onError={setError}
                  />
                ) : (
                  <article
                    key={partner.id}
                    className={`backoffice-partner-row${partner.isActive ? "" : " backoffice-partner-row--inactive"}`}
                  >
                    <div className="backoffice-partner-row__logo-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={partner.logoUrl} alt="" className="backoffice-partner-row__logo" />
                    </div>

                    <div className="backoffice-partner-row__body">
                      <div className="backoffice-partner-row__headline">
                        <h3 className="backoffice-partner-row__name">{partner.name}</h3>
                        <span
                          className={`backoffice-badge${partner.isActive ? " backoffice-badge--success" : " backoffice-badge--muted"}`}
                        >
                          {partner.isActive ? "Visible" : "Masqué"}
                        </span>
                      </div>

                      <div className="backoffice-partner-row__meta">
                        {partner.websiteUrl ? (
                          <p className="backoffice-partner-row__url">
                            {partner.websiteUrl.replace(/^https?:\/\//, "")}
                          </p>
                        ) : (
                          <p className="backoffice-partner-row__url backoffice-partner-row__url--empty">Aucun site</p>
                        )}
                        <span className="backoffice-partner-row__order">Ordre {partner.sortOrder}</span>
                      </div>
                    </div>

                    <div className="backoffice-partner-row__actions">
                      <button
                        type="button"
                        className="backoffice-icon-button backoffice-icon-button--ghost"
                        onClick={() => {
                          setError(null);
                          setEditingPartnerId(partner.id);
                        }}
                        aria-label={`Modifier ${partner.name}`}
                        title="Modifier"
                      >
                        <Icon icon={BACKOFFICE_PARTNER_ICONS.edit} width={18} height={18} aria-hidden />
                      </button>

                      {partner.websiteUrl ? (
                        <a
                          href={partner.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="backoffice-icon-button backoffice-icon-button--ghost"
                          aria-label={`Ouvrir le site de ${partner.name}`}
                          title="Ouvrir le site"
                        >
                          <Icon icon={BACKOFFICE_PARTNER_ICONS.external} width={18} height={18} aria-hidden />
                        </a>
                      ) : null}

                      <button
                        type="button"
                        className="backoffice-icon-button backoffice-icon-button--ghost"
                        onClick={() => void handleToggleActive(partner)}
                        aria-label={partner.isActive ? `Masquer ${partner.name}` : `Publier ${partner.name}`}
                        title={partner.isActive ? "Masquer sur le site" : "Publier sur le site"}
                      >
                        <Icon
                          icon={partner.isActive ? BACKOFFICE_PARTNER_ICONS.hide : BACKOFFICE_PARTNER_ICONS.publish}
                          width={18}
                          height={18}
                          aria-hidden
                        />
                      </button>

                      <button
                        type="button"
                        className="backoffice-icon-button backoffice-icon-button--danger"
                        onClick={() => void handleDelete(partner.id)}
                        aria-label={`Supprimer ${partner.name}`}
                        title="Supprimer"
                      >
                        <Icon icon={BACKOFFICE_PARTNER_ICONS.delete} width={18} height={18} aria-hidden />
                      </button>
                    </div>
                  </article>
                ),
              )
            : null}
        </div>
      </section>
    </div>
  );
}
