from fastapi import FastAPI, APIRouter
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
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
from .engine import calculate_profit, build_insights, evaluate_risk, assistant_brief

app = FastAPI(title="Business Logic Engine", version="1.0.0")
router = APIRouter(prefix="/v1")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "INVALID_PAYLOAD",
                "message": "Request payload failed validation",
                "details": exc.errors(),
            }
        },
    )


@app.get("/health")
def health():
    return {"ok": True}


@router.post("/profit/calculate", response_model=ProfitResponse)
def profit_endpoint(payload: ProfitRequest):
    return calculate_profit(payload)


@router.post("/insights/summary", response_model=InsightResponse)
def insights_endpoint(payload: InsightRequest):
    return build_insights(payload)


@router.post("/risk/evaluate", response_model=RiskResponse)
def risk_endpoint(payload: RiskRequest):
    return evaluate_risk(payload)


@router.post("/assistant/brief", response_model=AssistantBriefResponse)
def assistant_endpoint(payload: AssistantBriefRequest):
    return assistant_brief(payload)


app.include_router(router)
