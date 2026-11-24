import type { NextConfig } from "next";

// GitHub Pages serves the site from /<repo>; set NEXT_PUBLIC_BASE_PATH=/adjop there.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
