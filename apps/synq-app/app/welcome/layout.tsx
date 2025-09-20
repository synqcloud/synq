// REACT
import * as React from "react";

import { CurrencyProvider } from "@/shared/contexts/currency-context";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}
