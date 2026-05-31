import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATH_PREFIXES = [
  "/login",
  "/apply",
  "/track",
  "/admissions",
  "/book-tour",
  "/programs",
] as const;

function resolvePath(pathname: string): { locale: string; path: string } {
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];
  const hasLocale =
    maybeLocale != null &&
    (routing.locales as readonly string[]).includes(maybeLocale);
  const locale = hasLocale ? maybeLocale : routing.defaultLocale;
  const rest = hasLocale ? segments.slice(1) : segments;
  const path = rest.length ? `/${rest.join("/")}` : "/";
  return { locale, path };
}

function localePath(locale: string, path: string): string {
  return `/${locale}${path === "/" ? "" : path}`;
}

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const { locale, path } = resolvePath(pathname);
  const isLoggedIn = Boolean(request.auth?.user);

  if (path === "/") {
    const target = isLoggedIn ? "/dashboard" : "/login";
    return NextResponse.redirect(
      new URL(localePath(locale, target), request.url),
    );
  }

  if (path === "/login" && isLoggedIn) {
    return NextResponse.redirect(
      new URL(localePath(locale, "/dashboard"), request.url),
    );
  }

  const isProtected =
    path === "/dashboard" || path.startsWith("/dashboard/");

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL(localePath(locale, "/login"), request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
