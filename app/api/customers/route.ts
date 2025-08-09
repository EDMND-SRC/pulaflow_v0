import { NextResponse } from "next/server"
import { DEMO, createCustomer, listCustomers } from "@/app/api/_db"

export async function GET() {
  const rows = listCustomers(DEMO.DEMO_USER_ID)
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const payload = await req.json()
  const created = createCustomer(DEMO.DEMO_USER_ID, {
    name: payload.name ?? "",
    email: payload.email ?? "",
    phone_number: payload.phone_number ?? "",
  })
  return NextResponse.json(created, { status: 201 })
}
