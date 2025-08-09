type PaymentIntent = {
  invoiceId: string
  amount: number
  msisdn?: string
  createdAt: number
}

const intents = new Map<string, PaymentIntent>()

export function rememberIntent(txId: string, intent: PaymentIntent) {
  intents.set(txId, intent)
  // auto-expire after 30 minutes
  setTimeout(() => intents.delete(txId), 30 * 60 * 1000)
}

export function getIntent(txId: string) {
  return intents.get(txId)
}
