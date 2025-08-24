import type { Metadata } from "next";
import { SynqProviders } from "./providers";
import { Toaster } from "@synq/ui/component";
import { cookies } from "next/headers";

import "@synq/ui/globals.css";

export const metadata: Metadata = {
  title: "Synq",
  description: "Collectibles Inventory Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "system";

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SynqProviders initialTheme={theme as "light" | "dark" | "system"}>
          {children}
        </SynqProviders>
        <Toaster />
      </body>
    </html>
  );
}
