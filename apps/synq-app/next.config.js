/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  transpilePackages: ["@synq/ui", "@synq/supabase"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
      },
      {
        protocol: "https",
        hostname: "gfwtmsyiwthckwkaudas.supabase.co",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
