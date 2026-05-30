import type { NextConfig } from "next";
// Plugin CJS officiel Prisma pour inclure le moteur query sur Vercel
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin");

const nextConfig: NextConfig = {
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
