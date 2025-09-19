"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserService } from "@synq/supabase/services";

type Currency = "usd" | "eur";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined,
);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currency, setCurrency] = useState<Currency>("usd");
  const [symbol, setSymbol] = useState("$");

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const userCurrency = await UserService.fetchUserCurrency("client");
        if (userCurrency) {
          // normalize to lowercase
          const normalized = userCurrency.toLowerCase() as Currency;
          setCurrency(normalized);
        }
      } catch (err) {
        console.error("Failed to fetch currency:", err);
      }
    };

    fetchCurrency();
  }, []);

  useEffect(() => {
    setSymbol(currency === "usd" ? "$" : "€");
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context)
    throw new Error("useCurrency must be used within a CurrencyProvider");
  return context;
};
