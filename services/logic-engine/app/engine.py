from .contracts import (
    ProfitRequest,
    ProfitResponse,
    InsightRequest,
    InsightResponse,
    RiskRequest,
    RiskResponse,
    AssistantBriefRequest,
    AssistantBriefResponse,
)


def calculate_profit(payload: ProfitRequest) -> ProfitResponse:
    revenue = sum(item.quantity * item.unitPrice for item in payload.items)
    cost = sum(item.quantity * item.unitCost for item in payload.items)
    profit = revenue - cost
    margin = (profit / revenue * 100) if revenue > 0 else 0
    return ProfitResponse(
        invoiceId=payload.invoiceId,
        revenue=round(revenue, 2),
        cost=round(cost, 2),
        profit=round(profit, 2),
        marginPercent=round(margin, 2),
    )


def build_insights(payload: InsightRequest) -> InsightResponse:
    margin = (payload.totalProfit / payload.totalRevenue * 100) if payload.totalRevenue > 0 else 0
    trend = "stable"
    if payload.overdueCount > payload.unpaidCount * 0.4:
        trend = "cashflow pressure"
    elif margin > 35:
        trend = "high efficiency"

    recommendation = (
        "Prioritize collection workflows and tighter payment terms."
        if payload.overdueCount > 0
        else "Current payment behavior is healthy; focus on growth."
    )

    return InsightResponse(
        summary=f"Revenue is {payload.totalRevenue:.2f} with {margin:.2f}% margin.",
        trend=trend,
        recommendation=recommendation,
    )


def evaluate_risk(payload: RiskRequest) -> RiskResponse:
    reasons = []
    score = 0

    if payload.daysOverdue >= 30:
        score += 2
        reasons.append("Invoice is significantly overdue.")
    elif payload.daysOverdue > 0:
        score += 1
        reasons.append("Invoice is overdue.")

    if payload.marginPercent < 12:
        score += 2
        reasons.append("Margin is below target threshold.")
    elif payload.marginPercent < 20:
        score += 1
        reasons.append("Margin is approaching lower safe range.")

    if payload.customerOutstanding > 5000:
        score += 2
        reasons.append("Outstanding balance is high.")
    elif payload.customerOutstanding > 1500:
        score += 1
        reasons.append("Outstanding balance is moderate.")

    level = "LOW"
    if score >= 4:
        level = "HIGH"
    elif score >= 2:
        level = "MEDIUM"

    return RiskResponse(level=level, reasons=reasons)


def assistant_brief(payload: AssistantBriefRequest) -> AssistantBriefResponse:
    q = (payload.question or "").strip().lower()
    ctx = payload.context[:4000]
    bullets: list[str] = []
    actions: list[str] = []

    if "overdue" in q or "cash" in q:
        bullets.append("Cash collection risk is a primary lever when invoices age past due dates.")
        actions.append("Review overdue balances and confirm next follow-up dates.")
    if "margin" in q or "profit" in q:
        bullets.append("Margin health depends on cost discipline relative to selling price.")
        actions.append("Identify the lowest-margin invoices from the latest period.")

    if not bullets:
        bullets.append("Use the dashboard metrics as your baseline for weekly operating reviews.")
        bullets.append("Trend signals are most reliable when compared across consistent time windows.")

    if not actions:
        actions.append("Prioritize the highest outstanding balances this week.")
        actions.append("Validate tax and discount assumptions on new invoices.")

    headline = "Operational snapshot"
    if q:
        headline = "Guidance based on your question"

    return AssistantBriefResponse(
        headline=headline,
        bullets=bullets[:5],
        suggestedActions=actions[:5],
    )
