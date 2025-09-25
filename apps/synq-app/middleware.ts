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
    const pathname = request.nextUrl.pathname;

    // Allow access to webhook endpoints without authentication
    if (pathname.startsWith("/api/stripe")) {
      return response;
    }

    if (pathname.startsWith("/api/account/delete")) {
      return response;
    }

    // Allow access to mail API endpoints without onboarding/auth redirects
    if (pathname.startsWith("/api/mail")) {
      return response;
    }

    // Get the current user from Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // If user is authenticated and trying to access login, redirect to home
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

    // Check onboarding completion
    if (!pathname.startsWith("/welcome")) {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .single();

      const onboardingDone = data?.onboarding_completed ?? false;

      if (error) {
        console.error("Onboarding check failed:", error);
      } else if (!onboardingDone) {
        const url = request.nextUrl.clone();
        url.pathname = "/welcome";
        return NextResponse.redirect(url);
      }
    }

    // If user has completed onboarding and tries to access welcome, redirect based on subscription
    if (pathname === "/welcome") {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .single();

      const onboardingDone = data?.onboarding_completed ?? false;

      if (onboardingDone) {
        // Check if user has access
        try {
          const { data: hasAccess, error: accessError } = await supabase.rpc(
            "user_has_access",
            {
              p_user_id: user.id,
            },
          );

          if (accessError) {
            console.error("Access check failed:", accessError);
            // Default to home on error
            const url = request.nextUrl.clone();
            url.pathname = "/home";
            return NextResponse.redirect(url);
          } else if (hasAccess === false) {
            const url = request.nextUrl.clone();
            url.pathname = "/plan-required";
            return NextResponse.redirect(url);
          } else {
            const url = request.nextUrl.clone();
            url.pathname = "/home";
            return NextResponse.redirect(url);
          }
        } catch (error) {
          console.error("Subscription check error:", error);
          // Default to home on error
          const url = request.nextUrl.clone();
          url.pathname = "/home";
          return NextResponse.redirect(url);
        }
      }
    }

    // If user has full name and tries to access setup-account, redirect to home
    if (pathname === "/setup-account") {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }

    // Check subscription status for protected routes
    // Allow access to subscription-related pages and settings without subscription check
    const subscriptionPages = ["/plan-required", "/billing", "/settings"];
    const isSubscriptionPage = subscriptionPages.some((page) =>
      pathname.startsWith(page),
    );

    if (!isSubscriptionPage) {
      try {
        // Check if user has access using the Supabase function
        const { data: hasAccess, error: accessError } = await supabase.rpc(
          "user_has_access",
          {
            p_user_id: user.id,
          },
        );

        if (accessError) {
          console.error("Access check failed:", accessError);
          // Don't block access if the check fails, but log it
        } else if (hasAccess === false) {
          // User doesn't have access - redirect to plan-required page
          const url = request.nextUrl.clone();
          url.pathname = "/plan-required";
          return NextResponse.redirect(url);
        }
      } catch (error) {
        console.error("Subscription check error:", error);
        // Don't block access on error, but log it for debugging
      }
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
