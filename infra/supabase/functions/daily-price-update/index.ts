// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BATCH_SIZE = 10; // Adjust according to your needs

serve(async (req) => {
  const startTime = Date.now();
  const invocationTime = new Date().toISOString();
  console.log(`[${invocationTime}] Invoking batch card price update`);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Get the current function URL from the request
  const url = new URL(req.url);
  // Extract function name from pathname and construct proper Supabase function URL
  const functionName = url.pathname.split("/").pop() || "daily-price-update";
  const functionUrl = `https://${url.host}/functions/v1/${functionName}`;
  console.log(`Function URL constructed: ${functionUrl}`);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    const today = new Date().toISOString().split("T")[0];

    // Fetch next batch of pending items
    const { data: queueItems, error: queueError } = await supabase
      .from("daily_processing_queue")
      .select("id, core_card_id")
      .eq("created_date", today)
      .eq("status", "pending")
      .limit(BATCH_SIZE);

    if (queueError) throw queueError;

    if (!queueItems || queueItems.length === 0) {
      const endTime = Date.now();
      console.log(
        `[${invocationTime}] No pending items. Batch finished in ${endTime - startTime} ms`,
      );
      return new Response(
        JSON.stringify({
          success: true,
          processed: 0,
          execution_ms: endTime - startTime,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      `[${invocationTime}] Processing batch of ${queueItems.length} cards`,
    );

    for (const item of queueItems) {
      const itemStart = Date.now();
      try {
        // Mark as processing
        await supabase
          .from("daily_processing_queue")
          .update({ status: "processing" })
          .eq("id", item.id);

        const { data: card } = await supabase
          .from("core_cards")
          .select(
            "id, external_source, external_id, price_key, tcgplayer_id, name",
          )
          .eq("id", item.core_card_id)
          .single();

        if (!card) {
          console.warn(`Card not found for id ${item.core_card_id}`);
          await supabase
            .from("daily_processing_queue")
            .update({ status: "failed" })
            .eq("id", item.id);
          continue;
        }

        const { data: existingPrice } = await supabase
          .from("core_card_prices")
          .select("tcgplayer_price, cardmarket_price")
          .eq("core_card_id", item.core_card_id)
          .single();

        const newPriceData = await fetchPriceData(card);
        if (!newPriceData) {
          console.warn(`No price data for ${card.name}`);
          await supabase
            .from("daily_processing_queue")
            .update({ status: "failed" })
            .eq("id", item.id);
          continue;
        }

        const priceChanges = calculatePriceChanges(existingPrice, newPriceData);

        await supabase.from("core_card_prices").upsert(
          {
            core_card_id: item.core_card_id,
            tcgplayer_price: newPriceData.tcgplayer_price,
            cardmarket_price: newPriceData.cardmarket_price,
          },
          { onConflict: "core_card_id" },
        );

        if (
          existingPrice &&
          (priceChanges.tcgplayer_change || priceChanges.cardmarket_change)
        ) {
          await createPriceChangeNotifications(
            supabase,
            item.core_card_id,
            card.name,
            priceChanges,
            existingPrice,
            newPriceData,
          );
        }

        await supabase
          .from("daily_processing_queue")
          .update({
            status: "completed",
            processed_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        const itemEnd = Date.now();
        console.log(
          `Processed card ${item.core_card_id} in ${itemEnd - itemStart} ms`,
        );
      } catch (err) {
        console.error(`Error processing card ${item.core_card_id}:`, err);
        await supabase
          .from("daily_processing_queue")
          .update({
            status: "failed",
            attempts: supabase.sql`attempts + 1`,
          })
          .eq("id", item.id);
      }
    }

    // Check remaining pending items BEFORE responding
    const { count: remaining } = await supabase
      .from("daily_processing_queue")
      .select("*", { count: "exact", head: true })
      .eq("created_date", today)
      .eq("status", "pending");

    const endTime = Date.now();
    console.log(`Batch finished. Total execution: ${endTime - startTime} ms`);

    // Self-invoke AFTER sending response to avoid timeout issues
    if (remaining && remaining > 0) {
      console.log(
        `Still ${remaining} items left. Scheduling next invocation...`,
      );

      // Use setTimeout to invoke after response is sent
      setTimeout(async () => {
        try {
          console.log(`Invoking next batch at: ${functionUrl}`);
          const response = await fetch(functionUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              "Content-Type": "application/json",
              "User-Agent": "Supabase-Edge-Function/1.0",
            },
            body: JSON.stringify({ auto_invoked: true, batch_continue: true }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(
              `Self-invocation failed: ${response.status} - ${errorText}`,
            );
          } else {
            const responseData = await response.json();
            console.log("Successfully invoked next batch:", responseData);
          }
        } catch (err) {
          console.error("Error auto-invoking self:", err);
        }
      }, 100); // Small delay to ensure response is sent first
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: queueItems.length,
        remaining: remaining || 0,
        execution_ms: endTime - startTime,
        will_continue: remaining > 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const endTime = Date.now();
    console.error(
      `Batch processing error after ${endTime - startTime} ms:`,
      error,
    );
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// Helper function to convert USD price key to EUR equivalent
function convertUsdToEurPriceKey(usdPriceKey) {
  const conversionMap = {
    usd: "eur",
    usd_foil: "eur_foil",
    usd_etched: "eur_etched",
  };
  return conversionMap[usdPriceKey] || "eur"; // fallback to 'eur' if no match
}

async function fetchPriceData(card) {
  try {
    console.log(`Fetching price data for ${card.external_source}`);
    switch (card.external_source) {
      case "scryfall":
        return await fetchScryfallPrice(card.external_id, card.price_key);
      case "tcgplayer":
        return await fetchTCGPlayerPrice(card.tcgplayer_id || card.external_id);
      case "cardmarket":
        return await fetchCardMarketPrice(card.external_id);
      default:
        console.error(`Unsupported external source: ${card.external_source}`);
        return null;
    }
  } catch (error) {
    console.error("Error fetching price data:", error);
    return null;
  }
}

async function fetchScryfallPrice(cardId, priceKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s

  try {
    const response = await fetch(`https://api.scryfall.com/cards/${cardId}`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CardPriceTracker/1.0",
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Scryfall API error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch card data: ${response.statusText}`);
    }

    const cardData = await response.json();

    if (!cardData.prices) {
      return { tcgplayer_price: null, cardmarket_price: null };
    }

    const result = { tcgplayer_price: null, cardmarket_price: null };

    // Get USD price for TCGPlayer
    let usdPrice = null;
    const usdPriceValue = cardData.prices[priceKey];
    if (usdPriceValue !== null && usdPriceValue !== undefined) {
      usdPrice =
        typeof usdPriceValue === "string"
          ? parseFloat(usdPriceValue)
          : typeof usdPriceValue === "number"
            ? usdPriceValue
            : null;
      if (usdPrice !== null && isNaN(usdPrice)) usdPrice = null;
    }

    // Get EUR price for CardMarket (convert USD price key to EUR equivalent)
    const eurPriceKey = convertUsdToEurPriceKey(priceKey);
    let eurPrice = null;
    const eurPriceValue = cardData.prices[eurPriceKey];
    if (eurPriceValue !== null && eurPriceValue !== undefined) {
      eurPrice =
        typeof eurPriceValue === "string"
          ? parseFloat(eurPriceValue)
          : typeof eurPriceValue === "number"
            ? eurPriceValue
            : null;
      if (eurPrice !== null && isNaN(eurPrice)) eurPrice = null;
    }

    // Assign prices based on the original price key type
    if (["usd", "usd_foil", "usd_etched"].includes(priceKey)) {
      result.tcgplayer_price = usdPrice;
      result.cardmarket_price = eurPrice;
    } else if (priceKey === "tix") {
      result.tcgplayer_price = usdPrice;
      // No EUR equivalent for tix, keep cardmarket_price as null
    } else {
      // fallback - assume it's a USD price key
      result.tcgplayer_price = usdPrice;
      result.cardmarket_price = eurPrice;
    }

    console.log(
      `Price data for card ${cardId}: TCG=${result.tcgplayer_price}, CM=${result.cardmarket_price} (keys: ${priceKey}/${eurPriceKey})`,
    );
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Error fetching Scryfall price:", error);
    return { tcgplayer_price: null, cardmarket_price: null };
  }
}

async function fetchTCGPlayerPrice(productId) {
  throw new Error("TCGPlayer API not implemented yet");
}

async function fetchCardMarketPrice(productId) {
  throw new Error("CardMarket API not implemented yet");
}

function calculatePriceChanges(existingPrice, newPrice) {
  const changes = {
    tcgplayer_change: null,
    cardmarket_change: null,
  };

  // TCGPlayer
  if (
    existingPrice?.tcgplayer_price != null ||
    newPrice.tcgplayer_price != null
  ) {
    const oldPrice = existingPrice?.tcgplayer_price ?? null;
    const newPriceValue = newPrice.tcgplayer_price ?? null;

    if (oldPrice != null && newPriceValue != null && oldPrice !== 0) {
      changes.tcgplayer_change = ((newPriceValue - oldPrice) / oldPrice) * 100;
    } else {
      changes.tcgplayer_change = oldPrice !== newPriceValue ? 100 : 0;
    }
  }

  // CardMarket
  if (
    existingPrice?.cardmarket_price != null ||
    newPrice.cardmarket_price != null
  ) {
    const oldPrice = existingPrice?.cardmarket_price ?? null;
    const newPriceValue = newPrice.cardmarket_price ?? null;

    if (oldPrice != null && newPriceValue != null && oldPrice !== 0) {
      changes.cardmarket_change = ((newPriceValue - oldPrice) / oldPrice) * 100;
    } else {
      changes.cardmarket_change = oldPrice !== newPriceValue ? 100 : 0;
    }
  }

  return changes;
}

async function createPriceChangeNotifications(
  supabaseClient,
  coreCardId,
  cardName,
  priceChanges,
  existingPrice,
  newPrice,
) {
  const { data: alertUsers, error } = await supabaseClient
    .from("user_card_price_alerts")
    .select("user_id")
    .eq("core_card_id", coreCardId);

  if (error || !alertUsers?.length) return;

  const notifications = [];

  for (const alertUser of alertUsers) {
    const changesMessages = [];
    const priceChangeDetails = {};

    // TCGPlayer
    const oldTCG = existingPrice?.tcgplayer_price ?? null;
    const newTCG = newPrice.tcgplayer_price ?? null;
    if (oldTCG !== newTCG) {
      const direction =
        oldTCG != null && newTCG != null
          ? newTCG > oldTCG
            ? "increased"
            : "decreased"
          : "changed";
      changesMessages.push(
        `TCGPlayer price ${newTCG === null ? "unavailable" : direction}`,
      );
      priceChangeDetails.tcgplayer = {
        old_price: oldTCG,
        new_price: newTCG,
        change_percent:
          oldTCG != null && newTCG != null && oldTCG !== 0
            ? ((newTCG - oldTCG) / oldTCG) * 100
            : null,
        direction,
      };
    }

    // CardMarket
    const oldCM = existingPrice?.cardmarket_price ?? null;
    const newCM = newPrice.cardmarket_price ?? null;
    if (oldCM !== newCM) {
      const direction =
        oldCM != null && newCM != null
          ? newCM > oldCM
            ? "increased"
            : "decreased"
          : "changed";
      changesMessages.push(
        `CardMarket price ${newCM === null ? "unavailable" : direction}`,
      );
      priceChangeDetails.cardmarket = {
        old_price: oldCM,
        new_price: newCM,
        change_percent:
          oldCM != null && newCM != null && oldCM !== 0
            ? ((newCM - oldCM) / oldCM) * 100
            : null,
        direction,
      };
    }

    if (changesMessages.length > 0) {
      const message = `Price update for ${cardName}: ${changesMessages.join(", ")}`;
      notifications.push({
        user_id: alertUser.user_id,
        core_card_id: coreCardId,
        notification_type: "price_alert",
        message: message,
        metadata: {
          card_name: cardName,
          price_changes: priceChangeDetails,
          timestamp: new Date().toISOString(),
        },
        is_read: false,
      });
    }
  }

  if (notifications.length > 0) {
    const { error: notificationError } = await supabaseClient
      .from("notifications")
      .insert(notifications);

    if (notificationError) {
      console.error("Error creating notifications:", notificationError);
    } else {
      console.log(
        `Created ${notifications.length} price alert notifications for card ${cardName}`,
      );
    }
  }
}
