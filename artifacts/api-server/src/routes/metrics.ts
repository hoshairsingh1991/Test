import { Router, type IRouter } from "express";
import { db, tradesTable, type Trade } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import {
  inRange,
  parseAnchor,
  parseTimeframe,
  periodRange,
} from "../lib/timeframe";

const router: IRouter = Router();

async function loadUserTrades(userId: string): Promise<Trade[]> {
  return db.select().from(tradesTable).where(eq(tradesTable.userId, userId));
}

function summarize(trades: Trade[]) {
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const breakeven = trades.filter((t) => t.pnl === 0);
  const winRate = trades.length ? wins.length / trades.length : 0;
  const avgWin = wins.length
    ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length
    : 0;
  const avgLoss = losses.length
    ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length
    : 0;
  const avgR = trades.length
    ? trades.reduce((s, t) => s + t.rr, 0) / trades.length
    : 0;
  const avgWinR = wins.length
    ? wins.reduce((s, t) => s + t.rr, 0) / wins.length
    : 0;
  const avgLossR = losses.length
    ? Math.abs(losses.reduce((s, t) => s + t.rr, 0) / losses.length)
    : 0;
  // Expectancy in R: P(win)*avgWinR - P(loss)*avgLossR
  const pWin = trades.length ? wins.length / trades.length : 0;
  const pLoss = trades.length ? losses.length / trades.length : 0;
  const expectancyR = pWin * avgWinR - pLoss * avgLossR;
  return {
    totalPnl: Number(totalPnl.toFixed(4)),
    tradeCount: trades.length,
    winRate: Number(winRate.toFixed(4)),
    avgWin: Number(avgWin.toFixed(4)),
    avgLoss: Number(avgLoss.toFixed(4)),
    expectancyR: Number(expectancyR.toFixed(4)),
    avgR: Number(avgR.toFixed(4)),
    wins: wins.length,
    losses: losses.length,
    breakeven: breakeven.length,
  };
}

function filterByPeriod(trades: Trade[], start: Date, end: Date): Trade[] {
  return trades.filter((t) => inRange(t.tradedAt, start, end));
}

router.get("/metrics/summary", requireAuth, async (req, res) => {
  const timeframe = parseTimeframe(req.query.timeframe);
  const anchor = parseAnchor(req.query.date);
  const range = periodRange(timeframe, anchor);

  const all = await loadUserTrades(req.userId!);
  const current =
    timeframe === "all" ? all : filterByPeriod(all, range.start, range.end);
  const previous =
    timeframe === "all"
      ? { ...summarize([]) }
      : summarize(filterByPeriod(all, range.prevStart, range.prevEnd));

  res.json({
    ...summarize(current),
    previous,
    periodStart: range.start.toISOString(),
    periodEnd: range.end.toISOString(),
  });
});

router.get("/metrics/equity-curve", requireAuth, async (req, res) => {
  const timeframe = parseTimeframe(req.query.timeframe);
  const anchor = parseAnchor(req.query.date);
  const range = periodRange(timeframe, anchor);

  const all = await loadUserTrades(req.userId!);
  const trades =
    timeframe === "all" ? all : filterByPeriod(all, range.start, range.end);
  const sorted = [...trades].sort(
    (a, b) => a.tradedAt.getTime() - b.tradedAt.getTime(),
  );
  let cum = 0;
  const points = sorted.map((t) => {
    cum += t.pnl;
    return {
      date: t.tradedAt.toISOString(),
      cumulativePnl: Number(cum.toFixed(4)),
    };
  });
  res.json(points);
});

router.get("/metrics/win-loss", requireAuth, async (req, res) => {
  const timeframe = parseTimeframe(req.query.timeframe);
  const anchor = parseAnchor(req.query.date);
  const range = periodRange(timeframe, anchor);

  const all = await loadUserTrades(req.userId!);
  const trades =
    timeframe === "all" ? all : filterByPeriod(all, range.start, range.end);
  const wins = trades.filter((t) => t.pnl > 0).length;
  const losses = trades.filter((t) => t.pnl < 0).length;
  const breakeven = trades.filter((t) => t.pnl === 0).length;
  res.json({ wins, losses, breakeven });
});

function groupBy(trades: Trade[], key: (t: Trade) => string) {
  const groups = new Map<string, Trade[]>();
  for (const t of trades) {
    const k = key(t);
    const arr = groups.get(k) ?? [];
    arr.push(t);
    groups.set(k, arr);
  }
  return Array.from(groups.entries()).map(([label, items]) => {
    const wins = items.filter((t) => t.pnl > 0).length;
    const totalPnl = items.reduce((s, t) => s + t.pnl, 0);
    return {
      label,
      tradeCount: items.length,
      winRate: items.length ? Number((wins / items.length).toFixed(4)) : 0,
      totalPnl: Number(totalPnl.toFixed(4)),
      avgPnl: items.length ? Number((totalPnl / items.length).toFixed(4)) : 0,
    };
  });
}

router.get("/metrics/by-setup", requireAuth, async (req, res) => {
  const timeframe = parseTimeframe(req.query.timeframe);
  const anchor = parseAnchor(req.query.date);
  const range = periodRange(timeframe, anchor);

  const all = await loadUserTrades(req.userId!);
  const trades =
    timeframe === "all" ? all : filterByPeriod(all, range.start, range.end);
  res.json(groupBy(trades, (t) => t.setupType));
});

router.get("/metrics/by-session", requireAuth, async (req, res) => {
  const timeframe = parseTimeframe(req.query.timeframe);
  const anchor = parseAnchor(req.query.date);
  const range = periodRange(timeframe, anchor);

  const all = await loadUserTrades(req.userId!);
  const trades =
    timeframe === "all" ? all : filterByPeriod(all, range.start, range.end);
  res.json(groupBy(trades, (t) => t.session));
});

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

router.get("/metrics/calendar", requireAuth, async (req, res) => {
  const anchor = parseAnchor(req.query.date);
  const start = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1),
  );
  const end = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 1),
  );

  const all = await loadUserTrades(req.userId!);
  const trades = filterByPeriod(all, start, end);

  const byDay = new Map<string, Trade[]>();
  for (const t of trades) {
    const k = dateKey(t.tradedAt);
    const arr = byDay.get(k) ?? [];
    arr.push(t);
    byDay.set(k, arr);
  }

  const days = Array.from(byDay.entries()).map(([date, items]) => {
    const wins = items.filter((t) => t.pnl > 0).length;
    return {
      date,
      pnl: Number(items.reduce((s, t) => s + t.pnl, 0).toFixed(4)),
      tradeCount: items.length,
      winRate: items.length ? Number((wins / items.length).toFixed(4)) : 0,
    };
  });
  res.json(days);
});

router.get("/metrics/day", requireAuth, async (req, res) => {
  const dateRaw = typeof req.query.date === "string" ? req.query.date : "";
  if (!dateRaw) {
    res.status(400).json({ error: "date is required" });
    return;
  }
  const anchor = parseAnchor(dateRaw);
  const start = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const all = await loadUserTrades(req.userId!);
  const trades = filterByPeriod(all, start, end);

  const wins = trades.filter((t) => t.pnl > 0).length;
  const sorted = [...trades].sort((a, b) => b.pnl - a.pnl);
  const best = sorted[0] ?? null;
  const worst = sorted[sorted.length - 1] ?? null;

  const losers = trades.filter((t) => t.pnl < 0);
  const mistakes: string[] = [];
  if (losers.some((t) => t.executionQuality === "FOMO")) {
    mistakes.push("FOMO entries on losing trades");
  }
  if (losers.some((t) => !t.emaAlignment)) {
    mistakes.push("Counter-trend (no EMA alignment) losses");
  }
  if (losers.some((t) => t.executionQuality === "B")) {
    mistakes.push("B-grade execution on losers");
  }

  function rowOf(t: Trade | null) {
    if (!t) return null;
    return {
      symbol: t.symbol,
      direction: t.direction,
      pnl: Number(t.pnl.toFixed(4)),
      rr: Number(t.rr.toFixed(4)),
      executionQuality: t.executionQuality,
    };
  }

  res.json({
    date: start.toISOString().slice(0, 10),
    pnl: Number(trades.reduce((s, t) => s + t.pnl, 0).toFixed(4)),
    tradeCount: trades.length,
    winRate: trades.length ? Number((wins / trades.length).toFixed(4)) : 0,
    bestTrade: rowOf(best && best.pnl > 0 ? best : best),
    worstTrade: rowOf(worst && worst.pnl < 0 ? worst : worst),
    mistakes,
  });
});

export default router;
