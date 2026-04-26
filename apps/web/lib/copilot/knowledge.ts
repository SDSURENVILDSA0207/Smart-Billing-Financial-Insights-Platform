import type { CopilotModule } from "./types";

/** Structured help — single source of truth for in-app guidance (no generic AI). */
export const MODULE_HELP: Record<
  CopilotModule,
  { headline: string; summary: string; bullets: string[]; nextSteps: { label: string; href: string }[] }
> = {
  dashboard: {
    headline: "Overview",
    summary:
      "The dashboard is your control room: key totals, an intelligence summary, and recent invoice activity.",
    bullets: [
      "Position — revenue, profit, open invoice count, and overdue count at a glance.",
      "Guidance — trend and recommendation from the same signals used on Insights.",
      "Recent movement — shortcuts into invoices that changed recently."
    ],
    nextSteps: [
      { label: "Open invoice register", href: "/invoices" },
      { label: "Add a customer", href: "/customers" },
      { label: "See analytics", href: "/insights" }
    ]
  },
  invoices: {
    headline: "Invoice register",
    summary: "Search and filter all invoices. Each row opens the full record (lines, tax, margin, payments).",
    bullets: [
      "Search matches invoice number or customer name (updates as you type).",
      "Status filter: paid, partial, or unpaid.",
      "Mini stats above the table reflect the current filter."
    ],
    nextSteps: [
      { label: "Create invoice", href: "/invoices/new" },
      { label: "Payments view", href: "/payments" }
    ]
  },
  "invoice-new": {
    headline: "Create invoice",
    summary: "Pick a customer, describe the line, and set quantity, price, cost, tax, and discount. Totals preview on the right.",
    bullets: [
      "Customer must exist — add them under Customers first if needed.",
      "Profit and margin are computed when you save (logic engine).",
      "After save you land on the invoice detail to record payments."
    ],
    nextSteps: [
      { label: "Customer directory", href: "/customers" },
      { label: "Cancel to register", href: "/invoices" }
    ]
  },
  "invoice-detail": {
    headline: "Invoice detail",
    summary: "Read-only economics plus payment actions when the invoice is not fully paid.",
    bullets: [
      "Summary shows total, paid, balance, margin, tax, and discount.",
      "Record payment — enter an amount up to the open balance (partial payments allowed).",
      "Line items list each line’s price, cost, tax %, and line total."
    ],
    nextSteps: [
      { label: "Payment center", href: "/payments" },
      { label: "Back to register", href: "/invoices" }
    ]
  },
  customers: {
    headline: "Customers",
    summary: "Add accounts on the left; search the directory on the right. Outstanding is rolled up from open invoices.",
    bullets: [
      "New account — name required; email optional.",
      "Search filters the list (debounced).",
      "Click a row for profile and invoice history."
    ],
    nextSteps: [
      { label: "New invoice", href: "/invoices/new" },
      { label: "Overview", href: "/dashboard" }
    ]
  },
  "customer-detail": {
    headline: "Customer profile",
    summary: "Outstanding balance and a table of invoices for this account.",
    bullets: [
      "Open any invoice row for full detail and payment.",
      "Use Related links for payments and insights context."
    ],
    nextSteps: [
      { label: "Create invoice", href: "/invoices/new" },
      { label: "Payments", href: "/payments" }
    ]
  },
  payments: {
    headline: "Payments / collections",
    summary: "Portfolio view: collected vs outstanding and per-invoice paid amount and balance.",
    bullets: [
      "Filter by payment status to focus unpaid or partial work.",
      "Each row links to the invoice for recording another payment."
    ],
    nextSteps: [
      { label: "Invoice register", href: "/invoices" },
      { label: "Risk alerts", href: "/alerts" }
    ]
  },
  alerts: {
    headline: "Risk & alerts",
    summary: "Exceptions flagged by the risk engine (e.g. overdue, margin pressure). Each card links to the invoice.",
    bullets: [
      "Severity is shown on the badge (LOW / MEDIUM / HIGH).",
      "Reasons explain why the invoice surfaced."
    ],
    nextSteps: [
      { label: "Payments", href: "/payments" },
      { label: "Insights", href: "/insights" }
    ]
  },
  insights: {
    headline: "Analytics",
    summary: "Narrative plus trends, overdue exposure, monthly revenue/profit bars, and top customers by revenue.",
    bullets: [
      "Top customer rows link to customer profiles.",
      "Same intelligence narrative as the dashboard, with more breakdown."
    ],
    nextSteps: [
      { label: "Assistant (AI briefing)", href: "/assistant" },
      { label: "Alerts", href: "/alerts" }
    ]
  },
  assistant: {
    headline: "Assistant (briefing)",
    summary:
      "This screen calls the Python logic engine for a structured briefing from your data — not open-ended chat. Use the Guide (floating button) for product help.",
    bullets: [
      "Pick a preset or type a question, then generate a briefing.",
      "Headline, bullets, and suggested actions are returned from the engine."
    ],
    nextSteps: [
      { label: "Analytics", href: "/insights" },
      { label: "Overview", href: "/dashboard" }
    ]
  },
  other: {
    headline: "Navigation",
    summary: "Use the left sidebar for primary areas: Overview, Invoices, Customers, Payments, Insights, Alerts, Assistant.",
    bullets: [
      "Overview — KPIs and activity.",
      "Invoices — register and create.",
      "Customers — directory and profiles.",
      "Payments — collection posture.",
      "Insights — analytics; Alerts — risk; Assistant — engine briefing."
    ],
    nextSteps: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Invoices", href: "/invoices" }
    ]
  }
};

export const GLOSSARY: Record<string, string> = {
  overdue:
    "Overdue means the invoice is not fully paid and its due date is in the past. It affects overdue counts on the dashboard and can trigger risk alerts.",
  unpaid:
    "Unpaid means no payment has been recorded yet (status UNPAID). Partial means some payment; paid means fully collected.",
  partial:
    "Partial means part of the invoice total has been paid; balance remains until you record more payments.",
  margin:
    "Margin (margin %) compares profit to revenue for the invoice, using cost from line items and the logic engine. Higher margin means more retained profit per dollar billed.",
  profit:
    "Profit on an invoice is revenue after costs (and engine rules). Dashboard and Insights show rolled-up profit over time.",
  revenue:
    "Revenue here is invoiced revenue (totals you billed), not necessarily cash received. Payments update cash posture in Payments and invoice balances.",
  alert:
    "Risk alerts call out invoices that match rules (e.g. overdue exposure, margin pressure). Open the invoice from the alert to act.",
  risk:
    "Risk in Alerts is operational — which invoices need attention — not market risk.",
  balance:
    "Balance on an invoice is total minus paid; it’s what you can still collect.",
  "open invoice":
    "An open invoice is not fully paid — it counts toward open totals and outstanding.",
  filter:
    "Filters narrow lists (e.g. invoice status, payment status) without changing underlying data.",
  search:
    "Search on Invoices and Customers runs against numbers and names; results update as you type (debounced)."
};
