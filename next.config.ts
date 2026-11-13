import type { NextConfig } from "next";
// Plugin CJS officiel Prisma pour inclure le moteur query sur Vercel
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin");

/** Rapport PDF hébergé sur Cloudflare R2 (bucket var4), servi via le domaine du site (pas de CORS). */
const RAPPORT_PDF_REMOTE_URL =
  process.env.RAPPORT_PDF_REMOTE_URL ??
  "https://pub-6c8d0f1917f74c348c57b4ae9f1e2dae.r2.dev/rapport-var4.pdf";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/rapport/rapport-var4.pdf", destination: RAPPORT_PDF_REMOTE_URL }];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/.prisma/client/**/*"],
  },
  allowedDevOrigins: [
    "http://192.168.1.71:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
};

export default nextConfig;
