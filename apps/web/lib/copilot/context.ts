import type { CopilotModule } from "./types";

export function getModuleFromPath(pathname: string | null): CopilotModule {
  if (!pathname) return "other";
  const p = pathname.split("?")[0] ?? pathname;
  if (p === "/" || p === "/dashboard") return "dashboard";
  if (p.startsWith("/invoices/new")) return "invoice-new";
  if (/^\/invoices\/[^/]+$/.test(p)) return "invoice-detail";
  if (p.startsWith("/invoices")) return "invoices";
  if (p.startsWith("/customers/") && p !== "/customers") return "customer-detail";
  if (p.startsWith("/customers")) return "customers";
  if (p.startsWith("/payments")) return "payments";
  if (p.startsWith("/alerts")) return "alerts";
  if (p.startsWith("/insights")) return "insights";
  if (p.startsWith("/assistant")) return "assistant";
  return "other";
}

export function moduleTitle(m: CopilotModule): string {
  const map: Record<CopilotModule, string> = {
    dashboard: "Overview",
    invoices: "Invoices",
    "invoice-new": "New invoice",
    "invoice-detail": "Invoice detail",
    customers: "Customers",
    "customer-detail": "Customer profile",
    payments: "Payments",
    alerts: "Alerts",
    insights: "Insights",
    assistant: "Assistant briefing",
    other: "This screen"
  };
  return map[m];
}
