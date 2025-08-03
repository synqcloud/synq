export interface Database {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  imageUrl?: string;
  installedGroups?: string[]; // IDs of installed groups
  lastUpdated?: string; // ISO date string
  totalCards?: number;
  pricingSupport?: "tcgplayer" | "cardmarket" | "none";
  priceUpdateFrequency?: "24h" | "weekly" | "none";
}

export const mockData: Database[] = [
  {
    id: "disney-lorcana",
    name: "Disney Lorcana",
    description: "Disney Lorcana TCG collection and inventory tracking",
    status: "active",
    imageUrl:
      "https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png",
    installedGroups: ["first-chapter", "rise-of-the-floodborn"],
    lastUpdated: "2024-01-15T10:30:00Z",
    totalCards: 408,
    pricingSupport: "tcgplayer",
    priceUpdateFrequency: "24h",
  },
  {
    id: "pokemon",
    name: "Pokémon",
    description: "Your Pokémon card inventory and tracking",
    status: "inactive",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png",
    installedGroups: [],
    pricingSupport: "tcgplayer",
    priceUpdateFrequency: "24h",
  },
  {
    id: "yu-gi-oh",
    name: "Yu-Gi-Oh!",
    description: "Yu-Gi-Oh! card collection and inventory management",
    status: "inactive",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Yu-Gi-Oh%21_%28Logo%29.jpg/1200px-Yu-Gi-Oh%21_%28Logo%29.jpg",
    installedGroups: [],
    pricingSupport: "cardmarket",
    priceUpdateFrequency: "weekly",
  },
  {
    id: "magic-the-gathering",
    name: "Magic: The Gathering",
    description: "MTG card collection and inventory tracking",
    status: "inactive",
    imageUrl:
      "https://mnd-assets.mynewsdesk.com/image/upload/c_fill,dpr_auto,f_auto,g_sm,q_auto:good,w_746/v85jyye7uyoqc851m514kf",
    installedGroups: [],
    pricingSupport: "tcgplayer",
    priceUpdateFrequency: "24h",
  },
  {
    id: "one-piece",
    name: "One Piece Card Game",
    description: "One Piece TCG collection and inventory management",
    status: "inactive",
    imageUrl:
      "https://static.wixstatic.com/media/57a197_e334385962ac4203abe6390f3b6ff4c6~mv2.png/v1/fill/w_280,h_157,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ONE%20PIECE%20LOGO.png",
    installedGroups: [],
    pricingSupport: "cardmarket",
    priceUpdateFrequency: "weekly",
  },
  {
    id: "digimon",
    name: "Digimon Card Game",
    description: "Digimon TCG collection and inventory tracking",
    status: "inactive",
    imageUrl:
      "https://ihc.cards/cdn/shop/collections/digimon-card-game-logo.webp?v=1707603160",
    installedGroups: [],
    pricingSupport: "none",
    priceUpdateFrequency: "none",
  },
  {
    id: "flesh-and-blood",
    name: "Flesh and Blood",
    description: "Flesh and Blood TCG collection and inventory management",
    status: "inactive",
    imageUrl:
      "https://dhhim4ltzu1pj.cloudfront.net/static/32625500/fabsite/img/fab_logo.png",
    installedGroups: [],
    pricingSupport: "none",
    priceUpdateFrequency: "none",
  },
  {
    id: "star-wars-unlimited",
    name: "Star Wars: Unlimited",
    description: "Star Wars: Unlimited TCG collection and inventory tracking",
    status: "inactive",
    imageUrl:
      "https://www.coolesuggesties.nl/wp-content/uploads/2023/05/Star-Wars-Unlimited-logo-275x197.png",
    installedGroups: [],
    pricingSupport: "none",
    priceUpdateFrequency: "none",
  },
];
