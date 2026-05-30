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
import {
  InscriptionGoogleButton,
  type GoogleProfilePayload,
} from "@/components/inscription/InscriptionGoogleButton";
import { isGoogleSignInEnabled } from "@/components/inscription/InscriptionGoogleProvider";
import { setOverlayScrollLock } from "@/lib/scroll-init";

const INSCRIPTION_EMAIL = "duvirtuelaureel@miteka.io";

const SOCIAL_NETWORKS = [
  "Instagram",
  "Facebook",
  "TikTok",
  "X (Twitter)",
  "YouTube",
  "LinkedIn",
  "Autre",
] as const;

type FormState = {
  fullName: string;
  socialNetwork: string;
  link: string;
  pseudo: string;
  city: string;
  email: string;
};

const EMPTY_FORM: FormState = {
  fullName: "",
  socialNetwork: "",
  link: "",
  pseudo: "",
  city: "",
  email: "",
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
    setIsOpen(true);
  }, []);

  const closeInscriptionModal = useCallback(() => {
    setIsOpen(false);
    setIsSubmitted(false);
    setSubmitError(null);
    setIsSubmitting(false);
    setForm(EMPTY_FORM);
    clearPhoto();
  }, [clearPhoto]);

  const updateField = useCallback((field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

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
        email: profile.email || current.email,
      }));
      setSubmitError(null);

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
      const formData = new FormData();
      formData.append("fullName", form.fullName.trim());
      formData.append("socialNetwork", form.socialNetwork);
      formData.append("link", form.link.trim());
      formData.append("pseudo", form.pseudo.trim());
      formData.append("city", form.city.trim());
      formData.append("email", form.email.trim());

      if (photoFile) {
        formData.append("photo", photoFile, photoFile.name);
      }

      const response = await fetch("/api/inscriptions", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Impossible d'envoyer l'inscription.");
      }

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
                      <strong>{form.email.trim() || INSCRIPTION_EMAIL}</strong> si besoin.
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
                              onError={setSubmitError}
                            />
                            <div className="inscription-modal__divider" aria-hidden>
                              <span>ou remplir le formulaire</span>
                            </div>
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

                        <div className="inscription-modal__field">
                          <label htmlFor="inscription-social-network">Réseau social préféré</label>
                          <select
                            id="inscription-social-network"
                            name="socialNetwork"
                            required
                            value={form.socialNetwork}
                            onChange={(event) => updateField("socialNetwork", event.target.value)}
                            onFocus={handleFieldFocus}
                          >
                            <option value="" disabled>
                              Sélectionner un réseau
                            </option>
                            {SOCIAL_NETWORKS.map((network) => (
                              <option key={network} value={network}>
                                {network}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="inscription-modal__field">
                          <label htmlFor="inscription-link">Lien</label>
                          <input
                            id="inscription-link"
                            name="link"
                            type="url"
                            inputMode="url"
                            enterKeyHint="next"
                            required
                            value={form.link}
                            onChange={(event) => updateField("link", event.target.value)}
                            onFocus={handleFieldFocus}
                            placeholder="https://instagram.com/votre-profil"
                          />
                        </div>

                        <div className="inscription-modal__field">
                          <label htmlFor="inscription-pseudo">Pseudo</label>
                          <input
                            id="inscription-pseudo"
                            name="pseudo"
                            type="text"
                            enterKeyHint="next"
                            required
                            value={form.pseudo}
                            onChange={(event) => updateField("pseudo", event.target.value)}
                            onFocus={handleFieldFocus}
                            placeholder="@votre_pseudo"
                          />
                        </div>

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

                        <div className="inscription-modal__field">
                          <label htmlFor="inscription-email">Adresse mail</label>
                          <input
                            id="inscription-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            enterKeyHint="done"
                            required
                            value={form.email}
                            onChange={(event) => updateField("email", event.target.value)}
                            onFocus={handleFieldFocus}
                            placeholder="vous@exemple.com"
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
            </div>,
            document.body,
          )
        : null}
    </InscriptionModalContext.Provider>
  );
}
