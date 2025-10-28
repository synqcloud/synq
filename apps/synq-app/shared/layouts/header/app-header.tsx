"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SidebarTrigger,
  Button,
  ButtonGroup,
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
  Kbd,
} from "@synq/ui/component";
import { Plus, ShoppingBag, Search } from "lucide-react";
import NotificationBell from "@/features/notifications/components/notification-bell";
import { QuickTransactionSheet } from "@/features/transactions/components/quick-transaction-sheet";

import { UserService } from "@synq/supabase/services";
import { useQuickTransaction } from "@/shared/contexts/quick-transaction-context";
import { SearchCommand } from "@/shared/command/search-command";

type Currency = "usd" | "eur";

const AppHeader: React.FC = () => {
  const router = useRouter();
  const [currency, setCurrency] = useState<"usd" | "eur">("usd");
  const [loading, setLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

  // Keyboard shortcut for search (Cmd+P or Ctrl+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
          <div className="h-6 w-px bg-border" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchOpen(true)}
            className="relative w-64 justify-start text-muted-foreground text-sm"
          >
            <Search className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline-flex">Search cards...</span>
            <span className="inline-flex sm:hidden">Search...</span>
            <div className="pointer-events-none ml-auto hidden select-none items-center gap-1 sm:flex">
              <Kbd>⌘ + P</Kbd>
            </div>
          </Button>
        </div>

        <HStack align="center" justify="end" gap={4}>
          {/* Currency Selector */}
          {/*<Select
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
          </Select>*/}

          {/* Button Group for Quick Transaction and Notifications */}
          <TooltipProvider>
            <ButtonGroup>
              {/* Quick Transaction Button */}
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

              {/* Notification Bell */}
              <NotificationBell />
            </ButtonGroup>
          </TooltipProvider>
        </HStack>
      </header>

      {/* Search Command */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Quick Transaction Sheet */}
      <QuickTransactionSheet />
    </>
  );
};

export default AppHeader;
