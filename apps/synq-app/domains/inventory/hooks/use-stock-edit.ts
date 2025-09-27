import { useEffect, useState } from "react";
import { UserStockWithListings } from "@synq/supabase/services";
import { createInitialEditData } from "../utils/stock-helpers";

export type EditData = {
  quantity: number;
  condition: string;
  cogs: number;
  sku: string;
  location: string;
  language: string;
};

export function useStockEdit(stock: UserStockWithListings) {
  const [isEditing, setIsEditing] = useState(false);
  const [marketplaces, setMarketplaces] = useState<string[]>(
    stock.marketplaces || [],
  );
  const [editData, setEditData] = useState<EditData>(() =>
    createInitialEditData(stock),
  );

  useEffect(() => {
    setEditData(createInitialEditData(stock));
    setMarketplaces(stock.marketplaces || []);
  }, [stock]);

  const startEdit = () => setIsEditing(true);

  const cancelEdit = () => {
    setEditData(createInitialEditData(stock));
    setIsEditing(false);
  };

  const updateField = (field: keyof EditData, value: string | number) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const addMarketplace = (marketplace: string) => {
    setMarketplaces((prev) => [...prev, marketplace]);
  };

  const removeMarketplace = (marketplace: string) => {
    setMarketplaces((prev) => prev.filter((m) => m !== marketplace));
  };

  return {
    isEditing,
    editData,
    marketplaces,
    startEdit,
    cancelEdit,
    updateField,
    addMarketplace,
    removeMarketplace,
  };
}
