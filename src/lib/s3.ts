import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const INSCRIPTION_PHOTO_PREFIX = "inscriptions/var4/";

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

export function resolveInscriptionPhotoKey(
  photoKey: string | null | undefined,
  photoUrl: string | null | undefined,
): string | null {
  if (photoKey && isValidInscriptionPhotoKey(photoKey)) {
    return photoKey;
  }

  if (!photoUrl) {
    return null;
  }

  const config = getS3Config();
  if (!config) {
    return null;
  }

  const publicBase = process.env.AWS_S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (publicBase && photoUrl.startsWith(`${publicBase}/`)) {
    const key = photoUrl.slice(publicBase.length + 1);
    return isValidInscriptionPhotoKey(key) ? key : null;
  }

  try {
    const parsed = new URL(photoUrl);
    const host = parsed.hostname;
    const isBucketHost =
      host === `${config.bucket}.s3.${config.region}.amazonaws.com` ||
      host === `${config.bucket}.s3.amazonaws.com` ||
      host.startsWith(`${config.bucket}.s3.`);

    if (!isBucketHost) {
      return null;
    }

    const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
    return isValidInscriptionPhotoKey(key) ? key : null;
  } catch {
    return null;
  }
}

export async function downloadInscriptionPhoto(
  key: string,
): Promise<{ body: Uint8Array; contentType: string }> {
  const config = getS3Config();
  if (!config) {
    throw new Error("S3 is not configured");
  }

  if (!isValidInscriptionPhotoKey(key)) {
    throw new Error("Invalid photo key");
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
    throw new Error("Photo introuvable");
  }

  return {
    body: await response.Body.transformToByteArray(),
    contentType: response.ContentType ?? "image/jpeg",
  };
}
