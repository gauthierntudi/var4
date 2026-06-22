import type { IconifyIcon } from "@iconify/types";
import facebookIcon from "@iconify-icons/simple-icons/facebook";
import instagramIcon from "@iconify-icons/simple-icons/instagram";
import linkedinIcon from "@iconify-icons/simple-icons/linkedin";
import tiktokIcon from "@iconify-icons/simple-icons/tiktok";
import whatsappIcon from "@iconify-icons/simple-icons/whatsapp";
import xIcon from "@iconify-icons/simple-icons/x";
import type { PublishedBadgeShare } from "@/lib/badge-share";
import { VAR4_BADGE_SHARE_TEXT } from "@/lib/badge-share";

export const SOCIAL_BRAND_ICONS = {
  facebook: facebookIcon,
  instagram: instagramIcon,
  linkedin: linkedinIcon,
  tiktok: tiktokIcon,
  whatsapp: whatsappIcon,
  x: xIcon,
} as const satisfies Record<string, IconifyIcon>;

export type SocialBrandId = keyof typeof SOCIAL_BRAND_ICONS;

export type SocialLinkItem = {
  id: SocialBrandId;
  label: string;
  href: string;
  tone: SocialBrandId;
};

export const VAR4_SOCIAL_HANDLE = "duvirtuelaureel243";

export const VAR4_SOCIAL_LINKS: SocialLinkItem[] = [
  {
    id: "instagram",
    label: "Instagram",
    tone: "instagram",
    href: "https://www.instagram.com/duvirtuelaureel243",
  },
  {
    id: "tiktok",
    label: "TikTok",
    tone: "tiktok",
    href: "https://www.tiktok.com/@duvirtuelaureel243",
  },
  {
    id: "facebook",
    label: "Facebook",
    tone: "facebook",
    href: "https://www.facebook.com/duvirtuelaureel243",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    tone: "whatsapp",
    href: "https://whatsapp.com/channel/0029VbBUJrAK0IBqXEeGHb0M",
  },
];

export const FOOTER_SOCIAL_LINKS = VAR4_SOCIAL_LINKS;
export const MOBILE_SOCIAL_LINKS = VAR4_SOCIAL_LINKS;

export type BadgeShareNetwork = "instagram" | "x" | "facebook" | "linkedin";

export const BADGE_SHARE_NETWORKS: Array<{
  id: BadgeShareNetwork;
  label: string;
}> = [
  { id: "instagram", label: "Instagram" },
  { id: "x", label: "X (Twitter)" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
];

export function getVar4ShareUrl() {
  if (typeof window === "undefined") return "https://var4.cd";
  return window.location.origin;
}

export function getVar4ShareText() {
  return VAR4_BADGE_SHARE_TEXT;
}

function createBadgeFile(blob: Blob, fileName: string) {
  return new File([blob], fileName, { type: "image/png" });
}

export async function publishBadgeShare(blob: Blob, fileName: string): Promise<PublishedBadgeShare> {
  const formData = new FormData();
  formData.append("badge", createBadgeFile(blob, fileName));

  const response = await fetch("/api/inscriptions/badge-share", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | (PublishedBadgeShare & { ok?: true; error?: string })
    | null;

  if (!response.ok || !data || !data.shareId || !data.imageUrl || !data.pageUrl) {
    throw new Error(data?.error ?? "Impossible de publier le badge.");
  }

  return {
    shareId: data.shareId,
    imageUrl: data.imageUrl,
    pageUrl: data.pageUrl,
  };
}

async function copyBadgeToClipboard(file: File) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    return false;
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      "image/png": file,
    }),
  ]);

  return true;
}

type NativeShareResult = "shared" | "cancelled" | "unsupported" | "failed";

async function tryNativeFileShare(
  file: File,
  text: string,
  options?: { url?: string; fileOnly?: boolean },
): Promise<NativeShareResult> {
  if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
    return "unsupported";
  }

  try {
    if (options?.fileOnly) {
      await navigator.share({
        files: [file],
        title: "Mon badge VAR 4",
        text,
      });
    } else if (options?.url) {
      await navigator.share({
        files: [file],
        title: "Mon badge VAR 4",
        text,
        url: options.url,
      });
    } else {
      await navigator.share({
        files: [file],
        title: "Mon badge VAR 4",
        text,
      });
    }
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }
    return "failed";
  }
}

function openNetworkShareIntent(
  network: BadgeShareNetwork,
  shareLink: string,
  shareText: string,
) {
  const encodedLink = encodeURIComponent(shareLink);
  const encodedMessage = encodeURIComponent(`${shareText}\n${shareLink}`);

  const intentUrl =
    network === "x"
      ? `https://twitter.com/intent/tweet?text=${encodedMessage}`
      : network === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`
        : network === "linkedin"
          ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`
          : shareLink;

  window.open(intentUrl, "_blank", "noopener,noreferrer,width=640,height=720");
}

async function shareOnFacebookOrLinkedIn(
  network: "facebook" | "linkedin",
  file: File,
  blob: Blob,
  fileName: string,
  published: PublishedBadgeShare,
  shareText: string,
) {
  // Fichier seul : meilleure compatibilité avec l'app Facebook / LinkedIn sur mobile.
  let nativeShareResult = await tryNativeFileShare(file, shareText, { fileOnly: true });
  if (nativeShareResult === "shared" || nativeShareResult === "cancelled") {
    return;
  }

  nativeShareResult = await tryNativeFileShare(file, shareText, { url: published.pageUrl });
  if (nativeShareResult === "shared" || nativeShareResult === "cancelled") {
    return;
  }

  const copied = await copyBadgeToClipboard(file).catch(() => false);
  downloadBadgeBlob(blob, fileName);

  // Lien direct vers le PNG : Facebook et LinkedIn affichent le badge en aperçu large.
  openNetworkShareIntent(network, published.imageUrl, shareText);

  const networkLabel = network === "facebook" ? "Facebook" : "LinkedIn";

  if (copied) {
    throw new Error(
      `Badge copié et téléchargé. Sur ${networkLabel}, créez une publication et collez l'image (Ctrl+V / Cmd+V) — l'aperçu du lien affiche aussi votre badge.`,
    );
  }

  throw new Error(
    `Badge téléchargé. Sur ${networkLabel}, joignez le PNG à votre publication ou collez-le — le lien ouvert affiche votre badge en aperçu.`,
  );
}

export async function shareBadgeOnNetwork(
  network: BadgeShareNetwork,
  blob: Blob,
  fileName: string,
) {
  const file = createBadgeFile(blob, fileName);
  const shareText = getVar4ShareText();
  let published: PublishedBadgeShare | null = null;

  try {
    published = await publishBadgeShare(blob, fileName);
  } catch (error) {
    if (network === "facebook" || network === "linkedin") {
      throw error instanceof Error
        ? error
        : new Error("Impossible de publier le badge pour le partage.");
    }
  }

  const pageUrl = published?.pageUrl ?? getVar4ShareUrl();
  const shareLink = published?.imageUrl ?? pageUrl;

  if (network === "facebook" || network === "linkedin") {
    if (!published) {
      downloadBadgeBlob(blob, fileName);
      throw new Error("Badge téléchargé — publiez l'image manuellement sur le réseau.");
    }

    await shareOnFacebookOrLinkedIn(network, file, blob, fileName, published, shareText);
    return;
  }

  const nativeShareResult = await tryNativeFileShare(file, shareText, { url: pageUrl });
  if (nativeShareResult === "shared" || nativeShareResult === "cancelled") {
    return;
  }

  if (network === "instagram") {
    downloadBadgeBlob(blob, fileName);
    throw new Error("Badge téléchargé — ouvrez Instagram et publiez l'image depuis votre galerie.");
  }

  const copied = await copyBadgeToClipboard(file).catch(() => false);
  downloadBadgeBlob(blob, fileName);

  if (published) {
    openNetworkShareIntent(network, shareLink, shareText);
  }

  if (copied) {
    throw new Error(
      published
        ? "Badge copié et téléchargé. Collez l'image (Ctrl+V / Cmd+V) dans votre publication — le lien ouvert affiche aussi votre badge."
        : "Badge copié et téléchargé. Collez l'image (Ctrl+V / Cmd+V) dans votre publication.",
    );
  }

  throw new Error(
    published
      ? "Badge téléchargé. Joignez le fichier PNG à votre publication — le lien ouvert inclut votre badge en aperçu."
      : "Badge téléchargé — joignez le fichier PNG à votre publication sur le réseau ouvert.",
  );
}

export async function shareBadgeNative(blob: Blob, fileName: string) {
  const file = createBadgeFile(blob, fileName);
  const shareText = getVar4ShareText();
  let pageUrl = getVar4ShareUrl();

  if (!navigator.share) {
    downloadBadgeBlob(blob, fileName);
    throw new Error("Badge téléchargé — partagez l'image depuis votre galerie.");
  }

  try {
    const published = await publishBadgeShare(blob, fileName);
    pageUrl = published.pageUrl;
  } catch {
    // Partage local si la publication en ligne échoue.
  }

  if (navigator.canShare?.({ files: [file] })) {
    const fileOnlyResult = await tryNativeFileShare(file, shareText, { fileOnly: true });
    if (fileOnlyResult === "shared" || fileOnlyResult === "cancelled") {
      return;
    }

    await navigator.share({
      files: [file],
      title: "Mon badge VAR 4",
      text: shareText,
      url: pageUrl,
    });
    return;
  }

  await navigator.share({
    title: "Mon badge VAR 4",
    text: shareText,
    url: pageUrl,
  });
}

export function downloadBadgeBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
