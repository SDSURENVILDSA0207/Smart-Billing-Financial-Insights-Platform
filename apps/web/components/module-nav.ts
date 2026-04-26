import type { SubNavItem } from "./module-subnav";

export const invoiceModuleNav: SubNavItem[] = [
  {
    href: "/invoices",
    label: "Register",
    isActive: (p) => p === "/invoices" || (p.startsWith("/invoices/") && p !== "/invoices/new")
  },
  { href: "/invoices/new", label: "New invoice", isActive: (p) => p === "/invoices/new" },
  {
    href: "/payments",
    label: "Payments",
    isActive: (p) => p.startsWith("/payments")
  }
];

export const customerModuleNav: SubNavItem[] = [
  {
    href: "/customers",
    label: "Directory",
    isActive: (p) => p === "/customers" || /^\/customers\/[^/]+$/.test(p)
  },
  { href: "/invoices/new", label: "New invoice", isActive: (p) => p === "/invoices/new" }
];

export const paymentsModuleNav: SubNavItem[] = [
  { href: "/payments", label: "Center", isActive: (p) => p.startsWith("/payments") },
  { href: "/invoices", label: "Invoices", isActive: (p) => p.startsWith("/invoices") }
];

export const intelligenceModuleNav: SubNavItem[] = [
  { href: "/insights", label: "Analytics", isActive: (p) => p === "/insights" },
  { href: "/assistant", label: "Assistant", isActive: (p) => p.startsWith("/assistant") },
  { href: "/alerts", label: "Alerts", isActive: (p) => p.startsWith("/alerts") }
];
