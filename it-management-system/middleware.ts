import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production"
)

const COOKIE_NAME = "it-admin-token"

const publicPaths = ["/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE_NAME)?.value
  
  // Allow API routes to pass through
  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (!token) {
    if (isPublicPath || pathname === "/") {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verify token
  try {
    await jwtVerify(token, JWT_SECRET)

    // If authenticated and on public path, redirect to dashboard
    if (isPublicPath || pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
  } catch {
    // Invalid token - clear it and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete(COOKIE_NAME)
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon).*)"],
}
