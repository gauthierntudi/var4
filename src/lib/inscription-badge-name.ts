export const BADGE_NAME_MAX_LENGTH = 20;

function normalizeFullName(fullName: string) {
  return fullName.trim().replace(/\s+/g, " ");
}

function capitalizeWordPart(part: string) {
  if (!part) return "";
  return part.charAt(0).toLocaleUpperCase("fr-FR") + part.slice(1).toLocaleLowerCase("fr-FR");
}

function capitalizeToken(token: string) {
  return token.split("-").map(capitalizeWordPart).join("-");
}

/** Affichage uniforme des noms inscrits : première lettre de chaque mot en majuscule. */
export function formatInscriptionDisplayName(fullName: string) {
  return normalizeFullName(fullName)
    .split(" ")
    .map(capitalizeToken)
    .join(" ");
}

function partToInitial(part: string) {
  const letter = capitalizeWordPart(part.trim())[0];
  return letter ? `${letter}.` : "";
}

/** Passe 1 : tous les segments sauf le dernier en entier, dernier → initiale (ex. Jacques Ndoli K.). */
function abbreviateLastPart(parts: string[]) {
  if (parts.length <= 1) return parts[0] ?? "";
  return [...parts.slice(0, -1), partToInitial(parts[parts.length - 1]!)].join(" ");
}

/** Passe 2 : premier segment en entier, suivants en initiales compactes (ex. Jacques N.K.). */
function abbreviateAfterFirstPart(parts: string[]) {
  if (parts.length <= 1) return parts[0] ?? "";
  const tail = parts.slice(1).map(partToInitial).join("");
  return `${parts[0]} ${tail}`.trim();
}

/** Passe 3 : premier segment en initiale, suivants compactes (ex. J. N.K.). */
function abbreviateAllButCompactTail(parts: string[]) {
  if (parts.length <= 1) return partToInitial(parts[0] ?? "");
  const tail = parts.slice(1).map(partToInitial).join("");
  return `${partToInitial(parts[0]!)} ${tail}`.trim();
}

/**
 * Limite le nom affiché sur le badge à 20 caractères (espaces inclus).
 * Jacques Ndoli Kassamba → Jacques Ndoli K. → Jacques N.K. si nécessaire.
 */
export function formatBadgeDisplayName(fullName: string, maxLength = BADGE_NAME_MAX_LENGTH) {
  const normalized = formatInscriptionDisplayName(fullName);
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;

  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length === 1) {
    return normalized.slice(0, maxLength);
  }

  const passes = [
    abbreviateLastPart(parts),
    abbreviateAfterFirstPart(parts),
    abbreviateAllButCompactTail(parts),
    parts.map(partToInitial).join(""),
  ];

  for (const candidate of passes) {
    if (candidate && candidate.length <= maxLength) {
      return candidate;
    }
  }

  const fallback = passes.find(Boolean) ?? normalized;
  return fallback.slice(0, maxLength);
}
