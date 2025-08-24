"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

interface LandingProvidersProps {
  children: React.ReactNode;
}

export function LandingProviders({ children }: LandingProvidersProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
