/**
 * @file middleware.ts
 * @description Route koruması. Korumalı sayfalara oturumsuz erişim /giris'e
 * yönlendirilir; giriş yapmış kullanıcı auth sayfalarına gelirse /panel'e gider.
 * Edge runtime'da çalışır — yalnızca jose tabanlı token doğrulaması yapar.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";

// /yonetim de korumalıdır; ayrıca rol kontrolü yonetim/layout.tsx içinde yapılır
const PROTECTED_PREFIXES = [
  "/panel",
  "/tadimlarim",
  "/favoriler",
  "/istek-listem",
  "/profil",
  "/akis",
  "/bildirimler",
  "/yonetim",
];
const AUTH_PAGES = ["/giris", "/kayit"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL("/giris", req.url);
    loginUrl.searchParams.set("donus", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/panel", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/tadimlarim/:path*",
    "/favoriler/:path*",
    "/istek-listem/:path*",
    "/profil/:path*",
    "/akis/:path*",
    "/bildirimler/:path*",
    "/yonetim/:path*",
    "/giris",
    "/kayit",
  ],
};
