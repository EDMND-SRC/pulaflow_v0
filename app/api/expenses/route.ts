import { NextResponse } from "next/server"
import { DEMO, createExpense, listExpenses } from "@/app/api/_db"

export async function GET() {
  const rows = listExpenses(DEMO.DEMO_USER_ID)
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const payload = await req.json()
  const created = createExpense(DEMO.DEMO_USER_ID, {
    description: payload.description ?? "",
    amount: Number(payload.amount ?? 0),
    category: payload.category ?? "General",
    receipt_url: payload.receipt_url ?? "",
    date: payload.date ?? new Date().toISOString().slice(0, 10),
  })
  return NextResponse.json(created, { status: 201 })
}
