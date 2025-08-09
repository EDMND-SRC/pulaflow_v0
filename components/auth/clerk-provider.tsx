"use client"

import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"

export default function ClerkProviderClient({
  publishableKey,
  children,
}: {
  publishableKey: string
  children: React.ReactNode
}) {
  if (!publishableKey) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 text-center">
        <p className="text-sm">{"Clerk is not configured. Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY on the server."}</p>
      </div>
    )
  }
  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
}
