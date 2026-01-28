import { NextRequest, NextResponse } from "next/server"

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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  // Allow static assets from /public (e.g., /logo.png, /icons/*.svg) and any file-like path
  const isAsset = pathname.startsWith("/_next") || pathname === "/favicon.ico" || /\.[a-zA-Z0-9]+$/.test(pathname)

  if (isPublic || isAsset) return NextResponse.next()

  const hasSession = Boolean(req.cookies.get("evidenceiq_session")?.value)
  if (!hasSession) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // Lightweight response caching for authenticated Alunbrig GET APIs.
  // Helps repeated loads/navigation without changing UI or reducing data.
  const res = NextResponse.next()
  if (req.method === "GET" && pathname.startsWith("/api/alunbrig/")) {
    // Private: don't allow shared caches to store authenticated analytics responses.
    res.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60")
  }
  return res
}

export const config = {
  matcher: ["/((?!api/auth/login|api/auth/logout|login|privacy|_next|favicon.ico|public).*)"],
}
