import { z } from "zod";
import { EditData } from "../hooks/use-stock-edit";

const stockSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  condition: z.string().nonempty("Condition is required"),
  cost: z.number().nonnegative("Cost cannot be negative").optional(),
  sku: z.string().optional(),
  location: z.string().optional(),
  language: z.string().nonempty("Language is required"),
});

export function validateStock(
  editData: EditData,
  existingCombinations: Array<{
    condition?: string;
    language: string;
  }>,
): string | null {
  // Check for duplicates - condition + language combination
  const isDuplicate = existingCombinations.some((combo) => {
    return (
      combo.condition === editData.condition &&
      combo.language === editData.language
    );
  });

  if (isDuplicate) {
    return "This combination already exists in your inventory.";
  }

  // Zod validation
  const parseResult = stockSchema.safeParse({
    quantity: editData.quantity,
    condition: editData.condition,
    cost: editData.cogs,
    sku: editData.sku,
    location: editData.location,
    language: editData.language,
  });

  if (!parseResult.success) {
    return parseResult.error.errors[0]?.message || "Validation error";
  }

  return null;
}
