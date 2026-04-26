import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { EquityPoint } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import type { Timeframe } from "./TopBar";

interface PnlChartProps {
  data: EquityPoint[] | undefined;
  timeframe: Timeframe;
}

export function PnlChart({ data, timeframe }: PnlChartProps) {
  const points = data ?? [];
  const last = points[points.length - 1]?.cumulativePnl ?? 0;
  const positive = last >= 0;

  function formatTick(val: string) {
    const d = new Date(val);
    if (timeframe === "day") return format(d, "HH:mm");
    if (timeframe === "year") return format(d, "MMM");
    return format(d, "MMM d");
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">PnL Over Time</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Cumulative running total</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Period total
          </div>
          <div className={`text-2xl font-bold tabular-nums ${positive ? "text-win" : "text-loss"}`}>
            {formatCurrency(last)}
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-[280px]">
        {points.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="winGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--win))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--win))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--loss))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--loss))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis
                dataKey="date"
                tickFormatter={formatTick}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(val) => `$${val}`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [formatCurrency(value), "Cumulative PnL"]}
                labelFormatter={(label) => format(new Date(label as string), "PPp")}
              />
              <Area
                type="monotone"
                dataKey="cumulativePnl"
                stroke={positive ? "hsl(var(--win))" : "hsl(var(--loss))"}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={positive ? "url(#winGrad)" : "url(#lossGrad)"}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No trades in this period
          </div>
        )}
      </div>
    </div>
  );
}
