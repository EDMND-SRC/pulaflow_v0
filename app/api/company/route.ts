import { NextResponse } from "next/server"
import { DEMO, getCompanyByUser, updateCompanyByUser } from "@/app/api/_db"

export async function GET() {
  const company = getCompanyByUser(DEMO.DEMO_USER_ID)
  return NextResponse.json(company ?? null)
}

export async function PATCH(req: Request) {
  const data = await req.json()
  const company = updateCompanyByUser(DEMO.DEMO_USER_ID, data)
  return NextResponse.json(company)
}
