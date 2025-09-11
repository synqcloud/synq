import { useState } from "react";
import { UserStockWithListings } from "@synq/supabase/services";

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

  const [editData, setEditData] = useState<EditData>({
    quantity: stock.quantity || 1,
    condition: stock.condition || "",
    cogs: stock.cogs || 0,
    sku: stock.sku || "",
    location: stock.location || "",
    language: stock.language || "",
  });

  const startEdit = () => setIsEditing(true);

  const cancelEdit = () => {
    setEditData({
      quantity: stock.quantity || 1,
      condition: stock.condition || "",
      cogs: stock.cogs || 0,
      sku: stock.sku || "",
      location: stock.location || "",
      language: stock.language || "",
    });
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

  const getCurrentConditionValue = () => {
    return editData.condition || "";
  };

  const handleConditionChange = (value: string) => {
    updateField("condition", value);
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
    getCurrentConditionValue,
    handleConditionChange,
  };
}
