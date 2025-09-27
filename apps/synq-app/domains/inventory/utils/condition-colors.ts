export function getConditionColor(condition: string | null): string {
  if (!condition) return "";

  const conditionColors: Record<string, string> = {
    // TCGPlayer conditions
    "near mint": "text-green-600",
    "lightly played": "text-yellow-500",
    "moderately played": "text-orange-500",
    "heavily played": "text-red-600",
    damaged: "text-gray-400",

    // Cardmarket conditions
    mint: "text-green-700",
    excellent: "text-green-600",
    good: "text-yellow-500",
    "light played": "text-yellow-500",
    played: "text-red-600",
    poor: "text-gray-500",
  };

  return conditionColors[condition.toLowerCase()] || "";
}
