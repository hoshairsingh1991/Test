import {
  pgTable,
  text,
  uuid,
  doublePrecision,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const tradesTable = pgTable(
  "trades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    symbol: text("symbol").notNull(),
    entryPrice: doublePrecision("entry_price").notNull(),
    exitPrice: doublePrecision("exit_price").notNull(),
    size: doublePrecision("size").notNull(),
    direction: text("direction").notNull(),
    tradedAt: timestamp("traded_at", { withTimezone: true }).notNull(),
    setupType: text("setup_type").notNull(),
    session: text("session").notNull(),
    emaAlignment: boolean("ema_alignment").notNull(),
    executionQuality: text("execution_quality").notNull(),
    notes: text("notes"),
    screenshotUrl: text("screenshot_url"),
    pnl: doublePrecision("pnl").notNull(),
    rr: doublePrecision("rr").notNull(),
    source: text("source").notNull().default("manual"),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("trades_user_id_idx").on(t.userId),
    index("trades_traded_at_idx").on(t.tradedAt),
  ],
);

export type Trade = typeof tradesTable.$inferSelect;
export type InsertTrade = typeof tradesTable.$inferInsert;
