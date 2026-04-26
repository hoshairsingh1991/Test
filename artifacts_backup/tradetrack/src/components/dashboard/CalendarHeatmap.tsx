import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from "date-fns";
import type { CalendarDay } from "@workspace/api-client-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

interface CalendarHeatmapProps {
  month: Date;
  onMonthChange: (d: Date) => void;
  data: CalendarDay[] | undefined;
  onDayClick: (date: string) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function colorFor(pnl: number, max: number): string {
  if (pnl === 0) return "bg-card";
  const ratio = Math.min(1, Math.abs(pnl) / Math.max(max, 1));
  // 4 buckets each side
  const bucket = Math.ceil(ratio * 4);
  if (pnl > 0) {
    return ["bg-win/10", "bg-win/20", "bg-win/40", "bg-win/60", "bg-win/80"][bucket];
  }
  return ["bg-loss/10", "bg-loss/20", "bg-loss/40", "bg-loss/60", "bg-loss/80"][bucket];
}

export function CalendarHeatmap({ month, onMonthChange, data, onDayClick }: CalendarHeatmapProps) {
  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  const byDate = useMemo(() => {
    const m = new Map<string, CalendarDay>();
    for (const d of data ?? []) m.set(d.date, d);
    return m;
  }, [data]);

  const max = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map((d) => Math.abs(d.pnl)));
  }, [data]);

  const totalPnl = useMemo(
    () => (data ?? []).reduce((s, d) => s + d.pnl, 0),
    [data],
  );

  // Week starts Monday: shift Sunday(0) to 7
  const firstWeekday = getDay(days[0]);
  const offset = firstWeekday === 0 ? 6 : firstWeekday - 1;

  function prev() {
    const d = new Date(month);
    d.setMonth(d.getMonth() - 1);
    onMonthChange(d);
  }
  function next() {
    const d = new Date(month);
    d.setMonth(d.getMonth() + 1);
    onMonthChange(d);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Daily Performance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click a day for details
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Month total
            </div>
            <div className={`font-bold tabular-nums ${totalPnl >= 0 ? "text-win" : "text-loss"}`}>
              {formatCurrency(totalPnl)}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <Button variant="ghost" size="icon" onClick={prev} data-testid="button-prev-month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium px-2 min-w-[120px] text-center">
              {format(month, "MMMM yyyy")}
            </div>
            <Button variant="ghost" size="icon" onClick={next} data-testid="button-next-month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-xs text-muted-foreground uppercase tracking-widest text-center pb-2">
            {d}
          </div>
        ))}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const cell = byDate.get(key);
          const inMonth = isSameMonth(d, month);
          const cls = cell
            ? colorFor(cell.pnl, max)
            : "bg-muted/20 hover:bg-muted/40";
          return (
            <button
              key={key}
              onClick={() => cell && onDayClick(key)}
              disabled={!cell}
              className={`aspect-square rounded-md ${cls} ${
                cell ? "cursor-pointer hover:ring-1 hover:ring-primary/60" : "cursor-default"
              } ${isToday(d) ? "ring-1 ring-primary" : ""} ${
                !inMonth ? "opacity-40" : ""
              } flex flex-col items-center justify-center p-1 transition-all`}
              data-testid={`calendar-day-${key}`}
            >
              <span className="text-xs font-medium">{format(d, "d")}</span>
              {cell && (
                <span
                  className={`text-[10px] font-semibold tabular-nums ${
                    cell.pnl >= 0 ? "text-win" : "text-loss"
                  }`}
                >
                  {cell.pnl >= 0 ? "+" : ""}
                  {Math.abs(cell.pnl) >= 1000
                    ? `${(cell.pnl / 1000).toFixed(1)}k`
                    : cell.pnl.toFixed(0)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
