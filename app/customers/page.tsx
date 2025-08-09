"use client"

import TopNav from "@/components/top-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"
import type { Customer } from "@/lib/types"

export default function CustomersPage() {
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [form, setForm] = useState({ name: "", email: "", phone_number: "" })
  const [edit, setEdit] = useState<Customer | null>(null)

  const load = async () => {
    const data = await fetch("/api/customers").then((r) => r.json())
    setCustomers(data)
  }
  useEffect(() => {
    load()
  }, [])

  const submit = async () => {
    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setOpen(false)
    setForm({ name: "", email: "", phone_number: "" })
    await load()
  }

  const startEdit = (c: Customer) => {
    setEdit(c)
    setEditOpen(true)
  }
  const saveEdit = async () => {
    if (!edit) return
    await fetch(`/api/customers/${edit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: edit.name, email: edit.email, phone_number: edit.phone_number }),
    })
    setEditOpen(false)
    setEdit(null)
    await load()
  }
  const remove = async (id: string) => {
    await fetch(`/api/customers/${id}`, { method: "DELETE" })
    await load()
  }

  return (
    <div style={{ backgroundColor: "#F1E9DE", minHeight: "100svh" }}>
      <TopNav appName="PulaFlow" />
      <main className="mx-auto max-w-6xl px-4 py-4 md:py-8">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl" style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
            Customers
          </h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="ml-auto rounded-xl" style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}>
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl" style={{ backgroundColor: "#FFF9F0", borderColor: "#E0D4C6" }}>
              <DialogHeader>
                <DialogTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
                  New Customer
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label style={{ color: "#10263F" }}>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="rounded-xl"
                    placeholder="Customer name"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                  />
                </div>
                <div className="space-y-2">
                  <Label style={{ color: "#10263F" }}>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="rounded-xl"
                    placeholder="email@example.com"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                  />
                </div>
                <div className="space-y-2">
                  <Label style={{ color: "#10263F" }}>Phone</Label>
                  <Input
                    value={form.phone_number}
                    onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                    className="rounded-xl"
                    placeholder="+267..."
                    style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                  />
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
          <CardHeader>
            <CardTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>All Customers</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ color: "#10263F" }}>Name</TableHead>
                  <TableHead style={{ color: "#10263F" }}>Email</TableHead>
                  <TableHead style={{ color: "#10263F" }}>Phone</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell style={{ color: "#10263F" }}>{c.name}</TableCell>
                    <TableCell style={{ color: "#10263F" }}>{c.email}</TableCell>
                    <TableCell style={{ color: "#10263F" }}>{c.phone_number}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          className="rounded-lg bg-transparent"
                          onClick={() => startEdit(c)}
                          style={{ borderColor: "#18A0C9", color: "#18A0C9" }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="rounded-lg"
                          onClick={() => remove(c.id)}
                          style={{ color: "#C62828" }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="rounded-2xl" style={{ backgroundColor: "#FFF9F0", borderColor: "#E0D4C6" }}>
            <DialogHeader>
              <DialogTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
                Edit Customer
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label style={{ color: "#10263F" }}>Name</Label>
                <Input
                  value={edit?.name ?? ""}
                  onChange={(e) => setEdit((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                  className="rounded-xl"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                />
              </div>
              <div className="space-y-2">
                <Label style={{ color: "#10263F" }}>Email</Label>
                <Input
                  type="email"
                  value={edit?.email ?? ""}
                  onChange={(e) => setEdit((prev) => (prev ? { ...prev, email: e.target.value } : prev))}
                  className="rounded-xl"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                />
              </div>
              <div className="space-y-2">
                <Label style={{ color: "#10263F" }}>Phone</Label>
                <Input
                  value={edit?.phone_number ?? ""}
                  onChange={(e) => setEdit((prev) => (prev ? { ...prev, phone_number: e.target.value } : prev))}
                  className="rounded-xl"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="rounded-xl bg-transparent"
                onClick={() => setEditOpen(false)}
                style={{ borderColor: "#A66E3A", color: "#A66E3A" }}
              >
                Cancel
              </Button>
              <Button
                className="rounded-xl"
                onClick={saveEdit}
                style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
