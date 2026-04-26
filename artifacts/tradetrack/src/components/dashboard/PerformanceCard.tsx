import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceCardProps {
  label: string;
  value: string;
  valueClassName?: string;
  current: number;
  previous: number;
  formatDelta?: (delta: number) => string;
  invertColor?: boolean;
}

export function PerformanceCard({
  label,
  value,
  valueClassName,
  current,
  previous,
  formatDelta,
  invertColor,
}: PerformanceCardProps) {
  const delta = current - previous;
  const pct =
    previous === 0
      ? current === 0
        ? 0
        : null
      : (delta / Math.abs(previous)) * 100;

  const isUp = delta > 0;
  const isFlat = delta === 0;
  const positive = invertColor ? !isUp : isUp;
  const color = isFlat
    ? "text-muted-foreground"
    : positive
      ? "text-win"
      : "text-loss";
  const bg = isFlat
    ? "bg-muted/40"
    : positive
      ? "bg-win/10"
      : "bg-loss/10";

  let deltaLabel: string;
  if (formatDelta) {
    deltaLabel = formatDelta(delta);
  } else if (pct === null) {
    deltaLabel = "new";
  } else {
    deltaLabel = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between min-h-[140px] hover:border-primary/40 transition-colors">
      <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
        {label}
      </div>
      <div className="flex items-end justify-between gap-3 mt-2">
        <div className={cn("text-3xl font-bold tabular-nums tracking-tight", valueClassName)}>
          {value}
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md",
            bg,
            color,
          )}
        >
          {isFlat ? (
            <Minus className="h-3 w-3" />
          ) : isUp ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
          {deltaLabel}
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">vs previous period</div>
    </div>
  );
}
