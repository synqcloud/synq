import { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@synq/ui/component";

// Map of full condition names to short codes
const conditionShortCodes: Record<string, string> = {
  // TCGplayer
  "near mint": "nm",
  "lightly played": "lp",
  "moderately played": "mp",
  "heavily played": "hp",
  damaged: "dm",

  // Cardmarket
  mint: "m",
  excellent: "ex",
  good: "g",
  "light played": "lp",
  played: "p",
  poor: "pr",
};

// Map of full condition names to color classes
const conditionColors: Record<string, string> = {
  // TCGplayer
  "near mint": "bg-green-600 text-white",
  "lightly played": "bg-yellow-500 text-black",
  "moderately played": "bg-orange-500 text-white",
  "heavily played": "bg-red-600 text-white",
  damaged: "bg-gray-500 text-white",

  // Cardmarket
  mint: "bg-green-700 text-white",
  excellent: "bg-lime-700 text-white",
  good: "bg-yellow-500 text-black",
  "light played": "bg-orange-500 text-white",
  played: "bg-red-300 text-black",
  poor: "bg-red-600 text-white",
};

// Map of full condition names to Badge variants
const conditionVariants: Record<
  string,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  "near mint": "near-mint",
  "lightly played": "lightly-played",
  "moderately played": "moderately-played",
  "heavily played": "heavily-played",
  damaged: "damaged",
  mint: "mint",
  excellent: "excellent",
  good: "good",
  "light played": "light-played",
  played: "played",
  poor: "poor",
};

// Helper: normalize a condition string
function normalizeCondition(condition: string | null): string {
  if (!condition) return "";
  return condition
    .toLowerCase()
    .trim()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Returns the short code for a condition string
 * Example: "Near Mint" -> "NM"
 */
export function getConditionShortCode(condition: string | null): string {
  const normalized = normalizeCondition(condition);
  return conditionShortCodes[normalized]?.toUpperCase() || "";
}

/**
 * Returns a color class for a condition string
 * Example: "lightly played" -> "bg-yellow-500 text-black"
 */
export function getConditionColor(condition: string | null): string {
  const normalized = normalizeCondition(condition);
  return normalized && conditionColors[normalized]
    ? `!${conditionColors[normalized]}`
    : "";
}

/**
 * Returns the badge variant for a condition string
 * Example: "heavily played" -> "heavily-played"
 */
export function getConditionVariant(
  condition: string | null,
): VariantProps<typeof badgeVariants>["variant"] {
  const normalized = normalizeCondition(condition);
  return normalized && conditionVariants[normalized]
    ? conditionVariants[normalized]
    : "none";
}
