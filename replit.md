# TradeTrack Pro

## Overview

A focused trading journal web app. Users sign in, log every trade with rich metadata (setup, session, EMA alignment, execution quality), and review dashboards, execution analysis, and weekly insights to identify what's working and what's costing them.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript**: 5.9
- **Frontend**: React + Vite, Wouter routing, TanStack Query, Recharts, Tailwind v4, shadcn-style UI
- **Backend**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Clerk (Replit-managed)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (server), Vite (frontend)

## Artifacts

- `artifacts/tradetrack` — Web frontend (React + Vite), served at `/`
- `artifacts/api-server` — Express API, served at `/api`
- `artifacts/mockup-sandbox` — Local design sandbox

## Database schema (`lib/db/src/schema/trades.ts`)

`trades` table:
- id, user_id (Clerk userId)
- symbol, entry_price, exit_price, size
- direction (Long/Short)
- traded_at, created_at
- setup_type (Pullback/Breakout/Reversal)
- session (London/NY/Asia)
- ema_alignment (boolean)
- execution_quality (A+/B/FOMO)
- notes, screenshot_url
- pnl, rr (auto-calculated server-side)
- source ("manual" or "csv")

## API surface

- `GET/POST /api/trades`, `GET/PATCH/DELETE /api/trades/:id`
  - `DELETE` is a soft delete (sets `is_deleted = true`); soft-deleted trades are hidden from list, metrics, analysis, calendar, day, weekly review, and CSV duplicate check
  - `PATCH` updates any subset of fields and re-derives `pnl` and `rr` server-side
- `POST /api/trades/import` — bulk import (CSV); skips duplicates, sets `source = "csv"`
- All metrics endpoints accept `?timeframe=day|week|month|year|all&date=ISO`
- `GET /api/metrics/summary` — current period stats + previous-period comparison
- `GET /api/metrics/equity-curve` — cumulative PnL within period
- `GET /api/metrics/win-loss` — wins/losses/breakeven counts
- `GET /api/metrics/by-setup`, `/api/metrics/by-session` — grouped performance
- `GET /api/metrics/calendar?date=ISO` — daily PnL aggregates for the month
- `GET /api/metrics/day?date=YYYY-MM-DD` — single-day detail (best/worst trade, mistakes)
- `GET /api/analysis/execution` — EMA-on vs off, A+ vs FOMO comparisons (timeframe-aware)
- `GET /api/review/weekly` — best/worst setup/session/day, worst habit, recommendation

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
