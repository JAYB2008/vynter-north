import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const rawSecret =
  process.env.SESSION_SECRET ||
  "vynter-north-fallback-session-secret-key-32chars-minimum!!";
const JWT_SECRET = new TextEncoder().encode(rawSecret);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/admin");

  if (isProtected) {
    const token = request.cookies.get("vn_session")?.value;
    let isAuthenticated = false;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload?.accountId) {
          isAuthenticated = true;
        }
      } catch {
        isAuthenticated = false;
      }
    }

    if (!isAuthenticated) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/studio/:path*",
    "/admin/:path*",
  ],
};
