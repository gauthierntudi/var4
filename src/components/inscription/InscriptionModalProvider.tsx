"use client";

import {
  createContext,
  type FormEvent,
  type FocusEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { InscriptionPhotoField } from "@/components/inscription/InscriptionPhotoField";
import { InscriptionSocialFields } from "@/components/inscription/InscriptionSocialFields";
import {
  InscriptionGoogleButton,
  type GoogleProfilePayload,
} from "@/components/inscription/InscriptionGoogleButton";
import {
  InscriptionGoogleGate,
  isGoogleSignInEnabled,
} from "@/components/inscription/InscriptionGoogleGate";
import {
  INSCRIPTION_FEED_EVENT,
  resolveInscriptionFeedPhotoUrl,
  type InscriptionFeedItem,
} from "@/lib/inscription-feed";
import {
  clearInscriptionModalPersistence,
  isInscriptionModalHash,
  INSCRIPTION_MODAL_STORAGE_KEY,
  persistInscriptionModalOpen,
  shouldOpenInscriptionModalFromUrl,
} from "@/lib/inscription-modal-state";
import { setOverlayScrollLock } from "@/lib/scroll-init";

const INSCRIPTION_FALLBACK_CONTACT = "duvirtuelaureel@miteka.io";

type FormState = {
  fullName: string;
  socialNetwork: string;
  communityTitle: string;
  city: string;
  contact: string;
};

const EMPTY_FORM: FormState = {
  fullName: "",
  socialNetwork: "",
  communityTitle: "",
  city: "",
  contact: "",
};

type InscriptionModalContextValue = {
  openInscriptionModal: () => void;
  closeInscriptionModal: () => void;
  isInscriptionModalOpen: boolean;
};

const InscriptionModalContext = createContext<InscriptionModalContextValue | null>(null);

export function useInscriptionModal() {
  const context = useContext(InscriptionModalContext);
  if (!context) {
    throw new Error("useInscriptionModal must be used within InscriptionModalProvider");
  }
  return context;
}

export function InscriptionModalProvider({ children }: { children: ReactNode }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);

  const clearPhoto = useCallback(() => {
    if (photoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
  }, [photoPreviewUrl]);

  const openInscriptionModal = useCallback(() => {
    setIsSubmitted(false);
    setSubmitError(null);
    setGoogleNotice(null);
    setIsOpen(true);
    persistInscriptionModalOpen();
  }, []);

  const closeInscriptionModal = useCallback(() => {
    setIsOpen(false);
    setIsSubmitted(false);
    setSubmitError(null);
    setGoogleNotice(null);
    setIsSubmitting(false);
    setForm(EMPTY_FORM);
    clearPhoto();
    clearInscriptionModalPersistence();
  }, [clearPhoto]);

  const updateField = useCallback((field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (shouldOpenInscriptionModalFromUrl()) {
      setIsSubmitted(false);
      setSubmitError(null);
      setGoogleNotice(null);
      setIsOpen(true);
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const onHashChange = () => {
      if (isInscriptionModalHash()) {
        setIsSubmitted(false);
        setSubmitError(null);
        setGoogleNotice(null);
        setIsOpen(true);
        persistInscriptionModalOpen();
        return;
      }

      setIsOpen(false);
      try {
        window.sessionStorage.removeItem(INSCRIPTION_MODAL_STORAGE_KEY);
      } catch {
        // ignore
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [isMounted]);

  useEffect(() => {
    if (!isOpen) return;

    persistInscriptionModalOpen();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeInscriptionModal();
    };

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.classList.add("inscription-modal-open");
    setOverlayScrollLock(true);
    window.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      setOverlayScrollLock(false);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.classList.remove("inscription-modal-open");
      document.documentElement.style.removeProperty("--inscription-keyboard-offset");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeInscriptionModal, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    const syncKeyboardOffset = () => {
      const keyboardOffset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty(
        "--inscription-keyboard-offset",
        `${keyboardOffset}px`,
      );
    };

    syncKeyboardOffset();
    viewport.addEventListener("resize", syncKeyboardOffset);
    viewport.addEventListener("scroll", syncKeyboardOffset);

    return () => {
      viewport.removeEventListener("resize", syncKeyboardOffset);
      viewport.removeEventListener("scroll", syncKeyboardOffset);
      document.documentElement.style.removeProperty("--inscription-keyboard-offset");
    };
  }, [isOpen]);

  const handleFieldFocus = useCallback((event: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!window.matchMedia("(max-width: 640px)").matches) return;

    window.setTimeout(() => {
      event.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 320);
  }, []);

  const handlePhotoChange = useCallback((file: File | null, previewUrl: string | null) => {
    setPhotoFile(file);
    setPhotoPreviewUrl(previewUrl);
    setSubmitError(null);
  }, []);

  const handleGoogleProfile = useCallback(
    async (profile: GoogleProfilePayload) => {
      setForm((current) => ({
        ...current,
        fullName: profile.fullName || current.fullName,
        contact: profile.email || current.contact,
      }));
      setSubmitError(null);
      setGoogleNotice("Profil Google importé — complétez les champs restants puis validez.");

      if (!profile.picture || photoFile) return;

      try {
        const response = await fetch(
          `/api/inscriptions/google-avatar?url=${encodeURIComponent(profile.picture)}`,
        );

        if (!response.ok) return;

        const blob = await response.blob();
        const file = new File([blob], "google-profile.jpg", {
          type: blob.type || "image/jpeg",
        });
        const previewUrl = URL.createObjectURL(file);
        handlePhotoChange(file, previewUrl);
      } catch {
        // La photo Google est optionnelle — le reste du profil est déjà prérempli.
      }
    },
    [handlePhotoChange, photoFile],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const communityTitle = form.communityTitle.trim();
      const formData = new FormData();
      formData.append("fullName", form.fullName.trim());
      formData.append("socialNetwork", form.socialNetwork);
      formData.append("communityTitle", communityTitle);
      formData.append("pseudo", communityTitle);
      formData.append("city", form.city.trim());
      formData.append("contact", form.contact.trim());

      if (photoFile) {
        formData.append("photo", photoFile, photoFile.name);
      }

      const response = await fetch("/api/inscriptions", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; id?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Impossible d'envoyer l'inscription.");
      }

      window.dispatchEvent(
        new CustomEvent<InscriptionFeedItem>(INSCRIPTION_FEED_EVENT, {
          detail: {
            id: data?.id ?? `local-${Date.now()}`,
            fullName: form.fullName.trim(),
            city: form.city.trim(),
            photoUrl:
              data?.id && photoFile
                ? resolveInscriptionFeedPhotoUrl(data.id, "uploaded", null)
                : (photoPreviewUrl ?? null),
          },
        }),
      );

      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Impossible d'envoyer l'inscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InscriptionModalContext.Provider
      value={{
        openInscriptionModal,
        closeInscriptionModal,
        isInscriptionModalOpen: isOpen,
      }}
    >
      {children}

      {isMounted && isOpen
        ? createPortal(
            <InscriptionGoogleGate>
            <div
              className="inscription-modal"
              role="dialog"
              aria-modal="true"
              id="inscription-modal"
              aria-labelledby="inscription-modal-title"
              data-lenis-prevent
            >
              <div
                className="inscription-modal__backdrop"
                onClick={closeInscriptionModal}
                aria-hidden
              />

              <div
                className="inscription-modal__panel"
                data-lenis-prevent
                data-lenis-prevent-touch
                data-lenis-prevent-vertical
              >
                <header className="inscription-modal__topbar">
                  <div className="inscription-modal__handle" aria-hidden />

                  <div className="inscription-modal__topbar-inner">
                    <div className="inscription-modal__head">
                      <p className="inscription-modal__eyebrow">VAR 4</p>
                      <h2 id="inscription-modal-title" className="inscription-modal__title">
                        Inscription
                      </h2>
                      <p className="inscription-modal__meta">
                        <span>09 août 2026</span>
                        <span className="inscription-modal__meta-dot" aria-hidden />
                        <span>Kinshasa</span>
                      </p>
                    </div>

                    <button
                      ref={closeButtonRef}
                      type="button"
                      className="inscription-modal__close"
                      onClick={closeInscriptionModal}
                      aria-label="Fermer le formulaire"
                    >
                      <span aria-hidden>×</span>
                    </button>
                  </div>
                </header>

                {isSubmitted ? (
                  <div
                    className="inscription-modal__scroll inscription-modal__success"
                    data-lenis-prevent
                  >
                    <p>Merci pour votre inscription.</p>
                    <p>
                      Votre demande a bien été enregistrée. L&apos;équipe VAR4 vous contactera à{" "}
                      <strong>{form.contact.trim() || INSCRIPTION_FALLBACK_CONTACT}</strong> si besoin.
                    </p>
                    <button
                      type="button"
                      className="inscription-modal__submit"
                      onClick={closeInscriptionModal}
                    >
                      Fermer
                    </button>
                  </div>
                ) : (
                  <form className="inscription-modal__form" onSubmit={handleSubmit}>
                    <div className="inscription-modal__form-body">
                      <div className="inscription-modal__scroll" data-lenis-prevent>
                        {isGoogleSignInEnabled() ? (
                          <>
                            <InscriptionGoogleButton
                              disabled={isSubmitting}
                              onProfile={handleGoogleProfile}
                              onError={(message) => {
                                setGoogleNotice(null);
                                setSubmitError(message);
                              }}
                            />
                            <div className="inscription-modal__divider" aria-hidden>
                              <span>ou remplir le formulaire</span>
                            </div>
                            {googleNotice ? (
                              <p className="inscription-modal__google-notice" role="status">
                                {googleNotice}
                              </p>
                            ) : null}
                          </>
                        ) : null}

                        <InscriptionPhotoField
                          value={photoFile}
                          previewUrl={photoPreviewUrl}
                          onChange={handlePhotoChange}
                        />

                        <div className="inscription-modal__fields">
                        <div className="inscription-modal__field">
                          <label htmlFor="inscription-full-name">Nom complet</label>
                          <input
                            id="inscription-full-name"
                            name="fullName"
                            type="text"
                            autoComplete="name"
                            enterKeyHint="next"
                            required
                            value={form.fullName}
                            onChange={(event) => updateField("fullName", event.target.value)}
                            onFocus={handleFieldFocus}
                            placeholder="Ex. Marie Kabongo"
                          />
                        </div>

                        <InscriptionSocialFields
                          socialNetwork={form.socialNetwork}
                          communityTitle={form.communityTitle}
                          onSocialNetworkChange={(value) => updateField("socialNetwork", value)}
                          onCommunityTitleChange={(value) => updateField("communityTitle", value)}
                          onFieldFocus={handleFieldFocus}
                        />

                        <div className="inscription-modal__field">
                          <label htmlFor="inscription-city">Ville</label>
                          <input
                            id="inscription-city"
                            name="city"
                            type="text"
                            autoComplete="address-level2"
                            enterKeyHint="next"
                            required
                            value={form.city}
                            onChange={(event) => updateField("city", event.target.value)}
                            onFocus={handleFieldFocus}
                            placeholder="Ex. Kinshasa"
                          />
                        </div>

                        <div className="inscription-modal__field inscription-modal__field--full">
                          <label htmlFor="inscription-contact">Adresse e-mail ou Téléphone</label>
                          <input
                            id="inscription-contact"
                            name="contact"
                            type="text"
                            autoComplete="email tel"
                            inputMode="email"
                            enterKeyHint="done"
                            required
                            value={form.contact}
                            onChange={(event) => updateField("contact", event.target.value)}
                            onFocus={handleFieldFocus}
                            placeholder="vous@exemple.com ou +243 812 345 678"
                          />
                        </div>
                        </div>
                      </div>

                      {submitError ? (
                        <p className="inscription-modal__form-error" role="alert">
                          {submitError}
                        </p>
                      ) : null}
                    </div>

                    <footer className="inscription-modal__footer">
                      <div className="inscription-modal__footer-inner">
                        <button
                          type="button"
                          className="inscription-modal__cancel"
                          onClick={closeInscriptionModal}
                          disabled={isSubmitting}
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="inscription-modal__submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Envoi…" : "S'inscrire"}
                        </button>
                      </div>
                    </footer>
                  </form>
                )}
              </div>
            </div>
            </InscriptionGoogleGate>,
            document.body,
          )
        : null}
    </InscriptionModalContext.Provider>
  );
}
