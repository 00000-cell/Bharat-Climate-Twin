import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "cyan"
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "cyan" | "emerald" | "amber" | "red";
}) {
  const toneMap = {
    cyan: "text-cyan-200 bg-cyan-400/12 border-cyan-300/25",
    emerald: "text-emerald-200 bg-emerald-400/12 border-emerald-300/25",
    amber: "text-amber-200 bg-amber-400/12 border-amber-300/25",
    red: "text-red-200 bg-red-400/12 border-red-300/25"
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-normal text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-400">{detail}</p>
        </div>
        <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-md border", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
