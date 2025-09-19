"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SidebarTrigger,
  Button,
  HStack,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/component";
import { Plus } from "lucide-react";
import NotificationBell from "@/features/notifications/components/notification-bell";
import { UserService } from "@synq/supabase/services";

type Currency = "usd" | "eur";

const AppHeader: React.FC = () => {
  const router = useRouter();
  const [pageTitle, setPageTitle] = useState("");
  const [currency, setCurrency] = useState<"usd" | "eur">("usd");
  const [loading, setLoading] = useState(false);

  // Fetch current user currency
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const userCurrency = await UserService.fetchUserCurrency("client");
        if (userCurrency) {
          const normalizedCurrency = userCurrency.toLowerCase() as Currency;
          setCurrency(normalizedCurrency);
        }
      } catch (err) {
        console.error("Failed to fetch currency:", err);
      }
    };

    fetchCurrency();
  }, []);

  // Page title observer
  useEffect(() => {
    const updateTitle = () => {
      const title = document.title;
      const cleanTitle = title.replace(/\s*\|\s*Synq$/, "");
      setPageTitle(cleanTitle);
    };

    updateTitle();
    const observer = new MutationObserver(updateTitle);
    observer.observe(document.head, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  // Handle currency change
  const handleCurrencyChange = async (newCurrency: "usd" | "eur") => {
    setCurrency(newCurrency);
    setLoading(true);
    try {
      await UserService.updateUserCurrency(newCurrency, "client");
    } catch (err) {
      console.error("Failed to update currency:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex shrink-0 items-center justify-between gap-2 p-4 border-b border-border/40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="ml-1" />
        <div className="flex items-center gap-3">
          <div className="h-6 w-px bg-border" />
          <div className="flex flex-col">
            <h1 className="text-lg font-light tracking-[-0.01em] text-foreground">
              {pageTitle}
            </h1>
          </div>
        </div>
      </div>

      <HStack align="center" justify="end" gap={4}>
        {/* Currency Selector */}

        <Select
          value={currency}
          onValueChange={(val) => handleCurrencyChange(val as "usd" | "eur")}
          disabled={loading}
        >
          <SelectTrigger className="h-8 text-xs px-3">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usd">USD</SelectItem>
            <SelectItem value="eur">EUR</SelectItem>
          </SelectContent>
        </Select>

        {/* Button to go to new transaction page */}
        <Button
          variant="outline"
          size="xs"
          onClick={() => router.push("/transactions/new")}
        >
          <Plus />
          Add Transaction
        </Button>

        {/* Notification Bell */}
        <NotificationBell />
      </HStack>
    </header>
  );
};

export default AppHeader;
