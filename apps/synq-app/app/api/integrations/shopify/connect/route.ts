import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@synq/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get shop URL from request body
    const body = await request.json();
    const { shop } = body;

    if (!shop) {
      return NextResponse.json(
        { error: "Shop URL is required" },
        { status: 400 },
      );
    }

    // Validate shop URL format (should be mystore.myshopify.com)
    const shopDomain = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!shopDomain.endsWith(".myshopify.com")) {
      return NextResponse.json(
        {
          error:
            "Invalid Shopify shop URL. Must be in format: mystore.myshopify.com",
        },
        { status: 400 },
      );
    }

    // Get Shopify credentials from environment
    const clientId = process.env.SHOPIFY_API_KEY;
    const scopes =
      "read_products,write_products,read_inventory,write_inventory,read_orders";
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/shopify/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: "Shopify API key not configured" },
        { status: 500 },
      );
    }

    // Build OAuth authorization URL
    const state = `${user.id}:${Date.now()}`; // Simple state for CSRF protection (use : instead of -)
    const authUrl =
      `https://${shopDomain}/admin/oauth/authorize?` +
      `client_id=${clientId}` +
      `&scope=${scopes}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}`;

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Shopify connect error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Shopify connection" },
      { status: 500 },
    );
  }
}
