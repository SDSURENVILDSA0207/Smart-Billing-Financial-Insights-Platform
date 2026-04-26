# Smart Billing & Financial Insights Platform

Full-stack app for **invoices, customers, payments**, and a **dashboard** with profitability, analytics, and risk signals. The **API gateway** persists data in **PostgreSQL** (Prisma) and calls a **Python FastAPI** service for business logic (profit, insights, risk, assistant-style briefs).

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS (`apps/web`) |
| API | Express, TypeScript, Zod, JWT (`services/api-gateway`) |
| Data | PostgreSQL 16, Prisma 5 |
| Business logic | Python 3, FastAPI, Pydantic (`services/logic-engine`) |

## Repo layout

- `apps/web` — Next.js UI; talks to the gateway via `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`).
- `services/api-gateway` — REST API (`/api/v1/...` and matching legacy paths without the prefix), auth, validation, Prisma, orchestration to the Python engine.
- `services/logic-engine` — FastAPI: `/v1/profit/calculate`, `/v1/insights/summary`, `/v1/risk/evaluate`, `/v1/assistant/brief`, plus `/health`.
- `docker-compose.yml` — local **PostgreSQL** on host port **5433** (db `smart_billing`).

## Prerequisites

- **Node.js** (LTS) and **npm**
- **Python 3.9+** (for the logic engine virtualenv)
- **Docker** (optional but recommended for Postgres)

## Quick start

1. **Clone and install Node dependencies** (repo root):

   ```bash
   npm install
   ```

2. **Start PostgreSQL** (from repo root):

   ```bash
   docker compose up -d
   ```

3. **Logic engine (Python)** — create a venv and install deps once:

   ```bash
   cd services/logic-engine
   python3 -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   cd ../..
   ```

4. **Environment** — copy the gateway example and adjust if needed:

   ```bash
   cp services/api-gateway/.env.example services/api-gateway/.env
   ```

   `services/api-gateway/.env.example` sets `DATABASE_URL` to `localhost:5433`, `PORT=4000`, `JWT_SECRET`, and `PYTHON_ENGINE_URL=http://localhost:8001`.

5. **Database** (from repo root):

   ```bash
   npm --workspace services/api-gateway run prisma:generate
   npm --workspace services/api-gateway run prisma:migrate
   ```

   (`prisma:migrate` runs `prisma db push` in this project.)

6. **Run everything** (web + API + Python):

   ```bash
   npm run dev
   ```

## npm scripts (root)

| Script | What it does |
| --- | --- |
| `npm run dev` | Web (`dev:web`), API (`dev:api`), and logic engine (`dev:python`) together |
| `npm run dev:web` | Next.js only |
| `npm run dev:api` | API gateway only |
| `npm run dev:python` | Uvicorn on port 8001 (expects `.venv` under `services/logic-engine`) |
| `npm run dev:web:reset` | Clears `.next` then starts the web app |
| `npm run dev:reset` | `dev:web:reset` + API + Python |
| `npm run build` | `npm run build` in all workspaces |

## URLs and ports

| Service | URL |
| --- | --- |
| Web | http://localhost:3100 |
| API gateway | http://localhost:4000 (e.g. `GET /health`) |
| Logic engine | http://localhost:8001 (e.g. `GET /health`, `GET /docs`) |
| PostgreSQL (Docker) | `localhost:5433` → container `5432` |

Optional: set `NEXT_PUBLIC_API_URL` in `apps/web` if the gateway is not on `http://localhost:4000`.

## Production-style runs

- Gateway: `npm --workspace services/api-gateway run build` then `npm --workspace services/api-gateway run start`
- Web: `npm --workspace apps/web run build` then `npm --workspace apps/web run start` (default Next port applies unless configured)
- Logic engine: activate venv and run Uvicorn with the same `app.main:app` as in `dev:python`, port **8001** or as configured in `PYTHON_ENGINE_URL` on the gateway
