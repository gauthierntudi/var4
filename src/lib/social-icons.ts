import type { IconifyIcon } from "@iconify/types";
import facebookIcon from "@iconify-icons/simple-icons/facebook";
import instagramIcon from "@iconify-icons/simple-icons/instagram";
import linkedinIcon from "@iconify-icons/simple-icons/linkedin";
import tiktokIcon from "@iconify-icons/simple-icons/tiktok";
import xIcon from "@iconify-icons/simple-icons/x";

export const SOCIAL_BRAND_ICONS = {
  facebook: facebookIcon,
  instagram: instagramIcon,
  linkedin: linkedinIcon,
  tiktok: tiktokIcon,
  x: xIcon,
} as const satisfies Record<string, IconifyIcon>;

export type SocialBrandId = keyof typeof SOCIAL_BRAND_ICONS;

export type SocialLinkItem = {
  id: SocialBrandId;
  label: string;
  href: string;
  tone: SocialBrandId;
};

export const FOOTER_SOCIAL_LINKS: SocialLinkItem[] = [
  {
    id: "facebook",
    label: "Facebook",
    tone: "facebook",
    href: "https://www.facebook.com/duvirtuelaureel",
  },
  {
    id: "instagram",
    label: "Instagram",
    tone: "instagram",
    href: "https://www.instagram.com/duvirtuelaureel/",
  },
  {
    id: "tiktok",
    label: "TikTok",
    tone: "tiktok",
    href: "https://www.tiktok.com/@duvirtuelaureel",
  },
];

const MOBILE_SOCIAL_HANDLE = "duvirtuelauréel";

export const MOBILE_SOCIAL_LINKS: SocialLinkItem[] = [
  {
    id: "facebook",
    label: "Facebook",
    tone: "facebook",
    href: `https://www.facebook.com/${encodeURIComponent(MOBILE_SOCIAL_HANDLE)}`,
  },
  {
    id: "tiktok",
    label: "TikTok",
    tone: "tiktok",
    href: `https://www.tiktok.com/@${encodeURIComponent(MOBILE_SOCIAL_HANDLE)}`,
  },
  {
    id: "instagram",
    label: "Instagram",
    tone: "instagram",
    href: `https://www.instagram.com/${encodeURIComponent(MOBILE_SOCIAL_HANDLE)}/`,
  },
];

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
  return "Je m'inscris à VAR 4 — Du Virtuel au Réel · Kinshasa, 09 août 2026";
}

export async function shareBadgeOnNetwork(
  network: BadgeShareNetwork,
  blob: Blob,
  fileName: string,
) {
  const file = new File([blob], fileName, { type: "image/png" });
  const shareUrl = getVar4ShareUrl();
  const shareText = getVar4ShareText();

  if (network === "instagram" || network === "tiktok") {
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Mon badge VAR 4",
        text: shareText,
      });
      return;
    }

    downloadBadgeBlob(blob, fileName);
    throw new Error(
      network === "instagram"
        ? "Badge téléchargé — ouvrez Instagram et publiez l'image depuis votre galerie."
        : "Badge téléchargé — ouvrez TikTok et publiez l'image depuis votre galerie.",
    );
  }

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "Mon badge VAR 4",
        text: shareText,
        url: shareUrl,
      });
      return;
    } catch {
      // Continue vers les intents web.
    }
  }

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const intentUrl =
    network === "x"
      ? `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
      : network === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  downloadBadgeBlob(blob, fileName);
  window.open(intentUrl, "_blank", "noopener,noreferrer,width=640,height=720");
}

export function downloadBadgeBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
