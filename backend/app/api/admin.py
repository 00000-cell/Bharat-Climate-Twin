from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.climate import District, Prediction, RiskScore, SimulationResult, State
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/overview")
def overview(db: Session = Depends(get_db)) -> dict:
    return {
        "users": db.query(User).count(),
        "states": db.query(State).count(),
        "districts": db.query(District).count(),
        "risk_scores": db.query(RiskScore).count(),
        "predictions": db.query(Prediction).count(),
        "simulations": db.query(SimulationResult).count(),
        "integrations": [
            {"name": "ISRO Bhuvan", "status": "mock-ready"},
            {"name": "NRSC Satellite Data", "status": "mock-ready"},
            {"name": "IMD Weather Data", "status": "mock-ready"},
            {"name": "India-WRIS", "status": "mock-ready"},
            {"name": "CPCB AQI", "status": "mock-ready"},
        ],
    }
