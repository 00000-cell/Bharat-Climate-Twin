"use client";

import { useEffect, useState } from "react";
import { Download, ShieldAlert } from "lucide-react";

import { DistrictSelector } from "@/components/climate/DistrictSelector";
import { RiskLineChart } from "@/components/climate/Charts";
import { RiskGauge } from "@/components/climate/RiskGauge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL, api } from "@/lib/api";
import type { Ranking, RiskScore } from "@/lib/types";
import { riskColor } from "@/lib/utils";

export default function RiskCenterPage() {
  const [districtId, setDistrictId] = useState<number>();
  const [risk, setRisk] = useState<RiskScore | null>(null);
  const [trends, setTrends] = useState<Array<Record<string, number | string>>>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);

  useEffect(() => {
    api.rankings(10).then(setRankings).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!districtId) return;
    Promise.all([api.risk(districtId), api.riskTrends(districtId)])
      .then(([riskResponse, trendsResponse]) => {
        setRisk(riskResponse);
        setTrends(trendsResponse.slice(-36));
      })
      .catch(() => undefined);
  }, [districtId]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <Badge>Climate Risk Engine</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white">District Risk Center</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Transparent 0-100 scoring for flood, drought, heatwave, and water stress with trend analytics.
          </p>
        </div>
        <div className="w-full max-w-md">
          <DistrictSelector value={districtId} onChange={setDistrictId} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader>
            <CardTitle>{risk?.district_name ?? "Select a district"}</CardTitle>
            <CardDescription>{risk?.state_name ?? "Latest district climate risk profile"}</CardDescription>
          </CardHeader>
          <CardContent className="grid place-items-center gap-6">
            <RiskGauge value={risk?.composite_risk ?? 0} label="Composite Climate Risk" />
            <div className="grid w-full grid-cols-2 gap-3">
              {[
                ["Flood", risk?.flood_risk ?? 0],
                ["Drought", risk?.drought_risk ?? 0],
                ["Heatwave", risk?.heatwave_risk ?? 0],
                ["Water Stress", risk?.water_stress_risk ?? 0]
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-md border border-cyan-300/15 bg-white/[0.03] p-3">
                  <p className="text-xs text-muted-foreground">{label as string}</p>
                  <p className={`mt-1 text-2xl font-semibold ${riskColor(value as number)}`}>
                    {Math.round(value as number)}
                  </p>
                </div>
              ))}
            </div>
            {districtId ? (
              <Button asChild variant="outline" className="w-full">
                <a href={`${API_BASE_URL}/api/v1/climate/reports/district/${districtId}.pdf`}>
                  <Download className="h-4 w-4" />
                  Export PDF Report
                </a>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Trend Graphs</CardTitle>
            <CardDescription>Multi-hazard monthly trajectory for planning and early warning.</CardDescription>
          </CardHeader>
          <CardContent>
            <RiskLineChart data={trends} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Climate Vulnerability Leaderboard</CardTitle>
          <CardDescription>Highest composite district scores first.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="text-left text-slate-400">
              <tr className="border-b border-cyan-300/15">
                <th className="py-3">District</th>
                <th>State</th>
                <th>Composite</th>
                <th>Flood</th>
                <th>Drought</th>
                <th>Heatwave</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((row) => (
                <tr key={row.district_id} className="border-b border-cyan-300/10">
                  <td className="py-3 font-medium text-white">{row.district_name}</td>
                  <td>{row.state_name}</td>
                  <td className={riskColor(row.composite_risk)}>{row.composite_risk}</td>
                  <td>{row.flood_risk}</td>
                  <td>{row.drought_risk}</td>
                  <td>{row.heatwave_risk}</td>
                  <td>
                    <Badge>{row.trend}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
