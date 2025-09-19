import { NextResponse } from "next/server";
import { createClient } from "@synq/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function testNotificationEmailTemplate(
  firstName: string | null,
  email: string,
) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Synq notifications are working!</title>
  </head>
  <body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.05);">
            <!-- Header -->
            <tr>
              <td style="padding:32px 32px 16px;text-align:center;">
                <img src="https://trysynq.com/brand/synq-icon.png" alt="Synq" width="40" height="40" style="margin-bottom:16px;" />
                <h1 style="margin:0;font-size:20px;font-weight:300;">🎉 Test notification successful!</h1>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding:0 32px 24px;font-size:15px;line-height:1.6;color:#333;">
                <p style="margin:0 0 16px;">Hi ${firstName || email},</p>
                <p style="margin:0 0 16px;">
                  Perfect! Your notifications are working correctly. You'll receive emails like this one when important events happen with your inventory.
                </p>

                <!-- Sample notifications preview -->
                <div style="background:#f8f9fa;border-radius:6px;padding:16px;margin:16px 0 24px;">
                  <h3 style="margin:0 0 12px;font-size:14px;font-weight:500;color:#000;">Here's what you can expect:</h3>

                  <div style="margin-bottom:12px;padding:8px 0;border-bottom:1px solid #e9ecef;">
                    <div style="font-size:13px;color:#666;margin-bottom:4px;">📦 Stock discrepancies</div>
                    <div style="font-size:14px;color:#000;">Get notified when your inventory counts don't match across platforms</div>
                  </div>

                  <div style="margin-bottom:12px;padding:8px 0;border-bottom:1px solid #e9ecef;">
                    <div style="font-size:13px;color:#666;margin-bottom:4px;">📈 Price alerts</div>
                    <div style="font-size:14px;color:#000;">Stay informed when card prices hit your target thresholds</div>
                  </div>
                </div>

                <p style="margin:0 0 24px;">
                  You're all set! We'll keep you informed about important changes to help you run your card shop more efficiently.
                </p>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td style="padding:0 32px 32px;text-align:center;">
                <a href="https://app.trysynq.com"
                  style="display:inline-block;background:#656af1;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:500;font-size:14px;border:1px solid #656af1;">
                  Continue to Synq
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px 32px;font-size:12px;line-height:1.6;color:#666;text-align:center;background:#fafafa;">
                <p style="margin:0 0 8px;">Run your business smarter with Synq.</p>
                <p style="margin:0 0 8px;">
                  <a href="https://trysynq.com" style="color:#666;text-decoration:none;margin:0 8px;">Homepage</a> •
                  <a href="https://trysynq.com/#features" style="color:#666;text-decoration:none;margin:0 8px;">Features</a> •
                  <a href="https://trysynq.com/privacy" style="color:#666;text-decoration:none;margin:0 8px;">Privacy</a> •
                  <a href="https://trysynq.com/terms" style="color:#666;text-decoration:none;margin:0 8px;">Terms</a>
                </p>
                <p style="margin:16px 0 0 0;color:#999;">© ${new Date().getFullYear()} Synq.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

export async function POST() {
  try {
    console.log("[send-test-notification-email] POST called");
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    console.log("[send-test-notification-email] user check", {
      hasUser: !!user,
      hasEmail: !!user?.email,
      error,
    });

    if (error || !user?.email) {
      return NextResponse.json(
        {
          error: "Unauthorized or missing user email",
          debug: { hasUser: !!user, hasEmail: !!user?.email, error },
        },
        { status: 401 },
      );
    }

    const html = testNotificationEmailTemplate(
      user.user_metadata?.full_name ?? null,
      user.email,
    );

    const result = await resend.emails.send({
      from: "Synq <welcome@trysynq.com>",
      to: user.email,
      subject: "🎉 Your Synq notifications are working!",
      html,
    });

    if (result.error) {
      console.error(
        "[send-test-notification-email] Resend error",
        result.error,
      );
      return NextResponse.json(
        {
          error: result.error.message,
          debug: {
            hasUser: true,
            hasEmail: true,
            email: user.email,
            hasResendKey: !!process.env.RESEND_API_KEY,
          },
        },
        { status: 500 },
      );
    }

    console.log(
      "[send-test-notification-email] email sent to",
      user.email,
      "id:",
      result.data?.id,
    );
    return NextResponse.json({
      success: true,
      emailId: result.data?.id,
      debug: {
        hasUser: true,
        hasEmail: true,
        email: user.email,
        hasResendKey: !!process.env.RESEND_API_KEY,
      },
    });
  } catch (err: unknown) {
    console.error("[send-test-notification-email] failed", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
