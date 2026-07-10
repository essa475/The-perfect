import { createFileRoute } from "@tanstack/react-router";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const SHFE_URL = "https://www.shfe.com.cn/data/tradedata/future/delaymarket/delaymarket_au.dat";
const TTL = 30_000; // 30 s
const TIMEOUT = 5_000;

type ShfeRow = {
  contractname: string; instrumentid: string; lastprice: string;
  upperdown: string; openprice: string; highprice: string;
  lowerprice: string; presettlementprice: string; bidprice: string;
  askprice: string; volume: string; openinterest: string;
  turnover: string; updatetime: string;
};

const num = (v: string) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

let cache: { data: unknown; ts: number } | null = null;
let inflight: Promise<Response> | null = null;

async function fetchFresh(): Promise<Response> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT);
  try {
    const res = await fetch(`${SHFE_URL}?_=${Date.now()}`, {
      signal: ac.signal,
      headers: {
        "User-Agent": UA,
        Referer: "https://www.shfe.com.cn/eng/Market/Futures/Metal/au_f/",
        Accept: "application/json,text/plain,*/*",
        "Cache-Control": "no-cache",
      },
    });
    clearTimeout(t);
    if (!res.ok) {
      const d = { success: false, message: `SHFE returned HTTP ${res.status}` };
      return Response.json(d);
    }
    const raw = (await res.json()) as { delaymarket?: ShfeRow[] };
    const rows = raw.delaymarket ?? [];
    if (!rows.length) {
      const d = { success: false, message: "No SHFE gold quotes returned" };
      return Response.json(d);
    }
    const quotes = rows.map(r => ({
      symbol: r.contractname.toUpperCase(),
      name: r.contractname,
      last: num(r.lastprice),
      change: num(r.upperdown),
      open: num(r.openprice),
      high: num(r.highprice),
      low: num(r.lowerprice),
      prevSettle: num(r.presettlementprice),
      bid: num(r.bidprice),
      ask: num(r.askprice),
      volume: num(r.volume),
      openInterest: num(r.openinterest),
      updateTime: r.updatetime,
    }));
    const primary = quotes.reduce((a, b) => b.volume > a.volume ? b : a);
    const d = {
      success: true, price: primary.last, name: primary.name,
      symbol: primary.symbol, updateTime: primary.updateTime,
      quotes, message: "ok", cached: false,
    };
    cache = { data: d, ts: Date.now() };
    return Response.json(d);
  } catch (err) {
    clearTimeout(t);
    const isTimeout = (err as Error).name === "AbortError";
    const d = { success: false, message: isTimeout ? "SHFE fetch timed out (5 s)" : `Network error: ${(err as Error).message}` };
    return Response.json(d);
  }
}

export const Route = createFileRoute("/api/fetch-shfe")({
  server: {
    handlers: {
      GET: async () => {
        if (cache && Date.now() - cache.ts < TTL) {
          return Response.json({ ...(cache.data as object), cached: true });
        }
        if (!inflight) {
          inflight = fetchFresh().finally(() => { inflight = null; });
        }
        return inflight;
      },
    },
  },
});
