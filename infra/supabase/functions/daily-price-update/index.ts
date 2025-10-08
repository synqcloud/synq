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

        // Fetch card name
        const { data: cardData, error: cardError } = await supabase
          .from("core_cards")
          .select("name")
          .eq("id", item.core_card_id)
          .single();

        if (cardError) {
          console.error(
            `Error fetching card data for ${item.core_card_id}:`,
            cardError,
          );
          throw cardError;
        }

        const cardName = cardData?.name || "Unknown Card";

        // Fetch existing prices
        const { data: existingPrice, error: priceError } = await supabase
          .from("core_card_prices")
          .select(
            "tcgplayer_price, cardmarket_price, previous_tcgplayer_price, previous_cardmarket_price",
          )
          .eq("core_card_id", item.core_card_id)
          .single();

        if (priceError) {
          console.error(
            `Error fetching prices for ${item.core_card_id}:`,
            priceError,
          );
          throw priceError;
        }

        const priceChanges = calculatePriceChanges(
          {
            tcgplayer_price: existingPrice?.previous_tcgplayer_price,
            cardmarket_price: existingPrice?.previous_cardmarket_price,
          },
          {
            tcgplayer_price: existingPrice?.tcgplayer_price,
            cardmarket_price: existingPrice?.cardmarket_price,
          },
        );

        if (priceChanges.tcgplayer_change || priceChanges.cardmarket_change) {
          await createPriceChangeNotifications(
            supabase,
            item.core_card_id,
            cardName,
            priceChanges,
            existingPrice,
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
          `Processed card ${item.core_card_id} (${cardName}) in ${itemEnd - itemStart} ms`,
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
    const oldTCG = existingPrice?.previous_tcgplayer_price ?? null;
    const newTCG = existingPrice?.tcgplayer_price ?? null;
    if (oldTCG !== newTCG) {
      const oldPriceText =
        oldTCG !== null ? `${oldTCG.toFixed(2)}` : "(no listing)";
      const newPriceText =
        newTCG !== null ? `${newTCG.toFixed(2)}` : "(no listing)";

      const direction =
        oldTCG != null && newTCG != null
          ? newTCG > oldTCG
            ? "increased"
            : "decreased"
          : "changed";

      const changePercent =
        oldTCG != null && newTCG != null && oldTCG !== 0
          ? ((newTCG - oldTCG) / oldTCG) * 100
          : null;

      const changeText =
        changePercent !== null
          ? ` (${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}%)`
          : "";

      changesMessages.push(
        `TCGPlayer: ${oldPriceText} → ${newPriceText}${changeText}`,
      );
      priceChangeDetails.tcgplayer = {
        old_price: oldTCG,
        new_price: newTCG,
        change_percent: changePercent,
        direction,
      };
    }

    // CardMarket
    const oldCM = existingPrice?.previous_cardmarket_price ?? null;
    const newCM = existingPrice?.cardmarket_price ?? null;
    if (oldCM !== newCM) {
      const oldPriceText =
        oldCM !== null ? `€${oldCM.toFixed(2)}` : "(no listing)";
      const newPriceText =
        newCM !== null ? `€${newCM.toFixed(2)}` : "(no listing)";

      const direction =
        oldCM != null && newCM != null
          ? newCM > oldCM
            ? "increased"
            : "decreased"
          : "changed";

      const changePercent =
        oldCM != null && newCM != null && oldCM !== 0
          ? ((newCM - oldCM) / oldCM) * 100
          : null;

      const changeText =
        changePercent !== null
          ? ` (${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}%)`
          : "";

      changesMessages.push(
        `CardMarket: ${oldPriceText} → ${newPriceText}${changeText}`,
      );
      priceChangeDetails.cardmarket = {
        old_price: oldCM,
        new_price: newCM,
        change_percent: changePercent,
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
