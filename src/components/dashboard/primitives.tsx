import { useRef, useState } from "react";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
export const Icons = {
  // Gold bar / ingot — replaces old star
  Gold: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="currentColor" stopOpacity="1"   />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.65" />
        </linearGradient>
      </defs>
      {/* Ingot body */}
      <path
        d="M4 9L6.5 6h11L20 9v6l-2.5 3H6.5L4 15V9z"
        fill="url(#goldGrad)"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Highlight line */}
      <line x1="7" y1="10.5" x2="17" y2="10.5" stroke="white" strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round" />
      {/* XAU label mark */}
      <line x1="12" y1="12.5" x2="12" y2="14.5" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),

  // Spread — candlestick bars (more distinctive)
  Spread: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="6"  y1="4"  x2="6"  y2="20" />
      <rect x="4"   y="7"   width="4"  height="8"  rx="0.5" fill="currentColor" fillOpacity="0.25" />
      <line x1="12" y1="6"  x2="12" y2="20" />
      <rect x="10"  y="9"   width="4"  height="7"  rx="0.5" fill="currentColor" fillOpacity="0.25" />
      <line x1="18" y1="3"  x2="18" y2="18" />
      <rect x="16"  y="6"   width="4"  height="9"  rx="0.5" fill="currentColor" fillOpacity="0.25" />
    </svg>
  ),

  // Bank / SGE — modern building with pillars
  Bank: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 21h18" />
      <path d="M3 10h18" />
      <path d="M12 3 3 10h18L12 3z" fill="currentColor" fillOpacity="0.15" />
      <line x1="6"  y1="10" x2="6"  y2="21" />
      <line x1="10" y1="10" x2="10" y2="21" />
      <line x1="14" y1="10" x2="14" y2="21" />
      <line x1="18" y1="10" x2="18" y2="21" />
    </svg>
  ),

  // Chart / TradingView — candlestick chart
  Chart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      {/* candle 1 */}
      <line x1="5" y1="3"  x2="5"  y2="21" strokeOpacity="0.35" />
      <rect x="3" y="7"  width="4" height="6" rx="1" fill="currentColor" fillOpacity="0.3" />
      {/* candle 2 */}
      <line x1="12" y1="2"  x2="12" y2="21" strokeOpacity="0.35" />
      <rect x="10" y="5" width="4" height="9" rx="1" fill="currentColor" fillOpacity="0.3" />
      {/* candle 3 */}
      <line x1="19" y1="4"  x2="19" y2="21" strokeOpacity="0.35" />
      <rect x="17" y="8" width="4" height="7" rx="1" fill="currentColor" fillOpacity="0.3" />
    </svg>
  ),

  // Profile — modern user circle with ring
  Profile: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="currentColor" fillOpacity="0.2" />
      <path d="M5.5 19.5C6.5 17 9 15.5 12 15.5s5.5 1.5 6.5 4" />
    </svg>
  ),

  // Refresh — with tighter arc
  Refresh: ({ spin }: { spin?: boolean }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round"
         className={`w-4 h-4 ${spin ? "animate-spin" : ""}`}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14"  />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),

  Eye: ({ open }: { open: boolean }) =>
    open ? (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
           strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
           strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),

  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
         strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),

  Info: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8"  x2="12.01" y2="8" />
    </svg>
  ),

  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
    </svg>
  ),

  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),

  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="11" width="18" height="10" rx="2" fill="currentColor" fillOpacity="0.1" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),

  Palette: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="13.5" cy="6.5"  r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="6.5"  cy="12.5" r=".5" fill="currentColor" />
      <circle cx="8.5"  cy="7.5"  r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.2-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-5.5-4.5-10-9-10z" />
    </svg>
  ),

  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),

  // Flame — for action / hot items
  Flame: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 2C8 7 4 10 4 14a8 8 0 0 0 16 0c0-5-4-9-5-10-1 2-3 4-3 6a4 4 0 0 0 8 0c0-3-2-5-3-6 0 0-3 2-3 4" />
    </svg>
  ),

  // Star — kept for legacy use
  Star: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

// ─── Ripple button ─────────────────────────────────────────────────────────────
export function RippleBtn({
  onClick, disabled, className, children, type = "button", style,
}: {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit";
  style?: React.CSSProperties;
}) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const ref = useRef<HTMLButtonElement>(null);

  function addRipple(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((r) => r.id !== id)), 600);
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      style={style}
      className={`relative overflow-hidden ${className ?? ""}`}
      onMouseDown={addRipple}
      onClick={onClick}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/25 pointer-events-none animate-[ripple_0.6s_ease-out_forwards]"
          style={{ left: r.x - 40, top: r.y - 40, width: 80, height: 80 }}
        />
      ))}
      {children}
    </button>
  );
}

// ─── Refresh button ───────────────────────────────────────────────────────────
export function RefreshBtn({
  onClick, loading, label = "Refresh", size = "sm",
}: {
  onClick: () => void;
  loading: boolean;
  label?: string;
  size?: "sm" | "md";
}) {
  const base =
    size === "md"
      ? "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all active:scale-95"
      : "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95";

  return (
    <RippleBtn
      onClick={onClick}
      disabled={loading}
      className={`${base} text-slate-950 disabled:opacity-60`}
      style={{
        background:
          "linear-gradient(to right, var(--app-button, #f59e0b), var(--app-button-light, #fbbf24))",
        boxShadow: "var(--app-shadow, 0 10px 24px 0 rgba(245,158,11,0.25))",
        borderRadius: "var(--app-radius, 0.75rem)",
        transitionDuration: "var(--app-transition, 200ms)",
      }}
    >
      <Icons.Refresh spin={loading} />
      <span>{loading ? "Syncing…" : label}</span>
    </RippleBtn>
  );
}

// ─── Glass card ───────────────────────────────────────────────────────────────
export function GlassCard({
  children, className, glow, onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: "amber" | "emerald" | "blue";
  onClick?: (e: React.MouseEvent) => void;
}) {
  const glowMap = {
    amber:   "shadow-amber-500/10 border-amber-500/15",
    emerald: "shadow-emerald-500/10 border-emerald-500/15",
    blue:    "shadow-blue-500/10 border-blue-500/15",
  };
  const glowClass = glow ? glowMap[glow] : "";
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border shadow-xl ${glowClass} ${!glow ? "border-white/6" : ""} ${className ?? ""}`}
      style={
        !glow
          ? {
              borderRadius:    "var(--app-radius, 1rem)",
              borderColor:     "var(--app-panel-border, rgba(255,255,255,0.06))",
              background:      "var(--app-panel-tint, linear-gradient(to bottom right, rgba(255,255,255,0.04), rgba(255,255,255,0.01)))",
              boxShadow:       "var(--app-shadow, 0 20px 25px -5px rgba(0,0,0,0.3))",
              backdropFilter:  "blur(var(--app-panel-blur, 4px))",
              transitionDuration: "var(--app-transition, 200ms)",
            }
          : {
              borderRadius:    "var(--app-radius, 1rem)",
              backdropFilter:  "blur(var(--app-panel-blur, 4px))",
              transitionDuration: "var(--app-transition, 200ms)",
            }
      }
    >
      {children}
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
export function Chip({
  label, value, accent = "text-slate-200",
}: {
  label: string; value: string; accent?: string;
}) {
  return (
    <div
      className="rounded-xl border border-white/6 bg-black/30 p-2.5 text-center"
      style={{ borderRadius: "var(--app-radius, 0.75rem)" }}
    >
      <div className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold truncate">
        {label}
      </div>
      <div className={`text-sm font-bold tabular-nums mt-0.5 ${accent}`}>{value}</div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="px-1 pt-1 pb-2">
      <h1
        className="text-lg font-black tracking-tight"
        style={{ color: "var(--app-heading, #fff)" }}
      >
        {title}
      </h1>
      <p
        className="text-[11px] mt-0.5"
        style={{ color: "var(--app-text, #94a3b8)", opacity: 0.7 }}
      >
        {subtitle}
      </p>
    </header>
  );
}
