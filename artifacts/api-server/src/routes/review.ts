import { Router, type IRouter } from "express";
import { db, tradesTable, type Trade } from "@workspace/db";
import { and, eq, gte, lte } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
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

function mostCommonMistake(trades: Trade[]): string | null {
  const losers = trades.filter((t) => t.pnl < 0);
  if (losers.length === 0) return null;

  const fomo = losers.filter((t) => t.executionQuality === "FOMO").length;
  const noEma = losers.filter((t) => !t.emaAlignment).length;
  const bGrade = losers.filter((t) => t.executionQuality === "B").length;

  const candidates: Array<{ label: string; count: number }> = [
    { label: "FOMO entries", count: fomo },
    { label: "Trading against EMA alignment", count: noEma },
    { label: "B-grade execution", count: bGrade },
  ];
  candidates.sort((a, b) => b.count - a.count);
  if (candidates[0].count === 0) return null;
  return candidates[0].label;
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
        gte(tradesTable.tradedAt, weekStart),
        lte(tradesTable.tradedAt, weekEnd),
      ),
    );

  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const setupRes = bestWorstBy(trades, (t) => t.setupType);
  const sessionRes = bestWorstBy(trades, (t) => t.session);

  res.json({
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    tradeCount: trades.length,
    totalPnl: Number(totalPnl.toFixed(4)),
    bestSetup: setupRes.best,
    worstSetup: setupRes.worst,
    bestSession: sessionRes.best,
    mostCommonMistake: mostCommonMistake(trades),
  });
});

export default router;
