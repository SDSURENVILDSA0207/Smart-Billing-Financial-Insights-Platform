import { z } from "zod";

export const profitRequestSchema = z.object({
  invoiceId: z.string(),
  items: z.array(
    z.object({
      quantity: z.number().int().positive(),
      unitPrice: z.number().nonnegative(),
      unitCost: z.number().nonnegative()
    })
  )
});

export const profitResponseSchema = z.object({
  invoiceId: z.string(),
  revenue: z.number(),
  cost: z.number(),
  profit: z.number(),
  marginPercent: z.number()
});

export const insightsRequestSchema = z.object({
  totalRevenue: z.number().nonnegative(),
  totalProfit: z.number(),
  unpaidCount: z.number().int().nonnegative(),
  overdueCount: z.number().int().nonnegative()
});

export const insightsResponseSchema = z.object({
  summary: z.string(),
  trend: z.string(),
  recommendation: z.string()
});

export const riskRequestSchema = z.object({
  invoiceId: z.string(),
  customerOutstanding: z.number().nonnegative(),
  marginPercent: z.number(),
  daysOverdue: z.number().int().nonnegative()
});

export const riskResponseSchema = z.object({
  level: z.enum(["LOW", "MEDIUM", "HIGH"]),
  reasons: z.array(z.string())
});

export const assistantBriefRequestSchema = z.object({
  context: z.string().min(1),
  question: z.string().optional()
});

export const assistantBriefResponseSchema = z.object({
  headline: z.string(),
  bullets: z.array(z.string()),
  suggestedActions: z.array(z.string())
});

export type ProfitRequest = z.infer<typeof profitRequestSchema>;
export type ProfitResponse = z.infer<typeof profitResponseSchema>;
export type InsightsRequest = z.infer<typeof insightsRequestSchema>;
export type InsightsResponse = z.infer<typeof insightsResponseSchema>;
export type RiskRequest = z.infer<typeof riskRequestSchema>;
export type RiskResponse = z.infer<typeof riskResponseSchema>;
export type AssistantBriefRequest = z.infer<typeof assistantBriefRequestSchema>;
export type AssistantBriefResponse = z.infer<typeof assistantBriefResponseSchema>;
