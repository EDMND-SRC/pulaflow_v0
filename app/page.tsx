"use client"

import TopNav from "@/components/top-nav"
import CompanyOnboardingDialog from "@/components/company-onboarding-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { Money } from "@/components/money"
import Link from "next/link"
import type { Invoice, Expense } from "@/lib/types"
import { useRouter } from "next/navigation"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function Page() {
  const [invoices, setInvoices] = useState<(Invoice & { customer?: { name: string; email?: string } })[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const inv = await fetch("/api/invoices").then((r) => r.json())
      const exp = await fetch("/api/expenses").then((r) => r.json())
      setInvoices(inv)
      setExpenses(exp)
    })()
  }, [])

  const metrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    let outstanding = 0
    let overdue = 0
    let paid30 = 0
    let exp30 = 0
    const d30 = new Date()
    d30.setDate(d30.getDate() - 30)
    const d30ISO = d30.toISOString().slice(0, 10)

    for (const inv of invoices) {
      const subtotal = inv.line_items.reduce((s, li) => s + li.quantity * li.unit_price, 0)
      const tax = subtotal * ((inv.tax_rate_applied ?? 0) / 100)
      const total = subtotal + tax
      if (inv.status !== "Paid") outstanding += total
      if (inv.due_date < today && inv.status !== "Paid") overdue += total
      if (inv.status === "Paid" && inv.issue_date >= d30ISO) paid30 += total
    }
    for (const e of expenses) {
      if (!e.date || e.date >= d30ISO) exp30 += e.amount
    }
    const net30 = paid30 - exp30
    return { outstanding, overdue, net30 }
  }, [invoices, expenses])

  // 6-month Income vs Expenses
  const chartData = useMemo(() => {
    const map = new Map<string, { month: string; income: number; expenses: number }>()
    const add = (key: string) => {
      if (!map.has(key)) map.set(key, { month: key, income: 0, expenses: 0 })
      return map.get(key)!
    }
    const toKey = (iso: string) => {
      const [y, m] = iso.split("-")
      return `${y}-${m}`
    }
    const now = new Date()
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      add(key)
    }
    for (const inv of invoices) {
      if (inv.status !== "Paid") continue
      const key = toKey(inv.issue_date)
      if (map.has(key)) {
        const subtotal = inv.line_items.reduce((s, li) => s + li.quantity * li.unit_price, 0)
        const tax = subtotal * ((inv.tax_rate_applied ?? 0) / 100)
        const total = subtotal + tax
        add(key).income += total
      }
    }
    for (const e of expenses) {
      const key = toKey(e.date)
      if (map.has(key)) add(key).expenses += e.amount
    }
    const arr = Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month))
    // Format month labels to "MMM"
    return arr.map((r) => {
      const [y, m] = r.month.split("-")
      const date = new Date(Number(y), Number(m) - 1, 1)
      return { ...r, month: date.toLocaleString("en-US", { month: "short" }) }
    })
  }, [invoices, expenses])

  const overdueList = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return invoices
      .filter((i) => i.due_date < today && i.status !== "Paid")
      .map((inv) => {
        const subtotal = inv.line_items.reduce((s, li) => s + li.quantity * li.unit_price, 0)
        const total = subtotal * (1 + (inv.tax_rate_applied ?? 0) / 100)
        return { ...inv, amount: total }
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }, [invoices])

  const remind = async (id: string) => {
    await fetch(`/api/invoices/${id}/remind`, { method: "POST" })
    alert("Reminder sent.")
  }

  return (
    <div style={{ backgroundColor: "#F1E9DE", minHeight: "100svh" }}>
      <TopNav appName="PulaFlow" />
      <CompanyOnboardingDialog />
      <main className="mx-auto max-w-6xl px-4 py-4 md:py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <h1 className="text-xl md:text-2xl" style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
            Dashboard
          </h1>
          <div className="ml-0 sm:ml-auto flex gap-2">
            <Button
              onClick={() => router.push("/invoices?new=1")}
              className="rounded-xl"
              style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}
            >
              + New Invoice
            </Button>
            <Button
              onClick={() => router.push("/expenses?new=1")}
              variant="outline"
              className="rounded-xl bg-transparent"
              style={{ borderColor: "#A66E3A", color: "#A66E3A" }}
            >
              + New Expense
            </Button>
          </div>
        </div>

        <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="rounded-2xl" style={{ backgroundColor: "#FFF9F0", borderColor: "#E0D4C6" }}>
            <CardHeader>
              <CardTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }} className="text-base">
                Total Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl md:text-4xl" style={{ color: "#10263F" }}>
              <Money value={metrics.outstanding} />
            </CardContent>
          </Card>
          <Card className="rounded-2xl" style={{ backgroundColor: "#FFF9F0", borderColor: "#E0D4C6" }}>
            <CardHeader>
              <CardTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }} className="text-base">
                Total Overdue
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl md:text-4xl" style={{ color: "#C62828" }}>
              <Money value={metrics.overdue} />
            </CardContent>
          </Card>
          <Card className="rounded-2xl" style={{ backgroundColor: "#FFF9F0", borderColor: "#E0D4C6" }}>
            <CardHeader>
              <CardTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }} className="text-base">
                Net Profit (30d)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl md:text-4xl" style={{ color: "#2E7D32" }}>
              <Money value={metrics.net30} />
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="rounded-2xl lg:col-span-2" style={{ backgroundColor: "#FFF9F0", borderColor: "#E0D4C6" }}>
            <CardHeader>
              <CardTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }} className="text-base">
                Income vs. Expenses (last 6 months)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ChartContainer
                config={{
                  income: { label: "Income", color: "hsl(var(--chart-1))" },
                  expenses: { label: "Expenses", color: "hsl(var(--chart-2))" },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="income" fill="var(--color-income)" name="Income" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expenses" fill="var(--color-expenses)" name="Expenses" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl" style={{ backgroundColor: "#FFF9F0", borderColor: "#E0D4C6" }}>
            <CardHeader>
              <CardTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }} className="text-base">
                Top Overdue Invoices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overdueList.length === 0 && (
                <p className="text-sm" style={{ color: "#10263F" }}>
                  No overdue invoices.
                </p>
              )}
              {overdueList.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{ backgroundColor: "#FDF8F3", border: "1px solid #E0D4C6" }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm" style={{ color: "#10263F" }}>
                      <span className="font-medium">{inv.invoice_number}</span>{" "}
                      <span className="text-xs opacity-70">• {inv.customer?.name ?? "Customer"}</span>
                    </div>
                    <div className="text-xs opacity-70" style={{ color: "#10263F" }}>
                      Due {inv.due_date}
                    </div>
                  </div>
                  <div className="text-sm" style={{ color: "#10263F" }}>
                    <Money value={inv.amount} />
                  </div>
                  <Button
                    onClick={() => remind(inv.id)}
                    variant="outline"
                    className="rounded-lg bg-transparent"
                    style={{ borderColor: "#18A0C9", color: "#18A0C9" }}
                  >
                    Send Reminder
                  </Button>
                </div>
              ))}
              <div className="pt-1">
                <Link href="/invoices" className="text-sm underline" style={{ color: "#18A0C9" }}>
                  View all invoices
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
