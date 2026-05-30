import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_LOGO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
const INSCRIPTION_PHOTO_PREFIX = "inscriptions/var4/";
const PARTNER_LOGO_PREFIX = "partners/var4/";

function getS3Config() {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return { region, bucket, accessKeyId, secretAccessKey };
}

function getPublicUrl(bucket: string, region: string, key: string) {
  const base = process.env.AWS_S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (base) {
    return `${base}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export function isS3Configured() {
  return getS3Config() !== null;
}

export async function uploadInscriptionPhoto(file: File): Promise<{ key: string; url: string }> {
  const config = getS3Config();
  if (!config) {
    throw new Error("S3 is not configured");
  }

  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    throw new Error("Format photo non pris en charge");
  }

  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error("La photo ne doit pas dépasser 5 Mo");
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `inscriptions/var4/${new Date().getFullYear()}/${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    key,
    url: getPublicUrl(config.bucket, config.region, key),
  };
}

export function isValidInscriptionPhotoKey(key: string) {
  return key.startsWith(INSCRIPTION_PHOTO_PREFIX) && !key.includes("..");
}

export function isValidPartnerLogoKey(key: string) {
  return key.startsWith(PARTNER_LOGO_PREFIX) && !key.includes("..");
}

function getLogoExtension(fileType: string) {
  if (fileType === "image/png") return "png";
  if (fileType === "image/webp") return "webp";
  if (fileType === "image/svg+xml") return "svg";
  return "jpg";
}

export async function uploadPartnerLogo(file: File): Promise<{ key: string; url: string }> {
  const config = getS3Config();
  if (!config) {
    throw new Error("S3 is not configured");
  }

  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    throw new Error("Format logo non pris en charge (PNG, JPG, WEBP, SVG).");
  }

  if (file.size > MAX_LOGO_BYTES) {
    throw new Error("Le logo ne doit pas dépasser 2 Mo.");
  }

  const extension = getLogoExtension(file.type);
  const key = `${PARTNER_LOGO_PREFIX}${new Date().getFullYear()}/${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    key,
    url: getPublicUrl(config.bucket, config.region, key),
  };
}

export async function deletePartnerLogo(key: string) {
  const config = getS3Config();
  if (!config || !isValidPartnerLogoKey(key)) {
    return;
  }

  const client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}

function resolveS3ObjectKey(
  key: string | null | undefined,
  url: string | null | undefined,
  isValidKey: (value: string) => boolean,
): string | null {
  if (key && isValidKey(key)) {
    return key;
  }

  if (!url) {
    return null;
  }

  const config = getS3Config();
  if (!config) {
    return null;
  }

  const publicBase = process.env.AWS_S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (publicBase && url.startsWith(`${publicBase}/`)) {
    const resolvedKey = url.slice(publicBase.length + 1);
    return isValidKey(resolvedKey) ? resolvedKey : null;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const isBucketHost =
      host === `${config.bucket}.s3.${config.region}.amazonaws.com` ||
      host === `${config.bucket}.s3.amazonaws.com` ||
      host.startsWith(`${config.bucket}.s3.`);

    if (!isBucketHost) {
      return null;
    }

    const resolvedKey = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
    return isValidKey(resolvedKey) ? resolvedKey : null;
  } catch {
    return null;
  }
}

async function downloadS3Object(
  key: string,
  isValidKey: (value: string) => boolean,
  fallbackContentType: string,
): Promise<{ body: Uint8Array; contentType: string }> {
  const config = getS3Config();
  if (!config) {
    throw new Error("S3 is not configured");
  }

  if (!isValidKey(key)) {
    throw new Error("Invalid object key");
  }

  const client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const response = await client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error("Object not found");
  }

  return {
    body: await response.Body.transformToByteArray(),
    contentType: response.ContentType ?? fallbackContentType,
  };
}

export function resolveInscriptionPhotoKey(
  photoKey: string | null | undefined,
  photoUrl: string | null | undefined,
): string | null {
  return resolveS3ObjectKey(photoKey, photoUrl, isValidInscriptionPhotoKey);
}

export function resolvePartnerLogoKey(
  logoKey: string | null | undefined,
  logoUrl: string | null | undefined,
): string | null {
  return resolveS3ObjectKey(logoKey, logoUrl, isValidPartnerLogoKey);
}

export async function downloadInscriptionPhoto(
  key: string,
): Promise<{ body: Uint8Array; contentType: string }> {
  return downloadS3Object(key, isValidInscriptionPhotoKey, "image/jpeg");
}

export async function downloadPartnerLogo(
  key: string,
): Promise<{ body: Uint8Array; contentType: string }> {
  return downloadS3Object(key, isValidPartnerLogoKey, "image/png");
}
