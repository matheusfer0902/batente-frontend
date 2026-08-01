import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_TOKEN_COOKIE } from "@/types/api";

const protectedPaths = ["/resources"];
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
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
    return NextResponse.redirect(new URL("/resources", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/resources/:path*", "/login", "/register"],
};
