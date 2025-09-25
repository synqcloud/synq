import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createServerClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle relevant events
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionCanceled(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const userId = subscription.metadata.supabase_user_id;

  if (!userId) {
    console.error("No user ID found in subscription metadata");
    return;
  }

  const status = mapStripeStatus(subscription.status);

  // Update the existing row in user_subscriptions
  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status,
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) console.error("Failed to update subscription:", error);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;

  if (userId) {
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (error) console.error("Failed to cancel subscription:", error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  const subscriptionId = invoice.subscription as string;

  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (sub?.user_id) {
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ status: "past_due", updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) console.error("Failed to mark subscription past_due:", error);
  }
}

function mapStripeStatus(
  stripeStatus: string,
): "trialing" | "active" | "canceled" | "past_due" {
  switch (stripeStatus) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled";
    case "past_due":
    case "incomplete":
      return "past_due";
    default:
      return "canceled";
  }
}
