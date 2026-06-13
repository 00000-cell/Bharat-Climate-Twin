"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Gauge,
  Home,
  Layers3,
  LockKeyhole,
  Map,
  Orbit,
  Settings,
  SlidersHorizontal
} from "lucide-react";

import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Mission", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/map", label: "Digital Twin", icon: Map },
  { href: "/risk-center", label: "Risk Center", icon: Activity },
  { href: "/simulator", label: "Simulator", icon: SlidersHorizontal },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/history", label: "Explorer", icon: Layers3 },
  { href: "/copilot", label: "AI Copilot", icon: Bot },
  { href: "/admin", label: "Admin", icon: Settings },
  { href: "/login", label: "Sign In", icon: LockKeyhole }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) return <>{children}</>;

  return (
    <div className="min-h-screen bg-radar-grid bg-[size:44px_44px]">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-cyan-300/15 bg-slate-950/82 px-4 py-5 backdrop-blur-2xl lg:block">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/30 bg-cyan-400/10">
            <Orbit className="h-6 w-6 text-cyan-200" />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Bharat
            </span>
            <span className="block text-lg font-semibold tracking-normal text-white">
              Climate Twin
            </span>
          </span>
        </Link>

        <nav className="mt-8 grid gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition",
                  active && "bg-cyan-400/12 text-white shadow-glow",
                  !active && "hover:bg-white/6 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <header className="sticky top-0 z-30 border-b border-cyan-300/15 bg-slate-950/84 px-4 py-3 backdrop-blur-2xl lg:ml-72">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Orbit className="h-6 w-6 text-cyan-200" />
            <span className="font-semibold">Bharat Climate Twin</span>
          </Link>
          <div className="hidden text-sm text-muted-foreground lg:block">
            National Climate Digital Twin Command Layer
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-md border border-emerald-300/25 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-100 sm:block">
              Live mock feeds synced
            </div>
            <button
              className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/20 bg-white/5 text-cyan-100"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {nav.slice(1, 8).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-w-max items-center gap-2 rounded-md border border-cyan-300/15 px-3 py-2 text-xs text-slate-300",
                  pathname === item.href && "bg-cyan-400/12 text-white"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="px-4 py-5 lg:ml-72 lg:px-8">{children}</main>
    </div>
  );
}
