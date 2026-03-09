import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/authSession"

const PUBLIC_PATHS = [
  "/login",
  "/privacy",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/debug/build",
  "/api/debug/source",
  "/_next",
  "/favicon.ico",
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  // Allow static assets from /public (e.g., /logo.png, /icons/*.svg) and any file-like path
  const isAsset = pathname.startsWith("/_next") || pathname === "/favicon.ico" || /\.[a-zA-Z0-9]+$/.test(pathname)

  if (isPublic || isAsset) return NextResponse.next()

  const rawSession = req.cookies.get("evidenceiq_session")?.value
  const session = await verifySession(rawSession)
  if (!session) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("from", pathname)
    const redirect = NextResponse.redirect(url)
    // Ensure stale/invalid cookies are removed.
    if (rawSession) {
      redirect.cookies.set({
        name: "evidenceiq_session",
        value: "",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      })
    }
    return redirect
  }

  const res = NextResponse.next()
  if (req.method === "GET") {
    if (pathname.startsWith("/api/alunbrig/")) {
      // Private: don't allow shared caches to store authenticated analytics responses.
      res.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60")
    } else {
      // Prevent browser from serving protected app pages from cache after logout.
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
      res.headers.set("Pragma", "no-cache")
      res.headers.set("Expires", "0")
    }
  }
  return res
}

export const config = {
  matcher: ["/((?!api/auth/login|api/auth/logout|login|privacy|_next|favicon.ico|public).*)"],
}
