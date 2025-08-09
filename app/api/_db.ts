import type { Company, Customer, Expense, ID, Invoice, InvoiceLineItem, User } from "@/lib/types"

// Simple in-memory store for demo purposes.
const today = () => new Date()
const toISODate = (d: Date) => d.toISOString().slice(0, 10)
const uid = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Math.random()}-${Date.now()}`)

const DEMO_USER_ID = "demo-user"

const users: User[] = [
  {
    id: DEMO_USER_ID,
    email: "owner@pulaflow.example",
    password: "demo",
    phone_number: "+26770000000",
  },
]

const companies: Company[] = [
  {
    id: uid(),
    user_id: DEMO_USER_ID,
    company_name: "",
    address: "",
    contact_phone: "",
    registration_number: "",
    default_tax_rate: 14,
    invoice_prefix: "PF",
  },
]

const customers: Customer[] = [
  {
    id: uid(),
    user_id: DEMO_USER_ID,
    name: "Kalahari Supplies",
    email: "accounts@kalahari.co.bw",
    phone_number: "+26773000000",
  },
  {
    id: uid(),
    user_id: DEMO_USER_ID,
    name: "Okavango Outfitters",
    email: "finance@okavango.bw",
    phone_number: "+26774000000",
  },
]

const invoices: Invoice[] = [
  {
    id: uid(),
    customer_id: customers[0].id,
    invoice_number: "PF-001",
    issue_date: toISODate(today()),
    due_date: toISODate(new Date(today().getTime() + 7 * 86400000)),
    status: "Draft",
    line_items: [
      { id: uid(), description: "Consulting - Setup", quantity: 1, unit_price: 1500 },
      { id: uid(), description: "Support - Month 1", quantity: 1, unit_price: 600 },
    ],
    tax_rate_applied: companies[0].default_tax_rate,
  },
]

const expenses: Expense[] = [
  {
    id: uid(),
    user_id: DEMO_USER_ID,
    description: "Fuel - client meeting",
    amount: 250.25,
    category: "Transport",
    receipt_url: "",
    date: toISODate(today()),
  },
  {
    id: uid(),
    user_id: DEMO_USER_ID,
    description: "Data bundle",
    amount: 120,
    category: "Utilities",
    receipt_url: "",
    date: toISODate(today()),
  },
]

// Helpers
export function getCompanyByUser(userId: ID): Company | undefined {
  return companies.find((c) => c.user_id === userId)
}

export function updateCompanyByUser(userId: ID, patch: Partial<Company>): Company {
  const c = getCompanyByUser(userId)
  if (!c) {
    const created: Company = {
      id: uid(),
      user_id: userId,
      company_name: "",
      address: "",
      contact_phone: "",
      registration_number: "",
      default_tax_rate: 0,
      invoice_prefix: "INV",
      ...patch,
    }
    companies.push(created)
    return created
  }
  Object.assign(c, patch)
  return c
}

export function listCustomers(userId: ID): Customer[] {
  return customers.filter((c) => c.user_id === userId)
}

export function createCustomer(userId: ID, data: Omit<Customer, "id" | "user_id">): Customer {
  const created: Customer = { id: uid(), user_id: userId, ...data }
  customers.unshift(created)
  return created
}

export function updateCustomer(id: ID, patch: Partial<Customer>): Customer | undefined {
  const c = customers.find((x) => x.id === id)
  if (!c) return undefined
  Object.assign(c, patch)
  return c
}

export function deleteCustomer(id: ID): boolean {
  const idx = customers.findIndex((x) => x.id === id)
  if (idx === -1) return false
  customers.splice(idx, 1)
  return true
}

export function listExpenses(userId: ID): Expense[] {
  return expenses.filter((e) => e.user_id === userId)
}

export function createExpense(userId: ID, data: Omit<Expense, "id" | "user_id">): Expense {
  const created: Expense = { id: uid(), user_id: userId, ...data }
  expenses.unshift(created)
  return created
}

export function listInvoices(userId: ID): (Invoice & { customer?: Customer })[] {
  const cs = listCustomers(userId)
  const csMap = new Map(cs.map((c) => [c.id, c]))
  return invoices
    .filter((inv) => csMap.has(inv.customer_id))
    .map((inv) => ({ ...inv, customer: csMap.get(inv.customer_id) }))
}

export function getInvoice(id: ID): (Invoice & { customer?: Customer }) | undefined {
  const inv = invoices.find((i) => i.id === id)
  if (!inv) return undefined
  const cust = customers.find((c) => c.id === inv.customer_id)
  return { ...inv, customer: cust }
}

export function createInvoice(
  userId: ID,
  data: {
    customer_id: ID
    issue_date: string
    due_date: string
    line_items: InvoiceLineItem[]
    tax_rate_applied?: number
  },
): Invoice {
  const company = getCompanyByUser(userId)
  const prefix = company?.invoice_prefix ?? "INV"
  const numbers = invoices
    .map((i) => i.invoice_number)
    .filter((n) => n.startsWith(prefix + "-"))
    .map((n) => Number.parseInt(n.split("-")[1] || "0", 10))
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1
  const invoice_number = `${prefix}-${String(next).padStart(3, "0")}`

  const created: Invoice = {
    id: uid(),
    customer_id: data.customer_id,
    invoice_number,
    issue_date: data.issue_date,
    due_date: data.due_date,
    status: "Draft",
    line_items: data.line_items,
    tax_rate_applied: data.tax_rate_applied ?? company?.default_tax_rate ?? 0,
  }
  invoices.unshift(created)
  return created
}

export function updateInvoice(id: ID, patch: Partial<Invoice>): Invoice | undefined {
  const inv = invoices.find((i) => i.id === id)
  if (!inv) return undefined
  Object.assign(inv, patch)
  return inv
}

export function deleteInvoice(id: ID): boolean {
  const idx = invoices.findIndex((i) => i.id === id)
  if (idx === -1) return false
  invoices.splice(idx, 1)
  return true
}

export function computeInvoiceTotals(inv: Pick<Invoice, "line_items" | "tax_rate_applied">) {
  const subtotal = inv.line_items.reduce((sum, li) => sum + li.quantity * li.unit_price, 0)
  const tax = subtotal * ((inv.tax_rate_applied ?? 0) / 100)
  const total = subtotal + tax
  return { subtotal, tax, total }
}

export const DEMO = { DEMO_USER_ID }
