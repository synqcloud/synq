import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@synq/supabase/server";
import {
  UserService,
  IntegrationsService,
  InventoryService,
} from "@synq/supabase/services";

const CARDTRADER_API_BASE = "https://api.cardtrader.com/api/v2";

type InventoryItem = {
  productId: number;
  blueprintId: number;
  quantity: number;
  price_cents: number;
  foil: boolean;
  condition: string | null;
  language: string | null;
  tcg_player_id?: number;
  scryfall_id?: string;
};

type SyncResult = {
  success: boolean;
  message: string;
  stats: {
    total_fetched: number;
    after_dedup: number;
    duplicates_removed: number;
    created: number;
    updated: number;
    skipped: number;
    matched_cards: number;
    duration_ms: number;
  };
  errors?: string[];
};

export async function POST(
  request: NextRequest,
): Promise<NextResponse<SyncResult>> {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    const supabase = await createClient();
    const user = await UserService.getCurrentUser("server");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          stats: {
            total_fetched: 0,
            after_dedup: 0,
            duplicates_removed: 0,
            created: 0,
            updated: 0,
            skipped: 0,
            matched_cards: 0,
            duration_ms: 0,
          },
        },
        { status: 401 },
      );
    }

    console.log(`[CardTrader Sync] Starting sync for user: ${user.id}`);

    // Get CardTrader integration
    const integrations = await IntegrationsService.getIntegrations("server");
    const ct = integrations.find((i) => i.integration_type === "cardtrader");
    const apiToken = (ct?.credentials as { api_token?: string })?.api_token;

    if (!apiToken) {
      return NextResponse.json(
        {
          success: false,
          message: "CardTrader integration not found or missing API token",
          stats: {
            total_fetched: 0,
            after_dedup: 0,
            duplicates_removed: 0,
            created: 0,
            updated: 0,
            skipped: 0,
            matched_cards: 0,
            duration_ms: Date.now() - startTime,
          },
        },
        { status: 400 },
      );
    }

    // Fetch products from CardTrader
    console.log(`[CardTrader Sync] Fetching products from CardTrader...`);
    const productResp = await fetch(
      `${CARDTRADER_API_BASE}/products/export?game_id=1`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!productResp.ok) {
      const errorText = await productResp.text();
      console.error(`[CardTrader Sync] Failed to fetch products:`, errorText);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch inventory from CardTrader",
          stats: {
            total_fetched: 0,
            after_dedup: 0,
            duplicates_removed: 0,
            created: 0,
            updated: 0,
            skipped: 0,
            matched_cards: 0,
            duration_ms: Date.now() - startTime,
          },
          errors: [errorText],
        },
        { status: 500 },
      );
    }

    const products = await productResp.json();
    const totalFetched = products.length;
    console.log(`[CardTrader Sync] Fetched ${totalFetched} products`);

    if (totalFetched === 0) {
      return NextResponse.json({
        success: true,
        message: "No products found in CardTrader inventory",
        stats: {
          total_fetched: 0,
          after_dedup: 0,
          duplicates_removed: 0,
          created: 0,
          updated: 0,
          skipped: 0,
          matched_cards: 0,
          duration_ms: Date.now() - startTime,
        },
      });
    }

    // Get blueprints for all expansions
    const expansionIds = [
      ...new Set(products.map((p: any) => p.expansion.id).filter(Boolean)),
    ];
    console.log(
      `[CardTrader Sync] Fetching blueprints for ${expansionIds.length} expansions...`,
    );

    const blueprintMap: Record<number, any> = {};
    const allBlueprints: any[] = [];

    for (const expansionId of expansionIds) {
      try {
        const bpResp = await fetch(
          `${CARDTRADER_API_BASE}/blueprints/export?expansion_id=${expansionId}`,
          {
            headers: {
              Authorization: `Bearer ${apiToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (bpResp.ok) {
          const blueprints = await bpResp.json();
          blueprints.forEach((bp: any) => {
            blueprintMap[bp.id] = bp;
            allBlueprints.push(bp);
          });
        } else {
          errors.push(
            `Failed to fetch blueprints for expansion ${expansionId}`,
          );
        }
      } catch (err) {
        errors.push(
          `Error fetching blueprints for expansion ${expansionId}: ${err}`,
        );
      }
    }
    console.log(`[CardTrader Sync] Loaded ${allBlueprints.length} blueprints`);

    // Build inventory items
    const inventory: InventoryItem[] = products.map((p: any) => {
      const blueprint =
        blueprintMap[p.blueprint_id] ??
        allBlueprints.find((b) => b.id === p.blueprint_id);
      return {
        productId: p.id,
        blueprintId: p.blueprint_id,
        quantity: p.quantity,
        price_cents: p.price_cents,
        foil: Boolean(p.properties_hash?.mtg_foil),
        condition: p.properties_hash?.condition ?? null,
        language: p.properties_hash?.mtg_language ?? null,
        tcg_player_id: blueprint?.tcg_player_id,
        scryfall_id: blueprint?.scryfall_id,
      };
    });

    // Deduplicate by card + condition + language
    const dedupeKey = (item: InventoryItem) =>
      `${item.blueprintId}|${item.condition}|${item.language}`;

    const beforeDedupeCount = inventory.length;
    const dedupedInventory = Array.from(
      new Map(inventory.map((item) => [dedupeKey(item), item])).values(),
    );
    const removedDupes = beforeDedupeCount - dedupedInventory.length;

    console.log(
      `[CardTrader Sync] Deduplication: ${beforeDedupeCount} → ${dedupedInventory.length} (removed ${removedDupes} duplicates)`,
    );

    // Build ID lists for lookup
    const tcgplayerIds = dedupedInventory
      .map((item) => item.tcg_player_id)
      .filter((id): id is number => typeof id === "number")
      .map((id) => `"${id}"`);
    const scryfallIds = dedupedInventory
      .map((item) => item.scryfall_id)
      .filter((id): id is string => typeof id === "string")
      .map((id) => `"${id}"`);

    console.log(
      `[CardTrader Sync] Looking up ${tcgplayerIds.length} TCGPlayer IDs and ${scryfallIds.length} Scryfall IDs...`,
    );

    // Lookup core cards
    const { data: coreCards, error } = await supabase
      .from("core_cards")
      .select("id, tcgplayer_id, external_id, external_source")
      .or(
        [
          tcgplayerIds.length > 0
            ? `tcgplayer_id.in.(${tcgplayerIds.join(",")})`
            : null,
          scryfallIds.length > 0
            ? `and(external_source.eq.scryfall,external_id.in.(${scryfallIds.join(",")}))`
            : null,
        ]
          .filter(Boolean)
          .join(","),
      );

    if (error) throw error;

    const matchedCards = coreCards?.length ?? 0;
    console.log(`[CardTrader Sync] Found ${matchedCards} matching core cards`);

    const coreCardByTcgId = new Map(
      coreCards?.map((c) => [c.tcgplayer_id, c]) ?? [],
    );
    const coreCardByScryfallId = new Map(
      coreCards
        ?.filter((c) => c.external_source === "scryfall")
        .map((c) => [c.external_id, c]) ?? [],
    );

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Process each inventory item
    for (const item of dedupedInventory) {
      try {
        const coreCard =
          (item.tcg_player_id && coreCardByTcgId.get(item.tcg_player_id)) ||
          (item.scryfall_id && coreCardByScryfallId.get(item.scryfall_id));

        if (!coreCard) {
          console.log(
            `[CardTrader Sync] ⚠️  Skipped: No core card found for blueprint ${item.blueprintId}`,
          );
          skippedCount++;
          continue;
        }

        const existingStock = await InventoryService.fetchStockByCard(
          "server",
          coreCard.id,
        );

        const matchedStock = existingStock.find((s) => {
          return (
            s.condition === item.condition &&
            s.language === item.language &&
            s.is_active
          );
        });

        if (matchedStock) {
          console.log(
            `[CardTrader Sync] ✏️  Updating stock ${matchedStock.stock_id}: ${item.condition} ${item.language} qty=${item.quantity}`,
          );

          await InventoryService.updateStockViaEdge("server", matchedStock.id, {
            change_type: "inventory_adjustment",
            quantity_new: item.quantity,
          });

          await InventoryService.addMarketplaceToStock(
            "server",
            matchedStock.id,
            "cardtrader",
          );

          updatedCount++;
        } else {
          console.log(
            `[CardTrader Sync] ➕ Creating new stock: card=${coreCard.id} ${item.condition} ${item.language} qty=${item.quantity}`,
          );

          const stockId = await InventoryService.addStockEntry(
            "server",
            coreCard.id,
            null,
            {
              quantity: item.quantity,
              condition: item.condition ?? undefined,
              language: item.language ?? undefined,
            },
          );

          await InventoryService.addMarketplaceToStock(
            "server",
            stockId,
            "cardtrader",
          );

          createdCount++;
        }
      } catch (err) {
        const errorMsg = `Failed to process item ${item.blueprintId}: ${err}`;
        console.error(`[CardTrader Sync] ${errorMsg}`);
        errors.push(errorMsg);
        skippedCount++;
      }
    }

    const duration = Date.now() - startTime;
    const message = `Successfully synced ${createdCount + updatedCount} items (${createdCount} new, ${updatedCount} updated)${skippedCount > 0 ? `, ${skippedCount} skipped` : ""}`;

    console.log(
      `[CardTrader Sync] ✅ Complete: ${createdCount} created, ${updatedCount} updated, ${skippedCount} skipped (${duration}ms)`,
    );

    return NextResponse.json({
      success: true,
      message,
      stats: {
        total_fetched: totalFetched,
        after_dedup: dedupedInventory.length,
        duplicates_removed: removedDupes,
        created: createdCount,
        updated: updatedCount,
        skipped: skippedCount,
        matched_cards: matchedCards,
        duration_ms: duration,
      },
      ...(errors.length > 0 && { errors }),
    });
  } catch (err) {
    console.error("[CardTrader Sync] ❌ Error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during sync",
        stats: {
          total_fetched: 0,
          after_dedup: 0,
          duplicates_removed: 0,
          created: 0,
          updated: 0,
          skipped: 0,
          matched_cards: 0,
          duration_ms: Date.now() - startTime,
        },
        errors: [err instanceof Error ? err.message : String(err)],
      },
      { status: 500 },
    );
  }
}
