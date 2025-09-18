// Supabase Edge Function: send-notification-emails
// Enhanced version with improved Synq branding and better notification handling
// - Finds users with ANY unread notifications (no time restriction)
// - Groups notifications per user and emails them via Resend with Synq-branded template
// - Handles different notification types with appropriate icons and descriptions
// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

type NotificationRow = {
  id: string;
  user_id: string;
  notification_type: "discrepancy_stock" | "price_alert";
  message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  // Additional fields
  stock_id?: string | null;
  core_card_id?: string | null;
  marketplace_id?: string | null;
};

type GroupedByUser = Record<string, NotificationRow[]>;

// Get configuration from environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

// Enhanced email config with Synq branding - configurable via env vars
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "Synq <synqbot@trysynq.com>";
const EMAIL_BRAND = Deno.env.get("EMAIL_BRAND") || "Synq";
const APP_URL = Deno.env.get("APP_URL") || "https://trysynq.com";
const EMAIL_TO_OVERRIDE = Deno.env.get("EMAIL_TO_OVERRIDE"); // Optional override for testing

// Brand colors based on globals file variables
const PRIMARY_COLOR = "hsl(238, 83%, 67%)";
const SUCCESS_COLOR = "#10B981"; // Keep for price alerts
const WARNING_COLOR = "#F59E0B"; // Keep for stock discrepancies

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "[send-notification-emails] Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
}
if (!RESEND_API_KEY) {
  throw new Error(
    "[send-notification-emails] Missing required environment variable: RESEND_API_KEY",
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function groupByUser(notifs: NotificationRow[]): GroupedByUser {
  return notifs.reduce((acc, n) => {
    (acc[n.user_id] ||= []).push(n);
    return acc;
  }, {} as GroupedByUser);
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function getNotificationIcon(type: string): string {
  switch (type) {
    case "price_alert":
      return "📈"; // Price trending up
    case "discrepancy_stock":
      return "📦"; // Package/inventory box
    default:
      return "🔔"; // Bell notification
  }
}

function getNotificationColor(type: string): string {
  switch (type) {
    case "price_alert":
      return SUCCESS_COLOR;
    case "discrepancy_stock":
      return WARNING_COLOR;
    default:
      return PRIMARY_COLOR;
  }
}

function summarizeRow(row: NotificationRow): {
  date: string;
  description: string;
  amount?: string;
  icon: string;
  color: string;
  priority: "high" | "medium" | "low";
} {
  const date = formatDate(row.created_at);
  const m = row.metadata ?? ({} as Record<string, unknown>);
  const icon = getNotificationIcon(row.notification_type);
  const color = getNotificationColor(row.notification_type);

  let description = row.message ?? "";
  let priority: "high" | "medium" | "low" = "medium";

  if (!description) {
    if (row.notification_type === "price_alert") {
      const symbol = (m["symbol"] || m["card_name"]) as string | undefined;
      const price = (m["price"] || m["new_price"]) as
        | number
        | string
        | undefined;
      const delta = (m["delta"] || m["change"] || m["change_pct"]) as
        | number
        | string
        | undefined;

      description = `Price alert${symbol ? ` for ${symbol}` : ""}`;
      if (price) description += ` - Now $${price}`;
      if (delta) {
        const deltaNum = typeof delta === "string" ? parseFloat(delta) : delta;
        if (typeof deltaNum === "number") {
          const sign = deltaNum >= 0 ? "+" : "";
          description += ` (${sign}${deltaNum.toFixed(1)}%)`;
          priority = Math.abs(deltaNum) > 10 ? "high" : "medium";
        }
      }
    } else if (row.notification_type === "discrepancy_stock") {
      const expected = m["expected_quantity"] as number | undefined;
      const actual = m["actual_quantity"] as number | undefined;
      const cardName = m["card_name"] as string | undefined;

      description = `Stock discrepancy${cardName ? ` for ${cardName}` : ""}`;
      if (typeof expected === "number" && typeof actual === "number") {
        description += ` - Expected ${expected}, found ${actual}`;
        const diff = Math.abs(expected - actual);
        priority = diff > 5 ? "high" : diff > 2 ? "medium" : "low";
      }
    } else {
      description = "New notification";
    }
  }

  let amount: string | undefined;
  if (typeof (m as any)?.amount === "number") {
    amount = `$${(m as any).amount.toFixed(2)}`;
  } else if (typeof (m as any)?.new_price === "number") {
    amount = `$${(m as any).new_price.toFixed(2)}`;
  } else if (typeof (m as any)?.price === "number") {
    amount = `$${(m as any).price.toFixed(2)}`;
  }

  return { date, description, amount, icon, color, priority };
}

function emailTemplate(
  firstName: string | null,
  brand: string,
  ctaUrl: string,
  rows: NotificationRow[],
) {
  const items = rows.slice(0, 15).map((r) => summarizeRow(r));
  const count = rows.length;
  const hasMore = rows.length > 15;

  // Sort by priority then by date
  const sortedItems = items.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Group notifications by type for summary
  const priceAlerts = rows.filter(
    (r) => r.notification_type === "price_alert",
  ).length;
  const stockDiscrepancies = rows.filter(
    (r) => r.notification_type === "discrepancy_stock",
  ).length;

  const notificationItems = sortedItems
    .map(
      (r, index) => `
      <tr style="border-bottom: ${index === sortedItems.length - 1 ? "none" : "1px solid #f1f1f1"};">
        <td style="padding: 16px 0; font-size: 14px; color: #666; width: 80px; vertical-align: top;">
          ${r.date}
        </td>
        <td style="padding: 16px 0; font-size: 14px; color: #000; vertical-align: top;">
          ${r.description}
        </td>
        <td style="padding: 16px 0; font-size: 14px; color: #000; text-align: right; vertical-align: top;">
          ${r.amount || ""}
        </td>
      </tr>
    `,
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${brand} Notifications</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafacc; color: #000;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

      <!-- Header with Synq logo -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; margin-bottom: 24px;">
          <img src="https://trysynq.com/brand/synq-icon.png" alt="Synq" width="32" height="32" style="display: block;" />
        </div>
        <h1 style="margin: 0; font-size: 18px; font-weight: 500; color: #000;">
          You have ${count} new notification${count === 1 ? "" : "s"}
        </h1>
      </div>

      <!-- Greeting -->
      <p style="margin: 0 0 32px 0; font-size: 14px; color: #000;">
        Hi ${firstName || "there"},
      </p>

      <!-- Description -->
      <p style="margin: 0 0 32px 0; font-size: 14px; color: #000; line-height: 1.5;">
        We found <strong>${count} new notification${count === 1 ? "" : "s"}</strong> for your inventory that need your attention.
        These include price alerts and stock discrepancies that could impact your card shop operations.
      </p>

      <!-- Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
        <thead>
          <tr style="border-bottom: 2px solid #000;">
            <th style="padding: 12px 0; font-size: 12px; font-weight: 500; color: #000; text-align: left; text-transform: uppercase; letter-spacing: 0.5px;">
              Date
            </th>
            <th style="padding: 12px 0; font-size: 12px; font-weight: 500; color: #000; text-align: left; text-transform: uppercase; letter-spacing: 0.5px;">
              Description
            </th>
            <th style="padding: 12px 0; font-size: 12px; font-weight: 500; color: #000; text-align: right; text-transform: uppercase; letter-spacing: 0.5px;">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          ${notificationItems}
        </tbody>
      </table>

      ${
        hasMore
          ? `
      <p style="margin: 0 0 32px 0; font-size: 14px; color: #666; text-align: center;">
        And ${rows.length - 15} more notification${rows.length - 15 === 1 ? "" : "s"}...
      </p>
      `
          : ""
      }

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 48px;">
        <a href="${ctaUrl}"
           style="display: inline-block;
                  background: #656af1;
                  color: #fff;
                  text-decoration: none;
                  padding: 12px 24px;
                  border-radius: 6px;
                  font-weight: 500;
                  font-size: 14px;
                  border: 1px solid #656af1;">
          View notifications
        </a>
      </div>

      <!-- Footer Links -->
      <div style="margin-bottom: 32px; text-align: center;">
        <a href="https://trysynq.com" style="display: inline-block; margin: 0 20px; font-size: 14px; color: #666; text-decoration: none;">Features</a>
        <a href="https://trysynq.com/story" style="display: inline-block; margin: 0 20px; font-size: 14px; color: #666; text-decoration: none;">Our Story</a>
        <a href="https://trysynq.com/privacy" style="display: inline-block; margin: 0 20px; font-size: 14px; color: #666; text-decoration: none;">Privacy</a>
        <a href="https://trysynq.com/terms" style="display: inline-block; margin: 0 20px; font-size: 14px; color: #666; text-decoration: none;">Terms</a>
      </div>

      <!-- Social Links -->
      <p style="margin: 0; font-size: 12px;">
        <a href="${APP_URL}/settings/notifications" style="color: #666; text-decoration: underline;">Notification preferences</a>
      </p>

      <!-- Brand Footer -->
      <div style="margin-top: 32px; text-align: center;">
        <img src="https://trysynq.com/brand/synq-icon.png" alt="Synq" width="16" height="16" style="display: block; margin: 0 auto; opacity: 0.5;" />
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #999;">
          synq
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

async function getUserEmail(
  userId: string,
): Promise<{ email: string | null; firstName: string | null }> {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error) {
      console.error("admin.getUserById error", error);
      return { email: null, firstName: null };
    }
    const email = data?.user?.email ?? null;
    const firstName = (data?.user?.user_metadata as any)?.first_name ?? null;
    return { email, firstName };
  } catch (e) {
    console.error("getUserEmail exception", e);
    return { email: null, firstName: null };
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  const startedAt = new Date();

  // Optional payload can override dryRun
  const body = await req.json().catch(() => ({}) as any);
  const dryRun: boolean = Boolean(body?.dryRun);

  // Initialize Resend with environment variable
  const resend = new Resend(RESEND_API_KEY);

  console.log(
    `[send-notification-emails] Starting batch for ALL unread notifications, dry run: ${dryRun}`,
  );
  console.log(
    `[send-notification-emails] Connecting to Supabase at: ${SUPABASE_URL}`,
  );

  // Query to get ALL unread notifications (no time restriction)
  const { data: notifs, error } = await supabase
    .from("notifications")
    .select(
      `
      id,
      user_id,
      notification_type,
      message,
      metadata,
      created_at,
      stock_id,
      core_card_id,
      marketplace_id
    `,
    )
    .eq("is_read", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  const grouped = groupByUser((notifs ?? []) as NotificationRow[]);
  const userIds = Object.keys(grouped);

  console.log(
    `[send-notification-emails] Found ${userIds.length} users with unread notifications`,
  );

  const results: Array<{
    userId: string;
    email?: string | null;
    notificationCount?: number;
    sent?: boolean;
    error?: string;
  }> = [];

  for (const userId of userIds) {
    const rows = grouped[userId];
    const { email, firstName } = await getUserEmail(userId);

    const toEmail = EMAIL_TO_OVERRIDE || email;
    if (!toEmail) {
      results.push({
        userId,
        email: null,
        notificationCount: rows.length,
        sent: false,
        error: "No email for user",
      });
      continue;
    }

    const html = emailTemplate(
      firstName,
      EMAIL_BRAND,
      `${APP_URL}/notifications`,
      rows,
    );
    const subject = `Unread notification${rows.length === 1 ? "" : "s"}`;

    if (dryRun) {
      console.log(
        `[DRY RUN] Would send to ${toEmail}: ${rows.length} notifications`,
      );
      results.push({
        userId,
        email: toEmail,
        notificationCount: rows.length,
        sent: false,
      });
      continue;
    }

    try {
      const res = await resend.emails.send({
        from: EMAIL_FROM,
        to: toEmail,
        subject,
        html,
      });

      if ((res as any)?.error) {
        throw new Error((res as any).error?.message ?? "Unknown Resend error");
      }

      console.log(
        `[send-notification-emails] Sent to ${toEmail}: ${rows.length} notifications`,
      );
      results.push({
        userId,
        email: toEmail,
        notificationCount: rows.length,
        sent: true,
      });
    } catch (e: any) {
      console.error(`Failed to send to ${toEmail}`, e);
      results.push({
        userId,
        email: toEmail,
        notificationCount: rows.length,
        sent: false,
        error: e?.message ?? String(e),
      });
    }
  }

  const sentCount = results.filter((r) => r.sent).length;
  const totalNotifications = results.reduce(
    (sum, r) => sum + (r.notificationCount || 0),
    0,
  );
  const durationMs = Date.now() - startedAt.getTime();

  console.log(
    `[send-notification-emails] Completed: ${sentCount}/${userIds.length} emails sent, ${totalNotifications} total notifications processed in ${durationMs}ms`,
  );

  return new Response(
    JSON.stringify({
      ok: true,
      usersConsidered: userIds.length,
      totalNotifications,
      sentCount,
      results,
      durationMs,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
