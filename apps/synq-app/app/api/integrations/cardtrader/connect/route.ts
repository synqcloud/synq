import { NextRequest, NextResponse } from "next/server";
import { IntegrationsService, UserService } from "@synq/supabase/services";
import { createClient } from "@synq/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    }

    // Get API token from request body
    const body = await request.json();
    const { apiToken } = body;

    if (!apiToken || !apiToken.trim()) {
      return NextResponse.json(
        { error: "API token is required" },
        { status: 400 },
      );
    }

    // Validate token by making a test API call to CardTrader
    const testResponse = await fetch("https://api.cardtrader.com/api/v2/info", {
      headers: {
        Authorization: `Bearer ${apiToken.trim()}`,
      },
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error("CardTrader validation error:", errorText);

      return NextResponse.json(
        {
          error:
            testResponse.status === 401
              ? "Invalid API token. Please check your token and try again."
              : "Failed to connect to CardTrader. Please try again later.",
        },
        { status: 400 },
      );
    }

    const cardTraderInfo = await testResponse.json();

    // Check if integration already exists
    const existingIntegrations =
      await IntegrationsService.getIntegrations("server");
    const existingCardTrader = existingIntegrations.find(
      (i) => i.integration_type === "cardtrader",
    );

    if (existingCardTrader) {
      // Update existing integration
      await IntegrationsService.updateIntegration(
        existingCardTrader.id,
        {
          credentials: {
            api_token: apiToken.trim(),
            user_id: cardTraderInfo.user_id,
            app_id: cardTraderInfo.id,
            app_name: cardTraderInfo.name,
            connected_at: new Date().toISOString(),
          },
        },
        "server",

      );
    } else {
      // Create new integration
      await IntegrationsService.createIntegration('cardtrader'
        , {
          api_token: apiToken.trim(),
          user_id: cardTraderInfo.user_id,
          app_id: cardTraderInfo.id,
          app_name: cardTraderInfo.name,
          connected_at: new Date().toISOString(),

        },
        "server",
      );
    }

    return NextResponse.json({
      success: true,
      message: "CardTrader connected successfully",
      data: {
        app_name: cardTraderInfo.name,
        user_id: cardTraderInfo.user_id,
      },
    });
  } catch (error) {
    console.error("CardTrader connect error:", error);
    return NextResponse.json(
      { error: "Failed to connect CardTrader account" },
      { status: 500 },
    );
  }
}
