import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Icons,
  RippleBtn,
  RefreshBtn,
  GlassCard,
  Chip,
  SectionHeader,
} from "@/components/dashboard/primitives";
import RightDrawer from "@/components/dashboard/RightDrawer";
import TradingViewTab from "@/components/dashboard/TradingViewTab";
import { animClassFor, applyTheme, isChartUnlocked, loadTheme, type AnimationStyle } from "@/lib/theme";

const G = 31.1035;
const AUTH_KEY = "xauusd_auth";
const PW = "XAUUSD";
const TTL = 24 * 60 * 60 * 1000;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gold Trading Dashboard" },
      { name: "description", content: "SHFE · SGE · Shanghai Anchor · Spread & Curve analytics." },
    ],
  }),
  component: App,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="min-h-screen grid place-items-center bg-[#06070e] text-slate-100 p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-semibold">{error.message}</h1>
          <button
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-slate-950 font-bold active:scale-95 transition-transform"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-8 text-slate-400">Not found</div>,
});

// ─── Types ───────────────────────────────────────────────────────────────────
type ShfeQuote = {
  symbol: string;
  name: string;
  last: number;
  change: number;
  open: number;
  high: number;
  low: number;
  prevSettle: number;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  updateTime: string;
};
type AuthState = { loggedIn: boolean; username: string; loginTime: number };

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function loadAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as AuthState;
    if (!p?.loggedIn) return null;
    if (Date.now() - p.loginTime > TTL) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return p;
  } catch {
    return null;
  }
}
function saveAuth(u: string) {
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({ loggedIn: true, username: u, loginTime: Date.now() }),
  );
}
function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useFx() {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const d = (await fetch("/api/fetch-fx").then((r) => r.json())) as {
        success: boolean;
        rate?: number;
        message?: string;
      };
      if (d.success && d.rate) setRate(d.rate);
      else setErr(d.message ?? "FX unavailable");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, []);
  return { rate, loading, err, refresh };
}

function useShfe() {
  const [quotes, setQuotes] = useState<ShfeQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [updateTime, setUpdateTime] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const d = (await fetch("/api/fetch-shfe").then((r) => r.json())) as {
        success: boolean;
        quotes?: ShfeQuote[];
        updateTime?: string;
        message?: string;
      };
      if (d.success && d.quotes) {
        setQuotes(d.quotes);
        setUpdateTime(d.updateTime ?? "");
      } else setErr(d.message ?? "SHFE unavailable");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, []);
  return { quotes, loading, err, updateTime, refresh };
}

type SgeRow = Record<string, string>;
function useSge() {
  const [benchmark, setBenchmark] = useState<SgeRow[]>([]);
  const [quotes, setQuotes] = useState<SgeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [benchErr, setBenchErr] = useState<string | null>(null);
  const [quotesErr, setQuotesErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const d = (await fetch("/api/fetch-sge").then((r) => r.json())) as {
        success: boolean;
        benchmark: SgeRow[];
        quotes: SgeRow[];
        benchmarkError?: string | null;
        quotesError?: string | null;
      };
      setBenchmark(d.benchmark ?? []);
      setQuotes(d.quotes ?? []);
      setBenchErr(d.benchmarkError ?? null);
      setQuotesErr(d.quotesError ?? null);
      if (!d.success) setErr("SGE data unavailable");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, []);
  return { benchmark, quotes, loading, err, benchErr, quotesErr, refresh };
}

// ─── Auth Gate ────────────────────────────────────────────────────────────────
function AuthGate({ onAuth }: { onAuth: (u: string) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username required.");
      triggerShake();
      return;
    }
    if (password !== PW) {
      setError("Wrong password.");
      triggerShake();
      setPassword("");
      return;
    }
    saveAuth(username.trim());
    onAuth(username.trim());
  }

  return (
    <div className="min-h-screen bg-[#06070e] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Premium grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(245,158,11,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-48 h-48 bg-amber-400/4 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-5 relative">
            {/* Outer glow ring */}
            <div className="absolute w-24 h-24 rounded-3xl bg-amber-500/20 blur-xl" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 shadow-2xl shadow-amber-500/50 flex items-center justify-center">
              {/* SHFE-style building/exchange icon */}
              <svg viewBox="0 0 32 32" fill="none" className="w-11 h-11">
                <rect x="14" y="3" width="4" height="4" rx="0.5" fill="rgba(15,15,15,0.9)" />
                <rect x="4" y="9" width="24" height="2.5" rx="0.5" fill="rgba(15,15,15,0.9)" />
                <rect x="6" y="13" width="3" height="10" rx="0.5" fill="rgba(15,15,15,0.9)" />
                <rect x="11" y="13" width="3" height="10" rx="0.5" fill="rgba(15,15,15,0.9)" />
                <rect x="18" y="13" width="3" height="10" rx="0.5" fill="rgba(15,15,15,0.9)" />
                <rect x="23" y="13" width="3" height="10" rx="0.5" fill="rgba(15,15,15,0.9)" />
                <rect x="3" y="24" width="26" height="2.5" rx="0.5" fill="rgba(15,15,15,0.9)" />
                <line x1="14" y1="3" x2="14" y2="7" stroke="rgba(15,15,15,0.6)" strokeWidth="0.5" />
                <line x1="18" y1="3" x2="18" y2="7" stroke="rgba(15,15,15,0.6)" strokeWidth="0.5" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Gold Dashboard</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-px w-8 bg-amber-500/30" />
            <p className="text-[10px] text-amber-400/70 tracking-[0.2em] uppercase font-semibold">
              SHFE · SGE · Spread Analytics
            </p>
            <div className="h-px w-8 bg-amber-500/30" />
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/10 p-6 space-y-5"
          style={{
            background: "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,158,11,0.08) inset, 0 1px 0 rgba(255,255,255,0.08) inset",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl bg-black/40">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 ${
                  mode === m
                    ? "bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/25"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={submit}
            className={`space-y-4 ${shake ? "animate-[shake_0.4s]" : ""}`}
          >
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                className="mt-1.5 w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition placeholder-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? "text" : "password"}
                  placeholder="Enter password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition placeholder-slate-700 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Icons.Eye open={showPw} />
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <span className="shrink-0">⚠</span> {error}
              </div>
            )}

            <RippleBtn
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-3.5 rounded-xl text-sm shadow-xl shadow-amber-500/30 active:scale-[0.98] transition-all"
            >
              {mode === "login" ? "Log In" : "Create Account"}
            </RippleBtn>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">or continue with</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* Google */}
            <button
              type="button"
              onClick={() => {}}
              aria-label="Continue with Google"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold transition-all active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="hidden sm:inline">Google</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => {}}
              aria-label="Continue with Facebook"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold transition-all active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="hidden sm:inline">Facebook</span>
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => {}}
              aria-label="Continue with GitHub"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold transition-all active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-700 tracking-wide">
            Session auto-expires after 24 h of inactivity
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── App shell ────────────────────────────────────────────────────────────────
type Tab = "calc" | "spread" | "sge" | "trading";
const TAB_ORDER: Tab[] = ["calc", "spread", "sge", "trading"];

function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [tab, setTab] = useState<Tab>("calc");
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [anyLoading, setAnyLoading] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [animStyle, setAnimStyle] = useState<AnimationStyle>("slide");
  const [chartUnlocked, setChartUnlocked] = useState(false);
  const fx = useFx();
  const shfe = useShfe();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAuth(loadAuth());
    setChartUnlocked(isChartUnlocked());
  }, []);

  // Apply saved dev-options theme (colors, radius, shadows, animation style…) on mount,
  // and stay in sync while Dev Options are being edited live.
  useEffect(() => {
    const t = loadTheme();
    applyTheme(t);
    setAnimStyle(t.animationStyle);
    function onThemeChange(e: Event) {
      const detail = (e as CustomEvent<{ animationStyle: AnimationStyle }>).detail;
      if (detail) setAnimStyle(detail.animationStyle);
    }
    function onChartUnlock(e: Event) {
      const unlocked = (e as CustomEvent<{ unlocked: boolean }>).detail?.unlocked ?? false;
      setChartUnlocked(unlocked);
      // If chart tab was active and just got locked, bounce back to calc
      if (!unlocked) setTab((t) => (t === "trading" ? "calc" : t));
    }
    window.addEventListener("app-theme-change", onThemeChange);
    window.addEventListener("app-chart-unlock", onChartUnlock);
    return () => {
      window.removeEventListener("app-theme-change", onThemeChange);
      window.removeEventListener("app-chart-unlock", onChartUnlock);
    };
  }, []);

  const resetTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      clearAuth();
      setAuth(null);
    }, TTL);
  }, []);

  useEffect(() => {
    if (!auth) return;
    resetTimer();
    const evs = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    evs.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    return () => {
      evs.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [auth, resetTimer]);

  useEffect(() => {
    setAnyLoading(fx.loading || shfe.loading);
  }, [fx.loading, shfe.loading]);

  if (!auth)
    return (
      <AuthGate onAuth={(u) => setAuth({ loggedIn: true, username: u, loginTime: Date.now() })} />
    );

  function logout() {
    clearAuth();
    setAuth(null);
  }

  function switchTab(next: Tab) {
    const oldIdx = TAB_ORDER.indexOf(tab);
    const newIdx = TAB_ORDER.indexOf(next);
    setSlideDir(newIdx >= oldIdx ? "right" : "left");
    setTab(next);
  }

  return (
    <div
      className={`text-slate-100 ${tab === "trading" ? "h-screen overflow-hidden" : "min-h-screen pb-28"}`}
      style={{ backgroundColor: "var(--app-bg, #06070e)" }}
    >
      {/* Ambient orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-50" />
      <div className="fixed top-0 left-0 right-0 h-56 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
      <div
        className="fixed bottom-24 right-0 w-64 h-64 bg-amber-500/3 rounded-full blur-3xl pointer-events-none"
        style={{ animation: "drift 18s ease-in-out infinite" }}
      />

      {/* Global loading bar */}
      {anyLoading && (
        <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 w-full"
            style={{ animation: "loadBar 1.8s ease-in-out infinite" }}
          />
        </div>
      )}

      {tab === "trading" ? (
        /* Full-viewport trading layout — uses dvh so it accounts for mobile browser chrome */
        <div
          className="relative z-10 flex flex-col"
          style={{ height: "100dvh" }}
        >
          <div className="max-w-[520px] w-full mx-auto px-4 pt-5 shrink-0">
            <TopBar
              fx={fx}
              username={auth.username}
              onLogout={logout}
              onProfileClick={() => setRightOpen(true)}
            />
          </div>
          {/* pb-20 leaves room for the floating bottom nav */}
          <div
            key={tab}
            className={`flex-1 min-h-0 mt-3 px-3 pb-20 ${animClassFor(animStyle, slideDir)}`}
            style={{ willChange: "transform, opacity, filter" }}
          >
            <TradingViewTab />
          </div>
        </div>
      ) : (
        <div className="max-w-[520px] mx-auto px-4 pt-5">
          <TopBar
            fx={fx}
            username={auth.username}
            onLogout={logout}
            onProfileClick={() => setRightOpen(true)}
          />

          <div
            key={tab}
            className={`mt-4 space-y-4 ${animClassFor(animStyle, slideDir)}`}
            style={{ willChange: "transform, opacity, filter" }}
          >
            {tab === "calc" && <CalcTab fx={fx} shfe={shfe} />}
            {tab === "spread" && <SpreadTab fx={fx} shfe={shfe} />}
            {tab === "sge" && <SgeTab fx={fx} />}
          </div>
        </div>
      )}

      <BottomNav tab={tab} setTab={switchTab} onProfileClick={() => setRightOpen(true)} chartUnlocked={chartUnlocked} />
      <RightDrawer
        open={rightOpen}
        onOpenChange={setRightOpen}
        username={auth.username}
        onLogout={logout}
      />
    </div>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────
function TopBar({
  fx,
  username,
  onLogout,
  onProfileClick,
}: {
  fx: ReturnType<typeof useFx>;
  username: string;
  onLogout: () => void;
  onProfileClick: () => void;
}) {
  return (
    <GlassCard glow="amber" className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="w-4 h-4"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 6v2M12 16v2M6 12h2M16 12h2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[9px] uppercase tracking-widest text-amber-400/60 font-semibold">
              CNY / USD
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-black text-amber-300 tabular-nums leading-none">
                {fx.rate != null ? fx.rate.toFixed(4) : "—"}
              </div>
              {fx.loading && (
                <span className="text-[10px] text-amber-400/50 animate-pulse">syncing</span>
              )}
              {!fx.loading && fx.rate != null && (
                <span className="text-[10px] text-emerald-400/60">● live</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <RefreshBtn onClick={fx.refresh} loading={fx.loading} />
          <button
            onClick={onProfileClick}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90"
            title={`Logged in as ${username} — open profile`}
          >
            <Icons.Profile />
          </button>
        </div>
      </div>
      {fx.err && <p className="mt-2 text-xs text-red-400">{fx.err}</p>}
    </GlassCard>
  );
}

// ─── Tab 1: Calculator ────────────────────────────────────────────────────────
function CalcTab({ fx, shfe }: { fx: ReturnType<typeof useFx>; shfe: ReturnType<typeof useShfe> }) {
  const [goldPrice, setGoldPrice] = useState("");
  const [selectedSym, setSelectedSym] = useState("");
  const [result, setResult] = useState<{ value: number; formula: string } | null>(null);

  useEffect(() => {
    if (!goldPrice && shfe.quotes.length > 0) {
      const top = shfe.quotes.reduce((a, b) => (b.volume > a.volume ? b : a));
      setSelectedSym(top.symbol);
      setGoldPrice(String(top.last));
    }
  }, [shfe.quotes]);

  function calculate() {
    const p = parseFloat(goldPrice);
    if (!goldPrice || isNaN(p)) {
      alert("Enter SHFE gold price (CNY / gram)");
      return;
    }
    if (!fx.rate) {
      alert("FX rate not loaded yet");
      return;
    }
    const v = p * G * fx.rate;
    setResult({ value: v, formula: `${p} × ${G} × ${fx.rate.toFixed(4)}` });
  }

  return (
    <>
      <SectionHeader title="Gold Calculator" subtitle="SHFE CNY/g → USD per troy ounce" />

      <GlassCard className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
            SHFE Contracts {shfe.updateTime ? `· ${shfe.updateTime}` : ""}
          </span>
          <RefreshBtn onClick={shfe.refresh} loading={shfe.loading} />
        </div>

        {shfe.quotes.length > 0 && (
          <div className="rounded-xl border border-white/6 overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_1fr_1.2fr] px-3 py-2 text-[9px] uppercase tracking-wider text-slate-600 bg-black/40">
              <div>Contract</div>
              <div className="text-right">Last</div>
              <div className="text-right">Chg</div>
              <div className="text-right">OI</div>
            </div>
            {shfe.quotes.map((q) => {
              const active = q.symbol === selectedSym;
              return (
                <button
                  key={q.symbol}
                  onClick={() => {
                    setSelectedSym(q.symbol);
                    setGoldPrice(String(q.last));
                    setResult(null);
                  }}
                  className={`w-full grid grid-cols-[1fr_1fr_1fr_1.2fr] px-3 py-2.5 text-sm tabular-nums text-left border-t border-white/4 transition-all duration-150 active:scale-[0.98] ${active ? "bg-amber-500/12 text-amber-200" : "hover:bg-white/4 text-slate-300"}`}
                >
                  <div
                    className={`font-bold text-xs tracking-wide ${active ? "text-amber-300" : "text-slate-400"}`}
                  >
                    {q.name.toLowerCase()}
                  </div>
                  <div className="text-right">{q.last.toFixed(2)}</div>
                  <div
                    className={`text-right text-xs ${q.change > 0 ? "text-red-400" : q.change < 0 ? "text-emerald-400" : "text-slate-600"}`}
                  >
                    {q.change > 0 ? "+" : ""}
                    {q.change.toFixed(2)}
                  </div>
                  <div className="text-right text-slate-600 text-xs">
                    {q.openInterest ? q.openInterest.toLocaleString() : "—"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {shfe.loading && shfe.quotes.length === 0 && (
          <div className="text-center py-8 text-slate-600 text-sm animate-pulse">
            Loading SHFE data…
          </div>
        )}
        {shfe.err && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{shfe.err}</p>
        )}
      </GlassCard>

      <GlassCard className="p-4 space-y-4">
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            SHFE price (CNY / gram)
          </span>
          <input
            type="number"
            step="0.01"
            value={goldPrice}
            onChange={(e) => {
              setGoldPrice(e.target.value);
              setResult(null);
            }}
            placeholder="e.g. 900.40"
            className="mt-2 w-full rounded-xl bg-black/50 border border-white/8 px-4 py-3 text-lg tabular-nums text-white outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/15 transition"
          />
        </label>
        <RippleBtn
          onClick={calculate}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-3 text-sm shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all"
        >
          Calculate USD / oz
        </RippleBtn>
        {result && (
          <div className="rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/8 to-transparent p-4">
            <div className="text-[9px] uppercase tracking-widest text-emerald-400/70 font-semibold">
              USD per Troy Ounce
            </div>
            <div className="mt-1 text-3xl font-black text-emerald-300 tabular-nums">
              ${result.value.toFixed(2)}
            </div>
            <div className="mt-1 text-[10px] text-slate-600 tabular-nums">{result.formula}</div>
          </div>
        )}
      </GlassCard>
    </>
  );
}

// ─── Scroll-reveal hook ──────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="scroll-reveal" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── Tab 2: Spread & Curve ────────────────────────────────────────────────────
function SpreadTab({
  fx,
  shfe,
}: {
  fx: ReturnType<typeof useFx>;
  shfe: ReturnType<typeof useShfe>;
}) {
  function refreshAll() {
    fx.refresh();
    shfe.refresh();
  }
  const refreshing = fx.loading || shfe.loading;

  return (
    <>
      <SectionHeader
        title="Anchor · Spread & Curve"
        subtitle="Shanghai analytics — CNY/USD synced"
      />
      <ScrollReveal delay={0}>
        <AnchorCard fx={fx} shfe={shfe} onRefreshAll={refreshAll} refreshing={refreshing} />
      </ScrollReveal>
      <ScrollReveal delay={60}>
        <CurveCard title="20-Day Curve" size={20} shfe={shfe} storageKey="spread20" />
      </ScrollReveal>
      <ScrollReveal delay={120}>
        <CurveCard title="5-Day Curve" size={5} shfe={shfe} storageKey="spread5" />
      </ScrollReveal>
    </>
  );
}

function AnchorCard({
  fx,
  shfe,
  onRefreshAll,
  refreshing,
}: {
  fx: ReturnType<typeof useFx>;
  shfe: ReturnType<typeof useShfe>;
  onRefreshAll: () => void;
  refreshing: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (selected.length === 0 && shfe.quotes.length > 0) {
      const top = [...shfe.quotes]
        .sort((a, b) => b.openInterest - a.openInterest)
        .slice(0, 3)
        .map((q) => q.symbol);
      setSelected(top);
    }
  }, [shfe.quotes]);

  function toggle(sym: string) {
    setSelected((s) =>
      s.includes(sym) ? s.filter((x) => x !== sym) : s.length < 3 ? [...s, sym] : s,
    );
  }

  const picks = shfe.quotes.filter((q) => selected.includes(q.symbol));
  const sumCpOi = picks.reduce((a, q) => a + q.last * q.openInterest, 0);
  const sumOi = picks.reduce((a, q) => a + q.openInterest, 0);
  const anchorCny = sumOi > 0 ? sumCpOi / sumOi : 0;
  const anchorUsdG = fx.rate ? anchorCny * fx.rate : 0;
  const anchorUsdOz = anchorUsdG * G;

  return (
    <GlassCard glow="amber" className="p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-amber-400">
            Shanghai Anchor Level
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Weighted by open interest · pick up to 3 contracts
          </div>
        </div>
        <RefreshBtn onClick={onRefreshAll} loading={refreshing} label="Sync All" />
      </div>

      {/* FX status inline */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/30 border border-white/6">
        <span className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold">
          CNY/USD
        </span>
        <span className="text-sm font-bold text-amber-300 tabular-nums">
          {fx.rate?.toFixed(4) ?? "—"}
        </span>
        {fx.loading && (
          <span className="text-[9px] text-amber-400/50 animate-pulse ml-auto">syncing…</span>
        )}
        {!fx.loading && fx.rate && (
          <span className="text-[9px] text-emerald-400/60 ml-auto">● live</span>
        )}
      </div>

      <div className="rounded-xl border border-white/6 overflow-hidden">
        <div className="grid grid-cols-[20px_1fr_1fr_1.1fr_1.3fr] px-3 py-2 text-[9px] uppercase tracking-wider text-slate-600 bg-black/40">
          <div></div>
          <div>Contract</div>
          <div className="text-right">Last</div>
          <div className="text-right">OI</div>
          <div className="text-right">CP×OI</div>
        </div>
        {shfe.quotes.map((q) => {
          const active = selected.includes(q.symbol);
          return (
            <button
              key={q.symbol}
              onClick={() => toggle(q.symbol)}
              className={`w-full grid grid-cols-[20px_1fr_1fr_1.1fr_1.3fr] px-3 py-2.5 text-sm tabular-nums text-left border-t border-white/4 transition-all duration-150 active:scale-[0.99] ${active ? "bg-amber-500/10 text-amber-200" : "hover:bg-white/4 text-slate-300"}`}
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${active ? "bg-amber-500 border-amber-400" : "border-slate-700"}`}
              >
                {active && <Icons.Check />}
              </div>
              <div className={`font-bold text-xs ${active ? "text-amber-300" : "text-slate-400"}`}>
                {q.name.toLowerCase()}
              </div>
              <div className="text-right text-xs">{q.last.toFixed(2)}</div>
              <div className="text-right text-xs text-slate-500">
                {q.openInterest.toLocaleString()}
              </div>
              <div className="text-right text-xs text-slate-600">
                {(q.last * q.openInterest).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </button>
          );
        })}
        {shfe.loading && shfe.quotes.length === 0 && (
          <div className="text-center py-6 text-slate-600 text-sm animate-pulse">Loading…</div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-white/6 bg-black/30 p-3">
          <div className="text-[8px] uppercase tracking-widest text-slate-600 font-semibold">
            CNY/g
          </div>
          <div className="text-base font-black text-amber-300 tabular-nums mt-0.5">
            {anchorCny ? anchorCny.toFixed(2) : "—"}
          </div>
        </div>
        <div className="rounded-xl border border-white/6 bg-black/30 p-3">
          <div className="text-[8px] uppercase tracking-widest text-slate-600 font-semibold">
            USD/g
          </div>
          <div className="text-base font-black text-blue-300 tabular-nums mt-0.5">
            {anchorUsdG ? anchorUsdG.toFixed(4) : "—"}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="text-[8px] uppercase tracking-widest text-emerald-500/70 font-semibold">
            USD/oz ★
          </div>
          <div className="text-base font-black text-emerald-300 tabular-nums mt-0.5">
            {anchorUsdOz ? anchorUsdOz.toFixed(2) : "—"}
          </div>
        </div>
      </div>
      <div className="text-[9px] text-slate-700 tabular-nums">
        Σ(CP×OI) {sumCpOi.toLocaleString(undefined, { maximumFractionDigits: 0 })} · Σ OI{" "}
        {sumOi.toLocaleString()} · {picks.length}/3 selected
      </div>
    </GlassCard>
  );
}

function CurveCard({
  title,
  size,
  shfe,
  storageKey,
}: {
  title: string;
  size: number;
  shfe: ReturnType<typeof useShfe>;
  storageKey: string;
}) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [rows, setRows] = useState<string[]>(() => Array(size).fill(""));
  const [prevAvg, setPrevAvg] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const p = JSON.parse(raw) as {
        rows?: string[];
        front?: string;
        back?: string;
        prevAvg?: number | null;
      };
      if (p.rows?.length === size) setRows(p.rows);
      if (p.front) setFront(p.front);
      if (p.back) setBack(p.back);
      if (typeof p.prevAvg === "number") setPrevAvg(p.prevAvg);
    } catch {}
  }, [storageKey, size]);

  function persist(next: {
    rows?: string[];
    front?: string;
    back?: string;
    prevAvg?: number | null;
  }) {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          rows: next.rows ?? rows,
          front: next.front ?? front,
          back: next.back ?? back,
          prevAvg: next.prevAvg !== undefined ? next.prevAvg : prevAvg,
        }),
      );
    } catch {}
  }

  const frontQ = shfe.quotes.find((q) => q.symbol === front);
  const backQ = shfe.quotes.find((q) => q.symbol === back);
  const spread = frontQ && backQ ? backQ.last - frontQ.last : null;
  const nums = rows.map((v) => parseFloat(v)).filter((n) => isFinite(n));
  const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  const latest = parseFloat(rows[0]);
  const prev = parseFloat(rows[1]);
  const base = prevAvg ?? avg;
  const curvePct =
    isFinite(latest) && isFinite(prev) && base ? ((latest - prev) / base) * 100 : null;

  const signal =
    curvePct == null
      ? { label: "—", cls: "text-slate-400" }
      : curvePct >= 15
        ? { label: "Breakout ▲", cls: "text-emerald-400" }
        : curvePct <= -15
          ? { label: "Reversal ▼", cls: "text-red-400" }
          : { label: "Neutral ◆", cls: "text-amber-400" };

  function capture() {
    if (spread == null) {
      alert("Select Front and Back month contracts first.");
      return;
    }
    const avgBefore = avg;
    const shifted = [spread.toFixed(4), ...rows.slice(0, size - 1)];
    setRows(shifted);
    setPrevAvg(avgBefore);
    persist({ rows: shifted, prevAvg: avgBefore });
  }

  function editRow(i: number, v: string) {
    const next = [...rows];
    next[i] = v;
    setRows(next);
    persist({ rows: next });
  }

  return (
    <GlassCard className="p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-black text-slate-200">{title}</div>
          <div className="text-[10px] text-slate-500">Back − Front · curve % vs {size}-day avg</div>
        </div>
        <button
          onClick={() => setShowRules(true)}
          className="w-7 h-7 rounded-xl border border-white/10 text-slate-500 hover:text-amber-400 hover:border-amber-500/30 flex items-center justify-center transition-all active:scale-90"
        >
          <Icons.Info />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: "Front month",
            val: front,
            set: (v: string) => {
              setFront(v);
              persist({ front: v });
            },
          },
          {
            label: "Back month",
            val: back,
            set: (v: string) => {
              setBack(v);
              persist({ back: v });
            },
          },
        ].map(({ label, val, set }) => (
          <label key={label} className="block">
            <span className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold">
              {label}
            </span>
            <select
              value={val}
              onChange={(e) => set(e.target.value)}
              className="mt-1 w-full rounded-xl bg-black/50 border border-white/8 px-2.5 py-2 text-xs outline-none focus:border-amber-500/50 text-slate-300 transition"
            >
              <option value="">Select…</option>
              {shfe.quotes.map((q) => (
                <option key={q.symbol} value={q.symbol}>
                  {q.name.toLowerCase()} · {q.last.toFixed(2)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Chip label="Front last" value={frontQ ? frontQ.last.toFixed(2) : "—"} />
        <Chip label="Back last" value={backQ ? backQ.last.toFixed(2) : "—"} />
        <Chip
          label="Spread"
          value={spread != null ? spread.toFixed(4) : "—"}
          accent="text-amber-300"
        />
      </div>

      <RippleBtn
        onClick={capture}
        className="w-full rounded-xl border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold py-2.5 text-sm transition-all active:scale-[0.98]"
      >
        Capture Spread → Row 1
      </RippleBtn>

      <div className="grid grid-cols-3 gap-2">
        <Chip label={`${size}-day avg`} value={nums.length ? avg.toFixed(4) : "—"} />
        <Chip
          label="Curve %"
          value={curvePct != null ? curvePct.toFixed(2) + "%" : "—"}
          accent={signal.cls}
        />
        <Chip label="Signal" value={signal.label} accent={signal.cls} />
      </div>

      <div className="rounded-xl border border-white/6 overflow-hidden">
        <div className="grid grid-cols-[32px_1fr] px-3 py-2 text-[9px] uppercase tracking-wider text-slate-600 bg-black/40">
          <div>#</div>
          <div>Spread value</div>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {rows.map((v, i) => (
            <div
              key={i}
              className="grid grid-cols-[32px_1fr] px-2 py-1.5 items-center border-t border-white/4"
            >
              <div className="text-[10px] text-slate-700 pl-1">
                {i + 1}
                {i === 0 && <span className="ml-0.5 text-[8px] text-emerald-500">●</span>}
              </div>
              <input
                value={v}
                onChange={(e) => editRow(i, e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
                className="w-full bg-black/30 border border-white/6 rounded-lg px-2.5 py-1 text-xs tabular-nums outline-none focus:border-amber-500/40 text-slate-300 transition"
              />
            </div>
          ))}
        </div>
      </div>

      {showRules && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setShowRules(false)}
        >
          <GlassCard
            glow="amber"
            className="max-w-md w-full p-5 space-y-3"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white">Signal Rules</h3>
              <button
                onClick={() => setShowRules(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90"
              >
                <Icons.Close />
              </button>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-300">
              <li>Back month must have min 10–20% of Front month open interest.</li>
              <li>Distance: min 2, max 6 months between Front and Back.</li>
              <li>
                Spread ≥ +15% of {size}-day avg vs yesterday →{" "}
                <b className="text-emerald-400">Breakout ▲</b>
              </li>
              <li>
                Spread ≤ −15% of {size}-day avg vs yesterday →{" "}
                <b className="text-red-400">Reversal ▼</b>
              </li>
              <li>
                Within ±15% → <b className="text-amber-400">Neutral ◆</b>
              </li>
            </ol>
          </GlassCard>
        </div>
      )}
    </GlassCard>
  );
}

// ─── Tab 3: SGE ───────────────────────────────────────────────────────────────
function SgeTab({ fx }: { fx: ReturnType<typeof useFx> }) {
  const sge = useSge();
  const [picked, setPicked] = useState<{ label: string; price: number } | null>(null);
  const usdOz = picked && fx.rate ? picked.price * G * fx.rate : null;

  return (
    <>
      <SectionHeader title="Shanghai Gold Exchange" subtitle="Benchmark · delayed quotes" />

      <GlassCard glow="emerald" className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-emerald-400/70 font-semibold">
              SGE → USD / Troy Ounce
            </div>
            <div className="text-3xl font-black text-emerald-300 tabular-nums mt-1">
              {usdOz != null ? `$${usdOz.toFixed(2)}` : "—"}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {picked
                ? `${picked.label} @ ${picked.price} CNY/g`
                : "Tap a price below to calculate"}
            </div>
            {picked && fx.rate && (
              <div className="text-[10px] text-slate-700 tabular-nums">
                {picked.price} × {G} × {fx.rate.toFixed(4)}
              </div>
            )}
          </div>
          <RefreshBtn onClick={sge.refresh} loading={sge.loading} />
        </div>
        {sge.err && <p className="text-xs text-red-400 mt-2">{sge.err}</p>}
      </GlassCard>

      <GlassCard className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-400/80">
              Benchmark Price (AM / PM)
            </div>
            {sge.benchmark.length > 0 && (
              <div className="text-[9px] text-slate-600 mt-0.5 tabular-nums">
                {sge.benchmark.length} record{sge.benchmark.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
          <RefreshBtn onClick={sge.refresh} loading={sge.loading} label="Sync" />
        </div>
        {sge.benchErr && <p className="text-xs text-red-400">{sge.benchErr}</p>}
        <BenchmarkTable
          rows={sge.benchmark}
          onPick={(l, p) => setPicked({ label: l, price: p })}
          picked={picked}
        />
      </GlassCard>

      <GlassCard className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-400/80">
              Delayed Quotes
            </div>
            {sge.quotes.length > 0 && (
              <div className="text-[9px] text-slate-600 mt-0.5 tabular-nums">
                {sge.quotes.length} instrument{sge.quotes.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
          <RefreshBtn onClick={sge.refresh} loading={sge.loading} label="Sync" />
        </div>
        {sge.quotesErr && <p className="text-xs text-red-400">{sge.quotesErr}</p>}
        <QuotesTable
          rows={sge.quotes}
          onPick={(l, p) => setPicked({ label: l, price: p })}
          picked={picked}
        />
      </GlassCard>
    </>
  );
}

function BenchmarkTable({
  rows,
  onPick,
  picked,
}: {
  rows: SgeRow[];
  onPick: (l: string, p: number) => void;
  picked: { label: string; price: number } | null;
}) {
  if (!rows.length) return <p className="text-xs text-slate-600 py-3">No data — tap Refresh.</p>;
  const k = Object.keys(rows[0]);
  const dateKey = k.find((x) => /date/i.test(x)) ?? k[0];
  const contractKey = k.find((x) => /contract/i.test(x));
  const amKey = k.find((x) => /am/i.test(x));
  const pmKey = k.find((x) => /pm/i.test(x));

  return (
    <div className="rounded-xl border border-white/6 overflow-hidden">
      <div className="grid grid-cols-[1fr_0.5fr_1fr_1fr] px-3 py-2 text-[9px] uppercase tracking-wider text-slate-600 bg-black/40">
        <div>Date</div>
        <div>Sym</div>
        <div className="text-right">AM</div>
        <div className="text-right">PM</div>
      </div>
      {rows.slice(0, 10).map((r, i) => {
        const raw = dateKey ? (r[dateKey] ?? "") : "";
        const date =
          raw.length === 8 ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6)}` : raw;
        const contract = contractKey ? (r[contractKey] ?? "—") : "SHAU";
        const am = parseFloat(amKey ? (r[amKey] ?? "/") : "/");
        const pm = parseFloat(pmKey ? (r[pmKey] ?? "/") : "/");
        const pickAm = picked?.label === `${contract} AM ${date}`;
        const pickPm = picked?.label === `${contract} PM ${date}`;

        return (
          <div
            key={i}
            className="grid grid-cols-[1fr_0.5fr_1fr_1fr] border-t border-white/4 text-sm tabular-nums"
          >
            <div className="px-3 py-2.5 text-slate-500 text-xs">{date}</div>
            <div className="px-1 py-2.5 text-amber-300 font-bold text-xs">{contract}</div>
            <button
              onClick={() => isFinite(am) && onPick(`${contract} AM ${date}`, am)}
              disabled={!isFinite(am)}
              className={`text-right px-3 py-2.5 text-xs transition-all active:scale-95 ${pickAm ? "text-emerald-300 bg-emerald-500/10" : "text-slate-300 hover:text-emerald-300"} disabled:text-slate-700 disabled:cursor-default`}
            >
              {isFinite(am) ? am.toFixed(2) : "—"}
            </button>
            <button
              onClick={() => isFinite(pm) && onPick(`${contract} PM ${date}`, pm)}
              disabled={!isFinite(pm)}
              className={`text-right px-3 py-2.5 text-xs transition-all active:scale-95 ${pickPm ? "text-emerald-300 bg-emerald-500/10" : "text-slate-300 hover:text-emerald-300"} disabled:text-slate-700 disabled:cursor-default`}
            >
              {isFinite(pm) ? pm.toFixed(2) : "—"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function QuotesTable({
  rows,
  onPick,
  picked,
}: {
  rows: SgeRow[];
  onPick: (l: string, p: number) => void;
  picked: { label: string; price: number } | null;
}) {
  if (!rows.length) return <p className="text-xs text-slate-600 py-3">No data — tap Refresh.</p>;
  const k = Object.keys(rows[0]);

  return (
    <div className="rounded-xl border border-white/6 overflow-hidden">
      <div className="grid grid-cols-[1.3fr_1fr_0.8fr_0.8fr_0.8fr] px-3 py-2 text-[9px] uppercase tracking-wider text-slate-600 bg-black/40">
        <div>Variety</div>
        <div className="text-right">Latest</div>
        <div className="text-right">High</div>
        <div className="text-right">Low</div>
        <div className="text-right">Open</div>
      </div>
      {rows.map((r, i) => {
        const variety = k[0] ? (r[k[0]] ?? `row-${i}`) : `row-${i}`;
        const latest = parseFloat(r[k[1]] ?? "0");
        const high = parseFloat(r[k[2]] ?? "0");
        const low = parseFloat(r[k[3]] ?? "0");
        const open = parseFloat(r[k[4]] ?? "0");
        const active = picked?.label === variety;

        return (
          <button
            key={i}
            onClick={() => latest > 0 && onPick(variety, latest)}
            disabled={!latest}
            className={`w-full grid grid-cols-[1.3fr_1fr_0.8fr_0.8fr_0.8fr] px-3 py-2.5 text-xs tabular-nums text-left border-t border-white/4 transition-all active:scale-[0.99] ${active ? "bg-emerald-500/8" : "hover:bg-white/3"} disabled:cursor-default`}
          >
            <div className={`font-bold ${active ? "text-emerald-300" : "text-amber-400"}`}>
              {variety}
            </div>
            <div className={`text-right ${active ? "text-emerald-300" : "text-slate-200"}`}>
              {latest ? latest.toFixed(2) : "—"}
            </div>
            <div className="text-right text-slate-600">{high ? high.toFixed(2) : "—"}</div>
            <div className="text-right text-slate-600">{low ? low.toFixed(2) : "—"}</div>
            <div className="text-right text-slate-600">{open ? open.toFixed(2) : "—"}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
const ALL_NAV_ITEMS: { id: Tab | "profile"; label: string; Icon: React.FC; locked?: boolean }[] = [
  { id: "calc",    label: "Gold",    Icon: Icons.Gold    },
  { id: "spread",  label: "Spread",  Icon: Icons.Spread  },
  { id: "sge",     label: "SGE",     Icon: Icons.Bank    },
  { id: "trading", label: "Chart",   Icon: Icons.Chart,  locked: true },
  { id: "profile", label: "Profile", Icon: Icons.Profile },
];

function BottomNav({
  tab,
  setTab,
  onProfileClick,
  chartUnlocked,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  onProfileClick: () => void;
  chartUnlocked: boolean;
}) {
  const navItems = ALL_NAV_ITEMS.filter((item) => !item.locked || chartUnlocked);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="flex justify-center pb-safe px-4" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}>
        {/* Floating island */}
        <div
          className="pointer-events-auto w-full max-w-[400px] flex items-center rounded-[28px] border border-white/10 backdrop-blur-2xl overflow-hidden"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06) inset",
          }}
        >
          {navItems.map(({ id, label, Icon }) => {
            const active = id !== "profile" && tab === id;
            const isProfile = id === "profile";
            return (
              <button
                key={id}
                onClick={() => (isProfile ? onProfileClick() : setTab(id as Tab))}
                className="relative flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200 active:scale-[0.88] select-none"
              >
                {/* Active highlight bubble */}
                {active && (
                  <span
                    className="absolute inset-x-2 top-1 bottom-1 rounded-2xl"
                    style={{
                      background: "linear-gradient(160deg, var(--app-button-tint-15, rgba(245,158,11,0.15)), var(--app-button-tint-10, rgba(245,158,11,0.08)))",
                      border: "1px solid var(--app-button-tint-25, rgba(245,158,11,0.25))",
                    }}
                  />
                )}

                {/* Icon */}
                <span
                  className="relative z-10 flex items-center justify-center transition-all duration-200"
                  style={
                    active
                      ? {
                          color: "var(--app-button, #fbbf24)",
                          filter: "drop-shadow(0 0 8px var(--app-button-tint-25, rgba(251,191,36,0.7)))",
                          transform: "scale(1.15)",
                        }
                      : { color: "rgba(148,163,184,0.55)" }
                  }
                >
                  <Icon />
                </span>

                {/* Label */}
                <span
                  className="relative z-10 text-[9px] font-bold tracking-wider transition-colors duration-200 leading-none"
                  style={
                    active
                      ? { color: "var(--app-button, #fbbf24)" }
                      : { color: "rgba(100,116,139,0.7)" }
                  }
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
