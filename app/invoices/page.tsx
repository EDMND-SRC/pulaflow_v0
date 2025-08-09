"use client"

import TopNav from "@/components/top-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useMemo, useState } from "react"
import { Money } from "@/components/money"
import { StatusBadge } from "@/components/status-badge"
import { Trash2 } from "lucide-react"
import type { Customer, Invoice, InvoiceLineItem } from "@/lib/types"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function InvoicesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoices, setInvoices] = useState<(Invoice & { customer?: Customer })[]>([])
  const [open, setOpen] = useState(false)
  const sp = useSearchParams()

  const load = async () => {
    const [cs, inv] = await Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
    ])
    setCustomers(cs)
    setInvoices(inv)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (sp.get("new") === "1") setOpen(true)
  }, [sp])

  const [form, setForm] = useState<{
    customer_id?: string
    issue_date: string
    due_date: string
    tax_rate_applied?: number
    line_items: InvoiceLineItem[]
  }>({
    customer_id: undefined,
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    tax_rate_applied: undefined,
    line_items: [{ id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0 }],
  })

  const totals = useMemo(() => {
    const subtotal = form.line_items.reduce((s, li) => s + (Number(li.quantity) || 0) * (Number(li.unit_price) || 0), 0)
    const taxRate = (form.tax_rate_applied ?? 0) / 100
    const tax = subtotal * taxRate
    return { subtotal, tax, total: subtotal + tax }
  }, [form])

  const submit = async () => {
    if (!form.customer_id) return
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setOpen(false)
      await load()
      setForm({
        customer_id: undefined,
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        tax_rate_applied: undefined,
        line_items: [{ id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0 }],
      })
    }
  }

  const setLineItem = (id: string, patch: Partial<InvoiceLineItem>) => {
    setForm((f) => ({
      ...f,
      line_items: f.line_items.map((li) => (li.id === id ? { ...li, ...patch } : li)),
    }))
  }

  const addLineItem = () => {
    setForm((f) => ({
      ...f,
      line_items: [...f.line_items, { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0 }],
    }))
  }

  const delLineItem = (id: string) => {
    setForm((f) => ({ ...f, line_items: f.line_items.filter((li) => li.id !== id) }))
  }

  const mark = async (id: string, status: "Sent" | "Payment Pending" | "Paid") => {
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    await load()
  }

  const remove = async (id: string) => {
    await fetch(`/api/invoices/${id}`, { method: "DELETE" })
    await load()
  }

  return (
    <div style={{ backgroundColor: "#F1E9DE", minHeight: "100svh" }}>
      <TopNav appName="PulaFlow" />
      <main className="mx-auto max-w-6xl px-4 py-4 md:py-8">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl" style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
            Invoices
          </h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="ml-auto rounded-xl" style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}>
                + New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl rounded-2xl"
              style={{ backgroundColor: "#FFF9F0", borderColor: "#E0D4C6" }}
            >
              <DialogHeader>
                <DialogTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
                  Create Invoice
                </DialogTitle>
                <p className="text-xs" style={{ color: "#10263F" }}>
                  Number is auto-generated from your company prefix when saved.
                </p>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label style={{ color: "#10263F" }}>Customer</Label>
                  <Select onValueChange={(v) => setForm((f) => ({ ...f, customer_id: v }))}>
                    <SelectTrigger
                      className="rounded-xl"
                      style={{ backgroundColor: "#FDF8F3", borderColor: "#E0D4C6", color: "#10263F" }}
                    >
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label style={{ color: "#10263F" }}>Issue date</Label>
                  <Input
                    type="date"
                    className="rounded-xl"
                    value={form.issue_date}
                    onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))}
                    style={{ backgroundColor: "#FDF8F3", borderColor: "#E0D4C6", color: "#10263F" }}
                  />
                </div>
                <div className="space-y-2">
                  <Label style={{ color: "#10263F" }}>Due date</Label>
                  <Input
                    type="date"
                    className="rounded-xl"
                    value={form.due_date}
                    onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                    style={{ backgroundColor: "#FDF8F3", borderColor: "#E0D4C6", color: "#10263F" }}
                  />
                </div>
                <div className="space-y-2">
                  <Label style={{ color: "#10263F" }}>Tax rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Default from settings"
                    className="rounded-xl"
                    value={form.tax_rate_applied?.toString() ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        tax_rate_applied: e.target.value === "" ? undefined : Number(e.target.value),
                      }))
                    }
                    style={{ backgroundColor: "#FDF8F3", borderColor: "#E0D4C6", color: "#10263F" }}
                  />
                </div>
              </div>

              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium" style={{ color: "#10263F" }}>
                    Line items
                  </h3>
                  <Button
                    variant="outline"
                    className="rounded-xl bg-transparent"
                    style={{ borderColor: "#A66E3A", color: "#A66E3A" }}
                    onClick={addLineItem}
                  >
                    Add item
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.line_items.map((li) => (
                    <div
                      key={li.id}
                      className="grid grid-cols-12 gap-2 rounded-xl p-2"
                      style={{ backgroundColor: "#FDF8F3", border: "1px solid #E0D4C6" }}
                    >
                      <div className="col-span-12 md:col-span-6">
                        <Input
                          placeholder="Description"
                          className="rounded-xl"
                          value={li.description}
                          onChange={(e) => setLineItem(li.id, { description: e.target.value })}
                          style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <Input
                          type="number"
                          min={0}
                          className="rounded-xl"
                          value={li.quantity}
                          onChange={(e) => setLineItem(li.id, { quantity: Number(e.target.value) })}
                          style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          className="rounded-xl"
                          value={li.unit_price}
                          onChange={(e) => setLineItem(li.id, { unit_price: Number(e.target.value) })}
                          style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                        />
                      </div>
                      <div className="col-span-12 md:col-span-1 flex items-center justify-end">
                        <Button
                          variant="ghost"
                          className="rounded-lg"
                          onClick={() => delLineItem(li.id)}
                          aria-label="Remove line item"
                          style={{ color: "#C62828" }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm" style={{ color: "#10263F" }}>
                  <div>
                    Subtotal: <Money value={totals.subtotal} />
                  </div>
                  <div>
                    VAT: <Money value={totals.tax} />
                  </div>
                  <div className="font-semibold">
                    Total: <Money value={totals.total} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl bg-transparent"
                    onClick={() => setOpen(false)}
                    style={{ borderColor: "#A66E3A", color: "#A66E3A" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="rounded-xl"
                    onClick={submit}
                    style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mt-4 rounded-2xl" style={{ backgroundColor: "#FFF9F0", borderColor: "#E0D4C6" }}>
          <CardHeader>
            <CardTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>All Invoices</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ color: "#10263F" }}>Number</TableHead>
                  <TableHead style={{ color: "#10263F" }}>Customer</TableHead>
                  <TableHead style={{ color: "#10263F" }}>Issue</TableHead>
                  <TableHead style={{ color: "#10263F" }}>Due</TableHead>
                  <TableHead style={{ color: "#10263F" }}>Total</TableHead>
                  <TableHead style={{ color: "#10263F" }}>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => {
                  const subtotal = inv.line_items.reduce((s, li) => s + li.quantity * li.unit_price, 0)
                  const total = subtotal * (1 + (inv.tax_rate_applied ?? 0) / 100)
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium" style={{ color: "#10263F" }}>
                        <Link href={`/invoices/${inv.id}`} className="underline" style={{ color: "#18A0C9" }}>
                          {inv.invoice_number}
                        </Link>
                      </TableCell>
                      <TableCell style={{ color: "#10263F" }}>{inv.customer?.name ?? "-"}</TableCell>
                      <TableCell style={{ color: "#10263F" }}>{inv.issue_date}</TableCell>
                      <TableCell style={{ color: "#10263F" }}>{inv.due_date}</TableCell>
                      <TableCell style={{ color: "#10263F" }}>
                        <Money value={total} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            className="rounded-lg bg-transparent"
                            onClick={() => mark(inv.id, "Sent")}
                            style={{ borderColor: "#A66E3A", color: "#A66E3A" }}
                          >
                            Send
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-lg bg-transparent"
                            onClick={() => mark(inv.id, "Payment Pending")}
                            style={{ borderColor: "#18A0C9", color: "#18A0C9" }}
                          >
                            Mobi Pay
                          </Button>
                          <Button
                            className="rounded-lg"
                            onClick={() => mark(inv.id, "Paid")}
                            style={{ backgroundColor: "#2E7D32", color: "#FFFFFF" }}
                          >
                            Mark Paid
                          </Button>
                          <Button
                            variant="ghost"
                            className="rounded-lg"
                            onClick={() => remove(inv.id)}
                            style={{ color: "#C62828" }}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
