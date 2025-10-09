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
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@synq/ui/component";
import { Plus, ShoppingBag } from "lucide-react";
import NotificationBell from "@/features/notifications/components/notification-bell";
import { QuickTransactionSheet } from "@/features/transactions/components/quick-transaction-sheet";
import { UserService } from "@synq/supabase/services";
import { useQuickTransaction } from "@/shared/contexts/quick-transaction-context";

type Currency = "usd" | "eur";

const AppHeader: React.FC = () => {
  const router = useRouter();
  const [pageTitle, setPageTitle] = useState("");
  const [currency, setCurrency] = useState<"usd" | "eur">("usd");
  const [loading, setLoading] = useState(false);

  // Quick Transaction context
  const { stockIds, toggleSheet } = useQuickTransaction();
  const itemCount = stockIds.length;

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
    <>
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
            <SelectTrigger className="h-7 text-xs px-3">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD</SelectItem>
              <SelectItem value="eur">EUR</SelectItem>
            </SelectContent>
          </Select>

          {/* Quick Transaction Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSheet}
                  aria-label="Quick transaction"
                  className="relative"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute top-0 right-0 h-4 w-4 flex items-center justify-center p-0 text-[10px] pointer-events-none rounded-full"
                    >
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  Quick Transaction{" "}
                  {itemCount > 0 &&
                    `(${itemCount} item${itemCount !== 1 ? "s" : ""})`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Notification Bell */}
          <NotificationBell />
        </HStack>
      </header>

      {/* Quick Transaction Sheet */}
      <QuickTransactionSheet />
    </>
  );
};

export default AppHeader;
