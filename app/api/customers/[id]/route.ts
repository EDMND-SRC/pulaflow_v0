import { NextResponse } from "next/server"
import { deleteCustomer, updateCustomer } from "@/app/api/_db"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const updated = updateCustomer(params.id, body)
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const ok = deleteCustomer(params.id)
  return NextResponse.json({ ok })
}
