from __future__ import annotations

from app.services.risk_engine import ClimateRiskEngine
from app.services.sample_data import clamp


class ScenarioSimulator:
    def __init__(self) -> None:
        self.risk_engine = ClimateRiskEngine()

    def run(self, baseline: dict, scenario: dict) -> dict:
        adjusted = dict(baseline)
        adjusted["rainfall_mm"] = max(
            0, baseline["rainfall_mm"] * (1 + scenario["rainfall_delta_pct"] / 100)
        )
        adjusted["rainfall_deficit_pct"] = clamp(
            baseline["rainfall_deficit_pct"] - scenario["rainfall_delta_pct"], -100, 100
        )
        adjusted["temperature_c"] = baseline["temperature_c"] + scenario["temperature_delta_c"]
        adjusted["reservoir_level_pct"] = clamp(
            baseline.get("reservoir_level_pct", 50) * (1 + scenario["reservoir_delta_pct"] / 100)
        )
        adjusted["soil_moisture_pct"] = clamp(
            baseline["soil_moisture_pct"]
            + scenario["rainfall_delta_pct"] * 0.22
            + scenario["reservoir_delta_pct"] * 0.08
            - scenario["temperature_delta_c"] * 2.5
        )
        adjusted["ndvi"] = clamp(
            baseline.get("ndvi", 0.45)
            + scenario["rainfall_delta_pct"] * 0.002
            + scenario["reservoir_delta_pct"] * 0.001
            - scenario["temperature_delta_c"] * 0.015,
            0,
            1,
        )
        risk = self.risk_engine.calculate(adjusted)
        water_availability = clamp(
            adjusted["reservoir_level_pct"] * 0.55 + adjusted["soil_moisture_pct"] * 0.45
        )
        crop_stress = clamp(100 - adjusted["ndvi"] * 100 + risk["heatwave_risk"] * 0.25)
        return {
            "adjusted_climate": adjusted,
            "water_availability": round(water_availability, 1),
            "crop_stress": round(crop_stress, 1),
            "drought_risk": risk["drought_risk"],
            "heatwave_risk": risk["heatwave_risk"],
            "flood_risk": risk["flood_risk"],
            "water_stress_risk": risk["water_stress_risk"],
            "composite_risk": risk["composite_risk"],
            "map_overlay": {
                "type": "scenario",
                "severity": risk["band"],
                "opacity": 0.72,
                "legend": "Projected composite climate risk",
            },
        }
