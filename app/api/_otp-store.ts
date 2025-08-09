type Record = {
  email: string
  password: string
  phone: string
  otp: string
  expiresAt: number
}

const store = new Map<string, Record>()

export function putOtp(txId: string, rec: Record) {
  store.set(txId, rec)
  setTimeout(
    () => {
      store.delete(txId)
    },
    5 * 60 * 1000,
  ) // 5 minutes
}

export function getOtp(txId: string) {
  const rec = store.get(txId)
  if (!rec) return null
  if (Date.now() > rec.expiresAt) {
    store.delete(txId)
    return null
  }
  return rec
}

export function consumeOtp(txId: string) {
  const rec = getOtp(txId)
  if (rec) store.delete(txId)
  return rec
}
