import { riskFill } from "@/lib/utils";

export function RiskGauge({
  value,
  label,
  size = "md"
}: {
  value: number;
  label: string;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? "h-28 w-28" : "h-40 w-40";
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`grid ${dimension} place-items-center rounded-full`}
        style={{
          background: `conic-gradient(${riskFill(value)} ${value * 3.6}deg, rgba(148, 163, 184, 0.18) 0deg)`
        }}
      >
        <div className="grid h-[76%] w-[76%] place-items-center rounded-full border border-cyan-300/10 bg-slate-950/88 text-center">
          <span className="text-3xl font-semibold text-white">{Math.round(value)}</span>
          <span className="-mt-3 text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <p className="text-center text-sm font-medium text-cyan-50">{label}</p>
    </div>
  );
}
