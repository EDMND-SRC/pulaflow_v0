"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function PayOrangeButton({
  invoiceId,
  msisdn,
}: {
  invoiceId: string
  msisdn?: string
}) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pay = async () => {
    setLoading(true)
    setError(null)
    setMsg(null)
    try {
      const res = await fetch("/api/payments/orange/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, msisdn }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Payment initiation failed.")
      setMsg(data.message || "Approve the Orange Money request on your phone.")
      // If a redirect URL is returned by your Orange API, you may navigate:
      // if (data.gateway?.payment_url) window.location.href = data.gateway.payment_url
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        disabled={loading}
        onClick={pay}
        className="w-full md:w-auto rounded-xl text-base px-6 py-6"
        style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}
      >
        {loading ? "Starting Orange Money..." : "Pay with Orange Money"}
      </Button>
      {msg && (
        <p className="text-sm" style={{ color: "#10263F" }}>
          {msg}
        </p>
      )}
      {error && (
        <p className="text-sm" style={{ color: "#C62828" }}>
          {error}
        </p>
      )}
    </div>
  )
}
