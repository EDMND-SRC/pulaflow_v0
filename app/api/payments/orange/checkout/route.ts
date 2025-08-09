import { NextResponse } from "next/server"
import { getInvoice, computeInvoiceTotals } from "@/app/api/_db"
import { rememberIntent } from "@/app/api/_payments"

// Helper: fetch Orange access token using Basic auth from env
async function getOrangeAccessToken() {
  const key = process.env.OrangeApiKey
  const secret = process.env.OrangeApiSecret
  if (!key || !secret) {
    throw new Error("Missing OrangeApiKey or OrangeApiSecret server environment variables.")
  }
  const basic = Buffer.from(`${key}:${secret}`).toString("base64")
  const res = await fetch("https://api.orange.com/oauth/v3/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Orange token error: ${text}`)
  }
  const json: any = await res.json()
  return String(json.access_token)
}

/*
  Starts an Orange Carrier Billing checkout for an invoice.
  Body: { invoiceId: string, msisdn?: string }
*/
export async function POST(req: Request) {
  try {
    const { invoiceId, msisdn } = await req.json()
    if (!invoiceId) {
      return NextResponse.json({ error: "invoiceId is required" }, { status: 400 })
    }
    const inv = getInvoice(invoiceId)
    if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 })

    const { total } = computeInvoiceTotals(inv)

    // 1) Access token
    const accessToken = await getOrangeAccessToken()

    // 2) Call Orange Carrier Billing - Check Out API
    // IMPORTANT: Replace CHECKOUT_URL and body fields with your exact Orange contract.
    // We include a notifyUrl that points to our webhook.
    const CHECKOUT_URL =
      process.env.ORANGE_CARRIER_BILLING_CHECKOUT_URL ?? "https://api.orange.com/telephony/v3/carrierbilling/checkout"
    const transactionId = crypto.randomUUID()

    // Remember correlation before the remote call to handle eventual callbacks
    rememberIntent(transactionId, {
      invoiceId: inv.id,
      amount: Number(total.toFixed(2)),
      msisdn: msisdn || inv.customer?.phone_number,
      createdAt: Date.now(),
    })

    const notifyUrl =
      process.env.PUBLIC_BASE_URL?.replace(/\/$/, "") + "/api/webhooks/orange" ||
      "https://example.com/api/webhooks/orange"

    const payload: any = {
      transactionId, // our correlation id
      amount: Number(total.toFixed(2)),
      currency: "BWP",
      msisdn: msisdn || inv.customer?.phone_number, // customer phone number
      description: `Invoice ${inv.invoice_number}`,
      notifyUrl,
    }

    const res = await fetch(CHECKOUT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const t = await res.text()
      return NextResponse.json({ error: `Orange checkout error: ${t}` }, { status: 502 })
    }

    const data = await res.json().catch(() => ({}))

    // Some Orange APIs return a payment URL for redirection, others push an approval on the phone.
    return NextResponse.json({
      ok: true,
      transactionId,
      gateway: data,
      message: "If prompted, approve the Orange Money request on your phone.",
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 })
  }
}
