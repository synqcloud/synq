import { useState } from "react";
import { InventoryItem, InventoryStats } from "../types/integrations";

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadInventory = async (endpoint: string) => {
    setLoading(true);
    setError("");
    setInventory([]);
    setStats(null);

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load inventory");
      }

      setInventory(data.inventory || []);
      setStats(data.stats || null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load inventory";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { inventory, stats, loading, error, loadInventory };
};
