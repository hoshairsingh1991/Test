import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { GroupedPerformance } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";

interface PnlBreakdownProps {
  title: string;
  rows: GroupedPerformance[] | undefined;
}

export function PnlBreakdown({ title, rows }: PnlBreakdownProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
      <h3 className="text-lg font-semibold tracking-tight mb-5">{title}</h3>
      <div className="flex-1 min-h-[220px]">
        {rows && rows.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis
                dataKey="label"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <RechartsTooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [formatCurrency(value), "PnL"]}
              />
              <Bar dataKey="totalPnl" radius={[4, 4, 0, 0]}>
                {rows.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.totalPnl >= 0 ? "hsl(var(--win))" : "hsl(var(--loss))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No data in this period
          </div>
        )}
      </div>
    </div>
  );
}
