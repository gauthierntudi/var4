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

export type BadgeShareNetwork = SocialBrandId;

export const BADGE_SHARE_NETWORKS: Array<{
  id: BadgeShareNetwork;
  label: string;
}> = [
  { id: "instagram", label: "Instagram" },
  { id: "x", label: "X (Twitter)" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "tiktok", label: "TikTok" },
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

async function tryNativeFileShare(file: File, text: string, url: string) {
  if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
    return "unsupported";
  }

  try {
    await navigator.share({
      files: [file],
      title: "Mon badge VAR 4",
      text,
      url,
    });
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }
    return "failed";
  }
}

function openNetworkShareIntent(network: BadgeShareNetwork, pageUrl: string, shareText: string) {
  const encodedPageUrl = encodeURIComponent(pageUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedMessage = encodeURIComponent(`${shareText}\n${pageUrl}`);

  const intentUrl =
    network === "x"
      ? `https://twitter.com/intent/tweet?text=${encodedMessage}`
      : network === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodedPageUrl}&quote=${encodedText}`
        : network === "linkedin"
          ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodedPageUrl}`
          : network === "whatsapp"
            ? `https://wa.me/?text=${encodedMessage}`
            : pageUrl;

  window.open(intentUrl, "_blank", "noopener,noreferrer,width=640,height=720");
}

export async function shareBadgeOnNetwork(
  network: BadgeShareNetwork,
  blob: Blob,
  fileName: string,
) {
  const file = createBadgeFile(blob, fileName);
  const shareText = getVar4ShareText();
  let pageUrl = getVar4ShareUrl();

  try {
    const published = await publishBadgeShare(blob, fileName);
    pageUrl = published.pageUrl;
  } catch {
    // On continue avec le partage fichier / téléchargement si S3 est indisponible.
  }

  const nativeShareResult = await tryNativeFileShare(file, shareText, pageUrl);
  if (nativeShareResult === "shared" || nativeShareResult === "cancelled") {
    return;
  }

  if (network === "instagram" || network === "tiktok") {
    downloadBadgeBlob(blob, fileName);
    throw new Error(
      network === "instagram"
        ? "Badge téléchargé — ouvrez Instagram et publiez l'image depuis votre galerie."
        : "Badge téléchargé — ouvrez TikTok et publiez l'image depuis votre galerie.",
    );
  }

  const copied = await copyBadgeToClipboard(file).catch(() => false);
  downloadBadgeBlob(blob, fileName);

  if (pageUrl !== getVar4ShareUrl()) {
    openNetworkShareIntent(network, pageUrl, shareText);
  }

  if (copied) {
    throw new Error(
      pageUrl !== getVar4ShareUrl()
        ? "Badge copié et téléchargé. Collez l'image (Ctrl+V / Cmd+V) dans votre publication — le lien ouvert affiche aussi votre badge."
        : "Badge copié et téléchargé. Collez l'image (Ctrl+V / Cmd+V) dans votre publication.",
    );
  }

  throw new Error(
    pageUrl !== getVar4ShareUrl()
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
