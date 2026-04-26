export type CopilotModule =
  | "dashboard"
  | "invoices"
  | "invoice-new"
  | "invoice-detail"
  | "customers"
  | "customer-detail"
  | "payments"
  | "alerts"
  | "insights"
  | "assistant"
  | "other";

export type CopilotAction = {
  label: string;
  href: string;
};

export type CopilotReply = {
  text: string;
  actions?: CopilotAction[];
  /** When set, client should navigate after showing the message */
  navigateTo?: string;
};
