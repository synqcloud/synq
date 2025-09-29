import { z } from "zod";
import { EditData } from "../hooks/use-stock-edit";

// Base schema for core stock fields - reusable
const baseStockSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  condition: z.string().min(1, "Condition is required"),
  cogs: z.number().nonnegative("Cost cannot be negative").optional(),
  sku: z.string().optional(),
  location: z.string().optional(),
  language: z.string().min(1, "Language is required"),
});

// Extended schema for add stock form (includes transaction fields)
// Now supports conditional validation based on createTransaction flag
export const addStockFormSchema = baseStockSchema
  .extend({
    source: z.string().optional(),
    shipping_amount: z.number().min(0).optional(),
    tax_amount: z.number().min(0).optional(),
    createTransaction: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // If createTransaction is true, source becomes required
    if (data.createTransaction !== false && !data.source) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Source is required when creating a transaction",
        path: ["source"],
      });
    }
  });

// Export the base schema for editing existing stock
export const editStockSchema = baseStockSchema;

// Type for add stock form (includes transaction fields)
export type AddStockFormData = z.infer<typeof addStockFormSchema>;

// Helper function to convert EditData to the format expected by baseStockSchema
function editDataToSchemaFormat(editData: EditData) {
  return {
    quantity: editData.quantity,
    condition: editData.condition,
    cogs: editData.cogs,
    sku: editData.sku,
    location: editData.location,
    language: editData.language,
  };
}

// Original validation function for EditData (keeps backward compatibility)
export function validateStock(editData: EditData): string | null {
  const parseResult = editStockSchema.safeParse(
    editDataToSchemaFormat(editData),
  );
  if (!parseResult.success) {
    return parseResult.error.errors[0]?.message || "Validation error";
  }
  return null;
}

// New validation function for add stock form
export function validateAddStockForm(
  formData: AddStockFormData,
): string | null {
  const parseResult = addStockFormSchema.safeParse(formData);
  if (!parseResult.success) {
    return parseResult.error.errors[0]?.message || "Validation error";
  }
  return null;
}

// Helper to convert AddStockFormData to the format needed by InventoryService
export function convertFormDataToStockData(formData: AddStockFormData) {
  return {
    stockData: {
      quantity: Number(formData.quantity),
      condition: formData.condition,
      cost:
        formData.cogs && formData.cogs > 0 ? Number(formData.cogs) : undefined,
      sku: formData.sku || undefined,
      location: formData.location || undefined,
      language: formData.language,
    },
    transactionData:
      formData.createTransaction !== false
        ? {
            source: formData.source || "manual",
            tax_amount:
              formData.tax_amount && formData.tax_amount > 0
                ? formData.tax_amount
                : undefined,
            shipping_amount:
              formData.shipping_amount && formData.shipping_amount > 0
                ? formData.shipping_amount
                : undefined,
          }
        : null,
  };
}

// Stock validation utilities
import { UserStockWithListings } from "@synq/supabase/services";

/**
 * Creates initial edit data from stock object
 */
export function createInitialEditData(stock: UserStockWithListings): EditData {
  return {
    quantity: stock.quantity || 1,
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

const tcgplayerConditions = [
  "Near Mint",
  "Lightly Played",
  "Moderately Played",
  "Heavily Played",
  "Damaged",
];

const cardmarketConditions = [
  "Mint",
  "Near Mint",
  "Excellent",
  "Good",
  "Light Played",
  "Played",
  "Poor",
];

export const STOCK_CONDITIONS = Array.from(
  new Set([...tcgplayerConditions, ...cardmarketConditions]),
);

export const STOCK_LANGUAGES = [
  "en", // English
  "fr", // French
  "de", // German
  "it", // Italian
  "pt", // Portuguese
  "es", // Spanish
  "ru", // Russian
  "ja", // Japanese
  "ko", // Korean
  "zh-CN", // Chinese (Simplified)
  "zh-TW", // Chinese (Traditional)
];

export const STOCK_MARKETPLACES = [
  "TCGplayer",
  "Cardmarket",
  "eBay",
  "Amazon",
  "Shopify",
];

export const STOCK_SOURCES = [
  // Online marketplaces
  "TCGplayer",
  "Cardmarket",
  "eBay",
  "Amazon",
  "Shopify",
  // Physical/direct sources
  "in-store",
  "person",
  "trade",
  "manual",
];

export function useStockData() {
  return {
    conditions: STOCK_CONDITIONS,
    languages: STOCK_LANGUAGES,
    marketplaces: STOCK_MARKETPLACES, // For listings
    sources: STOCK_SOURCES, // For purchases/acquisitions
    loading: false,
    error: null,
  };
}
