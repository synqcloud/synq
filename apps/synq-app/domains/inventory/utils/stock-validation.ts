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
export const addStockFormSchema = baseStockSchema.extend({
  source: z.string().min(1, "Source is required"),
  shipping_amount: z.number().min(0).optional(),
  tax_amount: z.number().min(0).optional(),
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
    transactionData: {
      source: formData.source,
      tax_amount:
        formData.tax_amount && formData.tax_amount > 0
          ? formData.tax_amount
          : undefined,
      shipping_amount:
        formData.shipping_amount && formData.shipping_amount > 0
          ? formData.shipping_amount
          : undefined,
    },
  };
}
