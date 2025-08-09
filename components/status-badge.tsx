import { Badge } from "@/components/ui/badge"

export function StatusBadge({
  status = "Draft",
}: {
  status?: "Draft" | "Sent" | "Paid" | "Payment Pending"
}) {
  let bg = "#E7DCCC"
  let fg = "#10263F"
  if (status === "Paid") {
    bg = "#E5F3E6"
    fg = "#2E7D32"
  } else if (status === "Sent") {
    bg = "#FFEFE2"
    fg = "#A66E3A"
  } else if (status === "Payment Pending") {
    bg = "#E0F6FD"
    fg = "#0D6E86"
  }

  return (
    <Badge
      className="rounded-full px-3 py-1 text-xs font-medium"
      style={{
        backgroundColor: bg,
        color: fg,
        border: "none",
      }}
    >
      {status}
    </Badge>
  )
}
