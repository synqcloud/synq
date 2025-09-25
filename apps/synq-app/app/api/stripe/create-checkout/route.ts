import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@synq/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { amount } = body; // amount in cents, e.g., 1200 for €12

    // Validate custom amount
    if (!amount || typeof amount !== "number" || amount < 1200) {
      return NextResponse.json(
        { error: "Amount must be at least €12" },
        { status: 400 },
      );
    }

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a subscription
    const { data: existingSub } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: hasAccess } = await supabase.rpc("user_has_access", {
      p_user_id: user.id,
    });

    if (hasAccess) {
      return NextResponse.json(
        { error: "User already has an active subscription" },
        { status: 400 },
      );
    }

    // Get or create Stripe customer
    let customer;
    if (existingSub?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(
        existingSub.stripe_customer_id,
      );
    } else {
      customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      });

      if (existingSub) {
        await supabase
          .from("user_subscriptions")
          .update({ stripe_customer_id: customer.id })
          .eq("user_id", user.id);
      }
    }

    // Create checkout session with dynamic price
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product: process.env.STRIPE_PRODUCT_ID!,
            unit_amount: amount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      allow_promotion_codes: false,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
