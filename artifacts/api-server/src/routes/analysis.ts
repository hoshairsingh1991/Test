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

function compare(groupA: string, groupB: string, a: Trade[], b: Trade[]) {
  const winsA = a.filter((t) => t.pnl > 0).length;
  const winsB = b.filter((t) => t.pnl > 0).length;
  const pnlA = a.reduce((s, t) => s + t.pnl, 0);
  const pnlB = b.reduce((s, t) => s + t.pnl, 0);
  return {
    groupA,
    groupB,
    winRateA: a.length ? Number((winsA / a.length).toFixed(4)) : 0,
    winRateB: b.length ? Number((winsB / b.length).toFixed(4)) : 0,
    pnlA: Number(pnlA.toFixed(4)),
    pnlB: Number(pnlB.toFixed(4)),
    countA: a.length,
    countB: b.length,
  };
}

router.get("/analysis/execution", requireAuth, async (req, res) => {
  const timeframe = parseTimeframe(req.query.timeframe);
  const anchor = parseAnchor(req.query.date);
  const range = periodRange(timeframe, anchor);

  const all = await db
    .select()
    .from(tradesTable)
    .where(eq(tradesTable.userId, req.userId!));

  const trades =
    timeframe === "all"
      ? all
      : all.filter((t) => inRange(t.tradedAt, range.start, range.end));

  const emaYes = trades.filter((t) => t.emaAlignment);
  const emaNo = trades.filter((t) => !t.emaAlignment);
  const aPlus = trades.filter((t) => t.executionQuality === "A+");
  const fomo = trades.filter((t) => t.executionQuality === "FOMO");

  res.json({
    emaComparison: compare("With EMA", "Without EMA", emaYes, emaNo),
    qualityComparison: compare("A+", "FOMO", aPlus, fomo),
  });
});

export default router;
