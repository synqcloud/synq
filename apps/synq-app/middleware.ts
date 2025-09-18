import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@synq/supabase/server";

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = await createClient();

    // Get the current user from Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Allow access to webhook endpoints without authentication
    if (pathname.startsWith("/api/stripe/webhook")) {
      return response;
    }

    if (user && pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }

    // Always allow access to auth-related paths
    if (
      pathname.startsWith("/auth") ||
      pathname.startsWith("/api/auth") ||
      pathname === "/login"
    ) {
      return response;
    }

    // If there's an auth error or no user, redirect to login
    if (userError || !user) {
      // Don't redirect if we're already on the login page
      if (pathname === "/login") {
        return response;
      }
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // If user exists but no full name, redirect to setup
    if (!user?.user_metadata?.full_name) {
      // Don't redirect if we're already on the setup page
      if (pathname === "/setup-account") {
        return response;
      }
      const url = request.nextUrl.clone();
      url.pathname = "/setup-account";
      return NextResponse.redirect(url);
    }

    // If user has full name and tries to access setup-account, redirect to home
    if (pathname === "/setup-account") {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // Return a basic response in case of error to prevent infinite redirects
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - error (error page)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|error|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
