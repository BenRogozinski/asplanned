import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { Logger } from "./lib/logger";
import { unauthorizedResponse } from "./lib/api";

const logger = new Logger("Middleware")

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  logger.debug(`Matched request to ${pathname}`);

  if (!session) {
    // Don't redirect for API routes, just return a 401
    if (pathname.startsWith("/api")) {
      return unauthorizedResponse();
    }

    // Redirect to login for regular routes
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Session is valud
  const response = NextResponse.next();
  if (pathname.startsWith("/api")) {
    response.headers.set("Cache-Control", "max-age=300, must-revalidate, private");
    response.headers.set("Vary", "Cookie");
  }
  return response;
}

export const config = {
  matcher: [
    "/api/:path((?!auth).*)",
    "/calendar",
    "/home",
    "/myInfo",
    "/tools"
  ]
};