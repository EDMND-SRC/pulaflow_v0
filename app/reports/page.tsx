"use client"

import TopNav from "@/components/top-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useEffect, useMemo, useState } from "react"
import type { Invoice, Expense } from "@/lib/types"
import { Money } from "@/components/money"
import jsPDF from "jspdf"

export default function ReportsPage() {
  const [start, setStart] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().slice(0, 10)
  })
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10))
  const [invoices, setInvoices] = useState<(Invoice & { customer?: { name: string } })[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    ;(async () => {
      const [inv, exp] = await Promise.all([
        fetch("/api/invoices").then((r) => r.json()),
        fetch("/api/expenses").then((r) => r.json()),
      ])
      setInvoices(inv)
      setExpenses(exp)
    })()
  }, [])

  const summary = useMemo(() => {
    const inRange = (iso: string) => iso >= start && iso <= end
    let sales = 0
    let vat = 0
    let expenseTotal = 0
    for (const inv of invoices) {
      if (!inRange(inv.issue_date)) continue
      // Count Paid and Sent for VAT purposes; adjust per policy as needed
      if (
        inv.status === "Paid" ||
        inv.status === "Sent" ||
        inv.status === "Payment Pending" ||
        inv.status === "Draft"
      ) {
        const subtotal = inv.line_items.reduce((s, li) => s + li.quantity * li.unit_price, 0)
        const tax = subtotal * ((inv.tax_rate_applied ?? 0) / 100)
        const total = subtotal + tax
        sales += total
        vat += tax
      }
    }
    for (const e of expenses) {
      if (!e.date || !inRange(e.date)) continue
      expenseTotal += e.amount
    }
    return { sales, vat, expenseTotal }
  }, [invoices, expenses, start, end])

  const downloadCSV = () => {
    const rows = [
      ["VAT Summary for BURS"],
      ["From", start, "To", end],
      [],
      ["Total Sales", summary.sales.toFixed(2)],
      ["Total VAT Collected", summary.vat.toFixed(2)],
      ["Total Expenses", summary.expenseTotal.toFixed(2)],
    ]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vat-summary_${start}_${end}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("VAT Summary for BURS", 14, 18)
    doc.setFontSize(11)
    doc.text(`From: ${start}   To: ${end}`, 14, 26)
    doc.text(`Total Sales: ${summary.sales.toFixed(2)} BWP`, 14, 38)
    doc.text(`Total VAT Collected: ${summary.vat.toFixed(2)} BWP`, 14, 46)
    doc.text(`Total Expenses: ${summary.expenseTotal.toFixed(2)} BWP`, 14, 54)
    doc.save(`vat-summary_${start}_${end}.pdf`)
  }

  return (
    <div style={{ backgroundColor: "#F1E9DE", minHeight: "100svh" }}>
      <TopNav appName="PulaFlow" />
      <main className="mx-auto max-w-4xl px-4 py-4 md:py-8">
        <h1 className="text-xl md:text-2xl mb-4" style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
          Reports
        </h1>

        <Card className="rounded-2xl" style={{ backgroundColor: "#FFF9F0", borderColor: "#E0D4C6" }}>
          <CardHeader>
            <CardTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
              VAT Summary for BURS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label style={{ color: "#10263F" }}>From</Label>
                <Input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="rounded-xl"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                />
              </div>
              <div className="space-y-1">
                <Label style={{ color: "#10263F" }}>To</Label>
                <Input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="rounded-xl"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={downloadCSV}
                  variant="outline"
                  className="rounded-xl bg-transparent w-full md:w-auto"
                  style={{ borderColor: "#18A0C9", color: "#18A0C9" }}
                >
                  Download CSV
                </Button>
                <Button
                  onClick={downloadPDF}
                  className="rounded-xl w-full md:w-auto"
                  style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}
                >
                  Download PDF
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl p-3" style={{ backgroundColor: "#FDF8F3", border: "1px solid #E0D4C6" }}>
                <div className="text-xs" style={{ color: "#10263F" }}>
                  Total Sales
                </div>
                <div className="text-2xl" style={{ color: "#10263F" }}>
                  <Money value={summary.sales} />
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: "#FDF8F3", border: "1px solid #E0D4C6" }}>
                <div className="text-xs" style={{ color: "#10263F" }}>
                  Total VAT Collected
                </div>
                <div className="text-2xl" style={{ color: "#10263F" }}>
                  <Money value={summary.vat} />
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: "#FDF8F3", border: "1px solid #E0D4C6" }}>
                <div className="text-xs" style={{ color: "#10263F" }}>
                  Total Expenses
                </div>
                <div className="text-2xl" style={{ color: "#C62828" }}>
                  <Money value={summary.expenseTotal} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
