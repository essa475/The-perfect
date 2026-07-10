// ─── Dev Options theme engine ──────────────────────────────────────────────
// Persists customization to localStorage and applies it to the document
// as CSS custom properties so the rest of the app can consume it live.

export type AnimationStyle =
  // ── Original 30 ──────────────────────────────────────────────────────────
  | "slide" | "fade" | "zoom" | "flip" | "slide-up" | "blur" | "bounce" | "rotate"
  | "slide-flip" | "zoom-flip" | "flip-bounce" | "slide-blur" | "zoom-rotate"
  | "bounce-blur" | "rotate-fade" | "slide-zoom" | "zoom-bounce" | "zoom-blur"
  | "flip-rotate" | "glide" | "drop" | "swing" | "rubber" | "pop" | "morph"
  | "drift-in" | "rise" | "unfold" | "shutter" | "mega"
  // ── New non-directional (61) ──────────────────────────────────────────────
  | "fade-up" | "fade-down" | "zoom-out" | "spin-in" | "flip-x" | "fold"
  | "curtain" | "stamp" | "newspaper" | "tv-on" | "flash-in" | "pulse-in"
  | "wobble-in" | "jello" | "tada" | "hinge" | "pendulum" | "clock" | "spiral"
  | "barrel" | "implode" | "explode" | "float" | "levitate" | "gravity" | "slam"
  | "bounce-down" | "blur-up" | "blur-down" | "zoom-up" | "zoom-down"
  | "flip-down" | "flip-up" | "compress" | "expand" | "sway" | "fog" | "dissolve"
  | "vortex" | "snap" | "elastic" | "light-speed" | "back-in" | "heartbeat"
  | "cascade" | "spin-zoom" | "flip-zoom" | "rotate-slide" | "blur-rotate"
  | "blur-bounce" | "drift-up" | "drift-down" | "scale-bounce" | "tilt-in"
  | "roll-in" | "page-in" | "fade-zoom" | "ping" | "wipe-left" | "wipe-right"
  | "flip-x-bounce"
  // ── New directional (10) ──────────────────────────────────────────────────
  | "rush" | "sling" | "roll-dir" | "skew" | "tilt" | "warp" | "kick"
  | "swoosh" | "spin-dir" | "bounce-dir";

export const ANIMATION_STYLES: { id: AnimationStyle; label: string; hint: string; cat: string }[] = [
  // ── Original 30 ──────────────────────────────────────────────────────────
  { id: "slide",        label: "Slide",          hint: "Classic directional slide",          cat: "Classic"    },
  { id: "fade",         label: "Fade",           hint: "Clean cross-fade",                   cat: "Classic"    },
  { id: "zoom",         label: "Zoom",           hint: "Scale up while fading",              cat: "Classic"    },
  { id: "flip",         label: "Flip",           hint: "3-D Y-axis flip",                    cat: "Classic"    },
  { id: "slide-up",     label: "Slide Up",       hint: "Rises from below",                   cat: "Classic"    },
  { id: "blur",         label: "Blur In",        hint: "Unblurs into focus",                 cat: "Classic"    },
  { id: "bounce",       label: "Bounce",         hint: "Springy overshoot",                  cat: "Classic"    },
  { id: "rotate",       label: "Rotate",         hint: "Spin + scale",                       cat: "Classic"    },
  { id: "slide-flip",   label: "Slide+Flip",     hint: "Slide while flipping",               cat: "Combo"      },
  { id: "zoom-flip",    label: "Zoom+Flip",      hint: "Scale while flipping",               cat: "Combo"      },
  { id: "flip-bounce",  label: "Flip+Bounce",    hint: "3-D flip, springy land",             cat: "Combo"      },
  { id: "slide-blur",   label: "Slide+Blur",     hint: "Slide while unblurring",             cat: "Combo"      },
  { id: "zoom-rotate",  label: "Zoom+Rotate",    hint: "Scale while spinning",               cat: "Combo"      },
  { id: "bounce-blur",  label: "Bounce+Blur",    hint: "Spring scale + unblur",              cat: "Combo"      },
  { id: "rotate-fade",  label: "Rotate+Fade",    hint: "Wide spin cross-fade",               cat: "Combo"      },
  { id: "slide-zoom",   label: "Slide+Zoom",     hint: "Slide while scaling",                cat: "Combo"      },
  { id: "zoom-bounce",  label: "Zoom+Bounce",    hint: "Scale with bounce land",             cat: "Combo"      },
  { id: "zoom-blur",    label: "Zoom+Blur",      hint: "Scale while unblurring",             cat: "Combo"      },
  { id: "flip-rotate",  label: "Flip+Rotate",    hint: "3-D flip + spin combo",              cat: "Combo"      },
  { id: "glide",        label: "Glide",          hint: "Smooth elastic glide",               cat: "Smooth"     },
  { id: "drop",         label: "Drop In",        hint: "Falls from above",                   cat: "Smooth"     },
  { id: "swing",        label: "Swing",          hint: "Hinge swing from top",               cat: "Smooth"     },
  { id: "rubber",       label: "Rubber",         hint: "Elastic overshoot both ways",        cat: "Bouncy"     },
  { id: "pop",          label: "Pop",            hint: "Sharp quick scale pop",              cat: "Bouncy"     },
  { id: "morph",        label: "Morph",          hint: "Scale + rotate + blur triple",       cat: "3D"         },
  { id: "drift-in",     label: "Drift In",       hint: "Diagonal bottom-right drift",        cat: "Smooth"     },
  { id: "rise",         label: "Rise",           hint: "Float up + unblur",                  cat: "Smooth"     },
  { id: "unfold",       label: "Unfold",         hint: "Scale from flat",                    cat: "Smooth"     },
  { id: "shutter",      label: "Shutter",        hint: "Camera-shutter X flip",              cat: "3D"         },
  { id: "mega",         label: "✦ Mega",         hint: "Fade+slide+rotate+flip+bounce",      cat: "Special"    },
  // ── New: Fade family ─────────────────────────────────────────────────────
  { id: "fade-up",      label: "Fade Up",        hint: "Fade while rising",                  cat: "Fade"       },
  { id: "fade-down",    label: "Fade Down",      hint: "Fade while dropping",                cat: "Fade"       },
  { id: "fade-zoom",    label: "Fade Zoom",      hint: "Subtle zoom-fade",                   cat: "Fade"       },
  { id: "flash-in",     label: "Flash In",       hint: "Flickers into view",                 cat: "Fade"       },
  { id: "fog",          label: "Fog Lift",       hint: "Heavy blur clears like fog",         cat: "Fade"       },
  { id: "dissolve",     label: "Dissolve",       hint: "Blur + scale dissolve",              cat: "Fade"       },
  // ── New: Zoom family ─────────────────────────────────────────────────────
  { id: "zoom-out",     label: "Zoom Out",       hint: "Starts big, shrinks to normal",      cat: "Zoom"       },
  { id: "zoom-up",      label: "Zoom Up",        hint: "Zoom + slide up",                    cat: "Zoom"       },
  { id: "zoom-down",    label: "Zoom Down",      hint: "Zoom + drop from top",               cat: "Zoom"       },
  { id: "implode",      label: "Implode",        hint: "Zooms in from large",                cat: "Zoom"       },
  { id: "explode",      label: "Explode",        hint: "Bursts from tiny",                   cat: "Zoom"       },
  { id: "back-in",      label: "Back In",        hint: "Comes from behind (scale > 1)",      cat: "Zoom"       },
  { id: "ping",         label: "Ping",           hint: "Scale ping with settle",             cat: "Zoom"       },
  // ── New: Slide/Directional ────────────────────────────────────────────────
  { id: "rush",         label: "Rush",           hint: "Hyper-speed slide with blur",        cat: "Directional"},
  { id: "sling",        label: "Sling",          hint: "Slingshot overshoot + snap back",    cat: "Directional"},
  { id: "swoosh",       label: "Swoosh",         hint: "Smooth fast swoosh",                 cat: "Directional"},
  { id: "kick",         label: "Kick",           hint: "Bouncy directional kick",            cat: "Directional"},
  { id: "skew",         label: "Skew",           hint: "Skew-correct slide",                 cat: "Directional"},
  { id: "warp",         label: "Warp",           hint: "Warp distortion slide",              cat: "Directional"},
  { id: "tilt",         label: "Tilt",           hint: "3-D perspective tilt slide",         cat: "Directional"},
  { id: "spin-dir",     label: "Spin Slide",     hint: "Spin while sliding in",              cat: "Directional"},
  { id: "roll-dir",     label: "Roll",           hint: "Roll in with rotation",              cat: "Directional"},
  { id: "bounce-dir",   label: "Bounce Slide",   hint: "Directional bounce settle",          cat: "Directional"},
  // ── New: Bounce/Spring ────────────────────────────────────────────────────
  { id: "bounce-down",  label: "Bounce Down",    hint: "Drops from above, bouncy land",      cat: "Bouncy"     },
  { id: "wobble-in",    label: "Wobble",         hint: "Wobbles to settle",                  cat: "Bouncy"     },
  { id: "jello",        label: "Jello",          hint: "Jello skew oscillation",             cat: "Bouncy"     },
  { id: "elastic",      label: "Elastic",        hint: "Elastic spring overshoot",           cat: "Bouncy"     },
  { id: "scale-bounce", label: "Scale Bounce",   hint: "Scale + bounce settle",              cat: "Bouncy"     },
  { id: "snap",         label: "Snap",           hint: "Sharp instant snap",                 cat: "Bouncy"     },
  { id: "pulse-in",     label: "Pulse In",       hint: "Heartbeat-rhythm entrance",          cat: "Bouncy"     },
  { id: "stamp",        label: "Stamp",          hint: "Stamps down from above",             cat: "Bouncy"     },
  { id: "slam",         label: "Slam",           hint: "Slams down hard then bounces",       cat: "Bouncy"     },
  // ── New: Rotation/3D ─────────────────────────────────────────────────────
  { id: "spin-in",      label: "Spin In",        hint: "Full 360° rotation entrance",        cat: "3D"         },
  { id: "flip-x",       label: "Flip X",         hint: "Horizontal axis flip",               cat: "3D"         },
  { id: "flip-x-bounce",label: "Flip X Bounce",  hint: "Flip on X axis + bounce",            cat: "3D"         },
  { id: "flip-down",    label: "Flip Down",      hint: "Flips open from top",                cat: "3D"         },
  { id: "flip-up",      label: "Flip Up",        hint: "Flips open from bottom",             cat: "3D"         },
  { id: "flip-zoom",    label: "Flip+Zoom",      hint: "Flip + scale combo",                 cat: "3D"         },
  { id: "spin-zoom",    label: "Spin+Zoom",      hint: "Half-spin + scale",                  cat: "3D"         },
  { id: "fold",         label: "Fold",           hint: "Folds open like a book",             cat: "3D"         },
  { id: "tilt-in",      label: "Tilt In",        hint: "3-D tilt correction entrance",       cat: "3D"         },
  { id: "page-in",      label: "Page Turn",      hint: "3-D page-turn from right",           cat: "3D"         },
  { id: "barrel",       label: "Barrel Roll",    hint: "Barrel roll 360° + scale",           cat: "3D"         },
  { id: "spiral",       label: "Spiral",         hint: "2-rotation spiral zoom",             cat: "3D"         },
  { id: "vortex",       label: "Vortex",         hint: "Strong spiral with blur",            cat: "3D"         },
  { id: "roll-in",      label: "Roll In",        hint: "Rotate while sliding in",            cat: "3D"         },
  { id: "pendulum",     label: "Pendulum",       hint: "Swings in from above",               cat: "3D"         },
  { id: "clock",        label: "Clockwise",      hint: "180° clockwise rotation",            cat: "3D"         },
  // ── New: Reveal/Creative ──────────────────────────────────────────────────
  { id: "curtain",      label: "Curtain",        hint: "Pulls open like curtain",            cat: "Reveal"     },
  { id: "wipe-left",    label: "Wipe Left",      hint: "Clip-path wipe from left",           cat: "Reveal"     },
  { id: "wipe-right",   label: "Wipe Right",     hint: "Clip-path wipe from right",          cat: "Reveal"     },
  { id: "tv-on",        label: "TV On",          hint: "CRT power-on effect",                cat: "Reveal"     },
  { id: "compress",     label: "Compress",       hint: "Squish from side to full",           cat: "Reveal"     },
  { id: "expand",       label: "Expand",         hint: "Wide then contracts to normal",      cat: "Reveal"     },
  // ── New: Vertical ────────────────────────────────────────────────────────
  { id: "float",        label: "Float",          hint: "Gentle float up",                    cat: "Vertical"   },
  { id: "levitate",     label: "Levitate",       hint: "Slow graceful rise",                 cat: "Vertical"   },
  { id: "gravity",      label: "Gravity",        hint: "Falls fast from far above",          cat: "Vertical"   },
  { id: "blur-up",      label: "Blur Up",        hint: "Blur clears while rising",           cat: "Vertical"   },
  { id: "blur-down",    label: "Blur Down",      hint: "Blur clears while dropping",         cat: "Vertical"   },
  { id: "drift-up",     label: "Drift Up",       hint: "Diagonal drift from lower-right",    cat: "Vertical"   },
  { id: "drift-down",   label: "Drift Down",     hint: "Diagonal drift from upper-right",    cat: "Vertical"   },
  // ── New: Fun/Theatrical ───────────────────────────────────────────────────
  { id: "tada",         label: "Tada",           hint: "Tada theatrical entrance",           cat: "Fun"        },
  { id: "heartbeat",    label: "Heartbeat",      hint: "Double-pulse heartbeat",             cat: "Fun"        },
  { id: "hinge",        label: "Hinge",          hint: "Pivots on top-left, settles",        cat: "Fun"        },
  { id: "newspaper",    label: "Newspaper",      hint: "Spins in like tossed paper",         cat: "Fun"        },
  { id: "cascade",      label: "Cascade",        hint: "Drop + gentle rotate settle",        cat: "Fun"        },
  { id: "sway",         label: "Sway",           hint: "Side-to-side sway settle",           cat: "Fun"        },
  { id: "rotate-slide", label: "Rotate Slide",   hint: "Rotates while rising",               cat: "Fun"        },
  { id: "blur-rotate",  label: "Blur+Rotate",    hint: "Blur clears as it rotates",          cat: "Fun"        },
  { id: "blur-bounce",  label: "Blur+Bounce",    hint: "Blur + scale bounce",                cat: "Fun"        },
  // ── New: Speed ───────────────────────────────────────────────────────────
  { id: "light-speed",  label: "Light Speed",    hint: "Lightning fast skew blur",           cat: "Speed"      },
];

export type ThemeSettings = {
  bgColor: string;
  buttonColor: string;
  panelColor: string;
  shadowColor: string;
  fontColor: string;
  headingColor: string;
  saturation: number;
  shadowIntensity: number;
  borderRadius: number;
  transitionDuration: number;
  animPixels: number;
  animationStyle: AnimationStyle;
  cardOpacity: number;
  glowIntensity: number;
  panelBlur: number;
  fontScale: number;
  // Font roles
  navFont: string;
  titleFont: string;
  headingFont: string;
  subheadingFont: string;
  panelFont: string;
};

export const DEFAULT_THEME: ThemeSettings = {
  bgColor: "#06070e",
  buttonColor: "#f59e0b",
  panelColor: "#ffffff",
  shadowColor: "#000000",
  fontColor: "#cbd5e1",
  headingColor: "#ffffff",
  saturation: 100,
  shadowIntensity: 40,
  borderRadius: 16,
  transitionDuration: 280,
  animPixels: 36,
  animationStyle: "slide",
  cardOpacity: 4,
  glowIntensity: 60,
  panelBlur: 4,
  fontScale: 100,
  navFont: "Inter",
  titleFont: "Inter",
  headingFont: "Inter",
  subheadingFont: "Inter",
  panelFont: "Inter",
};

const THEME_KEY = "xauusd_dev_theme";
export const DEV_UNLOCK_KEY   = "xauusd_dev_unlocked";
export const DEV_PASSWORD     = "W.D.GANN";
export const ABOUT_UNLOCK_KEY = "xauusd_about_unlocked";
export const ABOUT_PASSWORD   = "ESSA";
export const CHART_UNLOCK_KEY = "xauusd_chart_unlocked";
export const CHART_PASSWORD   = "Tradingview";

// ─── Color math ─────────────────────────────────────────────────────────────
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean.padEnd(6, "0");
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = l * 255; return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [
    hue2rgb(p, q, h + 1 / 3) * 255,
    hue2rgb(p, q, h) * 255,
    hue2rgb(p, q, h - 1 / 3) * 255,
  ];
}

export function adjustSaturation(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const newS = Math.max(0, Math.min(100, s * (percent / 100)));
  const [nr, ng, nb] = hslToRgb(h, newS, l);
  return rgbToHex(nr, ng, nb);
}

export function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const [nr, ng, nb] = hslToRgb(h, s, Math.max(0, Math.min(100, l + amount)));
  return rgbToHex(nr, ng, nb);
}

export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function randomHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 55 + Math.random() * 40;
  const l = 45 + Math.random() * 15;
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// ─── Persistence ────────────────────────────────────────────────────────────
export function loadTheme(): ThemeSettings {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (!raw) return { ...DEFAULT_THEME };
    return { ...DEFAULT_THEME, ...(JSON.parse(raw) as Partial<ThemeSettings>) };
  } catch {
    return { ...DEFAULT_THEME };
  }
}

export function saveTheme(t: ThemeSettings) {
  localStorage.setItem(THEME_KEY, JSON.stringify(t));
}

export function isDevUnlocked(): boolean {
  try { return localStorage.getItem(DEV_UNLOCK_KEY) === "1"; } catch { return false; }
}
export function setDevUnlocked(v: boolean) {
  if (v) localStorage.setItem(DEV_UNLOCK_KEY, "1");
  else localStorage.removeItem(DEV_UNLOCK_KEY);
}

export function isAboutUnlocked(): boolean {
  try { return localStorage.getItem(ABOUT_UNLOCK_KEY) === "1"; } catch { return false; }
}
export function setAboutUnlocked(v: boolean) {
  if (v) localStorage.setItem(ABOUT_UNLOCK_KEY, "1");
  else localStorage.removeItem(ABOUT_UNLOCK_KEY);
}

export function isChartUnlocked(): boolean {
  try { return localStorage.getItem(CHART_UNLOCK_KEY) === "1"; } catch { return false; }
}
export function setChartUnlocked(v: boolean) {
  if (v) localStorage.setItem(CHART_UNLOCK_KEY, "1");
  else localStorage.removeItem(CHART_UNLOCK_KEY);
  // Notify all listeners (BottomNav, App shell, etc.)
  window.dispatchEvent(new CustomEvent("app-chart-unlock", { detail: { unlocked: v } }));
}

/** Applies the theme as CSS custom properties on <html>. */
export function applyTheme(t: ThemeSettings) {
  const root = document.documentElement.style;
  const bg    = adjustSaturation(t.bgColor,     t.saturation);
  const btn   = adjustSaturation(t.buttonColor, t.saturation);
  const btnLight = lighten(btn, 14);
  const panel = adjustSaturation(t.panelColor,  t.saturation);
  const fgRaw = t.fontColor    || DEFAULT_THEME.fontColor;
  const hgRaw = t.headingColor || DEFAULT_THEME.headingColor;

  const shadowOpacity = (t.shadowIntensity / 100) * 0.55;
  const shadowBlur    = 10 + (t.shadowIntensity / 100) * 34;
  const shadowSpread  = (t.shadowIntensity / 100) * 4;
  const shadowRgb     = hexToRgb(t.shadowColor).join(", ");
  const cardOp        = (t.cardOpacity ?? DEFAULT_THEME.cardOpacity) / 100;
  const glowOp        = (t.glowIntensity ?? DEFAULT_THEME.glowIntensity) / 100;
  const blurPx        = (t.panelBlur ?? DEFAULT_THEME.panelBlur);
  const fontPct       = (t.fontScale ?? DEFAULT_THEME.fontScale);

  root.setProperty("--app-bg",             bg);
  root.setProperty("--app-button",         btn);
  root.setProperty("--app-button-light",   btnLight);
  root.setProperty("--app-button-tint-10", hexToRgba(btn, 0.1));
  root.setProperty("--app-button-tint-15", hexToRgba(btn, 0.15));
  root.setProperty("--app-button-tint-25", hexToRgba(btn, 0.25));
  root.setProperty(
    "--app-panel-tint",
    `linear-gradient(to bottom right, ${hexToRgba(panel, cardOp * 1.25)}, ${hexToRgba(panel, cardOp * 0.375)})`,
  );
  root.setProperty("--app-panel-border",   hexToRgba(panel, cardOp * 2.25));
  root.setProperty("--app-radius",         `${t.borderRadius}px`);
  root.setProperty(
    "--app-shadow",
    `0 ${shadowSpread + 6}px ${shadowBlur}px 0 rgba(${shadowRgb}, ${shadowOpacity})`,
  );
  root.setProperty("--app-transition",     `${t.transitionDuration}ms`);
  root.setProperty("--app-anim-distance",  `${t.animPixels}px`);
  root.setProperty("--app-text",           fgRaw);
  root.setProperty("--app-heading",        hgRaw);
  root.setProperty("--app-glow-op",        String(glowOp));
  root.setProperty("--app-panel-blur",     `${blurPx}px`);
  root.setProperty("--app-font-scale",     `${fontPct}%`);
  root.setProperty("--app-font-nav",       `'${t.navFont || "Inter"}', sans-serif`);
  root.setProperty("--app-font-title",     `'${t.titleFont || "Inter"}', sans-serif`);
  root.setProperty("--app-font-heading",   `'${t.headingFont || "Inter"}', sans-serif`);
  root.setProperty("--app-font-subheading",`'${t.subheadingFont || "Inter"}', sans-serif`);
  root.setProperty("--app-font-panel",     `'${t.panelFont || "Inter"}', sans-serif`);
  window.dispatchEvent(new CustomEvent<ThemeSettings>("app-theme-change", { detail: t }));
}

// Directional animation styles — keyframes come in -left / -right pairs.
const DIRECTIONAL_STYLES = new Set<AnimationStyle>([
  // Original 6
  "slide", "flip", "slide-flip", "slide-blur", "slide-zoom", "glide",
  // New directional 10
  "rush", "sling", "roll-dir", "skew", "tilt", "warp", "kick", "swoosh", "spin-dir", "bounce-dir",
]);

export function animClassFor(style: AnimationStyle, dir: "left" | "right"): string {
  if (DIRECTIONAL_STYLES.has(style)) return `anim-${style}-${dir}`;
  return `anim-${style}`;
}
