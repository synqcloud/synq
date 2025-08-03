import { UserService } from "@synq/supabase/services";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    // TODO: Implement auth callback using UserService
    // For now, we'll redirect without processing the code
    console.log("Auth callback received code:", code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/home", request.url));
}
