from __future__ import annotations

from app.services.sample_data import DISTRICTS, generate_observations


class ClimateDataGateway:
    """Mock integration boundary for national climate data providers."""

    def fetch_imd_weather(self, district_code: str) -> list[dict]:
        district = self._district(district_code)
        return generate_observations(district_code, district["profile"], years=7)

    def fetch_nrsc_satellite(self, district_code: str) -> list[dict]:
        return self.fetch_imd_weather(district_code)

    def fetch_bhuvan_boundary(self, district_code: str) -> dict:
        district = self._district(district_code)
        return {
            "provider": "ISRO Bhuvan mock",
            "district_code": district_code,
            "centroid": [district["lon"], district["lat"]],
        }

    def fetch_wris_reservoirs(self, district_code: str) -> dict:
        latest = self.fetch_imd_weather(district_code)[-1]
        return {
            "provider": "India-WRIS mock",
            "reservoir_level_pct": latest["reservoir_level_pct"],
            "major_reservoirs": [
                {"name": "Integrated Basin Storage", "level_pct": latest["reservoir_level_pct"]}
            ],
        }

    def fetch_cpcb_aqi(self, district_code: str) -> dict:
        latest = self.fetch_imd_weather(district_code)[-1]
        return {"provider": "CPCB mock", "aqi": latest["aqi"]}

    def _district(self, district_code: str) -> dict:
        return next(item for item in DISTRICTS if item["district_code"] == district_code)
