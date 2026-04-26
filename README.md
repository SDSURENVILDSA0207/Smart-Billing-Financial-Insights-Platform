# Smart Billing & Financial Insights Platform

Full-stack platform for invoice management, payment tracking, profitability analysis, and risk alerts.

## Architecture

- `apps/web` - Next.js + TypeScript + Tailwind CSS frontend
- `services/api-gateway` - Node.js + Express API gateway (auth, validation, orchestration)
- `services/logic-engine` - Python FastAPI business logic engine (profit, analytics, risk)
- PostgreSQL as primary database
- Prisma ORM on the Node.js side

## Quick Start

1. Install dependencies
   - `npm install`
   - `cd services/logic-engine && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
2. Set environment variables
   - Copy `services/api-gateway/.env.example` to `services/api-gateway/.env`
3. Prepare database
   - `npm --workspace services/api-gateway run prisma:generate`
   - `npm --workspace services/api-gateway run prisma:migrate`
4. Start all services
   - `npm run dev`

## Service Ports

- Frontend: `http://localhost:3000`
- Node API Gateway: `http://localhost:4000`
- Python Logic Engine: `http://localhost:8001`
