"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

type Step = "details" | "otp" | "success"

export default function RegisterForm() {
  const [step, setStep] = useState<Step>("details")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tx, setTx] = useState<string | null>(null)
  const [form, setForm] = useState({ email: "", password: "", phone: "" })
  const [otp, setOtp] = useState("")

  const isOrangeBW = (p: string) => /^\+2677\d{7}$/.test(p.trim())

  const start = async () => {
    setError(null)
    if (!form.email || !form.password || !form.phone) {
      setError("All fields are required.")
      return
    }
    if (!isOrangeBW(form.phone)) {
      setError("Enter a valid Orange Botswana number starting with +2677.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register-initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to start verification.")
      setTx(data.transactionId)
      setStep("otp")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const complete = async () => {
    setError(null)
    if (!tx) return
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, otp, transactionId: tx }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to complete registration.")
      setStep("success")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [step])

  return (
    <div className="min-h-svh flex items-center justify-center px-4" style={{ backgroundColor: "#F1E9DE" }}>
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: "#FFF9F0", border: "1px solid #E0D4C6" }}
        aria-live="polite"
      >
        <div className="flex items-center gap-2 mb-4">
          <Image src="/images/pulaflow-logo.png" alt="PulaFlow logo" width={36} height={36} className="h-9 w-9" />
          <span style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }} className="text-xl font-semibold">
            PulaFlow
          </span>
        </div>

        {step === "details" && (
          <>
            <h1 className="text-lg mb-2" style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
              Create your account
            </h1>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label style={{ color: "#10263F" }}>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="rounded-xl"
                  placeholder="you@example.com"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                />
              </div>
              <div className="space-y-1">
                <Label style={{ color: "#10263F" }}>Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="rounded-xl"
                  placeholder="••••••••"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                />
              </div>
              <div className="space-y-1">
                <Label style={{ color: "#10263F" }}>Orange Botswana Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="rounded-xl"
                  placeholder="+2677xxxxxxx"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E0D4C6", color: "#10263F" }}
                />
                <p className="text-xs" style={{ color: "#10263F" }}>
                  We'll send a one-time PIN (OTP) to this number to verify it.
                </p>
              </div>
              {error && (
                <p className="text-sm" style={{ color: "#C62828" }}>
                  {error}
                </p>
              )}
              <Button
                disabled={loading}
                onClick={start}
                className="w-full rounded-xl"
                style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}
              >
                {loading ? "Sending OTP..." : "Continue"}
              </Button>
              <p className="text-sm" style={{ color: "#10263F" }}>
                Already have an account?{" "}
                <Link href="/login" className="underline" style={{ color: "#18A0C9" }}>
                  Log in
                </Link>
              </p>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="text-lg mb-2" style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }}>
              Verify your phone
            </h1>
            <p className="text-sm mb-3" style={{ color: "#10263F" }}>
              Enter the OTP sent to {form.phone}.
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label style={{ color: "#10263F" }}>OTP Code</Label>
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="rounded-xl tracking-widest"
                />
              </div>
              {error && (
                <p className="text-sm" style={{ color: "#C62828" }}>
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl bg-transparent w-1/3"
                  onClick={() => setStep("details")}
                  style={{ borderColor: "#A66E3A", color: "#A66E3A" }}
                >
                  Back
                </Button>
                <Button
                  disabled={loading}
                  onClick={complete}
                  className="rounded-xl flex-1"
                  style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}
                >
                  {loading ? "Verifying..." : "Create Account"}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="text-center">
            <h1 className="text-lg mb-2" style={{ color: "#2E7D32", fontFamily: "Poppins, ui-sans-serif" }}>
              Account created!
            </h1>
            <p className="text-sm mb-4" style={{ color: "#10263F" }}>
              You can now log in to PulaFlow.
            </p>
            <Link href="/login">
              <Button className="w-full rounded-xl" style={{ backgroundColor: "#D07A27", color: "#FDF8F3" }}>
                Go to Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
