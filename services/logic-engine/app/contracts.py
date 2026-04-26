from pydantic import BaseModel, Field
from typing import List, Literal, Optional


class ProfitItem(BaseModel):
    quantity: int = Field(gt=0)
    unitPrice: float = Field(ge=0)
    unitCost: float = Field(ge=0)


class ProfitRequest(BaseModel):
    invoiceId: str
    items: List[ProfitItem]


class ProfitResponse(BaseModel):
    invoiceId: str
    revenue: float
    cost: float
    profit: float
    marginPercent: float


class InsightRequest(BaseModel):
    totalRevenue: float = Field(ge=0)
    totalProfit: float
    unpaidCount: int = Field(ge=0)
    overdueCount: int = Field(ge=0)


class InsightResponse(BaseModel):
    summary: str
    trend: str
    recommendation: str


class RiskRequest(BaseModel):
    invoiceId: str
    customerOutstanding: float = Field(ge=0)
    marginPercent: float
    daysOverdue: int = Field(ge=0)


class RiskResponse(BaseModel):
    level: Literal["LOW", "MEDIUM", "HIGH"]
    reasons: List[str]


class AssistantBriefRequest(BaseModel):
    context: str
    question: Optional[str] = None


class AssistantBriefResponse(BaseModel):
    headline: str
    bullets: List[str]
    suggestedActions: List[str]
