import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AuthService } from "@/services/AuthService";
import { AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/types/api";

const protectedPaths = ["/resources", "/inicio", "/portaria"];
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isAuthRoute = authPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(
      new URL(AuthService.resolveAuthenticatedRoute(role), request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/resources/:path*",
    "/inicio/:path*",
    "/portaria/:path*",
    "/login",
    "/register",
  ],
};
