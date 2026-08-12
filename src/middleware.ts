/**
 * @file middleware.ts
 * @description Route koruması. Korumalı sayfalara oturumsuz erişim /sign-in'e
 * yönlendirilir; giriş yapmış kullanıcı auth sayfalarına gelirse /dashboard'e gider.
 * Edge runtime'da çalışır — yalnızca jose tabanlı token doğrulaması yapar.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";

// /admin de korumalıdır; ayrıca rol kontrolü yonetim/layout.tsx içinde yapılır
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/my-tastings",
  "/favourites",
  "/wishlist",
  "/profile",
  "/feed",
  "/notifications",
  "/admin",
];
const AUTH_PAGES = ["/sign-in", "/sign-up"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL("/sign-in", req.url);
    loginUrl.searchParams.set("return", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-tastings/:path*",
    "/favourites/:path*",
    "/wishlist/:path*",
    "/profile/:path*",
    "/feed/:path*",
    "/notifications/:path*",
    "/admin/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
