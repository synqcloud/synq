import { NextRequest, NextResponse } from "next/server";
import { UserService, IntegrationsService } from "@synq/supabase/services";
import { createClient } from "@synq/supabase/server";

const CARDTRADER_API_BASE = "https://api.cardtrader.com/api/v2";

interface CardTraderProduct {
  id: number;
  blueprint_id: number;
  quantity: number;
  price: number;
  name_en?: string;
  properties?: {
    mtg_foil?: boolean;
    condition?: string;
    mtg_language?: string;
    [key: string]: any;
  };
  expansion: {id: string};
  price_cents?: number;
  properties_hash?: {
    mtg_foil?: boolean;
    condition?: string;
    [key: string]: any;
  };
  game_id?: number;
}

interface Blueprint {
  id: number;
  tcg_player_id: number | null;
  scryfall_id: string | null;
}

// Add type for CardTrader credentials
interface CardTraderCredentials {
  api_token?: string;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    console.log("Starting CardTrader inventory sync...");

    // 1. Authenticate user (server-side)
    const user = await UserService.getCurrentUser("server");
    if (!user) {
      console.log("No user authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("Authenticated user:", user.id);

    // 2. Get CardTrader integration info
    const integrations = await IntegrationsService.getIntegrations("server");
    const ct = integrations.find((i) => i.integration_type === "cardtrader");
    if (!ct) {
      console.log("CardTrader integration not found for user");
      return NextResponse.json(
        { error: "CardTrader not connected for this user" },
        { status: 400 },
      );
    }

    // Type assertion for credentials
    const credentials = ct.credentials as CardTraderCredentials | null;
    const apiToken = credentials?.api_token;
    if (!apiToken) {
      console.log("No API token for CardTrader integration");
      return NextResponse.json(
        { error: "No API token stored for CardTrader integration" },
        { status: 400 },
      );
    }
    console.log("Using CardTrader API token");

    // 3. Fetch products from CardTrader
    const url = new URL(`${CARDTRADER_API_BASE}/products/export`);
    url.searchParams.set("game_id", "1");

    console.log("Fetching products from:", url.toString());
    const resp = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.log("Failed to fetch products:", text);
      return NextResponse.json(
        {
          error: "Failed to fetch CardTrader inventory",
          detail: text,
        },
        { status: resp.status },
      );
    }

    const products: CardTraderProduct[] = await resp.json();
    console.log(`Fetched ${products.length} products`);

    // 4. Get unique expansion IDs from products (non-null)
    const expansionIds = Array.from(
      new Set(products.map((p) => p.expansion.id).filter(Boolean)),
    );
    console.log(`Unique expansion IDs found: [${expansionIds.join(", ")}]`);

    // 5. Fetch blueprints for each expansion, store per expansion
    const blueprintMap: Record<number, Blueprint> = {};
    const allBlueprints: Blueprint[] = [];

    for (const expansionId of expansionIds) {
      const blueprintUrl = new URL(`${CARDTRADER_API_BASE}/blueprints/export`);
      blueprintUrl.searchParams.set("expansion_id", expansionId.toString());

      console.log(
        `Fetching blueprints for expansion ${expansionId} from: ${blueprintUrl.toString()}`,
      );

      const blueprintResp = await fetch(blueprintUrl.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      });

      if (blueprintResp.ok) {
        const blueprints: Blueprint[] = await blueprintResp.json();
        console.log(
          `Fetched ${blueprints.length} blueprints for expansion ${expansionId}`,
        );

        blueprints.forEach((bp) => {
          blueprintMap[bp.id] = bp;
          allBlueprints.push(bp);
        });
      } else {
        const text = await blueprintResp.text();
        console.error(
          `Failed to fetch blueprints for expansion ${expansionId}:`,
          text,
        );
      }
    }

    console.log(`Total blueprints collected: ${allBlueprints.length}`);

    // 6. For products missing expansion_id, fallback search blueprints globally
    const findBlueprint = (
      product: CardTraderProduct,
    ): Blueprint | undefined => {
      if (product.expansion.id && blueprintMap[product.blueprint_id]) {
        return blueprintMap[product.blueprint_id];
      }
      // fallback: search allBlueprints for blueprint_id match
      const bp = allBlueprints.find((bp) => bp.id === product.blueprint_id);
      if (!bp) {
        console.warn(
          `Blueprint not found for product blueprint_id ${product.blueprint_id}`,
        );
      }
      return bp;
    };

    // 7. Map products with blueprint info added
    const inventory = products.map((p) => {
      const blueprint = findBlueprint(p);
      return {
        collector_number: p.properties_hash?.collector_number ?? null,
        productId: p.id,
        blueprintId: p.blueprint_id,
        expansion_id: p.expansion.id?? null,
        quantity: p.quantity,
        price_cents: p.price_cents,
        foil: Boolean(p.properties_hash?.mtg_foil),
        condition: p.properties_hash?.condition ?? null,
        game_id: p.game_id ?? null,
        name_en: p.name_en ?? null,
        tcg_player_id: blueprint?.tcg_player_id ?? null,
        scryfall_id: blueprint?.scryfall_id ?? null,
      };
    });

    // Step 1: Prepare your IDs with proper handling
    // Convert tcg_player_id (numbers) to strings for the query
    const tcgplayerIds = inventory
      .map((item) => item.tcg_player_id)
      .filter((id): id is number => id !== null && typeof id === 'number')
      .map((id) => `"${id}"`);

    const scryfallIds = inventory
      .map((item) => item.scryfall_id)
      .filter((id): id is string => id !== null && typeof id === 'string')
      .map((id) => `"${id}"`);

    // Step 2: Run the query using `or` filter in Supabase
    const { data: coreCards, error } = await supabase
      .from("core_cards")
      .select("id, tcgplayer_id, external_id, external_source")
      .or(
        [
          `tcgplayer_id.in.(${tcgplayerIds.join(",")})`,
          `and(external_source.eq.scryfall,external_id.in.(${scryfallIds.join(",")}))`,
        ].join(","),
      );

    if (error) {
      console.error("Error fetching core_cards:", error);
      throw error;
    }

    // Step 3: Create lookup maps for matching
    const coreCardByTcgId = new Map(
      coreCards.map((card) => [card.tcgplayer_id, card]),
    );
    const coreCardByScryfallId = new Map(
      coreCards
        .filter((card) => card.external_source === "scryfall")
        .map((card) => [card.external_id, card]),
    );

    // Step 4: Enhance inventory with matched coreCardId
    const inventoryWithMatches = inventory.map((item) => {
      let matchedCard = null;

      if (item.tcg_player_id && coreCardByTcgId.has(item.tcg_player_id)) {
        matchedCard = coreCardByTcgId.get(item.tcg_player_id);
      } else if (
        item.scryfall_id &&
        coreCardByScryfallId.has(item.scryfall_id)
      ) {
        matchedCard = coreCardByScryfallId.get(item.scryfall_id);
      }

      return {
        ...item,
        coreCardId: matchedCard ? matchedCard.id : null,
      };
    });

    console.log("Final mapped inventory:", inventoryWithMatches);

    return NextResponse.json({ inventory: inventoryWithMatches });
  } catch (err) {
    console.error("Error in CardTrader inventory route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}