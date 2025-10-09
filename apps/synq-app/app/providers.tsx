"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { TooltipProvider } from "@synq/ui/component";
import { QuickTransactionProvider } from "@/shared/contexts/quick-transaction-context";

interface SynqProvidersProps {
  children: React.ReactNode;
  initialTheme?: "light" | "dark" | "system";
}

export function SynqProviders({
  children,
  initialTheme = "system",
}: SynqProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <QuickTransactionProvider>
        <NextThemesProvider
          attribute="class"
          defaultTheme={initialTheme}
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </NextThemesProvider>
      </QuickTransactionProvider>
    </QueryClientProvider>
  );
}
