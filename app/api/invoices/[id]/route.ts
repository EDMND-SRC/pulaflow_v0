import { NextResponse } from "next/server"
import { deleteInvoice, getInvoice, updateInvoice } from "@/app/api/_db"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const inv = getInvoice(params.id)
  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(inv)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const updated = updateInvoice(params.id, body)
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const ok = deleteInvoice(params.id)
  return NextResponse.json({ ok })
}
