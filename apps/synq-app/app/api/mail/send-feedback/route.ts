import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { type, message } = await req.json();

    await resend.emails.send({
      from: "no-reply@trysynq.com",
      to: "help@trysynq.com",
      subject:
        type === "missing"
          ? "Missing Set/Card Feedback"
          : "Bug / Feature Feedback",
      html: `<p>Feedback type: <strong>${type}</strong></p><p>Message:</p><p>${message}</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
