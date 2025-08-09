import { NextResponse } from "next/server"
import { consumeOtp, getOtp } from "@/app/api/_otp-store"
import { clerkClient } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  try {
    const { transactionId, otp } = await req.json()
    if (!transactionId || !otp) {
      return NextResponse.json({ error: "Missing transactionId or otp" }, { status: 400 })
    }
    const rec = getOtp(transactionId)
    if (!rec) {
      return NextResponse.json({ error: "OTP expired or invalid transaction" }, { status: 400 })
    }
    if (String(otp).trim() !== rec.otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 })
    }

    // OTP valid: consume and create Clerk user
    consumeOtp(transactionId)

    try {
      await clerkClient.users.createUser({
        emailAddress: [rec.email],
        password: rec.password,
        phoneNumbers: [rec.phone],
      })
    } catch (err: any) {
      return NextResponse.json(
        { error: `Clerk create user error: ${err?.errors?.[0]?.message || err?.message || "failed"}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unexpected error" }, { status: 500 })
  }
}
