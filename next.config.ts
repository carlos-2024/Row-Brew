import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Necesario para la imagen Docker liviana que corre en EasyPanel
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
