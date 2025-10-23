import { NextRequest, NextResponse } from "next/server";
import { IntegrationsService } from "@synq/supabase/services";
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

    // Get email and access token from request body
    const body = await request.json();
    const { email, accessToken } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!accessToken || !accessToken.trim()) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 },
      );
    }

    // Validate credentials by making a test API call to Manapool
    // Use the seller account endpoint to validate
    //
    console.log(email.trim(), accessToken.trim());
    const testResponse = await fetch("https://manapool.com/api/v1/account", {
      method: "GET",
      headers: {
        "X-ManaPool-Email": email.trim(),
        "X-ManaPool-Access-Token": accessToken.trim(),
        Accept: "application/json",
      },
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      // console.error("Manapool validation error:", errorText);

      // Check if it's an HTML response (404) or actual API error
      const isHtmlError = errorText.trim().startsWith("<!");

      return NextResponse.json(
        {
          error: isHtmlError
            ? "Unable to connect to Manapool API. Please verify your credentials and try again."
            : testResponse.status === 401 || testResponse.status === 403
              ? "Invalid credentials. Please check your email and access token."
              : "Failed to connect to Manapool. Please try again later.",
        },
        { status: 400 },
      );
    }

    // If we get here, the token is valid
    // We may not get user info back, so we'll store what we have
    let manapoolData;
    try {
      manapoolData = await testResponse.json();
    } catch (e) {
      // If parsing fails, we'll just use the email
      manapoolData = {};
    }

    // Check if integration already exists
    const existingIntegrations =
      await IntegrationsService.getIntegrations("server");
    const existingManapool = existingIntegrations.find(
      (i) => i.integration_type === "manapool",
    );

    const credentials = {
      email: email.trim(),
      access_token: accessToken.trim(),
      connected_at: new Date().toISOString(),
      // Store any additional data we got from the API
      ...(manapoolData.user_id && { user_id: manapoolData.user_id }),
      ...(manapoolData.username && { username: manapoolData.username }),
      ...(manapoolData.verified !== undefined && {
        verified: manapoolData.verified,
      }),
      ...(manapoolData.singles_live !== undefined && {
        singles_live: manapoolData.singles_live,
      }),
      ...(manapoolData.sealed_live !== undefined && {
        sealed_live: manapoolData.sealed_live,
      }),
      ...(manapoolData.payouts_enabled !== undefined && {
        payouts_enabled: manapoolData.payouts_enabled,
      }),
    };

    if (existingManapool) {
      // Update existing integration
      await IntegrationsService.updateIntegration(
        existingManapool.id,
        {
          credentials,
        },
        "server",
      );
    } else {
      // Create new integration
      await IntegrationsService.createIntegration(
        "manapool",
        credentials,
        "server",
      );
    }

    return NextResponse.json({
      success: true,
      message: "Manapool connected successfully",
      data: {
        email: email.trim(),
        // ...(manapoolData.username && { username: manapoolData.username }),
      },
    });
  } catch (error) {
    console.error("Manapool connect error:", error);
    return NextResponse.json(
      { error: "Failed to connect Manapool account" },
      { status: 500 },
    );
  }
}
