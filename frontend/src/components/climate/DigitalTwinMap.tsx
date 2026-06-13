"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Layers, LocateFixed } from "lucide-react";
import mapboxgl from "mapbox-gl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { riskFill } from "@/lib/utils";

const layerOptions = [
  "temperature",
  "rainfall",
  "ndvi",
  "air_quality",
  "soil_moisture",
  "water_bodies",
  "reservoir_level",
  "flood_risk",
  "drought_risk"
];

function colorForFeature(feature: GeoJSON.Feature, layer: string) {
  const props = feature.properties as Record<string, number | string>;
  const value = Number(props[layer] ?? props.composite_risk ?? 50);
  if (layer.includes("risk")) return riskFill(value);
  if (layer === "temperature") return value >= 38 ? "#f87171" : "#22d3ee";
  if (layer === "rainfall" || layer === "water_bodies") return "#38bdf8";
  if (layer === "ndvi") return "#34d399";
  if (layer === "air_quality") return value > 150 ? "#f59e0b" : "#22d3ee";
  return "#2dd4bf";
}

export function DigitalTwinMap({ compact = false }: { compact?: boolean }) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [data, setData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [layer, setLayer] = useState("flood_risk");
  const [selected, setSelected] = useState<GeoJSON.Feature | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    api.layers().then(setData).catch(() => setData(null));
  }, []);

  const features = useMemo(() => data?.features ?? [], [data]);

  useEffect(() => {
    if (!token || !mapNode.current || !data || mapRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [78.9629, 22.5937],
      zoom: compact ? 3.2 : 4.2,
      attributionControl: false
    });
    mapRef.current = map;
    map.on("load", () => {
      map.addSource("district-risk", {
        type: "geojson",
        data
      });
      map.addLayer({
        id: "district-risk-fill",
        type: "fill",
        source: "district-risk",
        paint: {
          "fill-color": [
            "step",
            ["get", "composite_risk"],
            "#34d399",
            35,
            "#22d3ee",
            60,
            "#fbbf24",
            80,
            "#f87171"
          ],
          "fill-opacity": 0.36
        }
      });
      map.addLayer({
        id: "district-risk-line",
        type: "line",
        source: "district-risk",
        paint: {
          "line-color": "#67e8f9",
          "line-opacity": 0.7,
          "line-width": 1.5
        }
      });
      map.on("click", "district-risk-fill", (event) => {
        const feature = event.features?.[0];
        if (feature) setSelected(feature as GeoJSON.Feature);
      });
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [compact, data, token]);

  const selectedProps = (selected?.properties ?? features[0]?.properties ?? {}) as Record<string, string | number>;

  return (
    <div className={compact ? "grid gap-4 lg:grid-cols-[1fr_300px]" : "grid min-h-[calc(100vh-112px)] gap-4 xl:grid-cols-[1fr_340px]"}>
      <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-cyan-300/20 bg-slate-950/70 shadow-glow">
        {token ? (
          <div ref={mapNode} className="h-full min-h-[520px] w-full" />
        ) : (
          <div className="relative h-full min-h-[520px] overflow-hidden bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.20),transparent_34%),linear-gradient(135deg,#061525,#0a2019)]">
            <div className="absolute inset-0 bg-radar-grid bg-[size:40px_40px] opacity-70" />
            {features.map((feature, index) => {
              const props = feature.properties as Record<string, number | string>;
              const left = 18 + (index % 5) * 15 + (index % 2) * 4;
              const top = 15 + Math.floor(index / 5) * 32 + (index % 3) * 8;
              return (
                <button
                  key={`${props.district}-${index}`}
                  className="map-pulse absolute rounded-full border border-white/50 p-1"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    backgroundColor: `${colorForFeature(feature, layer)}44`
                  }}
                  onClick={() => setSelected(feature)}
                  title={`${props.district}`}
                >
                  <span
                    className="block h-8 w-8 rounded-full"
                    style={{ backgroundColor: colorForFeature(feature, layer) }}
                  />
                </button>
              );
            })}
            <div className="absolute left-6 top-6 max-w-sm">
              <Badge>Mapbox token optional</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-white">India Climate Risk Mesh</h2>
              <p className="mt-2 text-sm text-slate-300">
                Fallback command view renders district overlays from the same API layer feed.
              </p>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 rounded-md border border-cyan-300/20 bg-slate-950/82 p-2 backdrop-blur">
          <Layers className="h-4 w-4 text-cyan-200" />
          {layerOptions.map((item) => (
            <button
              key={item}
              onClick={() => setLayer(item)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                layer === item ? "bg-cyan-300 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {item.replaceAll("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Selected district</p>
            <h3 className="mt-1 text-xl font-semibold text-white">
              {selectedProps.district ?? "Awaiting data"}
            </h3>
            <p className="text-sm text-cyan-100">{selectedProps.state ?? "National view"}</p>
          </div>
          <Button size="icon" variant="outline" aria-label="Locate">
            <LocateFixed className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-6 grid gap-3">
          {[
            ["Flood", selectedProps.flood_risk],
            ["Drought", selectedProps.drought_risk],
            ["Heatwave", selectedProps.heatwave_risk],
            ["Water Stress", selectedProps.water_stress_risk],
            ["Composite", selectedProps.composite_risk]
          ].map(([name, value]) => (
            <div key={name as string}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-slate-300">{name}</span>
                <span className="font-semibold text-white">{Number(value ?? 0).toFixed(1)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Number(value ?? 0)}%`,
                    background: riskFill(Number(value ?? 0))
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-md border border-cyan-300/15 bg-cyan-400/8 p-4 text-sm text-slate-300">
          Animated climate overlays can be replaced with live raster tiles from Bhuvan, NRSC, IMD,
          India-WRIS, and CPCB without changing the map contract.
        </div>
      </Card>
    </div>
  );
}
