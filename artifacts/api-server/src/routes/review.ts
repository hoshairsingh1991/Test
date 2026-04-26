import { Router, type IRouter } from "express";
import { db, tradesTable, type Trade } from "@workspace/db";
import { and, eq, gte, lte } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function endOfWeek(d: Date): Date {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return end;
}

function bestWorstBy(trades: Trade[], key: (t: Trade) => string) {
  const groups = new Map<string, number>();
  for (const t of trades) {
    const k = key(t);
    groups.set(k, (groups.get(k) ?? 0) + t.pnl);
  }
  if (groups.size === 0) return { best: null, worst: null };
  let best: string | null = null;
  let worst: string | null = null;
  let bestPnl = -Infinity;
  let worstPnl = Infinity;
  for (const [k, v] of groups.entries()) {
    if (v > bestPnl) {
      bestPnl = v;
      best = k;
    }
    if (v < worstPnl) {
      worstPnl = v;
      worst = k;
    }
  }
  return { best, worst };
}

function bestWorstHabit(trades: Trade[]): { worstHabit: string | null; mostCommonMistake: string | null } {
  const losers = trades.filter((t) => t.pnl < 0);
  if (losers.length === 0) return { worstHabit: null, mostCommonMistake: null };

  const habits = [
    {
      label: "FOMO entries",
      count: losers.filter((t) => t.executionQuality === "FOMO").length,
    },
    {
      label: "Trading against EMA",
      count: losers.filter((t) => !t.emaAlignment).length,
    },
    {
      label: "B-grade execution",
      count: losers.filter((t) => t.executionQuality === "B").length,
    },
  ];
  habits.sort((a, b) => b.count - a.count);
  if (habits[0].count === 0) return { worstHabit: null, mostCommonMistake: null };
  return { worstHabit: habits[0].label, mostCommonMistake: habits[0].label };
}

function dayName(d: Date): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getUTCDay()];
}

function bestWorstDay(trades: Trade[]) {
  return bestWorstBy(trades, (t) => dayName(t.tradedAt));
}

function buildRecommendation(
  bestSetup: string | null,
  worstSetup: string | null,
  bestSession: string | null,
  worstHabit: string | null,
): string | null {
  const parts: string[] = [];
  if (bestSetup) parts.push(`Lean into ${bestSetup} setups`);
  if (bestSession) parts.push(`during the ${bestSession} session`);
  if (worstSetup && worstSetup !== bestSetup) parts.push(`Cut size on ${worstSetup} until you fix it`);
  if (worstHabit) parts.push(`Eliminate ${worstHabit.toLowerCase()}`);
  if (parts.length === 0) return null;
  return parts.join(". ") + ".";
}

router.get("/review/weekly", requireAuth, async (req, res) => {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const trades = await db
    .select()
    .from(tradesTable)
    .where(
      and(
        eq(tradesTable.userId, req.userId!),
        eq(tradesTable.isDeleted, false),
        gte(tradesTable.tradedAt, weekStart),
        lte(tradesTable.tradedAt, weekEnd),
      ),
    );

  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const setupRes = bestWorstBy(trades, (t) => t.setupType);
  const sessionRes = bestWorstBy(trades, (t) => t.session);
  const dayRes = bestWorstDay(trades);
  const habit = bestWorstHabit(trades);
  const recommendation = buildRecommendation(
    setupRes.best,
    setupRes.worst,
    sessionRes.best,
    habit.worstHabit,
  );

  res.json({
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    tradeCount: trades.length,
    totalPnl: Number(totalPnl.toFixed(4)),
    bestSetup: setupRes.best,
    worstSetup: setupRes.worst,
    bestSession: sessionRes.best,
    worstSession: sessionRes.worst,
    bestDay: dayRes.best,
    worstDay: dayRes.worst,
    worstHabit: habit.worstHabit,
    mostCommonMistake: habit.mostCommonMistake,
    recommendation,
  });
});

export default router;
