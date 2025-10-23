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
    const { stockId } = body;

    if (!stockId) {
      return NextResponse.json(
        { error: "stockId is required" },
        { status: 400 },
      );
    }

    // 3️⃣ Get ManaPool integration
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
        { error: "ManaPool credentials missing" },
        { status: 400 },
      );
    }

    // 4️⃣ Get the listing from DB
    const { data: listing, error: dbError } = await supabase
      .from("user_stock_listings")
      .select("*")
      .eq("stock_id", stockId)
      .eq("marketplace_id", integration.id)
      .single();

    if (dbError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (!listing.external_id) {
      return NextResponse.json(
        { error: "Listing has no external_id" },
        { status: 400 },
      );
    }

    // 5️⃣ Delete listing on ManaPool
    const response = await fetch(
      `https://manapool.com/api/v1/seller/inventory/tcgplayer_id/${listing.external_id}`,
      {
        method: "DELETE",
        headers: {
          "X-ManaPool-Email": email,
          "X-ManaPool-Access-Token": access_token,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to delete listing: ${errorText}` },
        { status: response.status },
      );
    }

    // 6️⃣ Remove external_id from DB (optional: delete row instead)
    const { error: updateError } = await supabase
      .from("user_stock_listings")
      .update({ external_id: null })
      .eq("id", listing.id);

    if (updateError) {
      console.error("Failed to update listing after deletion:", updateError);
    }

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete listing error:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 },
    );
  }
}
