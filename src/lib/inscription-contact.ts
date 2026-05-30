const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export function countPhoneDigits(value: string) {
  return value.replace(/\D/g, "").length;
}

/** Accepte formats internationaux courants (+243…, espaces, tirets). */
export function isValidInternationalPhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 24) return false;

  if (!/^\+?[\d\s().-]+$/.test(trimmed)) return false;

  const digits = countPhoneDigits(trimmed);
  return digits >= 8 && digits <= 15;
}

export function isValidEmailOrPhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;

  if (isValidEmail(trimmed)) return true;
  return isValidInternationalPhone(trimmed);
}

export function normalizeContact(value: string) {
  const trimmed = value.trim();

  if (isValidEmail(trimmed)) {
    return trimmed.toLowerCase();
  }

  if (isValidInternationalPhone(trimmed)) {
    const hasPlus = trimmed.startsWith("+");
    const digits = trimmed.replace(/\D/g, "");
    return hasPlus ? `+${digits}` : digits;
  }

  return trimmed;
}

export function getContactHref(value: string) {
  const normalized = normalizeContact(value);

  if (isValidEmail(normalized)) {
    return `mailto:${normalized}`;
  }

  if (isValidInternationalPhone(normalized)) {
    const digits = normalized.replace(/\D/g, "");
    return `tel:+${digits}`;
  }

  return null;
}
