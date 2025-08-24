import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, email, storeType, role, frustration, wantsUpdates } =
      body;

    // Validate required fields
    if (!firstName || !email || !storeType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Send email to you
    const notificationEmail = await resend.emails.send({
      from: "Synq <noreply@trysynq.com>",
      to: "iamtelmo@proton.me",
      subject: `New Contact Form Submission: ${firstName} from ${storeType}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Store Type:</strong> ${storeType}</p>
        ${role ? `<p><strong>Role:</strong> ${role}</p>` : ""}
        ${frustration ? `<p><strong>Biggest Frustration:</strong> ${frustration}</p>` : ""}
        <p><strong>Wants Updates:</strong> ${wantsUpdates ? "Yes" : "No"}</p>
      `,
    });

    console.log("Notification email sent:", notificationEmail);

    // Send confirmation email to user
    const confirmationEmail = await resend.emails.send({
      from: "Synq <noreply@trysynq.com>",
      to: email,
      subject: "Thanks for reaching out! 👋",
      html: `
        <h2>Hi ${firstName},</h2>
        <p>Thanks for reaching out! I'm excited to learn more about your needs.</p>
        <p>I'll be in touch soon to keep the conversation going and see how Synq can help your business.</p>
        <p>If you have any questions or want to share more thoughts, feel free to reach out directly at <a href="mailto:iamtelmo@proton.me">iamtelmo@proton.me</a>.</p>
        <p>Best,<br>Telmo Beroiz<br>Founder of Synq</p>
      `,
    });

    console.log("Confirmation email sent:", confirmationEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
