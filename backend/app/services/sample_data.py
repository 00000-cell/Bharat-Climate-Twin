from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from math import sin
from random import Random

DISTRICTS = [
    {
        "state": "Andhra Pradesh",
        "state_code": "AP",
        "district": "East Godavari",
        "district_code": "AP-EG",
        "lat": 17.0,
        "lon": 82.2,
        "population": 5150000,
        "area": 10807,
        "profile": "coastal_flood",
    },
    {
        "state": "Assam",
        "state_code": "AS",
        "district": "Dhemaji",
        "district_code": "AS-DH",
        "lat": 27.5,
        "lon": 94.6,
        "population": 690000,
        "area": 3237,
        "profile": "riverine_flood",
    },
    {
        "state": "Bihar",
        "state_code": "BR",
        "district": "Patna",
        "district_code": "BR-PT",
        "lat": 25.6,
        "lon": 85.1,
        "population": 5838000,
        "area": 3202,
        "profile": "heat_flood",
    },
    {
        "state": "Gujarat",
        "state_code": "GJ",
        "district": "Kutch",
        "district_code": "GJ-KC",
        "lat": 23.7,
        "lon": 69.8,
        "population": 2092000,
        "area": 45674,
        "profile": "arid_drought",
    },
    {
        "state": "Karnataka",
        "state_code": "KA",
        "district": "Bengaluru Urban",
        "district_code": "KA-BU",
        "lat": 12.97,
        "lon": 77.59,
        "population": 9621551,
        "area": 2196,
        "profile": "urban_heat",
    },
    {
        "state": "Maharashtra",
        "state_code": "MH",
        "district": "Marathwada",
        "district_code": "MH-MW",
        "lat": 19.88,
        "lon": 75.32,
        "population": 18700000,
        "area": 64590,
        "profile": "drought",
    },
    {
        "state": "Odisha",
        "state_code": "OD",
        "district": "Puri",
        "district_code": "OD-PR",
        "lat": 19.8,
        "lon": 85.82,
        "population": 1698000,
        "area": 3055,
        "profile": "coastal_cyclone",
    },
    {
        "state": "Rajasthan",
        "state_code": "RJ",
        "district": "Jaisalmer",
        "district_code": "RJ-JS",
        "lat": 26.91,
        "lon": 70.91,
        "population": 672000,
        "area": 38401,
        "profile": "desert_heat",
    },
    {
        "state": "Tamil Nadu",
        "state_code": "TN",
        "district": "Chennai",
        "district_code": "TN-CH",
        "lat": 13.08,
        "lon": 80.27,
        "population": 4646700,
        "area": 426,
        "profile": "urban_coastal",
    },
    {
        "state": "Uttar Pradesh",
        "state_code": "UP",
        "district": "Varanasi",
        "district_code": "UP-VR",
        "lat": 25.31,
        "lon": 82.97,
        "population": 3677000,
        "area": 1535,
        "profile": "heat_water_stress",
    },
]

PROFILE_BASELINES = {
    "coastal_flood": (190, 31, 73, 5.7, 68, 0.62, 76, 82),
    "riverine_flood": (240, 29, 82, 7.2, 76, 0.68, 83, 78),
    "heat_flood": (140, 35, 62, 5.9, 52, 0.49, 59, 145),
    "arid_drought": (28, 39, 29, 1.7, 18, 0.21, 22, 108),
    "urban_heat": (92, 34, 56, 2.4, 39, 0.36, 34, 168),
    "drought": (44, 38, 34, 2.1, 24, 0.26, 27, 132),
    "coastal_cyclone": (205, 31, 77, 5.4, 66, 0.61, 71, 92),
    "desert_heat": (16, 42, 22, 0.8, 12, 0.14, 14, 115),
    "urban_coastal": (132, 34, 69, 3.8, 49, 0.42, 48, 156),
    "heat_water_stress": (70, 40, 38, 2.3, 26, 0.29, 31, 174),
}


def clamp(value: float, lower: float = 0, upper: float = 100) -> float:
    return max(lower, min(upper, value))


def synthetic_boundary(lat: float, lon: float, size: float = 0.5) -> dict:
    return {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [lon - size, lat - size],
                    [lon + size, lat - size * 0.7],
                    [lon + size * 0.8, lat + size],
                    [lon - size * 0.8, lat + size * 0.8],
                    [lon - size, lat - size],
                ]
            ],
        },
        "properties": {},
    }


def generate_observations(district_code: str, profile: str, years: int = 7) -> list[dict]:
    rng = Random(district_code)
    rainfall, temp, humidity, river, soil, ndvi, reservoir, aqi = PROFILE_BASELINES[profile]
    today = date.today().replace(day=1)
    rows = []
    months = years * 12
    for offset in range(months):
        observed = today - timedelta(days=30 * (months - offset))
        monsoon = 1.0 + 0.55 * sin((observed.month - 5) / 12 * 6.283)
        heat = 1.0 + 0.22 * sin((observed.month - 3) / 12 * 6.283)
        noise = rng.uniform(-0.08, 0.08)
        rainfall_mm = max(0, rainfall * monsoon * (1 + noise))
        temp_c = temp * heat + rng.uniform(-1.5, 1.5)
        soil_pct = clamp(soil + (rainfall_mm - rainfall) * 0.08 - (temp_c - temp) * 1.6)
        ndvi_value = clamp(ndvi + (soil_pct - soil) * 0.006, 0, 1)
        reservoir_pct = clamp(reservoir + (rainfall_mm - rainfall) * 0.12 - (temp_c - temp) * 1.3)
        deficit = clamp((rainfall - rainfall_mm) / max(rainfall, 1) * 100, -100, 100)
        rows.append(
            {
                "observed_on": observed,
                "rainfall_mm": round(rainfall_mm, 1),
                "rainfall_deficit_pct": round(deficit, 1),
                "temperature_c": round(temp_c, 1),
                "humidity_pct": round(clamp(humidity + rng.uniform(-8, 8)), 1),
                "river_level_m": round(max(0.2, river + (rainfall_mm - rainfall) * 0.015), 2),
                "soil_moisture_pct": round(soil_pct, 1),
                "aqi": int(clamp(aqi + rng.uniform(-18, 22), 10, 400)),
                "ndvi": round(ndvi_value, 3),
                "land_surface_temp_c": round(temp_c + rng.uniform(1.5, 4.5), 1),
                "water_body_index": round(clamp(0.2 + reservoir_pct / 180, 0, 1), 3),
                "reservoir_level_pct": round(reservoir_pct, 1),
            }
        )
    return rows


def sample_alerts() -> list[dict]:
    now = datetime.now(timezone.utc)
    return [
        {
            "district_code": "AS-DH",
            "severity": "high",
            "alert_type": "Flood Watch",
            "title": "Brahmaputra tributary levels rising",
            "message": "River levels and soil saturation indicate elevated flood risk over the next 72 hours.",
            "issued_at": now,
        },
        {
            "district_code": "RJ-JS",
            "severity": "critical",
            "alert_type": "Heatwave",
            "title": "Extreme heat stress likely",
            "message": "Maximum temperature anomaly and low humidity indicate severe outdoor exposure risk.",
            "issued_at": now,
        },
        {
            "district_code": "MH-MW",
            "severity": "high",
            "alert_type": "Drought",
            "title": "Reservoir drawdown alert",
            "message": "Reservoir storage and vegetation health remain below district resilience thresholds.",
            "issued_at": now,
        },
    ]
