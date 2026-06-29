import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "@/shared/config/env";

const PUBLIC_PATHS = ["/signin", "/signup", "/forgot-password", "/reset-password"];

function getTenantTypeFromToken(token: string): string | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { tenantType?: string };
    return payload.tenantType ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(env.authCookieName)?.value;
  const isPublicRoute = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (isPublicRoute && token) {
    const tenantType = getTenantTypeFromToken(token);
    const destination = tenantType === "cabinet" ? "/cabinet" : "/";
    return NextResponse.redirect(new URL(destination, request.url));
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
