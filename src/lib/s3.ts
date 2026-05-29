import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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
