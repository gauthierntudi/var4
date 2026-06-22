export const VAR4_BADGE_SHARE_TEXT =
  "Je m'inscris à VAR 4 — Du Virtuel au Réel · Kinshasa, 09 août 2026";

export const BADGE_SHARE_S3_PREFIX = "badges/share/var4/";

const SHARE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidBadgeShareId(shareId: string) {
  return SHARE_ID_PATTERN.test(shareId);
}

export function getBadgeShareS3Key(shareId: string) {
  if (!isValidBadgeShareId(shareId)) return null;
  return `${BADGE_SHARE_S3_PREFIX}${shareId}.png`;
}

export function getBadgeShareImageUrl(shareId: string) {
  const key = getBadgeShareS3Key(shareId);
  if (!key) return null;

  const base = process.env.AWS_S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (base) {
    return `${base}/${key}`;
  }

  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  if (!bucket || !region) return null;

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export function getBadgeSharePageUrl(shareId: string, origin?: string) {
  const base =
    origin?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://var4.cd";

  return `${base}/badge/${shareId}`;
}

export type PublishedBadgeShare = {
  shareId: string;
  imageUrl: string;
  pageUrl: string;
};
