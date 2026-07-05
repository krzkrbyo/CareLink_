import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oegnhpukbzcljbcnfqsu.supabase.co",
      },
    ],
  },
};

export default nextConfig;
