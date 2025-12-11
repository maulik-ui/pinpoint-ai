import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all admin routes except login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const isAuthenticated = request.cookies.get("admin-authenticated")?.value === "true";

    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login page
  if (pathname === "/admin/login") {
    const isAuthenticated = request.cookies.get("admin-authenticated")?.value === "true";
    if (isAuthenticated) {
      const redirect = request.nextUrl.searchParams.get("redirect") || "/admin/tools";
      return NextResponse.redirect(new URL(redirect, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};


