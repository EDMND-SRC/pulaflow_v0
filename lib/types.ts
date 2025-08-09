export type ID = string

export type User = {
  id: ID
  email: string
  password: string
  phone_number: string
}

export type Company = {
  id: ID
  user_id: ID
  company_name: string
  address: string
  contact_phone: string
  registration_number: string
  default_tax_rate: number // percent
  invoice_prefix: string
}

export type Customer = {
  id: ID
  user_id: ID
  name: string
  email: string
  phone_number: string
}

export type InvoiceLineItem = {
  id: ID
  description: string
  quantity: number
  unit_price: number
}

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Payment Pending"

export type Invoice = {
  id: ID
  customer_id: ID
  invoice_number: string
  issue_date: string // YYYY-MM-DD
  due_date: string // YYYY-MM-DD
  status: InvoiceStatus
  line_items: InvoiceLineItem[]
  tax_rate_applied: number
}

export type Expense = {
  id: ID
  user_id: ID
  description: string
  amount: number
  category: string
  receipt_url: string
  date: string // added for reporting and dashboard (YYYY-MM-DD)
}
