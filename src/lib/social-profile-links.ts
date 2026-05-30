export const INSCRIPTION_SOCIAL_NETWORKS = [
  "Instagram",
  "Facebook",
  "TikTok",
  "X (Twitter)",
  "YouTube",
  "LinkedIn",
  "Autre",
] as const;

export type InscriptionSocialNetwork = (typeof INSCRIPTION_SOCIAL_NETWORKS)[number];

type SocialNetworkConfig = {
  displayPrefix: string;
  urlPrefixes: string[];
  placeholder: string;
  pseudoPlaceholder: string;
  hint: string;
  buildUrl: (handle: string) => string;
};

const SOCIAL_NETWORK_CONFIG: Record<
  Exclude<InscriptionSocialNetwork, "Autre">,
  SocialNetworkConfig
> = {
  Instagram: {
    displayPrefix: "instagram.com/",
    urlPrefixes: ["https://instagram.com/", "https://www.instagram.com/", "http://instagram.com/", "http://www.instagram.com/"],
    placeholder: "votre_pseudo",
    pseudoPlaceholder: "@votre_pseudo",
    hint: "Saisissez votre pseudo ou collez le lien complet de votre profil Instagram.",
    buildUrl: (handle) => `https://instagram.com/${sanitizeHandle(handle)}`,
  },
  Facebook: {
    displayPrefix: "facebook.com/",
    urlPrefixes: ["https://facebook.com/", "https://www.facebook.com/", "http://facebook.com/", "http://www.facebook.com/"],
    placeholder: "votre.profil",
    pseudoPlaceholder: "@votre_profil",
    hint: "Saisissez votre nom de page ou collez l’URL de votre profil Facebook.",
    buildUrl: (handle) => `https://facebook.com/${sanitizeHandle(handle)}`,
  },
  TikTok: {
    displayPrefix: "tiktok.com/@",
    urlPrefixes: ["https://tiktok.com/@", "https://www.tiktok.com/@", "http://tiktok.com/@", "http://www.tiktok.com/@"],
    placeholder: "votre_pseudo",
    pseudoPlaceholder: "@votre_pseudo",
    hint: "Saisissez votre @pseudo ou collez le lien complet de votre profil TikTok.",
    buildUrl: (handle) => `https://tiktok.com/@${sanitizeHandle(handle)}`,
  },
  "X (Twitter)": {
    displayPrefix: "x.com/",
    urlPrefixes: [
      "https://x.com/",
      "https://www.x.com/",
      "https://twitter.com/",
      "https://www.twitter.com/",
    ],
    placeholder: "votre_pseudo",
    pseudoPlaceholder: "@votre_pseudo",
    hint: "Saisissez votre @pseudo ou collez le lien complet de votre profil X.",
    buildUrl: (handle) => `https://x.com/${sanitizeHandle(handle)}`,
  },
  YouTube: {
    displayPrefix: "youtube.com/@",
    urlPrefixes: [
      "https://youtube.com/@",
      "https://www.youtube.com/@",
      "https://youtube.com/c/",
      "https://www.youtube.com/c/",
      "https://youtube.com/channel/",
      "https://www.youtube.com/channel/",
    ],
    placeholder: "votre_chaine",
    pseudoPlaceholder: "@votre_chaine",
    hint: "Saisissez le nom de votre chaîne ou collez l’URL YouTube complète.",
    buildUrl: (handle) => `https://youtube.com/@${sanitizeHandle(handle)}`,
  },
  LinkedIn: {
    displayPrefix: "linkedin.com/in/",
    urlPrefixes: [
      "https://linkedin.com/in/",
      "https://www.linkedin.com/in/",
      "http://linkedin.com/in/",
      "http://www.linkedin.com/in/",
    ],
    placeholder: "votre-profil",
    pseudoPlaceholder: "votre-profil",
    hint: "Saisissez votre identifiant LinkedIn ou collez l’URL complète du profil.",
    buildUrl: (handle) => `https://linkedin.com/in/${sanitizeHandle(handle)}`,
  },
};

function sanitizeHandle(value: string) {
  return value.trim().replace(/^@+/, "").replace(/\/+$/, "");
}

export function isProbablyFullUrl(value: string) {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) || trimmed.includes("/") || trimmed.includes(".");
}

export function getSocialNetworkConfig(network: string) {
  if (network === "Autre" || !network) return null;
  return SOCIAL_NETWORK_CONFIG[network as Exclude<InscriptionSocialNetwork, "Autre">] ?? null;
}

export function getEditableLinkValue(network: string, link: string) {
  if (!link) return "";
  if (network === "Autre") return link;

  const config = getSocialNetworkConfig(network);
  if (!config) return link;

  const normalized = link.trim();
  const lower = normalized.toLowerCase();

  for (const prefix of config.urlPrefixes) {
    if (lower.startsWith(prefix.toLowerCase())) {
      return sanitizeHandle(normalized.slice(prefix.length));
    }
  }

  if (isProbablyFullUrl(normalized)) {
    return normalized;
  }

  return sanitizeHandle(normalized);
}

export function normalizeSocialProfileLink(network: string, raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (network === "Autre") {
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed.replace(/^\/+/, "")}`;
  }

  const config = getSocialNetworkConfig(network);
  if (!config) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return url.toString().replace(/\/$/, "");
    } catch {
      throw new Error("Lien invalide");
    }
  }

  const handle = sanitizeHandle(trimmed);
  if (!handle) return "";

  return config.buildUrl(handle);
}

export function derivePseudoFromLink(network: string, link: string) {
  const trimmed = link.trim();
  if (!trimmed) return "";

  const config = getSocialNetworkConfig(network);

  if (network !== "Autre" && config) {
    const handleFromPrefix = getEditableLinkValue(network, trimmed);
    if (handleFromPrefix && !handleFromPrefix.includes("://")) {
      const handle = sanitizeHandle(handleFromPrefix.split("/")[0] ?? handleFromPrefix);
      if (handle) return formatPseudo(network, handle);
    }

    try {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      const handle = extractHandleFromPath(network, url.pathname);
      if (handle) return formatPseudo(network, handle);
    } catch {
      return "";
    }
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const handle = extractHandleFromPath("Autre", url.pathname) || url.hostname.replace(/^www\./, "").split(".")[0];
    if (handle) return formatPseudo("Autre", handle);
  } catch {
    const fallback = sanitizeHandle(trimmed);
    if (fallback) return formatPseudo("Autre", fallback);
  }

  return "";
}

function formatPseudo(network: string, handle: string) {
  const cleaned = sanitizeHandle(handle);
  if (!cleaned) return "";
  return network === "LinkedIn" ? cleaned : `@${cleaned}`;
}

function extractHandleFromPath(network: string, pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "";

  if (network === "YouTube") {
    if (parts[0] === "channel" || parts[0] === "c" || parts[0] === "user") {
      return parts[1] ?? "";
    }
    if (parts[0]?.startsWith("@")) {
      return parts[0].slice(1);
    }
    return parts[parts.length - 1] ?? "";
  }

  const last = parts[parts.length - 1] ?? "";
  return last.startsWith("@") ? last.slice(1) : last;
}
