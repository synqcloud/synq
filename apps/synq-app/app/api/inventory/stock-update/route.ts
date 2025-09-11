"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@synq/supabase/server";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const supabase = await createClient();

    const { data, error } = await supabase.functions.invoke(
      "stock-update-operation",
      {
        body,
      },
    );

    if (error) {
      console.error("Edge Function error:", error);
      return NextResponse.json(
        { error: error.message || "Edge Function failed" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("API route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
