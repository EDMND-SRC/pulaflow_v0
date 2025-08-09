"use client"

import TopNav from "@/components/top-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useMemo, useState } from "react"
import { Money } from "@/components/money"
import type { Expense } from "@/lib/types"
import { useSearchParams } from "next/navigation"

export default function ExpensesPage() {
  const [open, setOpen] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "",
    receipt_url: "",
    date: new Date().toISOString().slice(0, 10),
  })
  const sp = useSearchParams()

  const load = async () => {
    const data = await fetch("/api/expenses").then((r) => r.json())
    setExpenses(data)
  }
  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (sp.get("new") === "1") setOpen(true)
  }, [sp])

  const submit = async () => {
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: form.description,
        amount: Number(form.amount || 0),
        category: form.category || "General",
        receipt_url: form.receipt_url || "",
        date: form.date,
      }),
    })
    setOpen(false)
    setForm({ description: "", amount: "", category: "", receipt_url: "", date: new Date().toISOString().slice(0, 10) })
    await load()
  }

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses])

  const onFile = async (file: File | undefined | null) => {
    if (!file) return
    // Save as Data URL for demo purposes
    const reader = new FileReader()
    reader.onload = () => {
      setForm((f) => ({ ...f, receipt_url: typeof reader.result === "string" ? reader.result : "" }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ backgroundColor: "#F1E9DE", minHeight: "100svh" }}>
      <TopNav appName="PulaFlow" />
      <main className="mx-auto max-w-6xl px-4 py-4 md:py-8">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl" style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
            Expenses
          </h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="ml-auto rounded-xl" style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}>
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl" style={{ backgroundColor: "#FFF9F0", borderColor: "#E0D4C6" }}>
              <DialogHeader>
                <DialogTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
                  New Expense
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label style={{ color: "#10263F" }}>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="rounded-xl"
                    placeholder="e.g. Fuel"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                  />
                </div>
                <div className="space-y-2">
                  <Label style={{ color: "#10263F" }}>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    className="rounded-xl"
                    placeholder="0.00"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                  />
                </div>
                <div className="space-y-2">
                  <Label style={{ color: "#10263F" }}>Category</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="rounded-xl"
                    placeholder="e.g. Transport"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                  />
                </div>
                <div className="space-y-2">
                  <Label style={{ color: "#10263F" }}>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="rounded-xl"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label style={{ color: "#10263F" }}>Receipt Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onFile(e.target.files?.[0])}
                    className="rounded-xl cursor-pointer"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                  />
                  {form.receipt_url && (
                    <p className="text-xs" style={{ color: "#10263F" }}>
                      Attached ✓
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
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
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mt-4 rounded-2xl" style={{ backgroundColor: "#FFF9F0", borderColor: "#E0D4C6" }}>
          <CardHeader className="flex flex-row items-center">
            <CardTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>All Expenses</CardTitle>
            <div className="ml-auto text-sm" style={{ color: "#10263F" }}>
              Total: <Money value={total} />
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ color: "#10263F" }}>Date</TableHead>
                  <TableHead style={{ color: "#10263F" }}>Description</TableHead>
                  <TableHead style={{ color: "#10263F" }}>Category</TableHead>
                  <TableHead style={{ color: "#10263F" }}>Amount</TableHead>
                  <TableHead style={{ color: "#10263F" }}>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell style={{ color: "#10263F" }}>{e.date}</TableCell>
                    <TableCell style={{ color: "#10263F" }}>{e.description}</TableCell>
                    <TableCell style={{ color: "#10263F" }}>{e.category}</TableCell>
                    <TableCell style={{ color: "#10263F" }}>
                      <Money value={e.amount} />
                    </TableCell>
                    <TableCell style={{ color: "#10263F" }}>
                      {e.receipt_url ? (
                        <a
                          href={e.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                          style={{ color: "#18A0C9" }}
                        >
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
