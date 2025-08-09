import { NextResponse } from "next/server"
import { putOtp } from "@/app/api/_otp-store"

function randOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req: Request) {
  try {
    const { email, password, phone } = await req.json()

    if (!email || !password || !phone) {
      return NextResponse.json({ error: "Missing email, password, or phone" }, { status: 400 })
    }
    if (!/^\+2677\d{7}$/.test(String(phone))) {
      return NextResponse.json({ error: "Phone must be an Orange Botswana number (+2677xxxxxxx)" }, { status: 400 })
    }

    const key = process.env.OrangeApiKey
    const secret = process.env.OrangeApiSecret
    if (!key || !secret) {
      return NextResponse.json({ error: "Orange API credentials are not configured on the server." }, { status: 500 })
    }

    // 1) Fetch Orange access token
    const basic = Buffer.from(`${key}:${secret}`).toString("base64")
    const tokenRes = await fetch("https://api.orange.com/oauth/v3/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })
    if (!tokenRes.ok) {
      const t = await tokenRes.text()
      return NextResponse.json({ error: `Orange token error: ${t}` }, { status: 502 })
    }
    const tokenJson: any = await tokenRes.json()
    const accessToken = tokenJson.access_token as string

    // 2) Generate OTP and call Orange Number Verification API
    const otp = randOtp()

    // NOTE: Adjust endpoint and payload to your Orange "Number Verification" contract.
    // This is a placeholder call that demonstrates the required Bearer header.
    const verifyEndpoint = "https://api.orange.com/telephony/v3/numberverification/otp"
    const verifyRes = await fetch(verifyEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      // Many number verification APIs accept msisdn and optional pin or message
      body: JSON.stringify({ msisdn: phone, pin: otp, message: `Your PulaFlow OTP is ${otp}` }),
    })

    if (!verifyRes.ok) {
      const t = await verifyRes.text()
      // We still store OTP locally for the demo flow, but fail to indicate Orange call issue.
      return NextResponse.json({ error: `Orange verification error: ${t}` }, { status: 502 })
    }

    const txId = crypto.randomUUID()
    putOtp(txId, { email, password, phone, otp, expiresAt: Date.now() + 5 * 60 * 1000 })

    return NextResponse.json({ transactionId: txId })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unexpected error" }, { status: 500 })
  }
}
