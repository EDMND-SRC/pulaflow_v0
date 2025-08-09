import { NextResponse } from "next/server"
import { getInvoice } from "@/app/api/_db"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const inv = getInvoice(params.id)
  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 })
  // Simulate sending a reminder (SMS/Email gateway to be integrated later)
  console.log(`Reminder sent for invoice ${inv.invoice_number} to ${inv.customer?.email}`)
  return NextResponse.json({ ok: true })
}
