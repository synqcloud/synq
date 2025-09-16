// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CardPriceData {
  tcgplayer_price?: number;
  cardmarket_price?: number;
}

interface CoreCard {
  id: string;
  external_source: string;
  external_id: string;
  price_key: string;
  tcgplayer_id?: string;
  name: string;
}

interface ExistingPrice {
  tcgplayer_price?: number;
  cardmarket_price?: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Starting card price update function");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { core_card_id } = await req.json();
    console.log("Processing card ID:", core_card_id);

    if (!core_card_id) {
      return new Response(
        JSON.stringify({ error: "core_card_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get card information
    console.log("Fetching card information from database");
    const { data: card, error: cardError } = await supabaseClient
      .from("core_cards")
      .select("id, external_source, external_id, price_key, tcgplayer_id, name")
      .eq("id", core_card_id)
      .single();

    if (cardError || !card) {
      console.error("Card not found:", cardError);
      return new Response(JSON.stringify({ error: "Card not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(
      "Card found:",
      card.name,
      "- External source:",
      card.external_source,
      "- Price key:",
      card.price_key,
    );

    // Get existing price data
    const { data: existingPrice } = await supabaseClient
      .from("core_card_prices")
      .select("tcgplayer_price, cardmarket_price")
      .eq("core_card_id", core_card_id)
      .single();

    console.log("Existing price:", existingPrice);

    // Fetch new price data based on external source
    console.log("Fetching new price data");
    const newPriceData = await fetchPriceData(card);

    if (!newPriceData) {
      return new Response(
        JSON.stringify({ error: "Unable to fetch price data" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("New price data:", newPriceData);

    // Calculate price changes for notifications
    const priceChanges = calculatePriceChanges(existingPrice, newPriceData);
    console.log("Price changes:", priceChanges);

    // Upsert price data
    const { error: upsertError } = await supabaseClient
      .from("core_card_prices")
      .upsert(
        {
          core_card_id: core_card_id,
          tcgplayer_price: newPriceData.tcgplayer_price,
          cardmarket_price: newPriceData.cardmarket_price,
        },
        {
          onConflict: "core_card_id",
        },
      );

    if (upsertError) {
      console.error("Error upserting price:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to update price data" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create notifications for users with price alerts if there are significant changes
    if (
      existingPrice &&
      (priceChanges.tcgplayer_change || priceChanges.cardmarket_change)
    ) {
      await createPriceChangeNotifications(
        supabaseClient,
        core_card_id,
        card.name,
        priceChanges,
        existingPrice,
        newPriceData,
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        price_data: newPriceData,
        price_changes: priceChanges,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in card price update function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function fetchPriceData(card: CoreCard): Promise<CardPriceData | null> {
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

async function fetchScryfallPrice(
  cardId: string,
  priceKey: string,
): Promise<CardPriceData> {
  console.log(
    `Fetching Scryfall price - Card ID: ${cardId}, Price Key: ${priceKey}`,
  );

  const response = await fetch(`https://api.scryfall.com/cards/${cardId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch card data: ${response.status}`);
  }

  const cardData = await response.json();
  console.log("Scryfall API response prices:", cardData.prices);

  // Extract the specific price using the price_key
  const price = cardData.prices?.[priceKey];
  console.log(`Price for key '${priceKey}':`, price);

  // Parse the price (Scryfall returns prices as strings)
  const parsedPrice = price ? parseFloat(price) : null;
  console.log("Parsed price:", parsedPrice);

  // Map the price to the correct field based on the price_key
  const result: CardPriceData = {
    tcgplayer_price: null,
    cardmarket_price: null,
  };

  // Determine which price field to populate based on price_key
  // Scryfall price keys: usd, usd_foil, usd_etched, eur, eur_foil, eur_etched, tix
  if (priceKey.startsWith("usd")) {
    // USD prices (usd, usd_foil, usd_etched) go to tcgplayer_price
    result.tcgplayer_price = parsedPrice;
  } else if (priceKey.startsWith("eur")) {
    // EUR prices (eur, eur_foil, eur_etched) go to cardmarket_price
    result.cardmarket_price = parsedPrice;
  } else if (priceKey === "tix") {
    // MTGO tickets - could map to either, but typically USD-based
    result.tcgplayer_price = parsedPrice;
  } else {
    // Fallback for any unknown price keys
    console.warn(`Unknown price key: ${priceKey}, mapping to tcgplayer_price`);
    result.tcgplayer_price = parsedPrice;
  }

  console.log("Final result:", result);
  return result;
}

async function fetchTCGPlayerPrice(productId: string): Promise<CardPriceData> {
  // Note: TCGPlayer API requires authentication and specific endpoints
  // This is a placeholder - you'll need to implement based on their API docs
  const apiKey = Deno.env.get("TCGPLAYER_API_KEY");

  if (!apiKey) {
    throw new Error("TCGPlayer API key not configured");
  }

  // Placeholder implementation
  const response = await fetch(
    `https://api.tcgplayer.com/catalog/products/${productId}/pricing`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  const priceData = await response.json();

  return {
    tcgplayer_price: priceData.results?.[0]?.marketPrice || null,
    cardmarket_price: null,
  };
}

async function fetchCardMarketPrice(productId: string): Promise<CardPriceData> {
  // Note: CardMarket API requires OAuth authentication
  // This is a placeholder - you'll need to implement based on their API docs
  const apiKey = Deno.env.get("CARDMARKET_API_KEY");

  if (!apiKey) {
    throw new Error("CardMarket API key not configured");
  }

  // Placeholder implementation
  const response = await fetch(
    `https://api.cardmarket.com/ws/v2.0/products/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  const priceData = await response.json();

  return {
    tcgplayer_price: null,
    cardmarket_price: priceData.product?.priceGuide?.AVG || null,
  };
}

function calculatePriceChanges(
  existingPrice: ExistingPrice | null,
  newPrice: CardPriceData,
) {
  const changes = {
    tcgplayer_change: null as number | null,
    cardmarket_change: null as number | null,
  };

  if (existingPrice?.tcgplayer_price && newPrice.tcgplayer_price) {
    const oldPrice = existingPrice.tcgplayer_price;
    const newPriceValue = newPrice.tcgplayer_price;
    changes.tcgplayer_change = ((newPriceValue - oldPrice) / oldPrice) * 100;
  }

  if (existingPrice?.cardmarket_price && newPrice.cardmarket_price) {
    const oldPrice = existingPrice.cardmarket_price;
    const newPriceValue = newPrice.cardmarket_price;
    changes.cardmarket_change = ((newPriceValue - oldPrice) / oldPrice) * 100;
  }

  return changes;
}

async function createPriceChangeNotifications(
  supabaseClient: any,
  coreCardId: string,
  cardName: string,
  priceChanges: {
    tcgplayer_change: number | null;
    cardmarket_change: number | null;
  },
  existingPrice: ExistingPrice | null,
  newPrice: CardPriceData,
) {
  // Get users who have alerts for this card
  const { data: alertUsers, error } = await supabaseClient
    .from("user_card_price_alerts")
    .select("user_id")
    .eq("core_card_id", coreCardId);

  if (error || !alertUsers?.length) {
    return;
  }

  const ALERT_THRESHOLD = 5.0; // 5% change threshold for notifications
  const notifications = [];

  for (const alertUser of alertUsers) {
    const changes = [];
    const priceChangeDetails: any = {};

    // Check TCGPlayer price changes
    if (
      priceChanges.tcgplayer_change &&
      Math.abs(priceChanges.tcgplayer_change) >= ALERT_THRESHOLD
    ) {
      const direction =
        priceChanges.tcgplayer_change > 0 ? "increased" : "decreased";
      const changePercent = Math.abs(priceChanges.tcgplayer_change);
      changes.push(`TCGPlayer ${direction} ${changePercent.toFixed(1)}%`);

      priceChangeDetails.tcgplayer = {
        old_price: existingPrice?.tcgplayer_price,
        new_price: newPrice.tcgplayer_price,
        change_percent: priceChanges.tcgplayer_change,
        direction: direction,
      };
    }

    // Check CardMarket price changes
    if (
      priceChanges.cardmarket_change &&
      Math.abs(priceChanges.cardmarket_change) >= ALERT_THRESHOLD
    ) {
      const direction =
        priceChanges.cardmarket_change > 0 ? "increased" : "decreased";
      const changePercent = Math.abs(priceChanges.cardmarket_change);
      changes.push(`CardMarket ${direction} ${changePercent.toFixed(1)}%`);

      priceChangeDetails.cardmarket = {
        old_price: existingPrice?.cardmarket_price,
        new_price: newPrice.cardmarket_price,
        change_percent: priceChanges.cardmarket_change,
        direction: direction,
      };
    }

    if (changes.length > 0) {
      const message = `Price update for ${cardName}: ${changes.join(", ")}`;

      notifications.push({
        user_id: alertUser.user_id,
        core_card_id: coreCardId,
        notification_type: "price_alert",
        message: message,
        metadata: {
          card_name: cardName,
          price_changes: priceChangeDetails,
          alert_threshold: ALERT_THRESHOLD,
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
