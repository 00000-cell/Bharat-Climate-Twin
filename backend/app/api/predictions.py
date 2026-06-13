from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.climate import District, Prediction, SatelliteData, WeatherData
from app.schemas.climate import PredictionRead, PredictionRequest
from app.services.prediction import DisasterPredictionService

router = APIRouter(prefix="/predictions", tags=["predictions"])
service = DisasterPredictionService()


def _latest_inputs(db: Session, district_id: int, payload: PredictionRequest) -> dict:
    district = db.get(District, district_id)
    if not district:
        raise HTTPException(status_code=404, detail="District not found")
    weather = (
        db.query(WeatherData)
        .filter(WeatherData.district_id == district_id)
        .order_by(desc(WeatherData.observed_on))
        .first()
    )
    satellite = (
        db.query(SatelliteData)
        .filter(SatelliteData.district_id == district_id)
        .order_by(desc(SatelliteData.observed_on))
        .first()
    )
    return {
        "rainfall_mm": payload.rainfall_mm if payload.rainfall_mm is not None else weather.rainfall_mm,
        "river_level_m": payload.river_level_m if payload.river_level_m is not None else weather.river_level_m,
        "soil_moisture_pct": payload.soil_moisture_pct
        if payload.soil_moisture_pct is not None
        else weather.soil_moisture_pct,
        "reservoir_capacity_pct": payload.reservoir_capacity_pct
        if payload.reservoir_capacity_pct is not None
        else satellite.reservoir_level_pct,
        "rainfall_deficit_pct": payload.rainfall_deficit_pct
        if payload.rainfall_deficit_pct is not None
        else weather.rainfall_deficit_pct,
        "temperature_c": payload.temperature_c
        if payload.temperature_c is not None
        else weather.temperature_c,
        "ndvi": payload.ndvi if payload.ndvi is not None else satellite.ndvi,
        "humidity_pct": payload.humidity_pct if payload.humidity_pct is not None else weather.humidity_pct,
    }


def _persist(db: Session, district_id: int, result: dict) -> PredictionRead:
    prediction = Prediction(district_id=district_id, **result)
    db.add(prediction)
    db.commit()
    return PredictionRead(**result)


@router.post("/flood", response_model=PredictionRead)
def flood(payload: PredictionRequest, db: Session = Depends(get_db)) -> PredictionRead:
    inputs = _latest_inputs(db, payload.district_id, payload)
    return _persist(db, payload.district_id, service.flood(inputs))


@router.post("/drought", response_model=PredictionRead)
def drought(payload: PredictionRequest, db: Session = Depends(get_db)) -> PredictionRead:
    inputs = _latest_inputs(db, payload.district_id, payload)
    return _persist(db, payload.district_id, service.drought(inputs))


@router.post("/heatwave", response_model=PredictionRead)
def heatwave(payload: PredictionRequest, db: Session = Depends(get_db)) -> PredictionRead:
    inputs = _latest_inputs(db, payload.district_id, payload)
    return _persist(db, payload.district_id, service.heatwave(inputs))
