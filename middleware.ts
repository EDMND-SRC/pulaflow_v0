import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware({
  publicRoutes: [
    "/",
    "/login",
    "/register",
    "/p/(.*)",
    "/api/webhooks/(.*)",
    "/api/auth/register-initiate",
    "/api/auth/register-complete",
    // Keep existing public API routes for demo
    "/api/(.*)",
  ],
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/"],
}
