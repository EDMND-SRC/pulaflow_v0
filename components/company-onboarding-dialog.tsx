"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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

export default function CompanyOnboardingDialog() {
  const [company, setCompany] = useState<Company>(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      const c = await fetch("/api/company").then((r) => r.json())
      setCompany(c)
      const seen = localStorage.getItem("pf_onboarded") === "1"
      const incomplete =
        !c ||
        !c.company_name ||
        !c.address ||
        !c.contact_phone ||
        !c.registration_number ||
        typeof c.default_tax_rate !== "number" ||
        c.invoice_prefix?.length === 0
      if (!seen || incomplete) setOpen(true)
    })()
  }, [])

  const change = (k: keyof NonNullable<Company>, v: string) => {
    setCompany((c) => (c ? ({ ...c, [k]: v } as NonNullable<Company>) : c))
  }

  const canSave = useMemo(() => {
    const c = company
    if (!c) return false
    return (
      c.company_name &&
      c.address &&
      c.contact_phone &&
      c.registration_number &&
      c.invoice_prefix &&
      c.default_tax_rate !== undefined &&
      c.default_tax_rate !== null &&
      String(c.default_tax_rate) !== ""
    )
  }, [company])

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
    localStorage.setItem("pf_onboarded", "1")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl rounded-2xl" style={{ backgroundColor: "#FFF9F0", borderColor: "#E0D4C6" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
            Complete your Company Profile
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm" style={{ color: "#10263F" }}>
          Please fill all fields to comply with BURS and enable invoice numbering.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="rounded-xl bg-transparent"
            onClick={() => setOpen(false)}
            style={{ borderColor: "#A66E3A", color: "#A66E3A" }}
          >
            Later
          </Button>
          <Button
            disabled={!canSave || saving}
            className="rounded-xl"
            onClick={save}
            style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
