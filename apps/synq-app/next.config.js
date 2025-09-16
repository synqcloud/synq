/** @type {import('next').NextConfig} */

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

export default nextConfig;
