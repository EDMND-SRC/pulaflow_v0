import type React from "react"
import ClerkProviderClient from "@/components/auth/clerk-provider"

// Server component: read env on the server and pass to the client wrapper
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ""
  return <ClerkProviderClient publishableKey={pk}>{children}</ClerkProviderClient>
}
