"use client"

import { useEffect, useState } from "react"
import TopNav from "@/components/top-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Money } from "@/components/money"
import type { Company, Customer, Invoice } from "@/lib/types"

type FullInvoice = (Invoice & { customer?: Customer }) | null
type CompanyResp = Company | null

export default function InvoiceView({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<FullInvoice>(null)
  const [company, setCompany] = useState<CompanyResp>(null)

  useEffect(() => {
    ;(async () => {
      const [inv, comp] = await Promise.all([
        fetch(`/api/invoices/${params.id}`).then((r) => r.json()),
        fetch("/api/company").then((r) => r.json()),
      ])
      setInvoice(inv)
      setCompany(comp)
    })()
  }, [params.id])

  if (!invoice) {
    return (
      <div style={{ backgroundColor: "#F1E9DE", minHeight: "100svh" }}>
        <TopNav appName="PulaFlow" />
        <main className="mx-auto max-w-3xl px-4 py-8">Loading...</main>
      </div>
    )
  }

  const subtotal = invoice.line_items.reduce((s, li) => s + li.quantity * li.unit_price, 0)
  const tax = subtotal * ((invoice.tax_rate_applied ?? 0) / 100)
  const total = subtotal + tax

  return (
    <div style={{ backgroundColor: "#F1E9DE", minHeight: "100svh" }}>
      <TopNav appName="PulaFlow" />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card className="rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6" }}>
          <CardContent className="p-6 space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <h1 className="text-2xl" style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
                  Invoice {invoice.invoice_number}
                </h1>
                <p className="text-sm" style={{ color: "#10263F" }}>
                  Issue: {invoice.issue_date} • Due: {invoice.due_date}
                </p>
              </div>
              <div className="sm:ml-auto text-right">
                <div className="text-sm font-medium" style={{ color: "#10263F" }}>
                  {company?.company_name || "Your Company"}
                </div>
                <div className="text-xs" style={{ color: "#10263F" }}>
                  {company?.address}
                </div>
                <div className="text-xs" style={{ color: "#10263F" }}>
                  Reg: {company?.registration_number}
                </div>
                <div className="text-xs" style={{ color: "#10263F" }}>
                  Phone: {company?.contact_phone}
                </div>
              </div>
            </header>
            <section>
              <div className="text-sm" style={{ color: "#10263F" }}>
                Bill To: <span className="font-medium">{invoice.customer?.name}</span>
              </div>
              <div className="text-xs" style={{ color: "#10263F" }}>
                {invoice.customer?.email} • {invoice.customer?.phone_number}
              </div>
            </section>
            <section className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: "#10263F" }}>
                    <th className="text-left py-2">Description</th>
                    <th className="text-left py-2">Qty</th>
                    <th className="text-left py-2">Unit Price</th>
                    <th className="text-left py-2">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.line_items.map((li) => {
                    const line = li.quantity * li.unit_price
                    return (
                      <tr key={li.id} style={{ color: "#10263F" }}>
                        <td className="py-1">{li.description}</td>
                        <td className="py-1">{li.quantity}</td>
                        <td className="py-1">
                          <Money value={li.unit_price} />
                        </td>
                        <td className="py-1">
                          <Money value={line} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </section>
            <section className="flex justify-end">
              <div className="text-sm space-y-1" style={{ color: "#10263F" }}>
                <div>
                  Subtotal: <Money value={subtotal} />
                </div>
                <div>
                  VAT ({invoice.tax_rate_applied}%): <Money value={tax} />
                </div>
                <div className="font-semibold">
                  Total: <Money value={total} />
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
