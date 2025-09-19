import { NextResponse } from "next/server";
import { createClient } from "@synq/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function welcomeEmailTemplate(firstName: string | null, email: string) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Synq</title>
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
                <h1 style="margin:0;font-size:20px;font-weight:300;">Welcome to Synq</h1>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding:0 32px 24px;font-size:15px;line-height:1.6;color:#333;">
                <p style="margin:0 0 16px;">Hi ${firstName || email},</p>
                <p style="margin:0 0 16px;">
                  Welcome to <strong>Synq</strong>! I'm Telmo, the founder of Synq.
                </p>
                <p style="margin:0 0 16px;">
                  We've been working on Synq for the past months, and during this time we've implemented the basic functionality to get started.
                  With your feedback, we can make the right decisions to help run your store smarter.
                </p>
                <p style="margin:0 0 24px;">
                  During our beta phase, you may encounter some bugs, but we genuinely want to hear all of your feedback.
                  If you have any questions, you can contact me directly at iamtelmo@proton.me.
                </p>

                <!-- Signature -->
                <p style="margin:0 0 16px;">Best regards,</p>
                <img src="https://trysynq.com/brand/signature.png" alt="Signature" width="160" height="auto" style="margin:8px 0 24px;display:block;" />
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td style="padding:0 32px 32px;text-align:center;">
                <a href="https://app.trysynq.com"
                  style="display:inline-block;background:#656af1;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:500;font-size:14px;border:1px solid #656af1;">
                  Get Started
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
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user?.email) {
      return NextResponse.json(
        { error: "Unauthorized or missing user email" },
        { status: 401 },
      );
    }

    const html = welcomeEmailTemplate(
      user.user_metadata?.full_name ?? null,
      user.email,
    );

    const { error: resendError } = await resend.emails.send({
      from: "Synq <welcome@trysynq.com>",
      to: user.email,
      subject: "Welcome to Synq 🎉",
      html,
    });

    if (resendError) {
      return NextResponse.json({ error: resendError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Failed to send welcome email", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
