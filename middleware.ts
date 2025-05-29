import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { Logger } from "./lib/logger";

const logger = new Logger("middleware")

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;
  
  logger.debug(`Matched request to ${pathname}`);

  if (!session) {
    // Return an error in-place for API routes
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { Error: "Unauthorized" },
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Redirect to login for regular routes
    if (!pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Session is valud
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api",
    "/calendar",
    "/home",
    "/myInfo",
    "/tools"
  ]
};