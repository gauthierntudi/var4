export const INSCRIPTION_MODAL_HASH = "#inscrire";
export const INSCRIPTION_MODAL_STORAGE_KEY = "var4:inscription-modal-open";

export function isInscriptionModalHash(hash = typeof window !== "undefined" ? window.location.hash : "") {
  return hash === INSCRIPTION_MODAL_HASH;
}

export function shouldOpenInscriptionModalFromUrl() {
  if (typeof window === "undefined") return false;

  if (isInscriptionModalHash()) return true;

  try {
    return window.sessionStorage.getItem(INSCRIPTION_MODAL_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function persistInscriptionModalOpen() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(INSCRIPTION_MODAL_STORAGE_KEY, "1");
  } catch {
    // sessionStorage indisponible (mode privé strict).
  }

  const nextUrl = `${window.location.pathname}${window.location.search}${INSCRIPTION_MODAL_HASH}`;

  if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
    window.history.replaceState({ inscriptionModal: true }, "", nextUrl);
  }
}

export function clearInscriptionModalPersistence() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(INSCRIPTION_MODAL_STORAGE_KEY);
  } catch {
    // ignore
  }

  if (!isInscriptionModalHash()) return;

  const nextUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}
