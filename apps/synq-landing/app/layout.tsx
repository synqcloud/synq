import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@synq/ui/globals.css";

import { LandingProviders } from "./providers";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Synq - Inventory Software Built for Card Shops and Sellers",
  description:
    "Inventory management software built specifically for trading card game sellers. Track inventory, manage transactions, and grow your TCG business. Built by sellers, for sellers.",
  keywords:
    "TCG inventory management, trading card game software, card shop inventory, local game store software, TCG seller tools, card inventory tracking, game store management, open source inventory software",
  metadataBase: new URL("https://www.trysynq.com"),
  openGraph: {
    title: "Synq - Inventory Software Built for Card Shops and Sellers",
    description:
      "Inventory management software built specifically for trading card game sellers. Track inventory, manage transactions, and grow your TCG business. Built by sellers, for sellers.",
    url: "https://www.trysynq.com",
    type: "website",
    siteName: "Synq",
    images: [
      {
        url: "/brand/synq-eyecatcher-art.png",
        width: 1200,
        height: 630,
        alt: "Synq Dashboard - Inventory Management for TCG Sellers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Synq - Inventory Software Built for Card Shops and Sellers",
    description:
      "Inventory management software built specifically for trading card game sellers. Track inventory, manage transactions, and grow your TCG business.",
    images: ["/brand/synq-eyecatcher-art.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Analytics />
        <link
          rel="sitemap"
          type="application/xml"
          title="Sitemap"
          href="/sitemap.xml"
        />
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        <LandingProviders>{children}</LandingProviders>
      </body>
    </html>
  );
}
