export function Money({
  value = 0,
  currency = "BWP",
}: {
  value?: number
  currency?: string
}) {
  const fmt = new Intl.NumberFormat("en-BW", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  })
  return (
    <span
      style={{
        fontFamily: '"Inter Tight", ui-sans-serif, system-ui',
        letterSpacing: "-0.01em",
      }}
    >
      {fmt.format(value)}
    </span>
  )
}
