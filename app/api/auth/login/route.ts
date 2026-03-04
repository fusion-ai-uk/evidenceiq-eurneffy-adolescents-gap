import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// List of allowed users (static)
const USERS = [
  // Existing login (unchanged)
  { email: "alunbrig@evidenceiq.io", password: "alunbrig.evidenceiq" },

  // New login (add your new credentials here)
  { email: "mary@fusionagency.solutions", password: "Moose01!" },
]

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

    // Allow if matches any allowed user
    const isValidUser = USERS.some(
      (user) => user.email === email && user.password === password
    )

    if (!isValidUser) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }

    const session = signSession({ email, ts: Date.now() })
    const res = NextResponse.json({ ok: true })
    const isProd = process.env.NODE_ENV === "production"

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
