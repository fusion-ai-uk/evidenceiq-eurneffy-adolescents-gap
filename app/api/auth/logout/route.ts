import { NextResponse } from "next/server"

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: "evidenceiq_session",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  return res
}


