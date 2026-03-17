import { NextRequest, NextResponse } from "next/server"
import { SESSION_MAX_AGE_SECONDS, signSession } from "@/lib/authSession"

// List of allowed users (static)
const USERS = [
  // Existing login
  { email: "alunbrig@evidenceiq.io", password: "alunbrig.evidenceiq" },

  // EURneffy login
  { email: "eurneffy@evidenceiq.io", password: "eurneffy" },
  { email: "eurneffy@evidenceiq.io", password: "evidenceiq" },

  // Fusion login
  { email: "mary@fusionagency.solutions", password: "Moose01!" },
]

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

    const session = await signSession({ email, ts: Date.now() })
    const res = NextResponse.json({ ok: true })
    const isProd = process.env.NODE_ENV === "production"

    res.cookies.set({
      name: "evidenceiq_session",
      value: session,
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    })

    return res
  } catch (e) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 })
  }
}
