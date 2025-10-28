import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@synq/supabase/server";
import { IntegrationsService } from "@synq/supabase/services";

// Define the expected credential structure
interface ManapoolCredentials {
  email: string;
  access_token: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Parse request body
    const body = await request.json();
    const {
      stockId,
      tcgplayerId,
      quantity = 1,
      price,
      condition = "NM",
      language = "EN",
      foil = false,
    } = body;

    if (!stockId) {
      return NextResponse.json(
        { error: "stockId is required" },
        { status: 400 },
      );
    }

    if (!tcgplayerId) {
      return NextResponse.json(
        { error: "tcgplayerId is required" },
        { status: 400 },
      );
    }

    if (!price && price !== 0) {
      return NextResponse.json({ error: "Price is required" }, { status: 400 });
    }

    // 3️⃣ Get ManaPool integration for current user
    const integration = await IntegrationsService.getIntegration(
      "manapool",
      "server",
    );

    if (!integration || !integration.credentials) {
      return NextResponse.json(
        { error: "ManaPool integration not found" },
        { status: 400 },
      );
    }

    // Type-cast credentials through unknown first
    const credentials =
      integration.credentials as unknown as ManapoolCredentials;
    const { email, access_token } = credentials;

    if (!email || !access_token) {
      return NextResponse.json(
        { error: "ManaPool credentials are missing" },
        { status: 400 },
      );
    }

    // 4️⃣ Build payload for ManaPool
    const payload = [
      {
        tcgplayer_id: Number(tcgplayerId),
        quantity,
        condition_id: condition, // NM, LP, MP, etc.
        language_id: language, // EN, JA, FR, etc.
        finish_id: foil ? "FO" : "NF", // foil/non-foil
        price_cents: Math.round(price * 100),
      },
    ];

    // 5️⃣ POST to ManaPool API
    const response = await fetch(
      "https://manapool.com/api/v1/seller/inventory/tcgplayer_id",
      {
        method: "POST",
        headers: {
          "X-ManaPool-Email": email,
          "X-ManaPool-Access-Token": access_token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to list card: ${errorText}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const externalId = data[0]?.id || null; // ManaPool returns array of created listings

    // 6️⃣ Save listing in user_stock_listings
    const { error: dbError } = await supabase
      .from("user_stock_listings")
      .upsert(
        {
          stock_id: stockId,
          marketplace_id: integration.id,
          external_id: externalId,
          listed_price: price,
        },
        { onConflict: "stock_id,marketplace_id" },
      );

    if (dbError) {
      console.error("Failed to save listing in DB:", dbError);
    }

    // 7️⃣ Return success
    return NextResponse.json({
      success: true,
      message: "Card listed successfully",
      data: {
        externalId,
        price,
      },
    });
  } catch (error) {
    console.error("List card error:", error);
    return NextResponse.json({ error: "Failed to list card" }, { status: 500 });
  }
}
