"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@synq/supabase/server";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const supabase = await createClient();

    const { data, error } = await supabase.functions.invoke(
      "stock-transaction-operation",
      {
        body: {
          ...body,
          change_type: body.change_type || "marketplace_sale",
        },
      },
    );

    if (error) {
      console.error("Edge Function error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Edge Function failed" },
        { status: 500, headers },
      );
    }

    if (!data?.success) {
      return NextResponse.json(
        { success: false, error: data?.error || "Edge Function failed" },
        { status: 500, headers },
      );
    }

    return NextResponse.json(
      { success: true, ...data },
      { status: 200, headers },
    );
  } catch (err) {
    console.error("API route error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal Server Error",
      },
      { status: 500, headers },
    );
  }
}
