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
  "Manapool",
  // Physical/direct sources
  "in-store",
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
