import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"

// Simple in-memory credential check for demo/testing
const TEST_EMAIL = "zynlonta@evidenceiq.io"
const TEST_PASSWORD = "zynlonta.evidenceiq"

// Sign a minimal session payload
function signSession(payload: object) {
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me"
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const sig = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64url")
  return `${body}.${sig}`
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (email !== TEST_EMAIL || password !== TEST_PASSWORD) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    const session = signSession({ email, ts: Date.now() })
    const res = NextResponse.json({ ok: true })
    const isProd = process.env.NODE_ENV === "production"

    // Set httpOnly cookie
    res.cookies.set({
      name: "evidenceiq_session",
      value: session,
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 60 * 60 * 24 * 3, // 3 days
    })
    return res
  } catch (e) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 })
  }
}


