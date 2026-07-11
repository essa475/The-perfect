import { createFileRoute } from "@tanstack/react-router";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const TTL = 45_000; // 45 s
const TIMEOUT = 5_000;

let cache: { data: unknown; ts: number } | null = null;
let inflight: Promise<Response> | null = null;

async function fetchFresh(): Promise<Response> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT);
  try {
    const res = await fetch("https://www.google.com/finance/beta/quote/CNY-USD?hl=en", {
      signal: ac.signal,
      headers: { "User-Agent": UA, Accept: "text/html", "Cache-Control": "no-cache" },
    });
    clearTimeout(t);
    if (!res.ok) {
      const d = { success: false, message: `HTTP ${res.status} from FX source` };
      return Response.json(d);
    }
    const html = await res.text();
    let rate: number | null = null;
    // Google Finance no longer renders a `data-last-price` attribute. The live
    // quote is embedded in an inline JS data blob as a *time series* of dated
    // entries (`[[yyyy,m,d,h,min,null,null,[]],[<price>,...]]`) ending right
    // before the `"CNY / USD",86400,` marker. The number sitting immediately
    // before that marker is NOT reliably the latest tick — it can be a stale
    // multi-day-old close that happens to be repeated nearby. The true latest
    // price is the *last* (most recent timestamp) entry in that time series.
    const anchorIdx = html.indexOf('"CNY / USD",86400');
    if (anchorIdx !== -1) {
      const windowStr = html.slice(Math.max(0, anchorIdx - 6000), anchorIdx);
      const tsRegex = /\[\d{4},\d{1,2},\d{1,2},\d{1,2},\d{1,2},null,null,\[\]\],\[(\d+\.\d+),/g;
      let m: RegExpExecArray | null;
      let last: RegExpExecArray | null = null;
      while ((m = tsRegex.exec(windowStr))) last = m;
      if (last) rate = parseFloat(last[1]);
    }
    if (!rate) {
      // Legacy fallback anchor (kept in case the time-series shape changes again).
      const blob = html.match(/,(\d+\.\d+),"CNY \/ USD",86400,/);
      if (blob) rate = parseFloat(blob[1]);
    }
    if (!rate) {
      const attr = html.match(/data-last-price="([\d.]+)"/);
      if (attr) rate = parseFloat(attr[1]);
    }
    if (!rate) {
      const rx = html.match(/CNY\s*\/\s*USD[^0-9]{0,200}([0-9]+\.[0-9]+)/);
      if (rx) rate = parseFloat(rx[1]);
    }
    if (!rate || !Number.isFinite(rate)) {
      const d = { success: false, message: "Could not parse CNY/USD rate" };
      return Response.json(d);
    }
    const d = { success: true, rate, cached: false };
    cache = { data: d, ts: Date.now() };
    return Response.json(d);
  } catch (err) {
    clearTimeout(t);
    const isTimeout = (err as Error).name === "AbortError";
    const d = { success: false, message: isTimeout ? "FX fetch timed out (5 s)" : `Network error: ${(err as Error).message}` };
    return Response.json(d);
  }
}

export const Route = createFileRoute("/api/fetch-fx")({
  server: {
    handlers: {
      GET: async () => {
        // Serve from cache if fresh
        if (cache && Date.now() - cache.ts < TTL) {
          return Response.json({ ...(cache.data as object), cached: true });
        }
        // Deduplicate simultaneous requests — only one outgoing fetch at a time
        if (!inflight) {
          inflight = fetchFresh().finally(() => { inflight = null; });
        }
        return inflight;
      },
    },
  },
});
