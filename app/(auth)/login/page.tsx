"use client"

import { SignIn } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-svh flex items-center justify-center px-4" style={{ backgroundColor: "#F1E9DE" }}>
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: "#FFF9F0", border: "1px solid #E0D4C6" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Image src="/images/pulaflow-logo.png" alt="PulaFlow logo" width={36} height={36} className="h-9 w-9" />
          <span style={{ color: "#10263F", fontFamily: "Poppins, ui-sans-serif" }} className="text-xl font-semibold">
            PulaFlow
          </span>
        </div>
        <SignIn routing="hash" />
        <p className="mt-4 text-sm" style={{ color: "#10263F" }}>
          New here?{" "}
          <Link href="/register" className="underline" style={{ color: "#18A0C9" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
