import { useEffect, useMemo, useRef, useState } from "react";
import { GlassCard, Icons } from "./primitives";

// ─── Persistence ────────────────────────────────────────────────────────────
const COLORS_KEY      = "xauusd_tv_candle_colors";
const INTERVAL_KEY    = "xauusd_tv_interval";
const SHOW_COLORS_KEY = "xauusd_tv_show_colors";

type CandleColors = {
  background: string;
  bullBody:   string;
  bullWick:   string;
  bearBody:   string;
  bearWick:   string;
};

const DEFAULT_COLORS: CandleColors = {
  background: "#000000",
  bullBody:   "#ffffff",
  bullWick:   "#000000",
  bearBody:   "#000000",
  bearWick:   "#000000",
};

function loadColors(): CandleColors {
  try {
    const raw = localStorage.getItem(COLORS_KEY);
    if (!raw) return { ...DEFAULT_COLORS };
    return { ...DEFAULT_COLORS, ...(JSON.parse(raw) as Partial<CandleColors>) };
  } catch {
    return { ...DEFAULT_COLORS };
  }
}
function saveColors(c: CandleColors) {
  localStorage.setItem(COLORS_KEY, JSON.stringify(c));
}

const INTERVALS: { label: string; value: string }[] = [
  { label: "1m",  value: "1"   },
  { label: "3m",  value: "3"   },
  { label: "5m",  value: "5"   },
  { label: "15m", value: "15"  },
  { label: "30m", value: "30"  },
  { label: "1h",  value: "60"  },
  { label: "2h",  value: "120" },
  { label: "4h",  value: "240" },
  { label: "1D",  value: "D"   },
];

function buildWidgetConfig(colors: CandleColors, interval: string) {
  return {
    autosize:         true,
    symbol:           "BLACKBULL:XAUUSD",
    interval,
    timezone:         "America/New_York",
    theme:            "dark",
    style:            "1",
    locale:           "en",
    backgroundColor:  colors.background,
    gridColor:        "rgba(255, 255, 255, 0.06)",
    hide_top_toolbar: false,
    hide_legend:      false,
    hide_side_toolbar: false,
    allow_symbol_change: false,
    save_image:       true,
    withdateranges:   true,
    details:          false,
    hotlist:          false,
    calendar:         false,
    support_host:     "https://www.tradingview.com",
    overrides: {
      "paneProperties.background":                          colors.background,
      "paneProperties.backgroundType":                      "solid",
      "mainSeriesProperties.candleStyle.upColor":           colors.bullBody,
      "mainSeriesProperties.candleStyle.downColor":         colors.bearBody,
      "mainSeriesProperties.candleStyle.borderUpColor":     colors.bullWick,
      "mainSeriesProperties.candleStyle.borderDownColor":   colors.bearWick,
      "mainSeriesProperties.candleStyle.wickUpColor":       colors.bullWick,
      "mainSeriesProperties.candleStyle.wickDownColor":     colors.bearWick,
      "mainSeriesProperties.candleStyle.drawWick":          true,
      "mainSeriesProperties.candleStyle.drawBorder":        true,
    },
  };
}

// ─── Hex color input ─────────────────────────────────────────────────────────
function ColorField({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex items-center gap-1.5">
        <div
          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
          style={{ background: /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#888" }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) =>
            /^#?[0-9a-fA-F]{0,6}$/.test(e.target.value) &&
            onChange(e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`)
          }
          className="w-20 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-slate-200 outline-none focus:border-amber-500/50 tabular-nums"
        />
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded-lg border border-white/10 bg-transparent cursor-pointer p-0.5"
        />
      </div>
    </div>
  );
}

export default function TradingViewTab() {
  const [colors, setColors]       = useState<CandleColors>(loadColors);
  const [interval, setInterval_]  = useState<string>(
    () => localStorage.getItem(INTERVAL_KEY) || "15",
  );
  const [showColors, setShowColors] = useState<boolean>(
    () => localStorage.getItem(SHOW_COLORS_KEY) === "1",
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { saveColors(colors); },                                [colors]);
  useEffect(() => { localStorage.setItem(INTERVAL_KEY, interval); },     [interval]);
  useEffect(() => { localStorage.setItem(SHOW_COLORS_KEY, showColors ? "1" : "0"); }, [showColors]);

  const config = useMemo(() => buildWidgetConfig(colors, interval), [colors, interval]);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    const rebuild = () => {
      host.innerHTML = "";

      const wrapper = document.createElement("div");
      wrapper.className = "tradingview-widget-container";
      wrapper.style.height = "100%";
      wrapper.style.width  = "100%";

      const widgetDiv = document.createElement("div");
      widgetDiv.className = "tradingview-widget-container__widget";
      widgetDiv.style.height = "100%";
      widgetDiv.style.width  = "100%";
      wrapper.appendChild(widgetDiv);

      const script = document.createElement("script");
      script.type  = "text/javascript";
      script.src   = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.async = true;
      script.text  = JSON.stringify(config);
      wrapper.appendChild(script);

      host.appendChild(wrapper);
    };

    const timeout = window.setTimeout(rebuild, 400);
    return () => { window.clearTimeout(timeout); host.innerHTML = ""; };
  }, [config]);

  function setColor(key: keyof CandleColors, value: string) {
    setColors((c) => ({ ...c, [key]: value }));
  }
  function resetColors() { setColors({ ...DEFAULT_COLORS }); }

  return (
    // Use 100dvh so the tab fills the full viewport on mobile (accounting for browser chrome)
    // The interval bar + optional panel sit at top; chart fills all remaining height.
    <div
      className="flex flex-col gap-2"
      style={{ height: "calc(100dvh - 140px)", minHeight: 0 }}
    >
      {/* Interval bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 px-0.5">
        {INTERVALS.map((iv) => (
          <button
            key={iv.value}
            onClick={() => setInterval_(iv.value)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
              interval === iv.value
                ? "text-slate-950"
                : "text-slate-400 bg-black/30 hover:text-slate-200"
            }`}
            style={
              interval === iv.value
                ? {
                    background:
                      "linear-gradient(to right, var(--app-button, #f59e0b), var(--app-button-light, #fbbf24))",
                    boxShadow: "0 0 12px var(--app-button-tint-25, rgba(245,158,11,0.4))",
                  }
                : undefined
            }
          >
            {iv.label}
          </button>
        ))}

        {/* Color panel toggle */}
        <button
          onClick={() => setShowColors((s) => !s)}
          aria-label="Toggle candle color settings"
          className={`ml-auto shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
            showColors
              ? "text-amber-300 bg-amber-500/15 border border-amber-500/30"
              : "text-slate-400 bg-black/30 hover:text-slate-200 border border-white/5"
          }`}
        >
          <Icons.Palette />
          <span className="hidden sm:inline">Colors</span>
        </button>
      </div>

      {/* Optional candle color panel */}
      {showColors && (
        <GlassCard className="p-3 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300/90">🕯 Candle Colors</span>
            <button
              onClick={resetColors}
              className="text-[11px] text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y divide-white/5 sm:divide-y-0">
            <div className="sm:pr-3 sm:border-r sm:border-white/5">
              <ColorField label="Background"     value={colors.background} onChange={(v) => setColor("background", v)} />
              <ColorField label="Bull body"      value={colors.bullBody}   onChange={(v) => setColor("bullBody",   v)} />
              <ColorField label="Bull wick"      value={colors.bullWick}   onChange={(v) => setColor("bullWick",   v)} />
            </div>
            <div className="sm:pl-3">
              <ColorField label="Bear body"      value={colors.bearBody}   onChange={(v) => setColor("bearBody",   v)} />
              <ColorField label="Bear wick"      value={colors.bearWick}   onChange={(v) => setColor("bearWick",   v)} />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Chart — fills all remaining height, never scrolls */}
      <GlassCard glow="amber" className="p-1.5 overflow-hidden flex-1 min-h-0">
        <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />
      </GlassCard>
    </div>
  );
}
