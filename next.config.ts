import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/api/inscriptions": ["./node_modules/.prisma/client/**/*"],
  },
  allowedDevOrigins: [
    "http://192.168.1.71:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
};

export default nextConfig;
