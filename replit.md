# Gold Dashboard

## Overview
A TanStack Start (React 19 + Vite + Tailwind v4) app imported from Lovable. It's a
"Gold Dashboard" tracking SHFE/SGE gold prices and spread analytics, gated behind a
login/signup screen. Server routes (`src/routes/api/*`) act as cached proxies to
public data sources (Google Finance for CNY/USD, SGE's public data pages) — no API
keys are required.

## Stack
- Runtime/package manager: Bun
- Framework: TanStack Start + TanStack Router, React 19
- Styling: Tailwind CSS v4, shadcn/radix-ui components
- Build tool: Vite

## Running
- `bun run dev` — starts the dev server on port 5000 (bound via the "Start application" workflow)
- `bun run build` / `bun run preview` — production build and preview (used by deployment config)
- `bun install` — install dependencies (already done during Replit import setup)

No environment variables/secrets are required for local development; the external
data-fetching routes hit public, unauthenticated endpoints.

## Features
- **Trading View tab** (bottom nav, `src/components/dashboard/TradingViewTab.tsx`) embeds
  TradingView's public Advanced Real-Time Chart widget for `BLACKBULL:XAUUSD` (timezone
  America/New_York). Candle colors and the selected interval persist to `localStorage`.
  Community indicators (GEX, RSI Candles, Settlement price, Volume Delta Candles) are listed
  with author names — the public embed widget can't auto-inject third-party Pine scripts, so
  users add them manually via the chart's Indicators panel. Includes a collapsible "object
  tree" viewer of the widget's JSON config.
- **Right-side drawer** (opened via the "Profile" bottom-nav item or the profile icon in the
  top bar) holds three sub-tabs: Profile (session info + logout), About (developer bio), and
  Dev Option.
- **Dev Option** (`src/components/dashboard/DevOptions.tsx`) is gated by the password
  `W.D.GANN` (persisted unlock state). Once unlocked it exposes: 8 tab-switch animation
  styles, background/button/panel color pickers (hex + native color wheel + random), a
  saturation slider, and sliders for shadow intensity/border radius/transition duration/
  animation distance. Settings apply live via CSS custom properties set on `<html>`
  (`src/lib/theme.ts`), scoped to the app shell, primary buttons, glass panels, and nav —
  not the semantic profit/loss accent colors used elsewhere.

## User preferences
None recorded yet.
