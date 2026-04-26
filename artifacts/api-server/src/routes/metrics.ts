import { Router, type IRouter } from "express";
import { db, tradesTable, type Trade } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

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
  const expectancyR = trades.length
    ? trades.reduce((s, t) => s + t.rr, 0) / trades.length
    : 0;
  return {
    totalPnl: Number(totalPnl.toFixed(4)),
    tradeCount: trades.length,
    winRate: Number(winRate.toFixed(4)),
    avgWin: Number(avgWin.toFixed(4)),
    avgLoss: Number(avgLoss.toFixed(4)),
    expectancyR: Number(expectancyR.toFixed(4)),
    wins: wins.length,
    losses: losses.length,
    breakeven: breakeven.length,
  };
}

router.get("/metrics/summary", requireAuth, async (req, res) => {
  const trades = await loadUserTrades(req.userId!);
  res.json(summarize(trades));
});

router.get("/metrics/equity-curve", requireAuth, async (req, res) => {
  const trades = await loadUserTrades(req.userId!);
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
  const trades = await loadUserTrades(req.userId!);
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
  const trades = await loadUserTrades(req.userId!);
  res.json(groupBy(trades, (t) => t.setupType));
});

router.get("/metrics/by-session", requireAuth, async (req, res) => {
  const trades = await loadUserTrades(req.userId!);
  res.json(groupBy(trades, (t) => t.session));
});

export default router;
