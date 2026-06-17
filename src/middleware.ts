import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "@/shared/config/env";

const PUBLIC_PATHS = ["/signin", "/signup", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(env.authCookieName)?.value;
  const isPublicRoute = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isPublicRoute && !token && !pathname.startsWith("/_next")) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api).*)"],
};
