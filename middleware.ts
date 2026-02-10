import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get session token from cookies - better-auth uses "better-auth.session_token" by default
  const cookies = request.cookies.getAll();
  const sessionCookie = cookies.find(cookie => 
    cookie.name === 'better-auth.session_token' || 
    cookie.name === '__Secure-better-auth.session_token'
  );

  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For API routes, continue and let the API handler validate
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // For dashboard routes, check role-based access
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/trainer")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/member")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
