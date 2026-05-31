import {
  BADGE_FRAME_SRC,
  BADGE_HEIGHT,
  BADGE_LAYOUT,
  BADGE_WIDTH,
  type BadgeRect,
} from "@/lib/inscription-badge-layout";
import { loadBadgeCertifiedIcon } from "@/lib/badge-icons";
import { formatBadgeDisplayName } from "@/lib/inscription-badge-name";

export type InscriptionBadgeInput = {
  fullName: string;
  communityTitle: string;
  photoUrl?: string | null;
  photoBlob?: Blob | File | null;
};

const BADGE_FONT_FAMILY =
  '"Barlow Semi Condensed", "Barlow Semi Condensed Fallback", Arial, sans-serif';

type CanvasPhotoSource = HTMLImageElement | ImageBitmap;

function getSourceSize(source: CanvasPhotoSource) {
  if (source instanceof HTMLImageElement) {
    return {
      width: source.naturalWidth || source.width,
      height: source.naturalHeight || source.height,
    };
  }

  return { width: source.width, height: source.height };
}

async function loadPhotoFromBlob(blob: Blob): Promise<CanvasPhotoSource> {
  return createImageBitmap(blob);
}

async function loadPhotoFromUrl(src: string): Promise<CanvasPhotoSource> {
  if (src.startsWith("blob:") || src.startsWith("data:")) {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Impossible de charger la photo."));
      image.src = src;
    });
    return image;
  }

  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Impossible de charger la photo."));
    image.src = src;
  });
  return image;
}

async function loadFrameImage() {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Impossible de charger le cadre du badge."));
    image.src = BADGE_FRAME_SRC;
  });
  return image;
}

async function resolvePhotoSource(input: InscriptionBadgeInput) {
  if (input.photoBlob && input.photoBlob.size > 0) {
    return loadPhotoFromBlob(input.photoBlob);
  }

  if (input.photoUrl) {
    return loadPhotoFromUrl(input.photoUrl);
  }

  return null;
}

async function ensureBadgeFonts() {
  if (typeof document === "undefined") return;

  try {
    await Promise.all([
      document.fonts.load('800 48px "Barlow Semi Condensed"'),
      document.fonts.load('600 28px "Barlow Semi Condensed"'),
    ]);
  } catch {
    // Fallback système si la police n'est pas encore disponible.
  }
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasPhotoSource,
  rect: BadgeRect,
) {
  const { width: sourceWidth, height: sourceHeight } = getSourceSize(image);
  const scale = Math.max(rect.width / sourceWidth, rect.height / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = rect.x + (rect.width - width) / 2;
  const y = rect.y + (rect.height - height) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(
    rect.x + rect.width / 2,
    rect.y + rect.height / 2,
    rect.width / 2,
    0,
    Math.PI * 2,
  );
  ctx.clip();
  ctx.drawImage(image, x, y, width, height);
  ctx.restore();
}

function getInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function drawPhotoPlaceholder(ctx: CanvasRenderingContext2D, rect: BadgeRect, fullName: string) {
  const gradient = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
  gradient.addColorStop(0, "#2563eb");
  gradient.addColorStop(1, "#0c2461");

  ctx.save();
  ctx.beginPath();
  ctx.arc(
    rect.x + rect.width / 2,
    rect.y + rect.height / 2,
    rect.width / 2,
    0,
    Math.PI * 2,
  );
  ctx.clip();
  ctx.fillStyle = gradient;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

  const initials = getInitials(fullName) || "?";
  const fontSize = Math.round(rect.height * 0.28);
  ctx.font = `800 ${fontSize}px ${BADGE_FONT_FAMILY}`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, rect.x + rect.width / 2, rect.y + rect.height / 2);
  ctx.restore();
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxFontSize: number,
  minFontSize: number,
  fontWeight: number,
  reservedWidth = 0,
) {
  let size = maxFontSize;

  while (size >= minFontSize) {
    ctx.font = `${fontWeight} ${size}px ${BADGE_FONT_FAMILY}`;
    if (ctx.measureText(text).width + reservedWidth <= maxWidth) {
      return size;
    }
    size -= 1;
  }

  return minFontSize;
}

async function drawCenteredNameWithCertifiedIcon(
  ctx: CanvasRenderingContext2D,
  text: string,
  rect: BadgeRect,
  options: {
    maxFontSize: number;
    minFontSize: number;
    fontWeight: number;
    color: string;
  },
) {
  const content = text.trim();
  if (!content) return;

  const provisionalSize = options.maxFontSize;
  const iconSize = Math.max(18, Math.round(provisionalSize * 0.82));
  const iconGap = Math.max(6, Math.round(provisionalSize * 0.18));
  const reservedWidth = iconSize + iconGap;

  const fontSize = fitFontSize(
    ctx,
    content,
    rect.width * 0.94,
    options.maxFontSize,
    options.minFontSize,
    options.fontWeight,
    reservedWidth,
  );

  const scaledIconSize = Math.max(16, Math.round(fontSize * 0.82));
  const scaledGap = Math.max(5, Math.round(fontSize * 0.18));

  ctx.font = `${options.fontWeight} ${fontSize}px ${BADGE_FONT_FAMILY}`;
  const textWidth = ctx.measureText(content).width;
  const groupWidth = textWidth + scaledGap + scaledIconSize;
  const startX = rect.x + (rect.width - groupWidth) / 2;
  const centerY = rect.y + rect.height / 2;

  ctx.fillStyle = options.color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(content, startX, centerY);

  const icon = await loadBadgeCertifiedIcon(scaledIconSize);
  ctx.drawImage(icon, startX + textWidth + scaledGap, centerY - scaledIconSize / 2, scaledIconSize, scaledIconSize);
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  rect: BadgeRect,
  options: {
    maxFontSize: number;
    minFontSize: number;
    fontWeight: number;
    color: string;
  },
) {
  const content = text.trim();
  if (!content) return;

  const fontSize = fitFontSize(
    ctx,
    content,
    rect.width * 0.94,
    options.maxFontSize,
    options.minFontSize,
    options.fontWeight,
  );

  ctx.font = `${options.fontWeight} ${fontSize}px ${BADGE_FONT_FAMILY}`;
  ctx.fillStyle = options.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(content, rect.x + rect.width / 2, rect.y + rect.height / 2);
}

export async function generateInscriptionBadge(input: InscriptionBadgeInput) {
  if (typeof document === "undefined") {
    throw new Error("Génération du badge indisponible côté serveur.");
  }

  await ensureBadgeFonts();

  const canvas = document.createElement("canvas");
  canvas.width = BADGE_WIDTH;
  canvas.height = BADGE_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas indisponible.");
  }

  ctx.fillStyle = "#061022";
  ctx.fillRect(0, 0, BADGE_WIDTH, BADGE_HEIGHT);

  const frame = await loadFrameImage();
  ctx.drawImage(frame, 0, 0, BADGE_WIDTH, BADGE_HEIGHT);

  try {
    const photo = await resolvePhotoSource(input);
    if (photo) {
      drawCoverImage(ctx, photo, BADGE_LAYOUT.photo);
    } else {
      drawPhotoPlaceholder(ctx, BADGE_LAYOUT.photo, input.fullName);
    }
  } catch {
    drawPhotoPlaceholder(ctx, BADGE_LAYOUT.photo, input.fullName);
  }

  await drawCenteredNameWithCertifiedIcon(
    ctx,
    formatBadgeDisplayName(input.fullName),
    BADGE_LAYOUT.name,
    {
    maxFontSize: 42,
    minFontSize: 22,
    fontWeight: 800,
    color: "#ffffff",
  });

  drawCenteredText(ctx, input.communityTitle, BADGE_LAYOUT.title, {
    maxFontSize: 24,
    minFontSize: 14,
    fontWeight: 600,
    color: "rgba(255, 255, 255, 0.88)",
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Export du badge impossible."));
      },
      "image/png",
      1,
    );
  });

  return {
    blob,
    dataUrl: canvas.toDataURL("image/png"),
    fileName: `var4-badge-${slugify(input.fullName)}.png`,
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "participant";
}
