import axios from "axios";
import { env } from "../config/env";
import {
  assistantBriefRequestSchema,
  assistantBriefResponseSchema,
  insightsRequestSchema,
  insightsResponseSchema,
  profitRequestSchema,
  profitResponseSchema,
  riskRequestSchema,
  riskResponseSchema,
  type AssistantBriefRequest,
  type InsightsRequest,
  type ProfitRequest,
  type RiskRequest
} from "../contracts/pythonContracts";
import { AppError } from "../utils/appError";

const pythonClient = axios.create({
  baseURL: env.pythonEngineUrl,
  timeout: 5000
});

async function postToPython<TReq, TRes>(endpoint: string, payload: TReq, parse: (data: unknown) => TRes) {
  try {
    const response = await pythonClient.post(endpoint, payload);
    return parse(response.data);
  } catch (error) {
    throw new AppError(502, "PYTHON_ENGINE_UNAVAILABLE", "Python logic engine request failed", error);
  }
}

export async function calculateProfit(payload: ProfitRequest) {
  const parsed = profitRequestSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AppError(400, "INVALID_PROFIT_REQUEST", "Invalid payload for profit calculation", parsed.error.flatten());
  }
  return postToPython("/v1/profit/calculate", parsed.data, (data) => profitResponseSchema.parse(data));
}

export async function fetchInsights(payload: InsightsRequest) {
  const parsed = insightsRequestSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AppError(400, "INVALID_INSIGHTS_REQUEST", "Invalid payload for insights", parsed.error.flatten());
  }
  return postToPython("/v1/insights/summary", parsed.data, (data) => insightsResponseSchema.parse(data));
}

export async function evaluateRisk(payload: RiskRequest) {
  const parsed = riskRequestSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AppError(400, "INVALID_RISK_REQUEST", "Invalid payload for risk evaluation", parsed.error.flatten());
  }
  return postToPython("/v1/risk/evaluate", parsed.data, (data) => riskResponseSchema.parse(data));
}

export async function fetchAssistantBrief(payload: AssistantBriefRequest) {
  const parsed = assistantBriefRequestSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AppError(400, "INVALID_ASSISTANT_REQUEST", "Invalid assistant payload", parsed.error.flatten());
  }
  return postToPython("/v1/assistant/brief", parsed.data, (data) => assistantBriefResponseSchema.parse(data));
}
