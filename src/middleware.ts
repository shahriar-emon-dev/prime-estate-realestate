// src/middleware.ts
// Middleware for authentication and role-based access control

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Role type for type safety
type UserRole = "admin" | "seller" | "agent" | "user";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // =====================================================
  // ROUTE DEFINITIONS
  // =====================================================

  const isAdminRoute = pathname.startsWith("/admin");
  const isSellerRoute = pathname.startsWith("/seller");
  const isAgentRoute = pathname.startsWith("/agent");
  const isAuthApiRoute = pathname.startsWith("/api/auth");

  // =====================================================
  // SKIP MIDDLEWARE FOR AUTH API ROUTES
  // =====================================================
  // Auth API routes (login, signup, redirects) should work for everyone
  if (isAuthApiRoute) {
    return response;
  }

  // =====================================================
  // AUTHENTICATION CHECK FOR PROTECTED ROUTES
  // =====================================================

  // Redirect to appropriate login if accessing protected routes without authentication
  if ((isAdminRoute || isSellerRoute || isAgentRoute) && !user) {
    // Admin routes → admin login page
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/login/admin", request.url));
    }
    // Other protected routes → standard login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // =====================================================
  // ROLE-BASED ACCESS CONTROL
  // =====================================================

  if ((isAdminRoute || isSellerRoute || isAgentRoute) && user) {
    // Fetch user role from database (source of truth)
    let role: UserRole = "user";

    try {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (userData?.role) {
        role = userData.role as UserRole;
      }
    } catch (error) {
      // If user record doesn't exist yet, default to 'user'
      role = "user";
    }

    // Enforce role-based access
    if (isAdminRoute && role !== "admin") {
      // Not an admin - redirect to homepage
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isSellerRoute && role !== "seller") {
      // Not a seller - redirect to homepage
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isAgentRoute && role !== "agent") {
      // Not an agent - redirect to homepage
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  // Apply middleware to:
  // - Admin routes
  // - Seller routes
  // - Agent routes
  // - Auth API routes (but we skip them in middleware logic)
  matcher: ["/admin/:path*", "/seller/:path*", "/agent/:path*", "/api/auth/:path*"],
};
