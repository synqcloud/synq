import { UserStockWithListings } from "@synq/supabase/services";
import { EditData } from "../hooks/use-stock-edit";

/**
 * Creates initial edit data from stock object
 */
export function createInitialEditData(stock: UserStockWithListings): EditData {
  return {
    quantity: stock.quantity || 0,
    condition: stock.condition || "",
    cogs: stock.cogs || 0,
    sku: stock.sku || "",
    location: stock.location || "",
    language: stock.language || "",
  };
}

/**
 * Normalizes a value for comparison (handles null, undefined, empty strings)
 */
function normalize(value: any, defaultValue: any = ""): any {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return value;
}

/**
 * Checks if edit data has changes compared to original stock
 */
export function hasStockChanges(
  stock: UserStockWithListings,
  editData: EditData,
  marketplaces?: string[],
): boolean {
  // Normalize and compare each field
  const quantityChanged =
    Number(editData.quantity) !== Number(normalize(stock.quantity, 1));
  const conditionChanged =
    normalize(editData.condition) !== normalize(stock.condition);
  const cogsChanged =
    Number(editData.cogs) !== Number(normalize(stock.cogs, 0));
  const skuChanged = normalize(editData.sku) !== normalize(stock.sku);
  const locationChanged =
    normalize(editData.location) !== normalize(stock.location);
  const languageChanged =
    normalize(editData.language) !== normalize(stock.language);

  const hasFieldChanges =
    quantityChanged ||
    conditionChanged ||
    cogsChanged ||
    skuChanged ||
    locationChanged ||
    languageChanged;

  // Check marketplace changes if provided
  let hasMarketplaceChanges = false;
  if (marketplaces !== undefined) {
    const originalMarketplaces = stock.marketplaces || [];

    // Sort both arrays for comparison to avoid order issues
    const sortedOriginal = [...originalMarketplaces].sort();
    const sortedCurrent = [...marketplaces].sort();

    hasMarketplaceChanges =
      sortedOriginal.length !== sortedCurrent.length ||
      !sortedOriginal.every((m, index) => m === sortedCurrent[index]);
  }

  return hasFieldChanges || hasMarketplaceChanges;
}

/**
 * Builds update payload for API call
 */
export function buildStockUpdatePayload(editData: EditData) {
  return {
    change_type: "manual_edit" as const,
    quantity_new: editData.quantity,
    condition: editData.condition,
    cost: editData.cogs,
    sku: editData.sku,
    location: editData.location,
    language: editData.language,
  };
}
