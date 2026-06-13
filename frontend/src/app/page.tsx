import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  DatabaseZap,
  Droplets,
  Gauge,
  Map,
  Satellite,
  ShieldAlert
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const capabilities = [
  { title: "Satellite + Weather Fusion", icon: Satellite, detail: "Mock NRSC, Bhuvan, IMD, India-WRIS, and CPCB feeds." },
  { title: "District Risk Engine", icon: Gauge, detail: "Flood, drought, heatwave, and water-stress scores from 0-100." },
  { title: "Scenario Simulator", icon: Activity, detail: "Stress-test rainfall, temperature, reservoir, and crop outcomes." },
  { title: "AI Climate Copilot", icon: DatabaseZap, detail: "Ask operational questions and receive charts plus interventions." }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <section className="relative min-h-[92vh] overflow-hidden">
        <Image
          src="/images/bharat-climate-hero.png"
          alt="Satellite digital twin of India with climate overlays"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/78 to-slate-950/18" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
        <div className="relative z-10 flex min-h-[92vh] items-center px-5 py-24 sm:px-8 lg:px-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100 backdrop-blur">
              <ShieldAlert className="h-4 w-4" />
              Government-tech climate command layer
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-normal text-white sm:text-7xl">
              Bharat Climate Twin
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              An AI-powered digital twin of India&apos;s climate system for prediction, simulation,
              and visualization of flood, drought, heat, water, air, and crop risks.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="default">
                <Link href="/dashboard">
                  Open Command Center
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/map">
                  <Map className="h-4 w-4" />
                  Launch Digital Twin Map
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-16 px-5 pb-12 sm:px-8 lg:px-16">
        <div className="relative z-20 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <CardContent className="p-5">
                  <div className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/25 bg-cyan-400/10 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-base font-semibold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 px-5 pb-16 sm:px-8 lg:grid-cols-3 lg:px-16">
        {[
          { title: "Flood Risk", detail: "Brahmaputra, coastal, and urban drainage exposure", icon: Droplets },
          { title: "Drought Watch", detail: "Rainfall deficit, vegetation health, reservoir drawdown", icon: Activity },
          { title: "Action Layer", detail: "District rankings, alerts, PDF reports, role-based access", icon: ShieldAlert }
        ].map((item) => {
          const Icon = item.icon;
          return (
          <div key={item.title} className="rounded-lg border border-cyan-300/15 bg-slate-950/40 p-5">
            <Icon className="h-5 w-5 text-emerald-200" />
            <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
          </div>
          );
        })}
      </section>
    </main>
  );
}
