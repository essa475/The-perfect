import { useEffect, useMemo, useRef, useState } from "react";
import { GlassCard, RippleBtn, Icons } from "./primitives";
import {
  ANIMATION_STYLES,
  ABOUT_PASSWORD,
  CHART_PASSWORD,
  DEFAULT_THEME,
  DEV_PASSWORD,
  applyTheme,
  isAboutUnlocked,
  isChartUnlocked,
  isDevUnlocked,
  loadTheme,
  randomHex,
  saveTheme,
  setAboutUnlocked,
  setChartUnlocked,
  setDevUnlocked,
  type AnimationStyle,
  type ThemeSettings,
} from "@/lib/theme";

// ─── 100 Google Fonts ─────────────────────────────────────────────────────────
export const FONT_LIST = [
  // ── Sans-serif / Modern ────────────────────────────────────────────────────
  "Inter","Roboto","Open Sans","Lato","Montserrat","Poppins","Raleway","Nunito",
  "Source Sans 3","Ubuntu","DM Sans","Work Sans","Karla","Quicksand","Varela Round",
  "Cabin","Fira Sans","Rubik","Barlow","Exo 2","Saira","Asap","Titillium Web",
  "Heebo","Questrial","Hind","Yantramanav","Alata","Lexend","Plus Jakarta Sans",
  "Sora","Figtree","Outfit","Manrope","Albert Sans","Space Grotesk","Mulish",
  "Jost","Nunito Sans","Josefin Sans","Be Vietnam Pro","Hanken Grotesk",
  "IBM Plex Sans","IBM Plex Sans Condensed","Encode Sans","Encode Sans Condensed",
  "Encode Sans Semi Condensed","Public Sans","Red Hat Display","Red Hat Text",
  "Darker Grotesque","Epilogue","Urbanist","Syne","Spline Sans","Sofia Sans",
  "Recursive","Readex Pro","Varta","Maven Pro","Mada","M PLUS 1","M PLUS Rounded 1c",
  "Mitr","Monda","Mukta","Cantarell","Catamaran","Chivo","Cuprum","Dosis",
  "Faustina","Gelasio","Gothic A1","Gugi","Hammersmith One","Jaldi",
  "Julius Sans One","K2D","Khand","Krub","Lalezar","League Gothic","League Spartan",
  "Lekton","Literata","Nanum Gothic","Noto Sans","Oxygen","Philosopher",
  "Quantico","Quattrocento Sans","Rambla","Ropa Sans","Rosario","Ruda","Sarabun",
  "Secular One","Signika","Signika Negative","Taviraj","Tenor Sans","Tinos",
  "Tomorrow","Ubuntu Condensed","Unica One","Wix Madefor Display","Wix Madefor Text",
  "Yanone Kaffeesatz","Ysabeau","Arimo","Blinker","Cairo","Chivo Mono",
  "El Messiri","Expletus Sans","Faustina","Frank Ruhl Libre","Fredoka",
  "Libre Franklin","Play","Poiret One","Sigmar One","Pathway Gothic One",
  // ── Serif ─────────────────────────────────────────────────────────────────
  "Oswald","PT Sans","Merriweather","Playfair Display","Libre Baskerville",
  "EB Garamond","Lora","Crimson Text","Cormorant Garamond","Old Standard TT",
  "Alegreya","Alegreya SC","Alegreya Sans","Alegreya Sans SC","Andada Pro",
  "Arbutus Slab","Bitter","Bodoni Moda","Cantata One","Cardo","Castoro",
  "Coustard","Crimson Pro","DM Serif Display","DM Serif Text","Domine",
  "Elsie","Enriqueta","Eczar","Fenix","Fraunces","Gilda Display","Gloock",
  "Hahmlet","IBM Plex Serif","Josefin Slab","Kaisei Decol","Kaisei Opti",
  "Kreon","Ledger","Libre Caslon Display","Libre Caslon Text","Lusitana",
  "Lustria","Macondo","Marcellus","Marcellus SC","Martel","Mate","Mate SC",
  "Neuton","Newsreader","Noto Serif","Petrona","Piazzolla","Playfair Display SC",
  "Poly","Prata","PT Serif","Quattrocento","Radley","Rhodium Libre","Rokkitt",
  "Rosarivo","Scope One","Slabo 27px","Source Serif 4","Spectral","Suez One",
  "Trocchi","Unna","Vesper Libre","Vidaloka","Vollkorn","Yeseva One","Zilla Slab",
  "Yrsa","Cormorant","Cormorant Infant","Cormorant SC","Cormorant Upright",
  "Cormorant Unicase","Fenix","Lustria","Rufina","Donegal One","Gravitas One",
  "Abhaya Libre","Della Respira","Diplomat","GFS Didot","Italiana","Noto Serif Display",
  // ── Display / Decorative ──────────────────────────────────────────────────
  "Righteous","Comfortaa","Pacifico","Lobster","Lobster Two","Bangers",
  "Boogaloo","Lilita One","Chewy","Paytone One","Russo One","Anton","Bebas Neue",
  "Barlow Condensed","Teko","Six Caps","Squada One","Black Ops One","Bungee",
  "Bungee Inline","Bungee Outline","Bungee Shade","Abril Fatface","Acme",
  "Alfa Slab One","Archivo Black","Baloo 2","BenchNine","Black Han Sans",
  "Bree Serif","Caesar Dressing","Candal","Caprasimo","Carter One","Changa",
  "Cherry Bomb One","Chicle","Cinzel","Cinzel Decorative","Contrail One",
  "Creepster","Crushed","Days One","Diplomata","Emblema One","Exo",
  "Fjalla One","Flavors","Fontdiner Swanky","Forum","Francois One",
  "Freckle Face","Fredericka the Great","Fredoka One","Fugaz One","Galindo",
  "Geostar","Gideon Roman","Glee","Goblin One","Gorditas","Gugi",
  "Happy Monkey","Henny Penny","Iceberg","Irish Grover","Joti One","Kavoon",
  "Kirang Haerang","Kite One","Knewave","Kranky","League Gothic","Lemonada",
  "Limelight","McLaren","Megrim","Michroma","Milonga","Miniver","Mystery Quest",
  "New Rocker","Nixie One","Norican","Nova Cut","Nova Flat","Nova Oval",
  "Nova Round","Nova Square","Numans","Oleo Script","Oleo Script Swash Caps",
  "Oregano","Overlock","Overlock SC","Passero One","Passion One","Patua One",
  "Peralta","Piedra","Pirata One","Press Start 2P","Prosto One",
  "Racing Sans One","Rammetto One","Ranchers","Revalia","Ribeye","Ribeye Marrow",
  "Risque","Romanesco","Rowdies","Rum Raisin","Ruslan Display","Sansita",
  "Seymour One","Short Stack","Simonetta","Skranji","Slackey","Sniglet",
  "Sonsie One","Spicy Rice","Spirax","Stoke","Strait","Stylish","Supermercado One",
  "Text Me One","Titan One","Tilt Neon","Tilt Prism","Tilt Warp","Trade Winds",
  "Trochut","Truculenta","Unkempt","Vampiro One","Vast Shadow","Viga","Voces",
  "Wendy One","Wire One","Yatra One","Zen Dots","Zen Loop","Zen Tokyo Zoo",
  // ── Script / Handwriting ──────────────────────────────────────────────────
  "Dancing Script","Caveat","Sacramento","Great Vibes","Satisfy","Kaushan Script",
  "Permanent Marker","Gloria Hallelujah","Shadows Into Light","Architects Daughter",
  "Kalam","Amatic SC","Indie Flower","Caveat Brush","Charm","Rock Salt",
  "Neucha","Handlee","Patrick Hand","Allura","Courgette","Dawning of a New Day",
  "Engagement","Euphoria Script","Felipa","Fondamento","Grand Hotel",
  "Homemade Apple","Imperial Script","Italianno","Kristi","Lavishly Yours",
  "Lovers Quarrel","Luxurious Script","Meddon","Miss Fajardose",
  "Monsieur La Doulaise","Mr De Haviland","Mrs Saint Delafield","Niconne",
  "Parisienne","Petit Formal Script","Pinyon Script","Princess Sofia",
  "Qwigley","Reenie Beanie","Rochester","Rouge Script","Ruthie","Sail",
  "Sevillana","Style Script","Sue Ellen Francisco","Sunshiney","Tangerine",
  "The Nautigal","Updock","Vujahday Script","Waiting for the Sunrise",
  "Waterfall","Yellowtail","Yesteryear","Molle","Delius","Delius Swash Caps",
  "Delius Unicase","Felipa","Herr Von Muellerhoff","Jim Nightshade","Julee",
  "League Script","Over the Rainbow","Romanesco","Snowburst One","Sofia",
  "Swanky and Moo Moo","Vibes","Vibur","Clicker Script","Condiment",
  "Damion","Dynalight","Emilys Candy","Flamenco","Finger Paint",
  // ── Monospace ────────────────────────────────────────────────────────────
  "Special Elite","Courier Prime","Source Code Pro","JetBrains Mono","Fira Code",
  "Share Tech Mono","Inconsolata","IBM Plex Mono","Space Mono","Cutive Mono",
  "Nova Mono","Major Mono Display","Anonymous Pro","B612 Mono","Cousine",
  "DM Mono","Fragment Mono","Nanum Gothic Coding","Noto Sans Mono",
  "Overpass Mono","PT Mono","Red Hat Mono","Roboto Mono","Syne Mono",
  "Xanh Mono","Ubuntu Mono","Martian Mono","Share Tech","Chivo Mono",
  // ── Tech / Futuristic ────────────────────────────────────────────────────
  "Audiowide","Orbitron","Electrolize","VT323","Exo 2","Share Tech",
  "Syncopate","Turret Road","Rajdhani","Zen Dots","Aldrich","Iceland","Jura",
  "Michroma","Quantico","Oxanium","Gugi","Play","Rajdhani","Blinker",
  "Tomorrow","Yanone Kaffeesatz","Graduate","Squada One","Encode Sans Expanded",
  // ── Condensed / Narrow ───────────────────────────────────────────────────
  "Cabin Condensed","Roboto Condensed","Saira Condensed","Saira Extra Condensed",
  "Saira Semi Condensed","PT Sans Narrow","PT Sans Caption","Asap Condensed",
  "Barlow Semi Condensed","Ubuntu Condensed","Encode Sans Condensed",
];

// Load a single Google Font into the document on demand
function loadGoogleFont(family: string) {
  const id = `gf-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;600;700&display=swap`;
  document.head.appendChild(link);
}

// Batch-load all FONT_LIST fonts in a few combined requests for fast preview rendering
let _allFontsLoaded = false;
function loadAllFonts() {
  if (_allFontsLoaded) return;
  _allFontsLoaded = true;
  const BATCH = 25;
  for (let i = 0; i < FONT_LIST.length; i += BATCH) {
    const batch = FONT_LIST.slice(i, i + BATCH);
    const id = `gf-batch-${i}`;
    if (document.getElementById(id)) continue;
    const families = batch.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;700`).join("&");
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);
  }
}

// ─── Font Role Picker ─────────────────────────────────────────────────────────
function FontRolePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = search
    ? FONT_LIST.filter((f) => f.toLowerCase().includes(search.toLowerCase()))
    : FONT_LIST;

  // Batch-load all fonts the moment the picker opens
  function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      loadAllFonts();
      // Scroll selected font into view after render
      requestAnimationFrame(() => {
        listRef.current?.querySelector("[data-selected='true']")?.scrollIntoView({ block: "nearest" });
      });
    } else {
      setSearch("");
    }
  }

  return (
    <div className="border-b border-white/5 last:border-0 py-2.5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider shrink-0">
          {label}
        </span>
        <button
          onClick={handleOpen}
          className={`flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 max-w-[160px] ${
            open
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
              : "border-white/8 bg-black/30 text-slate-300 hover:border-white/20"
          }`}
          style={{ fontFamily: `'${value}', sans-serif` }}
        >
          <span className="text-base leading-none font-bold" style={{ fontFamily: `'${value}', sans-serif` }}>
            Aa
          </span>
          <span className="truncate">{value}</span>
          <span className="shrink-0 opacity-60">{open ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="mt-2 space-y-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search fonts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500/50 placeholder-slate-600 transition"
          />

          {/* Font grid — stays open, tap to apply live */}
          <div
            ref={listRef}
            className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto pr-0.5"
          >
            {filtered.map((f) => {
              const selected = f === value;
              return (
                <button
                  key={f}
                  data-selected={selected}
                  onClick={() => {
                    loadGoogleFont(f); // ensure single-family fallback too
                    onChange(f);       // applies theme immediately via update()
                  }}
                  className={`group flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-lg border transition-all active:scale-95 text-left ${
                    selected
                      ? "border-amber-500/50 bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
                      : "border-white/5 bg-black/20 text-slate-400 hover:bg-white/5 hover:border-white/15 hover:text-slate-200"
                  }`}
                >
                  {/* Big "Aa" in the actual font */}
                  <span
                    className={`text-xl leading-none font-bold ${selected ? "text-amber-300" : "text-slate-300 group-hover:text-white"}`}
                    style={{ fontFamily: `'${f}', sans-serif` }}
                  >
                    Aa
                  </span>
                  {/* Font name in its own typeface */}
                  <span
                    className="text-[10px] leading-tight truncate w-full"
                    style={{ fontFamily: `'${f}', sans-serif` }}
                  >
                    {f}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Close button */}
          <button
            onClick={() => { setOpen(false); setSearch(""); }}
            className="w-full text-[10px] text-slate-600 hover:text-slate-400 py-1 transition"
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Animation Picker ────────────────────────────────────────────────────────
function AnimationPicker({ value, onChange }: { value: AnimationStyle; onChange: (id: AnimationStyle) => void }) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");

  const cats = useMemo(() => {
    const seen = new Set<string>();
    seen.add("All");
    ANIMATION_STYLES.forEach((a) => { if (a.cat) seen.add(a.cat); });
    return Array.from(seen);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ANIMATION_STYLES.filter((a) => {
      const matchCat = activeCat === "All" || a.cat === activeCat;
      if (!matchCat) return false;
      if (!q) return true;
      return a.label.toLowerCase().includes(q) || a.hint.toLowerCase().includes(q) || a.id.includes(q);
    });
  }, [search, activeCat]);

  return (
    <GlassCard className="p-4">
      <SectionLabel icon="✨" title="Tab-switch animation" desc={`How sections transition. ${ANIMATION_STYLES.length} styles total.`} />
      {/* Search */}
      <div className="relative mb-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search animations…"
          className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-amber-500/40 transition placeholder-slate-700"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 text-xs"
          >✕</button>
        )}
      </div>
      {/* Category pills */}
      <div className="flex flex-wrap gap-1 mb-2">
        {cats.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`text-[9px] font-semibold px-2 py-0.5 rounded-full transition-all ${
              activeCat === cat
                ? "bg-amber-500/25 text-amber-300 border border-amber-500/40"
                : "bg-black/30 text-slate-500 border border-white/6 hover:text-slate-300"
            }`}
          >{cat}</button>
        ))}
      </div>
      {/* Grid — scrollable */}
      <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-0.5 scrollbar-thin">
        {filtered.length === 0 && (
          <div className="col-span-2 text-center text-xs text-slate-700 py-4">No matches</div>
        )}
        {filtered.map((a) => (
          <button
            key={a.id}
            onClick={() => onChange(a.id as AnimationStyle)}
            className={`text-left rounded-xl border px-2.5 py-2 transition-all active:scale-95 ${
              value === a.id
                ? "border-amber-500/50 bg-amber-500/10"
                : "border-white/6 bg-black/20 hover:bg-black/35"
            }`}
          >
            <div className={`text-[11px] font-bold leading-tight ${value === a.id ? "text-amber-300" : "text-slate-300"}`}>
              {a.label}
            </div>
            <div className="text-[9px] text-slate-600 mt-0.5 leading-tight">{a.hint}</div>
          </button>
        ))}
      </div>
      {filtered.length > 0 && (
        <div className="text-[9px] text-slate-700 text-right mt-1">{filtered.length} of {ANIMATION_STYLES.length}</div>
      )}
    </GlassCard>
  );
}

// ─── Slider ──────────────────────────────────────────────────────────────────
function Slider({
  label, value, min, max, step = 1, unit = "", onChange,
}: {
  label: string; value: number; min: number; max: number;
  step?: number; unit?: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-bold text-amber-300/90 tabular-nums">
          {value}{unit}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute left-0 right-0 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(to right, var(--app-button, #f59e0b), var(--app-button-light, #fbbf24))",
            }}
          />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full opacity-0 h-5 cursor-pointer"
          style={{ zIndex: 1 }}
        />
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-amber-400 shadow-lg pointer-events-none"
          style={{
            left: `calc(${pct}% - 8px)`,
            background: "var(--app-button, #f59e0b)",
            boxShadow: "0 0 8px var(--app-button-tint-25, rgba(245,158,11,0.5))",
          }}
        />
      </div>
    </div>
  );
}

// ─── Color picker ────────────────────────────────────────────────────────────
function ColorPickerRow({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
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
          className="w-20 bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-slate-200 outline-none focus:border-amber-500/50 tabular-nums"
        />
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-white/10 bg-transparent cursor-pointer p-0.5"
        />
        <button
          type="button"
          title="Random"
          onClick={() => onChange(randomHex())}
          className="w-8 h-8 rounded-lg border border-white/10 bg-black/30 hover:bg-black/50 flex items-center justify-center text-sm active:scale-90 transition-transform"
        >
          🎲
        </button>
      </div>
    </div>
  );
}

// ─── Section label ───────────────────────────────────────────────────────────
function SectionLabel({ icon, title, desc }: { icon: string; title: string; desc?: string }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-bold text-white">{title}</span>
      </div>
      {desc && <p className="text-[11px] text-slate-600 mt-0.5 pl-7">{desc}</p>}
    </div>
  );
}

// ─── About content (unlocked via separate password) ───────────────────────────
function AboutContent({ onHide }: { onHide: () => void }) {
  return (
    <GlassCard glow="amber" className="p-4 space-y-3 relative">
      <button
        onClick={onHide}
        className="absolute top-3 right-3 text-slate-600 hover:text-slate-300 transition-colors text-xs"
        aria-label="Close"
      >
        <Icons.Close />
      </button>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
          <Icons.User />
        </div>
        <div>
          <div className="font-black text-white text-sm">Essa Aziz</div>
          <div className="text-[11px] text-amber-400/80 mt-0.5">Web · Full Stack Developer</div>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-slate-400 px-1">
        This dashboard was designed and built by{" "}
        <span className="text-white font-semibold">Essa Aziz</span>, a web developer and full
        stack developer with a sharp eye for detail and a genuine craftsman's approach to
        building software. From the live market data pipelines to the smallest
        micro-interaction, every part of this app reflects a rare combination of technical
        depth and design sensibility — clean architecture, thoughtful UX, and a relentless
        focus on getting the details right.
      </p>
    </GlassCard>
  );
}

// ─── DevOptions main component ────────────────────────────────────────────────
export default function DevOptions() {
  const [unlocked, setUnlocked]     = useState(false);
  const [pw, setPw]                 = useState("");
  const [err, setErr]               = useState("");
  const [theme, setTheme]           = useState<ThemeSettings>(DEFAULT_THEME);

  // About easter-egg state
  const [aboutUnlocked, setAboutUnlockedState] = useState(false);
  const [showAbout, setShowAbout]   = useState(false);
  const [aboutPw, setAboutPw]       = useState("");
  const [aboutPwVisible, setAboutPwVisible] = useState(false);
  const [aboutErr, setAboutErr]     = useState("");

  // Chart unlock easter-egg state
  const [chartUnlockedState, setChartUnlockedState] = useState(false);
  const [chartPw, setChartPw]             = useState("");
  const [chartPwVisible, setChartPwVisible] = useState(false);
  const [chartErr, setChartErr]           = useState("");

  // rAF + debounce refs for smooth slider performance
  const rafRef   = useRef<number | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTheme = useRef<ThemeSettings | null>(null);

  useEffect(() => {
    setUnlocked(isDevUnlocked());
    setAboutUnlockedState(isAboutUnlocked());
    setChartUnlockedState(isChartUnlocked());
    const t = loadTheme();
    setTheme(t);
    applyTheme(t);
    // Pre-load any saved custom fonts
    const fontRoles = [t.navFont, t.titleFont, t.headingFont, t.subheadingFont, t.panelFont];
    fontRoles.forEach((f) => { if (f && f !== "Inter") loadGoogleFont(f); });

    // Flush any pending save on unmount
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        if (pendingTheme.current) saveTheme(pendingTheme.current);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function update(patch: Partial<ThemeSettings>) {
    setTheme((t) => {
      const next = { ...t, ...patch };
      pendingTheme.current = next;

      // Apply visual change on the next animation frame (coalesced)
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        applyTheme(next);
        rafRef.current = null;
      });

      // Debounce the localStorage write
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveTheme(next);
        saveTimer.current = null;
      }, 180);

      return next;
    });
  }

  function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (pw === DEV_PASSWORD) {
      setDevUnlocked(true);
      setUnlocked(true);
      setErr("");
      setPw("");
    } else {
      setErr("Incorrect password.");
      setPw("");
    }
  }

  function lock() {
    setDevUnlocked(false);
    setUnlocked(false);
    // Locking Dev Options also revokes chart access
    setChartUnlocked(false);
    setChartUnlockedState(false);
    setChartPwVisible(false);
    setChartPw("");
  }

  function unlockChart(e: React.FormEvent) {
    e.preventDefault();
    if (chartPw === CHART_PASSWORD) {
      setChartUnlocked(true);      // persists + fires event
      setChartUnlockedState(true);
      setChartPw("");
      setChartErr("");
      setChartPwVisible(false);
    } else {
      setChartErr("Wrong password.");
      setChartPw("");
    }
  }

  function resetAll() {
    // Cancel any in-flight rAF or debounced save so stale values can't overwrite the reset.
    if (rafRef.current)    { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (saveTimer.current) { clearTimeout(saveTimer.current);      saveTimer.current = null; }
    pendingTheme.current = null;
    setTheme(DEFAULT_THEME);
    saveTheme(DEFAULT_THEME);
    applyTheme(DEFAULT_THEME);
  }

  function unlockAbout(e: React.FormEvent) {
    e.preventDefault();
    if (aboutPw === ABOUT_PASSWORD) {
      setAboutUnlocked(true);
      setAboutUnlockedState(true);
      setShowAbout(true);
      setAboutPw("");
      setAboutErr("");
      setAboutPwVisible(false);
    } else {
      setAboutErr("Wrong password.");
      setAboutPw("");
    }
  }

  // ── Locked gate ──────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <GlassCard className="p-5 space-y-4">
        <div className="flex items-center gap-2 text-amber-300/90">
          <Icons.Lock />
          <span className="text-sm font-bold">Developer Options</span>
        </div>
        <p className="text-xs text-slate-500">
          Enter the developer password to unlock appearance, animation & typography controls.
        </p>
        <form onSubmit={unlock} className="space-y-3">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Developer password"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition placeholder-slate-700"
          />
          {err && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {err}
            </div>
          )}
          <RippleBtn
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-sm active:scale-[0.98] transition-all"
          >
            Unlock
          </RippleBtn>
        </form>
      </GlassCard>
    );
  }

  // ── Unlocked panel ───────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Header */}
      <GlassCard className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400/90">
          <Icons.Check />
          <span className="text-sm font-bold text-white">Dev Options</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Chart "i" button — nearly invisible until tapped */}
          <button
            onClick={() => {
              if (chartUnlockedState) {
                // Already unlocked — tap again to lock chart
                setChartUnlocked(false);
                setChartUnlockedState(false);
              } else {
                setChartPwVisible((v) => !v);
                setChartErr("");
                setAboutPwVisible(false);
              }
            }}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors active:scale-90 ${
              chartUnlockedState
                ? "text-amber-400 hover:text-amber-300"
                : "text-slate-800 hover:text-slate-500"
            }`}
            aria-label="Chart unlock"
            title={chartUnlockedState ? "Chart tab unlocked — tap to lock" : "ⓘ"}
          >
            <Icons.Chart />
          </button>

          {/* About "i" button — nearly invisible until tapped */}
          {!showAbout && (
            <button
              onClick={() => {
                if (aboutUnlocked) {
                  setShowAbout(true);
                } else {
                  setAboutPwVisible((v) => !v);
                  setAboutErr("");
                  setChartPwVisible(false);
                }
              }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-800 hover:text-slate-500 transition-colors active:scale-90"
              aria-label="About"
              title="ⓘ"
            >
              <Icons.Info />
            </button>
          )}
          <button
            onClick={lock}
            className="text-[11px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <Icons.Lock /> Lock
          </button>
        </div>
      </GlassCard>

      {/* Chart unlock password prompt */}
      {chartPwVisible && !chartUnlockedState && (
        <GlassCard className="p-4">
          <p className="text-[11px] text-slate-500 mb-2 font-semibold uppercase tracking-wider">🔐 Unlock Chart Tab</p>
          <form onSubmit={unlockChart} className="space-y-2">
            <input
              type="password"
              value={chartPw}
              onChange={(e) => setChartPw(e.target.value)}
              placeholder="Enter password…"
              autoFocus
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50 transition placeholder-slate-700"
            />
            {chartErr && <p className="text-xs text-red-400">{chartErr}</p>}
            <RippleBtn
              type="submit"
              className="w-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold py-2 rounded-xl text-sm active:scale-[0.98] transition-all"
            >
              Unlock
            </RippleBtn>
          </form>
        </GlassCard>
      )}

      {/* About password prompt */}
      {aboutPwVisible && !aboutUnlocked && (
        <GlassCard className="p-4">
          <form onSubmit={unlockAbout} className="space-y-2">
            <input
              type="password"
              value={aboutPw}
              onChange={(e) => setAboutPw(e.target.value)}
              placeholder="Enter password…"
              autoFocus
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50 transition placeholder-slate-700"
            />
            {aboutErr && (
              <p className="text-xs text-red-400">{aboutErr}</p>
            )}
            <RippleBtn
              type="submit"
              className="w-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold py-2 rounded-xl text-sm active:scale-[0.98] transition-all"
            >
              View
            </RippleBtn>
          </form>
        </GlassCard>
      )}

      {/* About content (revealed after password) */}
      {showAbout && <AboutContent onHide={() => setShowAbout(false)} />}

      {/* ── Animation styles ───────────────────────────────────────────── */}
      <AnimationPicker
        value={theme.animationStyle}
        onChange={(id) => update({ animationStyle: id as AnimationStyle })}
      />

      {/* ── Colors ─────────────────────────────────────────────────────── */}
      <GlassCard className="p-4">
        <SectionLabel icon="🎨" title="Colors" desc="Hex value, color wheel, or random." />
        <div className="divide-y divide-white/5">
          <ColorPickerRow label="Background" value={theme.bgColor}      onChange={(v) => update({ bgColor: v })} />
          <ColorPickerRow label="Accent / Button" value={theme.buttonColor} onChange={(v) => update({ buttonColor: v })} />
          <ColorPickerRow label="Panel tint" value={theme.panelColor}   onChange={(v) => update({ panelColor: v })} />
          <ColorPickerRow label="Shadow color" value={theme.shadowColor} onChange={(v) => update({ shadowColor: v })} />
          <ColorPickerRow label="Body text" value={theme.fontColor}     onChange={(v) => update({ fontColor: v })} />
          <ColorPickerRow label="Headings" value={theme.headingColor}   onChange={(v) => update({ headingColor: v })} />
        </div>
        <Slider label="Saturation" value={theme.saturation} min={0} max={200} unit="%" onChange={(v) => update({ saturation: v })} />
      </GlassCard>

      {/* ── Font Style ─────────────────────────────────────────────────── */}
      <GlassCard className="p-4">
        <SectionLabel
          icon="🔤"
          title="Font Style"
          desc="Pick a typeface for each UI role. 100 fonts available."
        />
        <div className="divide-y divide-white/5">
          <FontRolePicker
            label="Nav bar"
            value={theme.navFont || "Inter"}
            onChange={(v) => update({ navFont: v })}
          />
          <FontRolePicker
            label="Title"
            value={theme.titleFont || "Inter"}
            onChange={(v) => update({ titleFont: v })}
          />
          <FontRolePicker
            label="Heading"
            value={theme.headingFont || "Inter"}
            onChange={(v) => update({ headingFont: v })}
          />
          <FontRolePicker
            label="Sub-heading"
            value={theme.subheadingFont || "Inter"}
            onChange={(v) => update({ subheadingFont: v })}
          />
          <FontRolePicker
            label="Panel text"
            value={theme.panelFont || "Inter"}
            onChange={(v) => update({ panelFont: v })}
          />
        </div>
      </GlassCard>

      {/* ── Shadow ─────────────────────────────────────────────────────── */}
      <GlassCard className="p-4">
        <SectionLabel icon="🌑" title="Shadow" />
        <Slider label="Intensity"   value={theme.shadowIntensity} min={0}   max={100} unit="%" onChange={(v) => update({ shadowIntensity: v })} />
      </GlassCard>

      {/* ── Shape ──────────────────────────────────────────────────────── */}
      <GlassCard className="p-4">
        <SectionLabel icon="⬡" title="Shape" />
        <Slider label="Border radius"      value={theme.borderRadius}     min={0}   max={32}  unit="px" onChange={(v) => update({ borderRadius: v })} />
        <Slider label="Card opacity"       value={theme.cardOpacity}      min={0}   max={20}  unit="%" onChange={(v) => update({ cardOpacity: v })} />
        <Slider label="Panel blur"         value={theme.panelBlur}        min={0}   max={32}  unit="px" onChange={(v) => update({ panelBlur: v })} />
        <Slider label="Glow intensity"     value={theme.glowIntensity}    min={0}   max={100} unit="%" onChange={(v) => update({ glowIntensity: v })} />
      </GlassCard>

      {/* ── Typography ─────────────────────────────────────────────────── */}
      <GlassCard className="p-4">
        <SectionLabel icon="Aa" title="Typography" />
        <Slider label="Font size scale" value={theme.fontScale} min={75} max={130} unit="%" onChange={(v) => update({ fontScale: v })} />
      </GlassCard>

      {/* ── Motion ─────────────────────────────────────────────────────── */}
      <GlassCard className="p-4">
        <SectionLabel icon="⚡" title="Motion" />
        <Slider label="Transition speed" value={theme.transitionDuration} min={80}  max={900} step={10} unit="ms" onChange={(v) => update({ transitionDuration: v })} />
        <Slider label="Slide distance"   value={theme.animPixels}         min={8}   max={100} unit="px"  onChange={(v) => update({ animPixels: v })} />
      </GlassCard>

      {/* Reset */}
      <RippleBtn
        onClick={resetAll}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 font-bold py-2.5 text-sm transition-all active:scale-[0.98]"
      >
        ↺ Reset all to defaults
      </RippleBtn>
    </div>
  );
}
