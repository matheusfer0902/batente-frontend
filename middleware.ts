import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isProtectedPath } from "@/lib/navigation";
import { AuthService } from "@/services/AuthService";
import { AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/types/api";

const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = authPaths.some((path) => pathname.startsWith(path));

  // Rotas do painel vêm de `lib/navigation` — uma lista só, sem duplicar aqui.
  if (isProtectedPath(pathname) && !token) {
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
  // Tudo que não for asset: a decisão de proteger fica no código, não aqui.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
