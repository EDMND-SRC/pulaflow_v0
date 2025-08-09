import { NextResponse } from "next/server"
import { getIntent } from "@/app/api/_payments"
import { updateInvoice } from "@/app/api/_db"

/*
  Webhook receiver for Orange payment confirmation.
  Configure Orange to POST to /api/webhooks/orange
  Expected generic payload example (adjust per Orange spec):
  {
    "transactionId": "uuid-we-sent",
    "status": "SUCCESS", // or "FAILED"
    "amount": 123.45,
    "currency": "BWP",
    "msisdn": "+2677xxxxxxx",
    "reference": "gateway-ref"
  }
*/
export async function POST(req: Request) {
  try {
    const bodyText = await req.text()
    // In production, verify Orange signature headers before parsing:
    // e.g. const sig = req.headers.get("X-OM-Signature") and verify with shared secret.
    // The exact mechanism depends on your Orange contract.

    let payload: any = {}
    try {
      payload = JSON.parse(bodyText || "{}")
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const txId = payload.transactionId || payload.orderId || payload.txId
    if (!txId) {
      return NextResponse.json({ error: "Missing transaction identifier" }, { status: 400 })
    }
    const intent = getIntent(txId)
    if (!intent) {
      return NextResponse.json({ error: "Unknown transaction" }, { status: 404 })
    }

    const status = String(payload.status || "").toUpperCase()
    if (status === "SUCCESS" || status === "PAID" || status === "COMPLETED") {
      // Update invoice to Paid
      updateInvoice(intent.invoiceId, { status: "Paid" })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 })
  }
}
