import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get session token from cookies
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For API routes, continue and let the API handler validate
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // For dashboard routes, check role-based access
  if (pathname.startsWith("/admin")) {
    // Check if user has admin role - we'll validate this on the client/server
    // The actual role check will be done in the page component
    return NextResponse.next();
  }

  if (pathname.startsWith("/trainer")) {
    // Check if user has trainer or admin role
    return NextResponse.next();
  }

  if (pathname.startsWith("/member")) {
    // All authenticated users can access member routes
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
