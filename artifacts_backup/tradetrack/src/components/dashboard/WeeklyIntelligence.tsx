import { useGetWeeklyReview } from "@workspace/api-client-react";
import { Brain, Sparkles, Calendar, AlertTriangle } from "lucide-react";

function Stat({
  icon,
  label,
  value,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  positive?: boolean;
}) {
  const color = positive === true ? "text-win" : positive === false ? "text-loss" : "text-foreground";
  return (
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-md bg-muted/40 ${color}`}>{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className={`font-semibold mt-0.5 ${color}`}>{value ?? "—"}</div>
      </div>
    </div>
  );
}

export function WeeklyIntelligence() {
  const { data, isLoading } = useGetWeeklyReview();

  if (isLoading || !data) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="h-6 w-40 bg-muted/40 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold tracking-tight">Weekly Intelligence</h3>
        <span className="text-xs text-muted-foreground ml-2">
          {data.tradeCount} trade{data.tradeCount === 1 ? "" : "s"} this week
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
        <Stat
          icon={<Sparkles className="h-4 w-4" />}
          label="Best setup"
          value={data.bestSetup ?? null}
          positive
        />
        <Stat
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Worst habit"
          value={data.worstHabit ?? null}
          positive={false}
        />
        <Stat
          icon={<Calendar className="h-4 w-4" />}
          label="Best day"
          value={data.bestDay ?? null}
          positive
        />
        <Stat
          icon={<Calendar className="h-4 w-4" />}
          label="Worst day"
          value={data.worstDay ?? null}
          positive={false}
        />
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="text-xs uppercase tracking-widest text-primary mb-1">
          Recommendation
        </div>
        <p className="text-sm leading-relaxed">
          {data.recommendation ??
            "Log more trades to unlock personalized insights and surface your true edge."}
        </p>
      </div>
    </div>
  );
}
