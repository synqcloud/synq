export interface ImportableGroup {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  releaseDate: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface DatabaseImportableGroups {
  databaseId: string;
  databaseName: string;
  groups: ImportableGroup[];
}

export const mockImportableGroups: DatabaseImportableGroups[] = [
  {
    databaseId: "disney-lorcana",
    databaseName: "Disney Lorcana",
    groups: [
      {
        id: "first-chapter",
        name: "The First Chapter",
        description: "The inaugural set featuring classic Disney characters",
        cardCount: 204,
        releaseDate: "2023-08-18",
        imageUrl:
          "https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png",
        isAvailable: true,
      },
      {
        id: "rise-of-the-floodborn",
        name: "Rise of the Floodborn",
        description: "The second set introducing new characters and mechanics",
        cardCount: 204,
        releaseDate: "2023-11-17",
        imageUrl:
          "https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png",
        isAvailable: true,
      },
      {
        id: "into-the-inklands",
        name: "Into the Inklands",
        description: "The third set exploring new realms and adventures",
        cardCount: 204,
        releaseDate: "2024-02-23",
        imageUrl:
          "https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png",
        isAvailable: true,
      },
      {
        id: "illumineers-trove",
        name: "Illumineer's Trove",
        description: "Special collection with unique cards and accessories",
        cardCount: 12,
        releaseDate: "2023-08-18",
        imageUrl:
          "https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png",
        isAvailable: true,
      },
      {
        id: "gift-set",
        name: "Gift Set",
        description: "Holiday gift collection with exclusive cards",
        cardCount: 8,
        releaseDate: "2023-11-17",
        imageUrl:
          "https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png",
        isAvailable: true,
      },
      {
        id: "d23-expo",
        name: "D23 Expo 2023",
        description: "Exclusive cards from the D23 Expo event",
        cardCount: 4,
        releaseDate: "2023-09-09",
        imageUrl:
          "https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png",
        isAvailable: true,
      },
      {
        id: "gen-con",
        name: "Gen Con 2023",
        description: "Limited edition cards from Gen Con convention",
        cardCount: 4,
        releaseDate: "2023-08-03",
        imageUrl:
          "https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png",
        isAvailable: true,
      },
      {
        id: "challenge-cards",
        name: "Challenge Cards",
        description: "Special challenge cards for competitive play",
        cardCount: 6,
        releaseDate: "2023-10-15",
        imageUrl:
          "https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png",
        isAvailable: true,
      },
      {
        id: "promo-cards",
        name: "Promotional Cards",
        description: "Various promotional cards from events and releases",
        cardCount: 15,
        releaseDate: "2023-08-18",
        imageUrl:
          "https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png",
        isAvailable: true,
      },
      {
        id: "starter-decks",
        name: "Starter Decks",
        description: "Pre-built starter decks for new players",
        cardCount: 60,
        releaseDate: "2023-08-18",
        imageUrl:
          "https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png",
        isAvailable: true,
      },
    ],
  },
  {
    databaseId: "pokemon",
    databaseName: "Pokémon",
    groups: [
      {
        id: "scarlet-violet",
        name: "Scarlet & Violet",
        description: "The latest generation of Pokémon cards",
        cardCount: 198,
        releaseDate: "2023-03-31",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png",
        isAvailable: true,
      },
      {
        id: "sword-shield",
        name: "Sword & Shield",
        description: "The Galar region Pokémon cards",
        cardCount: 202,
        releaseDate: "2020-02-07",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png",
        isAvailable: true,
      },
      {
        id: "sun-moon",
        name: "Sun & Moon",
        description: "The Alola region Pokémon cards",
        cardCount: 149,
        releaseDate: "2017-02-03",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png",
        isAvailable: true,
      },
      {
        id: "xy-series",
        name: "XY Series",
        description: "The Kalos region Pokémon cards",
        cardCount: 264,
        releaseDate: "2014-02-05",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png",
        isAvailable: true,
      },
      {
        id: "black-white",
        name: "Black & White",
        description: "The Unova region Pokémon cards",
        cardCount: 113,
        releaseDate: "2011-04-25",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png",
        isAvailable: true,
      },
      {
        id: "heartgold-soulsilver",
        name: "HeartGold & SoulSilver",
        description: "The Johto region Pokémon cards",
        cardCount: 123,
        releaseDate: "2010-02-10",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png",
        isAvailable: true,
      },
      {
        id: "platinum",
        name: "Platinum",
        description: "The Sinnoh region Pokémon cards",
        cardCount: 127,
        releaseDate: "2009-02-11",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png",
        isAvailable: true,
      },
      {
        id: "diamond-pearl",
        name: "Diamond & Pearl",
        description: "The Sinnoh region Pokémon cards",
        cardCount: 130,
        releaseDate: "2007-05-01",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png",
        isAvailable: true,
      },
      {
        id: "ex-series",
        name: "EX Series",
        description: "The Hoenn region Pokémon cards",
        cardCount: 165,
        releaseDate: "2003-06-18",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png",
        isAvailable: true,
      },
      {
        id: "neo-series",
        name: "Neo Series",
        description: "The Johto region Pokémon cards",
        cardCount: 113,
        releaseDate: "2000-12-16",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png",
        isAvailable: true,
      },
    ],
  },
  {
    databaseId: "magic-the-gathering",
    databaseName: "Magic: The Gathering",
    groups: [
      {
        id: "murders-at-karlov-manor",
        name: "Murders at Karlov Manor",
        description: "The latest set featuring detective themes",
        cardCount: 264,
        releaseDate: "2024-02-09",
        imageUrl:
          "https://mnd-assets.mynewsdesk.com/image/upload/c_fill,dpr_auto,f_auto,g_sm,q_auto:good,w_746/v85jyye7uyoqc851m514kf",
        isAvailable: true,
      },
      {
        id: "lost-caverns-of-ixalan",
        name: "Lost Caverns of Ixalan",
        description: "Explore the depths of Ixalan's caverns",
        cardCount: 288,
        releaseDate: "2023-11-17",
        imageUrl:
          "https://mnd-assets.mynewsdesk.com/image/upload/c_fill,dpr_auto,f_auto,g_sm,q_auto:good,w_746/v85jyye7uyoqc851m514kf",
        isAvailable: true,
      },
      {
        id: "wilds-of-eldraine",
        name: "Wilds of Eldraine",
        description: "A fairy tale adventure in Eldraine",
        cardCount: 264,
        releaseDate: "2023-09-08",
        imageUrl:
          "https://mnd-assets.mynewsdesk.com/image/upload/c_fill,dpr_auto,f_auto,g_sm,q_auto:good,w_746/v85jyye7uyoqc851m514kf",
        isAvailable: true,
      },
      {
        id: "lord-of-the-rings",
        name: "The Lord of the Rings: Tales of Middle-earth",
        description: "Journey through Middle-earth with iconic characters",
        cardCount: 281,
        releaseDate: "2023-06-23",
        imageUrl:
          "https://mnd-assets.mynewsdesk.com/image/upload/c_fill,dpr_auto,f_auto,g_sm,q_auto:good,w_746/v85jyye7uyoqc851m514kf",
        isAvailable: true,
      },
      {
        id: "march-of-the-machine",
        name: "March of the Machine",
        description: "The climactic battle against the Phyrexians",
        cardCount: 281,
        releaseDate: "2023-04-21",
        imageUrl:
          "https://mnd-assets.mynewsdesk.com/image/upload/c_fill,dpr_auto,f_auto,g_sm,q_auto:good,w_746/v85jyye7uyoqc851m514kf",
        isAvailable: true,
      },
      {
        id: "phyrexian-all-will-be-one",
        name: "Phyrexia: All Will Be One",
        description: "The Phyrexian invasion begins",
        cardCount: 271,
        releaseDate: "2023-02-10",
        imageUrl:
          "https://mnd-assets.mynewsdesk.com/image/upload/c_fill,dpr_auto,f_auto,g_sm,q_auto:good,w_746/v85jyye7uyoqc851m514kf",
        isAvailable: true,
      },
      {
        id: "brothers-war",
        name: "The Brothers' War",
        description: "The legendary conflict between Urza and Mishra",
        cardCount: 287,
        releaseDate: "2022-11-18",
        imageUrl:
          "https://mnd-assets.mynewsdesk.com/image/upload/c_fill,dpr_auto,f_auto,g_sm,q_auto:good,w_746/v85jyye7uyoqc851m514kf",
        isAvailable: true,
      },
      {
        id: "dominaria-united",
        name: "Dominaria United",
        description: "Return to the plane where it all began",
        cardCount: 281,
        releaseDate: "2022-09-09",
        imageUrl:
          "https://mnd-assets.mynewsdesk.com/image/upload/c_fill,dpr_auto,f_auto,g_sm,q_auto:good,w_746/v85jyye7uyoqc851m514kf",
        isAvailable: true,
      },
      {
        id: "streets-of-new-capenna",
        name: "Streets of New Capenna",
        description: "A noir-inspired world of crime families",
        cardCount: 281,
        releaseDate: "2022-04-29",
        imageUrl:
          "https://mnd-assets.mynewsdesk.com/image/upload/c_fill,dpr_auto,f_auto,g_sm,q_auto:good,w_746/v85jyye7uyoqc851m514kf",
        isAvailable: true,
      },
      {
        id: "kamigawa-neon-dynasty",
        name: "Kamigawa: Neon Dynasty",
        description: "Cyberpunk meets traditional Japanese mythology",
        cardCount: 302,
        releaseDate: "2022-02-18",
        imageUrl:
          "https://mnd-assets.mynewsdesk.com/image/upload/c_fill,dpr_auto,f_auto,g_sm,q_auto:good,w_746/v85jyye7uyoqc851m514kf",
        isAvailable: true,
      },
    ],
  },
  {
    databaseId: "one-piece",
    databaseName: "One Piece Card Game",
    groups: [
      {
        id: "op-05",
        name: "Awakening of the New Era",
        description: "The latest set featuring new characters and mechanics",
        cardCount: 1200,
        releaseDate: "2024-02-23",
        imageUrl:
          "https://static.wixstatic.com/media/57a197_e334385962ac4203abe6390f3b6ff4c6~mv2.png/v1/fill/w_280,h_157,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ONE%20PIECE%20LOGO.png",
        isAvailable: true,
      },
      {
        id: "op-04",
        name: "Kingdoms of Intrigue",
        description: "Explore the political intrigue of the One Piece world",
        cardCount: 1200,
        releaseDate: "2023-12-08",
        imageUrl:
          "https://static.wixstatic.com/media/57a197_e334385962ac4203abe6390f3b6ff4c6~mv2.png/v1/fill/w_280,h_157,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ONE%20PIECE%20LOGO.png",
        isAvailable: true,
      },
      {
        id: "op-03",
        name: "Pillars of Strength",
        description: "The third set introducing powerful new leaders",
        cardCount: 1200,
        releaseDate: "2023-09-22",
        imageUrl:
          "https://static.wixstatic.com/media/57a197_e334385962ac4203abe6390f3b6ff4c6~mv2.png/v1/fill/w_280,h_157,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ONE%20PIECE%20LOGO.png",
        isAvailable: true,
      },
      {
        id: "op-02",
        name: "Paramount War",
        description: "The second set featuring epic battles",
        cardCount: 1200,
        releaseDate: "2023-06-30",
        imageUrl:
          "https://static.wixstatic.com/media/57a197_e334385962ac4203abe6390f3b6ff4c6~mv2.png/v1/fill/w_280,h_157,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ONE%20PIECE%20LOGO.png",
        isAvailable: true,
      },
      {
        id: "op-01",
        name: "Romance Dawn",
        description: "The inaugural set featuring the Straw Hat Pirates",
        cardCount: 1200,
        releaseDate: "2023-03-31",
        imageUrl:
          "https://static.wixstatic.com/media/57a197_e334385962ac4203abe6390f3b6ff4c6~mv2.png/v1/fill/w_280,h_157,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ONE%20PIECE%20LOGO.png",
        isAvailable: true,
      },
      {
        id: "starter-decks",
        name: "Starter Decks",
        description: "Pre-built starter decks for new players",
        cardCount: 50,
        releaseDate: "2023-03-31",
        imageUrl:
          "https://static.wixstatic.com/media/57a197_e334385962ac4203abe6390f3b6ff4c6~mv2.png/v1/fill/w_280,h_157,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ONE%20PIECE%20LOGO.png",
        isAvailable: true,
      },
    ],
  },
  {
    databaseId: "digimon",
    databaseName: "Digimon Card Game",
    groups: [
      {
        id: "bt-16",
        name: "Beginning Observer",
        description: "The latest set featuring new Digimon and mechanics",
        cardCount: 120,
        releaseDate: "2024-02-23",
        imageUrl:
          "https://ihc.cards/cdn/shop/collections/digimon-card-game-logo.webp?v=1707603160",
        isAvailable: true,
      },
      {
        id: "bt-15",
        name: "Exceed Apocalypse",
        description: "The fifteenth set with apocalyptic themes",
        cardCount: 120,
        releaseDate: "2023-12-08",
        imageUrl:
          "https://ihc.cards/cdn/shop/collections/digimon-card-game-logo.webp?v=1707603160",
        isAvailable: true,
      },
      {
        id: "bt-14",
        name: "Blast Ace",
        description: "The fourteenth set featuring powerful new abilities",
        cardCount: 120,
        releaseDate: "2023-09-22",
        imageUrl:
          "https://ihc.cards/cdn/shop/collections/digimon-card-game-logo.webp?v=1707603160",
        isAvailable: true,
      },
      {
        id: "bt-13",
        name: "Versus Royal Knights",
        description: "The thirteenth set featuring the Royal Knights",
        cardCount: 120,
        releaseDate: "2023-06-30",
        imageUrl:
          "https://ihc.cards/cdn/shop/collections/digimon-card-game-logo.webp?v=1707603160",
        isAvailable: true,
      },
      {
        id: "bt-12",
        name: "Across Time",
        description: "The twelfth set exploring time travel themes",
        cardCount: 120,
        releaseDate: "2023-03-31",
        imageUrl:
          "https://ihc.cards/cdn/shop/collections/digimon-card-game-logo.webp?v=1707603160",
        isAvailable: true,
      },
      {
        id: "bt-11",
        name: "Dimensional Phase",
        description: "The eleventh set with dimensional themes",
        cardCount: 120,
        releaseDate: "2022-12-09",
        imageUrl:
          "https://ihc.cards/cdn/shop/collections/digimon-card-game-logo.webp?v=1707603160",
        isAvailable: true,
      },
      {
        id: "bt-10",
        name: "Xros Encounter",
        description: "The tenth set featuring Xros Wars characters",
        cardCount: 120,
        releaseDate: "2022-09-30",
        imageUrl:
          "https://ihc.cards/cdn/shop/collections/digimon-card-game-logo.webp?v=1707603160",
        isAvailable: true,
      },
      {
        id: "bt-09",
        name: "X Record",
        description: "The ninth set with X-Antibody themes",
        cardCount: 120,
        releaseDate: "2022-06-24",
        imageUrl:
          "https://ihc.cards/cdn/shop/collections/digimon-card-game-logo.webp?v=1707603160",
        isAvailable: true,
      },
      {
        id: "bt-08",
        name: "New Hero",
        description: "The eighth set featuring new heroes",
        cardCount: 120,
        releaseDate: "2022-03-25",
        imageUrl:
          "https://ihc.cards/cdn/shop/collections/digimon-card-game-logo.webp?v=1707603160",
        isAvailable: true,
      },
      {
        id: "bt-07",
        name: "Next Adventure",
        description: "The seventh set continuing the adventure",
        cardCount: 120,
        releaseDate: "2021-12-17",
        imageUrl:
          "https://ihc.cards/cdn/shop/collections/digimon-card-game-logo.webp?v=1707603160",
        isAvailable: true,
      },
    ],
  },
];

export function getImportableGroups(databaseName: string): ImportableGroup[] {
  const database = mockImportableGroups.find(
    (db) => db.databaseName.toLowerCase() === databaseName.toLowerCase(),
  );
  return database?.groups || [];
}
