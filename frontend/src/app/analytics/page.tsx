"use client";

import { useEffect, useState } from "react";
import { BarChart3, CloudRain, Droplets, Flame, RadioTower } from "lucide-react";

import { TrendAreaChart } from "@/components/climate/Charts";
import { MetricCard } from "@/components/climate/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Analytics } from "@/lib/types";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    api.analytics().then(setAnalytics).catch(() => undefined);
  }, []);

  const data = analytics?.national_trends ?? [];
  const summary = analytics?.summary;

  return (
    <div className="grid gap-5">
      <div>
        <Badge>Climate Analytics Dashboard</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white">National Climate Analytics</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Trends for temperature, rainfall, reservoir storage, air quality, and disaster forecast readiness.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Temperature" value={`${summary?.avg_temperature_c ?? "--"} C`} detail="Latest average" icon={Flame} tone="red" />
        <MetricCard title="Rainfall" value={`${summary?.avg_rainfall_mm ?? "--"} mm`} detail="Latest average" icon={CloudRain} tone="cyan" />
        <MetricCard title="Reservoir" value={`${summary?.avg_reservoir_level_pct ?? "--"}%`} detail="Storage status" icon={Droplets} tone="emerald" />
        <MetricCard title="AQI" value={`${summary?.avg_aqi ?? "--"}`} detail="Air quality index" icon={RadioTower} tone="amber" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>National Temperature Trends</CardTitle>
            <CardDescription>Monthly district average, latest 36 points.</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendAreaChart data={data} dataKey="temperature_c" color="#f87171" unit=" C" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rainfall Trends</CardTitle>
            <CardDescription>IMD-style precipitation aggregate.</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendAreaChart data={data} dataKey="rainfall_mm" color="#38bdf8" unit=" mm" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reservoir Status</CardTitle>
            <CardDescription>India-WRIS compatible storage feed.</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendAreaChart data={data} dataKey="reservoir_level_pct" color="#34d399" unit="%" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Air Quality Index</CardTitle>
            <CardDescription>CPCB-style district AQI aggregate.</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendAreaChart data={data} dataKey="aqi" color="#fbbf24" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disaster Forecast Summary</CardTitle>
          <CardDescription>Model facades prepared for XGBoost, Random Forest, and scikit-learn pipelines.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[
            ["Flood Forecast", "Rainfall, river levels, soil saturation, and reservoir headroom", "RandomForestFlood-v1"],
            ["Drought Forecast", "Rainfall deficit, heat anomaly, vegetation condition", "XGBoostDrought-v1"],
            ["Heatwave Forecast", "Temperature trend and humidity stress", "SklearnHeatAlert-v1"]
          ].map(([title, detail, model]) => (
            <div key={title} className="rounded-md border border-cyan-300/15 bg-white/[0.03] p-4">
              <BarChart3 className="h-5 w-5 text-cyan-200" />
              <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
              <Badge className="mt-4">{model}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
