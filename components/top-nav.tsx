"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"

export default function TopNav({
  appName = "PulaFlow",
}: {
  appName?: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const sp = useSearchParams()

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/invoices", label: "Invoices" },
    { href: "/customers", label: "Customers" },
    { href: "/expenses", label: "Expenses" },
    { href: "/reports", label: "Reports" },
  ]

  const goNewInvoice = () => router.push("/invoices?new=1")
  const goNewExpense = () => router.push("/expenses?new=1")

  return (
    <header
      className="w-full sticky top-0 z-30 border-b"
      style={{ backgroundColor: "#F1E9DE", borderColor: "#E0D4C6" }}
      aria-label="Top navigation"
    >
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-3">
        <button
          aria-label="Open menu"
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2"
          style={{ backgroundColor: "#E7DCCC", color: "#10263F" }}
          onClick={() => setOpen((o) => !o)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/pulaflow-logo.png"
            alt="PulaFlow logo"
            width={32}
            height={32}
            className="h-7 w-7 md:h-8 md:w-8"
            priority
          />
          <span
            className="font-semibold tracking-tight"
            style={{
              color: "#10263F",
              fontFamily: "Poppins, ui-sans-serif, system-ui",
              fontSize: "1.125rem",
            }}
          >
            {appName}
          </span>
        </Link>

        <nav className="ml-2 hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 rounded-lg text-sm"
                style={{
                  color: active ? "#FDF8F3" : "#10263F",
                  backgroundColor: active ? "#D07A27" : "transparent",
                }}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto hidden md:flex items-center gap-2">
          <Button
            onClick={goNewInvoice}
            className="rounded-lg"
            style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}
          >
            + New Invoice
          </Button>
          <Button
            onClick={goNewExpense}
            variant="outline"
            className="rounded-lg bg-transparent"
            style={{ borderColor: "#A66E3A", color: "#A66E3A" }}
          >
            + New Expense
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t" style={{ borderColor: "#E0D4C6" }}>
          <nav className="px-4 py-2 flex flex-col gap-1">
            {links.map((l) => {
              const active = pathname === l.href
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{
                    color: active ? "#FDF8F3" : "#10263F",
                    backgroundColor: active ? "#D07A27" : "transparent",
                  }}
                >
                  {l.label}
                </Link>
              )
            })}
            <div className="mt-2 flex gap-2">
              <Button
                onClick={goNewInvoice}
                className="flex-1 rounded-lg"
                style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}
              >
                + Invoice
              </Button>
              <Button
                onClick={goNewExpense}
                variant="outline"
                className="flex-1 rounded-lg bg-transparent"
                style={{ borderColor: "#A66E3A", color: "#A66E3A" }}
              >
                + Expense
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
