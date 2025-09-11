import { useState, useEffect } from "react";
import { InventoryService } from "@synq/supabase/services";

export function useStockData() {
  const [conditions, setConditions] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([
      InventoryService.getAvailableConditions("client"),
      InventoryService.getAvailableLanguages("client"),
    ])
      .then(([conditionsData, languagesData]) => {
        if (!active) return;
        setConditions(conditionsData);
        setLanguages(languagesData);
      })
      .catch((err) => {
        console.error("Failed to load stock data:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { conditions, languages, loading };
}
