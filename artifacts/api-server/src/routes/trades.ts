import { Router, type IRouter } from "express";
import { db, tradesTable } from "@workspace/db";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  CreateTradeBody,
  ListTradesQueryParams,
  GetTradeParams,
  DeleteTradeParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { computePnl, computeRR } from "../lib/calc";

const router: IRouter = Router();

function serializeTrade(t: typeof tradesTable.$inferSelect) {
  return {
    id: t.id,
    symbol: t.symbol,
    entryPrice: t.entryPrice,
    exitPrice: t.exitPrice,
    size: t.size,
    direction: t.direction,
    tradedAt: t.tradedAt.toISOString(),
    setupType: t.setupType,
    session: t.session,
    emaAlignment: t.emaAlignment,
    executionQuality: t.executionQuality,
    notes: t.notes,
    screenshotUrl: t.screenshotUrl,
    pnl: t.pnl,
    rr: t.rr,
    createdAt: t.createdAt.toISOString(),
  };
}

router.get("/trades", requireAuth, async (req, res) => {
  const params = ListTradesQueryParams.parse(req.query);
  const conditions = [eq(tradesTable.userId, req.userId!)];
  if (params.setup) conditions.push(eq(tradesTable.setupType, params.setup));
  if (params.session) conditions.push(eq(tradesTable.session, params.session));
  if (params.execution)
    conditions.push(eq(tradesTable.executionQuality, params.execution));

  const sortBy = params.sortBy === "pnl" ? tradesTable.pnl : tradesTable.tradedAt;
  const orderFn = params.sortDir === "asc" ? asc : desc;

  const rows = await db
    .select()
    .from(tradesTable)
    .where(and(...conditions))
    .orderBy(orderFn(sortBy));

  res.json(rows.map(serializeTrade));
});

router.post("/trades", requireAuth, async (req, res) => {
  const body = CreateTradeBody.parse(req.body);
  const pnl = computePnl(body.direction, body.entryPrice, body.exitPrice, body.size);
  const rr = computeRR(body.direction, body.entryPrice, body.exitPrice);

  const [row] = await db
    .insert(tradesTable)
    .values({
      userId: req.userId!,
      symbol: body.symbol,
      entryPrice: body.entryPrice,
      exitPrice: body.exitPrice,
      size: body.size,
      direction: body.direction,
      tradedAt: new Date(body.tradedAt),
      setupType: body.setupType,
      session: body.session,
      emaAlignment: body.emaAlignment,
      executionQuality: body.executionQuality,
      notes: body.notes ?? null,
      screenshotUrl: body.screenshotUrl ?? null,
      pnl,
      rr,
    })
    .returning();

  res.json(serializeTrade(row));
});

router.get("/trades/:id", requireAuth, async (req, res) => {
  const { id } = GetTradeParams.parse(req.params);
  const [row] = await db
    .select()
    .from(tradesTable)
    .where(and(eq(tradesTable.id, id), eq(tradesTable.userId, req.userId!)));
  if (!row) {
    res.status(404).json({ error: "Trade not found" });
    return;
  }
  res.json(serializeTrade(row));
});

router.delete("/trades/:id", requireAuth, async (req, res) => {
  const { id } = DeleteTradeParams.parse(req.params);
  await db
    .delete(tradesTable)
    .where(and(eq(tradesTable.id, id), eq(tradesTable.userId, req.userId!)));
  res.json({ success: true });
});

export default router;
