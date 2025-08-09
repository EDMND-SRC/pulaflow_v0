import { NextResponse } from "next/server"
import { DEMO, createInvoice, listInvoices } from "@/app/api/_db"

export async function GET() {
  const rows = listInvoices(DEMO.DEMO_USER_ID)
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const payload = await req.json()
  const created = createInvoice(DEMO.DEMO_USER_ID, {
    customer_id: payload.customer_id,
    issue_date: payload.issue_date,
    due_date: payload.due_date,
    line_items: payload.line_items ?? [],
    tax_rate_applied: payload.tax_rate_applied,
  })
  return NextResponse.json(created, { status: 201 })
}
