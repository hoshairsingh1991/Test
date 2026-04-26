import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import type { WinLoss } from "@workspace/api-client-react";

interface TradeDistributionProps {
  data: WinLoss | undefined;
}

export function TradeDistribution({ data }: TradeDistributionProps) {
  const pieData = data
    ? [
        { name: "Wins", value: data.wins, color: "hsl(var(--win))" },
        { name: "Losses", value: data.losses, color: "hsl(var(--loss))" },
        { name: "Breakeven", value: data.breakeven, color: "hsl(var(--muted-foreground))" },
      ].filter((d) => d.value > 0)
    : [];

  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
      <h3 className="text-lg font-semibold tracking-tight mb-5">Trade Distribution</h3>
      <div className="flex-1 min-h-[220px] flex items-center justify-center relative">
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-muted-foreground text-sm">No trades in this period</div>
        )}
        {pieData.length > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
            <span className="text-2xl font-bold tabular-nums">{total}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              Total
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
