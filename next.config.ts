import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Spotify OAuth requires the redirect URI host to be 127.0.0.1, so we open
  // the dev server at http://127.0.0.1:3000. Next.js 16 blocks /_next/* dev
  // resources from non-"localhost" origins by default, which breaks client
  // hydration. Allow both forms here.
  allowedDevOrigins: ["127.0.0.1", "localhost", "[::1]"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "mosaic.scdn.co" },
    ],
  },
};

export default nextConfig;
