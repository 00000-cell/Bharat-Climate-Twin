from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.climate import District, RiskScore, State
from app.schemas.climate import RiskScoreRead

router = APIRouter(prefix="/risk", tags=["risk"])


@router.get("/district/{district_id}", response_model=RiskScoreRead)
def district_risk(district_id: int, db: Session = Depends(get_db)) -> RiskScoreRead:
    row = (
        db.query(District, State, RiskScore)
        .join(State)
        .join(RiskScore)
        .filter(District.id == district_id)
        .order_by(desc(RiskScore.valid_on))
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Risk score not found")
    district, state, risk = row
    return RiskScoreRead(
        district_id=district.id,
        district_name=district.name,
        state_name=state.name,
        valid_on=risk.valid_on,
        flood_risk=risk.flood_risk,
        drought_risk=risk.drought_risk,
        heatwave_risk=risk.heatwave_risk,
        water_stress_risk=risk.water_stress_risk,
        composite_risk=risk.composite_risk,
        trend=risk.trend,
        drivers=risk.drivers,
    )


@router.get("/district/{district_id}/trends")
def risk_trends(district_id: int, db: Session = Depends(get_db)) -> list[dict]:
    rows = (
        db.query(RiskScore)
        .filter(RiskScore.district_id == district_id)
        .order_by(RiskScore.valid_on)
        .all()
    )
    return [
        {
            "date": row.valid_on.isoformat(),
            "flood": row.flood_risk,
            "drought": row.drought_risk,
            "heatwave": row.heatwave_risk,
            "water_stress": row.water_stress_risk,
            "composite": row.composite_risk,
        }
        for row in rows
    ]
