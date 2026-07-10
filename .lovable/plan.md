# Gold Trading Dashboard — Multi-Section App

Big expansion of the current single-page calculator into a 4-tab app with a bottom navigation bar, matching the dark UI reference from the last screenshot (dark navy background, purple/violet accents, card-based layout).

## Bottom Navigation (4 tabs)

   [1.gold](http://1.gold) price convertor

      2.**Spread** — Spread & Curve and anchor level tab

3.**SGE** — Shanghai Gold Exchange

4.**Profile** — Login / Signup

The existing Gold Price Calculator becomes a card inside the **Anchor** tab (or a small utility card — confirm below).

---

## 1. Shanghai Anchor Level tab

- Auto-fetch CNY/USD from Google Finance (already working).
- Auto-fetch SHFE gold contracts from the official SHFE delayed-market endpoint (already working — returns au2607, au2608, …, au2706 with `lastprice` and `openinterest`).
- User picks **3 contracts** via checkboxes.
- Compute per contract: `cp_x_oi = lastPrice × openInterest`
- Anchor formula:
  ```
  Anchor CNY/g = (Σ cp_x_oi) / (Σ openInterest)
  Anchor USD/g = Anchor CNY/g × CNY/USD rate
  ```
- Display: table of contracts with checkbox, last, OI, cp×oi; then a big highlighted "Shanghai Anchor Level" number.
- Keep the existing USD/oz calculator as a small utility card at the bottom of this tab.

## 2. Spread & Curve tab

Two sub-panels: **20-day** and **5-day** (same logic, different window).

- User picks **Front month** and **Back month** contracts (dropdowns from live SHFE data).
- `Spread = BackMonth.last − FrontMonth.last` (shown after clicking **Difference** button).
- A 20-row editable table (slot 1 = latest … slot 20 = oldest). User seeds initial 20 values manually.
- **Difference button behavior:** shift rows down (1→2, 2→3, …, 19→20, 20 dropped), write new spread into slot 1.
- **Average** = mean of the 20 slots (recomputed live).
- **Curve %** = `(latestSpread − previousSpread) / avgBeforeShift`
- **Signal** (based on Curve % vs threshold 15%):
  - ≥ +15% → **Breakout** (green)
  - ≤ −15% → **Reversal** (red)
  - between → **Neutral** (amber)
- Small **ⓘ** button top-right opens a rules modal (rules i–v from the spec).
- 5-day panel: identical UI with a 5-row table.
- Persist tables in `localStorage` so refreshing doesn't wipe entered data.

## 3. SGE tab

- CNY/USD banner (Google Finance).
- **Benchmark AM/PM** — fetch `https://en.sge.com.cn/h5_data_BenchmarkPrice`
- **Delayed Quotes** — fetch `https://en.sge.com.cn/h5_data_DelayedQuotes` → show Au99.95, Au99.99, Au100g, Au(T+D), mAu(T+D), etc. with Latest / High / Low / Open.
- User picks one row → convert to USD/oz:
  ```
  USD/oz = pickedPrice × 31.1035 × CNY_USD_rate
  ```
- Both SGE endpoints proxied through a new server route `src/routes/api/fetch-sge.ts` (server-side fetch to avoid CORS + set browser-like headers).

## 4. Profile tab

- Enable Lovable Cloud.
- Email + password login/signup, plus Google sign-in (native in Lovable Cloud).
- GitHub and Facebook are **not natively supported** by Lovable Cloud — I'll skip them unless you want to wire the Supabase integration manually later.
- No `profiles` table for now (just `auth.users`) — unless you want display names/avatars.

---

## Design (matches your dark reference screenshot)

- Background `#0b0d18` deep navy.
- Card surfaces with subtle violet gradient borders `from-violet-500/30 to-blue-500/30`.
- Accent color violet `#8b5cf6` for primary buttons/highlights.
- Rounded-2xl cards, generous padding, soft shadows.
- Fixed bottom nav (icons + labels), safe-area padding for mobile.
- Framer-motion tab transitions.

## Technical notes

- All external fetches stay in TanStack server routes (`/api/fetch-fx`, `/api/fetch-shfe`, `/api/fetch-sge`) to bypass CORS.
- SGE endpoints require `Referer: https://en.sge.com.cn/` header — I'll set that server-side.
- Spread tables persisted in `localStorage` (per window: `spread20`, `spread5`).
- Bottom-nav routing done with local tab state (single route `/`) to keep everything snappy — no route split needed.

---

## Questions before I build

1. **GitHub / Facebook auth** — Lovable Cloud only natively supports Email + Google + Apple. GitHub & Facebook need the raw Supabase integration and dashboard config on your side. OK to ship **Email + Google** first and add the others later?
2. **Seeding the 20-day / 5-day tables** — should they start empty (you enter 20 values before first Difference click), or pre-fill with the current spread × 20? manually i pit when i put it will be saved when i click on defference and add in 20 latest price like 1 . And the 1price goes to 2 2 to 3 and so on and 19 to 20 and 20 will lost. They will saves our data like use like local storage. 
3. **The Gold Price Calculator card** — keep on the Anchor tab, or make it a small floating utility available on every tab?available in every tab but it will be fetc real time data same dont mistake in it. And has another seprate section of it also of gold price calculator . 