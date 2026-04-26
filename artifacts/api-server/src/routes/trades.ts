import { Router, type IRouter } from "express";
import { db, tradesTable } from "@workspace/db";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  CreateTradeBody,
  ListTradesQueryParams,
  GetTradeParams,
  DeleteTradeParams,
  ImportTradesBody,
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
    source: t.source,
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

router.post("/trades/import", requireAuth, async (req, res) => {
  const body = ImportTradesBody.parse(req.body);
  const userId = req.userId!;

  const existing = await db
    .select({
      symbol: tradesTable.symbol,
      tradedAt: tradesTable.tradedAt,
      entryPrice: tradesTable.entryPrice,
      exitPrice: tradesTable.exitPrice,
      size: tradesTable.size,
    })
    .from(tradesTable)
    .where(eq(tradesTable.userId, userId));

  const dupKey = (t: {
    symbol: string;
    tradedAt: Date | string;
    entryPrice: number;
    exitPrice: number;
    size: number;
  }) =>
    `${t.symbol}|${new Date(t.tradedAt).toISOString()}|${t.entryPrice}|${t.exitPrice}|${t.size}`;

  const seen = new Set(existing.map(dupKey));

  const rowsToInsert: (typeof tradesTable.$inferInsert)[] = [];
  let skipped = 0;

  for (const t of body.trades) {
    const key = dupKey(t);
    if (seen.has(key)) {
      skipped += 1;
      continue;
    }
    seen.add(key);
    rowsToInsert.push({
      userId,
      symbol: t.symbol,
      entryPrice: t.entryPrice,
      exitPrice: t.exitPrice,
      size: t.size,
      direction: t.direction,
      tradedAt: new Date(t.tradedAt),
      setupType: "Pullback",
      session: "NY",
      emaAlignment: false,
      executionQuality: "B",
      notes: null,
      screenshotUrl: null,
      pnl: computePnl(t.direction, t.entryPrice, t.exitPrice, t.size),
      rr: computeRR(t.direction, t.entryPrice, t.exitPrice),
      source: "csv",
    });
  }

  if (rowsToInsert.length > 0) {
    await db.insert(tradesTable).values(rowsToInsert);
  }

  res.json({ imported: rowsToInsert.length, skippedDuplicates: skipped });
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
