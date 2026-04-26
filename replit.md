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

- `GET/POST /api/trades`, `GET/DELETE /api/trades/:id`
- `POST /api/trades/import` — bulk import (CSV); skips duplicates, sets `source = "csv"`
- `GET /api/metrics/summary` — total PnL, win rate, avg win/loss, expectancy
- `GET /api/metrics/equity-curve` — cumulative PnL over time
- `GET /api/metrics/win-loss` — wins/losses/breakeven counts
- `GET /api/metrics/by-setup`, `/api/metrics/by-session` — grouped performance
- `GET /api/analysis/execution` — EMA-on vs off, A+ vs FOMO comparisons
- `GET /api/review/weekly` — weekly best/worst setup/session, common mistake

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
