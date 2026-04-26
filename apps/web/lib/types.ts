export type DashboardResponse = {
  metrics: { totalRevenue: number; totalProfit: number; unpaidCount: number; overdueCount: number };
  insights: { summary: string; trend: string; recommendation: string };
  activity: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    status: string;
    totalAmount: number;
    paidAmount: number;
    updatedAt: string;
  }>;
};

export type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  subtotal?: unknown;
  taxAmount?: unknown;
  discountAmount?: unknown;
  totalAmount: unknown;
  paidAmount: unknown;
  status: "PAID" | "UNPAID" | "PARTIAL";
  marginPercent: unknown;
  issueDate: string;
  dueDate: string;
  customer: { id: string; name: string; email?: string | null };
  items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: unknown;
    unitCost: unknown;
    taxRate: unknown;
    discount: unknown;
    lineTotal: unknown;
  }>;
};

export type CustomerRow = {
  id: string;
  name: string;
  email?: string | null;
  outstanding: number;
  invoices?: InvoiceRow[];
};

export type AnalyticsResponse = {
  monthlyTrend: Array<{ period: string; revenue: number; profit: number; invoiceCount: number }>;
  topCustomers: Array<{ customerId: string; name: string; revenue: number; invoiceCount: number }>;
  overdue: { count: number; amountOutstanding: number };
};

export type PaymentsResponse = {
  summary: {
    totalCollected: number;
    totalOutstanding: number;
    paidCount: number;
    partialCount: number;
    unpaidCount: number;
  };
  items: Array<{
    id: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    status: string;
    issueDate: string;
    dueDate: string;
    updatedAt: string;
  }>;
};

export type RiskAlert = {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  level: "LOW" | "MEDIUM" | "HIGH";
  reasons: string[];
};

export type AssistantBrief = {
  headline: string;
  bullets: string[];
  suggestedActions: string[];
};
