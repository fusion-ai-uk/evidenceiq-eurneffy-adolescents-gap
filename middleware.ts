import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login", "/privacy", "/api/auth/login", "/api/auth/logout", "/_next", "/favicon.ico"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  // Allow static assets from /public (e.g., /logo.png, /icons/*.svg) and any file-like path
  const isAsset = pathname.startsWith('/_next') || pathname === '/favicon.ico' || /\.[a-zA-Z0-9]+$/.test(pathname)

  if (isPublic || isAsset) return NextResponse.next()

  const hasSession = Boolean(req.cookies.get("evidenceiq_session")?.value)
  if (!hasSession) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api/auth/login|api/auth/logout|login|privacy|_next|favicon.ico|public).*)",
  ],
}


