import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TransactionService,
  QuickTransactionItem,
} from "@synq/supabase/services";

type QuickTransactionContextType = {
  // State
  stockIds: string[];
  isOpen: boolean;
  items: QuickTransactionItem[];
  isLoading: boolean;
  // Actions
  addStockId: (stockId: string) => void;
  removeStockId: (stockId: string) => void;
  clearAll: () => void;
  openSheet: () => void;
  closeSheet: () => void;
  toggleSheet: () => void;
};

const QuickTransactionContext = createContext<
  QuickTransactionContextType | undefined
>(undefined);

const STORAGE_KEY = "quick-transaction-stock-ids";

// Helper functions for safe storage access
const getStoredStockIds = (): string[] => {
  // Only access localStorage on client side
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error("Failed to load stock IDs from storage:", error);
  }
  return [];
};

const saveStockIds = (stockIds: string[]): void => {
  // Only access localStorage on client side
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stockIds));
  } catch (error) {
    console.error("Failed to save stock IDs to storage:", error);
  }
};

export function QuickTransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize with empty array for SSR, load from storage after mount
  const [stockIds, setStockIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    const stored = getStoredStockIds();
    if (stored.length > 0) {
      setStockIds(stored);
    }
    setIsHydrated(true);
  }, []);

  // Persist stockIds to localStorage whenever they change (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      saveStockIds(stockIds);
    }
  }, [stockIds, isHydrated]);

  // Fetch items when stockIds change
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["quick-transaction-items", stockIds],
    queryFn: async () => {
      if (stockIds.length === 0) return [];
      return await TransactionService.getQuickTransactionItems(
        "client",
        stockIds,
      );
    },
    enabled: stockIds.length > 0,
  });

  const addStockId = useCallback((stockId: string) => {
    setStockIds((prev) => {
      // Avoid duplicates
      if (prev.includes(stockId)) return prev;
      return [...prev, stockId];
    });
    // Auto-open the sheet when adding an item
    setIsOpen(true);
  }, []);

  const removeStockId = useCallback((stockId: string) => {
    setStockIds((prev) => prev.filter((id) => id !== stockId));
  }, []);

  const clearAll = useCallback(() => {
    setStockIds([]);
  }, []);

  const openSheet = useCallback(() => setIsOpen(true), []);

  const closeSheet = useCallback(() => setIsOpen(false), []);

  const toggleSheet = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <QuickTransactionContext.Provider
      value={{
        stockIds,
        isOpen,
        items,
        isLoading,
        addStockId,
        removeStockId,
        clearAll,
        openSheet,
        closeSheet,
        toggleSheet,
      }}
    >
      {children}
    </QuickTransactionContext.Provider>
  );
}

export function useQuickTransaction() {
  const context = useContext(QuickTransactionContext);
  if (!context) {
    throw new Error(
      "useQuickTransaction must be used within QuickTransactionProvider",
    );
  }
  return context;
}
