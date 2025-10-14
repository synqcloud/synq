export interface IntegrationConfig {
  name: string;
  description: string;
  icon_url: string;
  type: "shopify" | "cardtrader" | "tcgplayer" | "cardmarket";
  isComingSoon?: boolean;
}

export const INTEGRATIONS: IntegrationConfig[] = [
  {
    name: "Shopify",
    description:
      "Sync products, orders, and inventory with your Shopify store.",
    icon_url: "/shopify.svg",
    type: "shopify",
  },
  {
    name: "CardTrader",
    description: "Connect to CardTrader to manage your listings and orders.",
    icon_url: "/cardtrader.svg",
    type: "cardtrader",
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
