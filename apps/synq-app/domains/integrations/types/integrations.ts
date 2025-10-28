export interface InventoryItem {
  collector_number: string | null;
  productId: number;
  blueprintId: number;
  quantity: number;
  price_cents: number;
  foil: boolean;
  condition: string | null;
  name_en: string | null;

  language: string | null;
  setCode: string | null;
  setName: string | null;
  coreCardId: string | null;
  tcg_player_id: string | null;
  scryfall_id: string | null;
  image_url: string | null;
  rarity: string | null;
  matched_name: string | null;
  matched: boolean;
}

export interface InventoryStats {
  total: number;
  matched: number;
  unmatched: number;
}

export interface IntegrationError {
  type: "connection" | "validation" | "sync";
  message: string;
}
