CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'analyst',
  hashed_password VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS states (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  code VARCHAR(8) UNIQUE NOT NULL,
  centroid_lat DOUBLE PRECISION NOT NULL,
  centroid_lon DOUBLE PRECISION NOT NULL,
  boundary_geojson JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  state_id INTEGER NOT NULL REFERENCES states(id),
  name VARCHAR(120) NOT NULL,
  code VARCHAR(16) UNIQUE NOT NULL,
  population INTEGER NOT NULL DEFAULT 0,
  area_sq_km DOUBLE PRECISION NOT NULL DEFAULT 0,
  centroid_lat DOUBLE PRECISION NOT NULL,
  centroid_lon DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(MULTIPOLYGON, 4326),
  boundary_geojson JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_districts_state_name ON districts(state_id, name);
CREATE INDEX IF NOT EXISTS ix_districts_geom ON districts USING GIST(geom);

CREATE TABLE IF NOT EXISTS weather_data (
  id SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL REFERENCES districts(id),
  observed_on DATE NOT NULL,
  rainfall_mm DOUBLE PRECISION NOT NULL,
  rainfall_deficit_pct DOUBLE PRECISION NOT NULL DEFAULT 0,
  temperature_c DOUBLE PRECISION NOT NULL,
  humidity_pct DOUBLE PRECISION NOT NULL,
  river_level_m DOUBLE PRECISION NOT NULL DEFAULT 0,
  soil_moisture_pct DOUBLE PRECISION NOT NULL DEFAULT 0,
  aqi INTEGER NOT NULL DEFAULT 60,
  source VARCHAR(80) NOT NULL DEFAULT 'mock-imd',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_weather_district_observed ON weather_data(district_id, observed_on);

CREATE TABLE IF NOT EXISTS satellite_data (
  id SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL REFERENCES districts(id),
  observed_on DATE NOT NULL,
  ndvi DOUBLE PRECISION NOT NULL,
  land_surface_temp_c DOUBLE PRECISION NOT NULL,
  soil_moisture_pct DOUBLE PRECISION NOT NULL,
  water_body_index DOUBLE PRECISION NOT NULL,
  reservoir_level_pct DOUBLE PRECISION NOT NULL,
  source VARCHAR(80) NOT NULL DEFAULT 'mock-nrsc',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_satellite_district_observed ON satellite_data(district_id, observed_on);

CREATE TABLE IF NOT EXISTS risk_scores (
  id SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL REFERENCES districts(id),
  valid_on DATE NOT NULL,
  flood_risk DOUBLE PRECISION NOT NULL,
  drought_risk DOUBLE PRECISION NOT NULL,
  heatwave_risk DOUBLE PRECISION NOT NULL,
  water_stress_risk DOUBLE PRECISION NOT NULL,
  composite_risk DOUBLE PRECISION NOT NULL,
  trend VARCHAR(24) NOT NULL DEFAULT 'stable',
  drivers JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_risk_district_valid ON risk_scores(district_id, valid_on);

CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL REFERENCES districts(id),
  prediction_type VARCHAR(40) NOT NULL,
  probability DOUBLE PRECISION NOT NULL,
  risk_zone VARCHAR(40) NOT NULL,
  model_name VARCHAR(80) NOT NULL,
  model_version VARCHAR(30) NOT NULL DEFAULT 'mock-v1',
  valid_for DATE NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  explanation TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS simulation_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  district_id INTEGER REFERENCES districts(id),
  scenario JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  prompt TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS climate_alerts (
  id SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL REFERENCES districts(id),
  severity VARCHAR(20) NOT NULL,
  alert_type VARCHAR(60) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
