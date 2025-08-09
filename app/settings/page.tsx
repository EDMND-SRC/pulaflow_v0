"use client"

import TopNav from "@/components/top-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

type Company = {
  id: string
  user_id: string
  company_name: string
  address: string
  contact_phone: string
  registration_number: string
  default_tax_rate: number
  invoice_prefix: string
} | null

export default function SettingsPage() {
  const [company, setCompany] = useState<Company>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const c = await fetch("/api/company").then((r) => r.json())
    setCompany(c)
  }
  useEffect(() => {
    load()
  }, [])

  const change = (k: keyof NonNullable<Company>, v: string) => {
    setCompany((c) => (c ? ({ ...c, [k]: v } as NonNullable<Company>) : c))
  }

  const save = async () => {
    setSaving(true)
    await fetch("/api/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: company?.company_name ?? "",
        address: company?.address ?? "",
        contact_phone: company?.contact_phone ?? "",
        registration_number: company?.registration_number ?? "",
        default_tax_rate: Number(company?.default_tax_rate ?? 0),
        invoice_prefix: company?.invoice_prefix ?? "INV",
      }),
    })
    setSaving(false)
    await load()
  }

  return (
    <div style={{ backgroundColor: "#F1E9DE", minHeight: "100svh" }}>
      <TopNav appName="PulaFlow" />
      <main className="mx-auto max-w-4xl px-4 py-4 md:py-8">
        <h1 className="text-xl md:text-2xl mb-4" style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
          Company
        </h1>
        <Card className="rounded-2xl" style={{ backgroundColor: "#FFF9F0", borderColor: "#E0D4C6" }}>
          <CardHeader>
            <CardTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
              Profile & Tax Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label style={{ color: "#10263F" }}>Company name</Label>
              <Input
                value={company?.company_name ?? ""}
                onChange={(e) => change("company_name", e.target.value)}
                className="rounded-xl"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "#10263F" }}>Contact phone</Label>
              <Input
                value={company?.contact_phone ?? ""}
                onChange={(e) => change("contact_phone", e.target.value)}
                className="rounded-xl"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label style={{ color: "#10263F" }}>Address</Label>
              <Input
                value={company?.address ?? ""}
                onChange={(e) => change("address", e.target.value)}
                className="rounded-xl"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "#10263F" }}>Registration number</Label>
              <Input
                value={company?.registration_number ?? ""}
                onChange={(e) => change("registration_number", e.target.value)}
                className="rounded-xl"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "#10263F" }}>Default tax rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={company?.default_tax_rate?.toString() ?? ""}
                onChange={(e) => change("default_tax_rate", e.target.value)}
                className="rounded-xl"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "#10263F" }}>Invoice prefix</Label>
              <Input
                value={company?.invoice_prefix ?? ""}
                onChange={(e) => change("invoice_prefix", e.target.value)}
                className="rounded-xl"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button
                className="rounded-xl"
                disabled={saving}
                onClick={save}
                style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
        <p className="text-xs mt-3" style={{ color: "#10263F" }}>
          Ensure your tax rate and invoice numbering align with BURS requirements. This app keeps VAT separated and
          applies your default rate to new invoices.
        </p>
      </main>
    </div>
  )
}
