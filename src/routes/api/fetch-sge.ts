import { createFileRoute } from "@tanstack/react-router";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const BASE_HEADERS = {
  "User-Agent": UA,
  Referer: "https://en.sge.com.cn/",
  Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Cache-Control": "no-cache",
};
const TTL = 30_000; // 30 s
const TIMEOUT = 5_000;

let cache: { data: unknown; ts: number } | null = null;
let inflight: Promise<Response> | null = null;

function stripTags(s: string) { return s.replace(/<[^>]+>/g, "").trim(); }

function parseHtmlTable(html: string): Record<string, string>[] | null {
  const headers: string[] = [];
  const theadM = html.match(/<thead[\s\S]*?<\/thead>/i);
  if (theadM) {
    const re = /<th[^>]*>([\s\S]*?)<\/th>/gi; let m;
    while ((m = re.exec(theadM[0])) !== null) headers.push(stripTags(m[1]));
  }
  if (!headers.length) {
    const first = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
    if (first) {
      const re = /<th[^>]*>([\s\S]*?)<\/th>/gi; let m;
      while ((m = re.exec(first[1])) !== null) headers.push(stripTags(m[1]));
    }
  }
  if (!headers.length) return null;
  const rows: Record<string, string>[] = [];
  const bodyM = html.match(/<tbody[\s\S]*?<\/tbody>/i);
  const search = bodyM ? bodyM[0] : html;
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi; let rm;
  while ((rm = rowRe.exec(search)) !== null) {
    if (rm[1].includes("<th")) continue;
    const cells: string[] = [];
    const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi; let cm;
    while ((cm = cellRe.exec(rm[1])) !== null) cells.push(stripTags(cm[1]));
    if (!cells.length) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ""; });
    rows.push(row);
  }
  return rows.length ? rows : null;
}

function findFirstTable(html: string): Record<string, string>[] | null {
  const tableRe = /<table[\s\S]*?<\/table>/gi; let m;
  while ((m = tableRe.exec(html)) !== null) {
    const r = parseHtmlTable(m[0]);
    if (r) return r;
  }
  return parseHtmlTable(html);
}

async function fetchUrl(url: string): Promise<{ ok: boolean; html?: string; err?: string }> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { signal: ac.signal, headers: BASE_HEADERS });
    clearTimeout(t);
    if (!res.ok) return { ok: false, err: `HTTP ${res.status}` };
    return { ok: true, html: await res.text() };
  } catch (err) {
    clearTimeout(t);
    const isTimeout = (err as Error).name === "AbortError";
    return { ok: false, err: isTimeout ? "Timed out (8 s)" : (err as Error).message };
  }
}

async function fetchFresh(): Promise<Response> {
  const [bR, qR] = await Promise.all([
    fetchUrl("https://en.sge.com.cn/data_BenchmarkPrice_Daily"),
    fetchUrl("https://en.sge.com.cn/data_DelayedQuotes"),
  ]);
  const benchmark = bR.ok && bR.html ? (findFirstTable(bR.html) ?? []) : [];
  const quotes    = qR.ok && qR.html ? (findFirstTable(qR.html) ?? []) : [];
  const d = {
    success: benchmark.length > 0 || quotes.length > 0,
    benchmark, quotes,
    benchmarkError: benchmark.length ? null : (bR.err ?? "No table found"),
    quotesError:    quotes.length    ? null : (qR.err ?? "No table found"),
    cached: false,
  };
  if (d.success) cache = { data: d, ts: Date.now() };
  return Response.json(d);
}

export const Route = createFileRoute("/api/fetch-sge")({
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
