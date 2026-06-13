# Bharat Climate Twin

AI-powered digital twin of India's climate system for district-level climate risk visualization, prediction, simulation, and decision support.

## What Is Included

- Next.js 15, TypeScript, Tailwind CSS, shadcn-style UI primitives
- Full command-center frontend: landing, auth, dashboard, map, risk center, simulator, analytics, copilot, admin, history explorer
- FastAPI backend with JWT auth, SQLAlchemy models, service layer, prediction facades, PDF report export
- PostgreSQL + PostGIS schema, Alembic migration, SQL bootstrap script
- Mock data architecture for ISRO Bhuvan, NRSC, IMD, India-WRIS, and CPCB integrations
- Docker Compose for frontend, backend, and database

## One Command Local Run

```bash
docker compose up --build
```

Then open:

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

Seeded demo accounts:

- Analyst: `analyst@bharatclimatetwin.in` / `ChangeMe123!`
- Admin: `admin@bharatclimatetwin.in` / `ChangeMe123!`

Copy `.env.example` to `.env` before production-like runs and set a strong `JWT_SECRET_KEY`.

## Mapbox

The map runs with a built-in fallback command view. For a live Mapbox GL basemap, set:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## Architecture

```text
frontend/              Next.js 15 app router UI
backend/               FastAPI application
backend/app/api        API route modules
backend/app/models     SQLAlchemy/PostGIS models
backend/app/services   data gateway, risk, prediction, simulation, copilot services
database/migrations    SQL bootstrap schema
data/sample            sample data and provider contracts
```

## API Highlights

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/climate/map/layers`
- `GET /api/v1/climate/analytics`
- `GET /api/v1/climate/rankings`
- `GET /api/v1/risk/district/{district_id}`
- `POST /api/v1/predictions/flood`
- `POST /api/v1/predictions/drought`
- `POST /api/v1/predictions/heatwave`
- `POST /api/v1/simulations/run`
- `POST /api/v1/copilot/chat`
- `GET /api/v1/climate/reports/district/{district_id}.pdf`

## Deployment Notes

Frontend on Vercel:

1. Set project root to `frontend`.
2. Set `NEXT_PUBLIC_API_URL` to the deployed FastAPI URL.
3. Optionally set `NEXT_PUBLIC_MAPBOX_TOKEN`.
4. Deploy with the default Next.js build command.

Backend on Render/Railway:

1. Create a PostgreSQL database with PostGIS enabled.
2. Set `DATABASE_URL`, `JWT_SECRET_KEY`, and `SEED_DATABASE=true` for the first deploy.
3. Use `backend/Dockerfile` or install `backend/requirements.txt`.
4. Start with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

Database:

- Local Docker runs `database/migrations/001_init.sql` on first database creation.
- Alembic migration is available at `backend/alembic/versions/0001_initial_schema.py`.

## Production Hardening Checklist

- Replace mock adapters with provider credentials and scheduled ingestion jobs.
- Move model facades to trained XGBoost, Random Forest, and scikit-learn model artifacts.
- Add row-level authorization for state and district officers.
- Add object storage for raster tiles and generated PDF archives.
- Add CI for backend tests, frontend type checks, and Docker image builds.
