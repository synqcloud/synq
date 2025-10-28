export interface IntegrationConfig {
  name: string;
  description: string;
  icon_url: string;
  type: "shopify" | "cardtrader" | "tcgplayer" | "cardmarket" | "manapool";
  isComingSoon?: boolean;
}

export const INTEGRATIONS: IntegrationConfig[] = [
  {
    name: "CardTrader",
    description: "Connect to CardTrader to manage your listings and orders.",
    icon_url: "/cardtrader.svg",
    type: "cardtrader",
  },
  {
    name: "Manapool",
    description: "Connect to Manapool to manage your listings and orders.",
    icon_url: "/manapool.svg",
    type: "manapool",
  },
  {
    name: "Shopify",
    description:
      "Sync products, orders, and inventory with your Shopify store.",
    icon_url: "/shopify.svg",
    type: "shopify",
  },
  {
    name: "TCGplayer",
    description: "Connect to TCGplayer seller accounts.",
    icon_url: "/tcgplayer.svg",
    type: "tcgplayer",
    isComingSoon: true,
  },
  {
    name: "Cardmarket",
    description: "Manage Cardmarket listings and orders.",
    icon_url: "/cardmarket.svg",
    type: "cardmarket",
    isComingSoon: true,
  },
];
