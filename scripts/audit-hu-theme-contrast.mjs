// Ad-hoc WCAG contrast audit for HU Kids theme presets (light + dark).
// Replicates the color-mix formulas from KidsMarketHomeApp.tsx getHuThemeStyle.
// Run: node scripts/audit-hu-theme-contrast.mjs

const TOKENS = {
  light: {
    "app-bg": "#F5F5F5",
    surface: "#FFFFFF",
    "surface-muted": "#F5F5F5",
    text: "#262626",
    "text-muted": "#666666",
    "text-inverse": "#FFFFFF",
    "bottom-bar-bg": "#FFFFFF",
    "primary-k1": "#262626",
    "product-blue": "#3F6A8B",
    "product-blue-deep": "#244858",
    "product-pink": "#DD1860",
    "product-mauve": "#A26077",
    "teal-main": "#007A91",
    "teal-blue": "#05829A",
    "teal-bright": "#00A197",
    "teal-soft": "#99D9D5",
    "teal-900": "#006375",
    "red-main": "#E2001A",
    "green-success": "#2FA358",
    "green-deep": "#004C3D",
    "green-olive": "#3D7D43",
    "green-bright": "#008574",
    "orange-main": "#E67300",
    "orange-deep": "#E3690E",
    "orange-status": "#F26B08",
    "yellow-gold": "#FBB800",
    "yellow-brown": "#D1960A",
    "gold-brown": "#7E5B01",
    "status-red": "#CF3524",
    "red-deep": "#9A000B",
    "red-card": "#B91823",
  },
  dark: {
    "app-bg": "#121212",
    surface: "#333333",
    "surface-muted": "#555555",
    text: "#FFFFFF",
    "text-muted": "#CCCCCC",
    "text-inverse": "#262626",
    "bottom-bar-bg": "#333333",
    "primary-k1": "#FFFFFF",
    "product-blue": "#78B6E8",
    "product-blue-deep": "#91D1DD",
    "product-pink": "#FF5F9A",
    "product-mauve": "#D38AA3",
    "teal-main": "#FFFFFF",
    "teal-blue": "#4FC6DD",
    "teal-bright": "#3ED6C8",
    "teal-soft": "#2E7C88",
    "teal-900": "#CCCCCC",
    "red-main": "#E2001A",
    "green-success": "#59D37F",
    "green-deep": "#004C3D",
    "green-olive": "#26EDA9",
    "green-bright": "#008574",
    "orange-main": "#FF9D3B",
    "orange-deep": "#FF9A47",
    "orange-status": "#FDA98B",
    "yellow-gold": "#FFD24D",
    "yellow-brown": "#E8BF52",
    "gold-brown": "#D4B04D",
    "status-red": "#FF7A8E",
    "red-deep": "#D94A5A",
    "red-card": "#F04A58",
  },
};

// theme presets: accent token names + weights + top wash (token, pct over app-bg)
const THEMES = {
  nordlys: { accent: "product-blue-deep", accent3: "yellow-gold", surfaceWeight: 92, navWeight: 90, wash: ["product-blue-deep", 0] },
  "blue-lines": { accent: "product-blue", accent3: "product-blue-deep", surfaceWeight: 87, navWeight: 78, wash: ["product-blue", 100, "primary-k1", 18] },
  bubbles: { accent: "green-olive", accent3: "yellow-brown", surfaceWeight: 88, navWeight: 80, wash: ["green-olive", 30] },
  aurora: { accent: "product-pink", accent3: "red-main", surfaceWeight: 87, navWeight: 78, wash: ["product-pink", 30] },
  garden: { accent: "green-success", accent3: "green-deep", surfaceWeight: 88, navWeight: 80, wash: ["green-success", 28] },
  solar: { accent: "orange-main", accent3: "red-main", surfaceWeight: 88, navWeight: 80, wash: ["orange-main", 30] },
};

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const toHex = (rgb) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
const mix = (a, pa, b) => {
  const A = hex(a), B = hex(b);
  return toHex(A.map((v, i) => (v * pa + B[i] * (100 - pa)) / 100));
};
const lum = (h) => {
  const [r, g, b] = hex(h).map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (f, b) => {
  const [l1, l2] = [lum(f), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
const fmt = (r) => r.toFixed(2);

// Gradient interpolation: wash color at vertical position y, fading to app-bg at endPx.
const washAt = (top, appBg, y, endPx) => {
  const t = Math.min(1, y / endPx);
  return mix(appBg, t * 100, top);
};

// Find max accent share P (5% steps) so mix(accent P%, text) passes all accent-strong checks in BOTH modes.
function solveAccentStrong(themeName, th) {
  for (let P = 100; P >= 30; P -= 5) {
    let allPass = true;
    for (const mode of ["light", "dark"]) {
      const T = TOKENS[mode];
      const accent = T[th.accent];
      const strong = mix(accent, P, T.text);
      const cardBg = mix(T.surface, th.surfaceWeight, accent);
      const progressBg = mix(T["surface-muted"], 78, accent);
      const navBg = mix(T["bottom-bar-bg"], th.navWeight, accent);
      if (
        ratio(strong, cardBg) < 4.5 ||
        ratio(strong, progressBg) < 3.0 ||
        ratio(T["text-inverse"], strong) < 4.5 ||
        ratio(strong, navBg) < 4.5
      ) {
        allPass = false;
        break;
      }
    }
    if (allPass) return P;
  }
  return null;
}

// Find max muted share Q so mix(text-muted Q%, text) >= 4.5 on the wash at welcome (y=162) and sub (y=252) in BOTH modes.
function solveHeroMuted(th) {
  for (let Q = 100; Q >= 0; Q -= 5) {
    let allPass = true;
    for (const mode of ["light", "dark"]) {
      const T = TOKENS[mode];
      const top =
        th.wash.length === 4
          ? mix(T[th.wash[2]], th.wash[3], T[th.wash[0]])
          : mix(T[th.wash[0]], th.wash[1], T["app-bg"]);
      const muted = mix(T["text-muted"], Q, T.text);
      if (
        ratio(muted, washAt(top, T["app-bg"], 162, 385)) < 4.5 ||
        ratio(muted, washAt(top, T["app-bg"], 252, 385)) < 4.5
      ) {
        allPass = false;
        break;
      }
    }
    if (allPass) return Q;
  }
  return null;
}

// ===== Verify the candidate fixes =====
const FIXES = {
  "blue-lines": { strongP: 80, mutedQ: null, washOverride: ["product-blue", 100, "static-black", 26] },
  bubbles: { strongP: 65, mutedQ: 90 },
  aurora: { strongP: 65, mutedQ: 85 },
  garden: { strongP: 60, mutedQ: 95 },
  solar: { strongP: 60, mutedQ: 95 },
};
TOKENS.light["static-black"] = "#262626";
TOKENS.dark["static-black"] = "#262626";

console.log("\n===== FIX VERIFICATION =====");
for (const [name, fix] of Object.entries(FIXES)) {
  const th = THEMES[name];
  for (const mode of ["light", "dark"]) {
    const T = TOKENS[mode];
    const accent = T[th.accent];
    const strong = mix(accent, fix.strongP, T.text);
    const cardBg = mix(T.surface, th.surfaceWeight, accent);
    const progressBg = mix(T["surface-muted"], 78, accent);
    const navBg = mix(T["bottom-bar-bg"], th.navWeight, accent);
    const washSpec = fix.washOverride ?? th.wash;
    const top =
      washSpec.length === 4
        ? mix(T[washSpec[2]], washSpec[3], T[washSpec[0]])
        : mix(T[washSpec[0]], washSpec[1], T["app-bg"]);
    // hero muted: blue-lines uses heroForeground-style strong muted; others mix(text-muted Q, text)
    const candidatesQ = fix.mutedQ === null ? [40, 30, 20, 10, 0] : [fix.mutedQ];
    let mutedResult = "";
    for (const Q of candidatesQ) {
      const muted = mix(T["text-muted"], Q, T.text);
      const r162 = ratio(muted, washAt(top, T["app-bg"], 162, 385));
      const r252 = ratio(muted, washAt(top, T["app-bg"], 252, 385));
      if (r162 >= 4.5 && r252 >= 4.5) {
        mutedResult = `mutedQ=${Q} ok (${fmt(r162)}/${fmt(r252)})`;
        break;
      }
      mutedResult = `mutedQ=${Q} FAIL (${fmt(r162)}/${fmt(r252)})`;
    }
    const out = [
      ["strong/card", ratio(strong, cardBg), 4.5],
      ["strong/track", ratio(strong, progressBg), 3.0],
      ["inverse/strong", ratio(T["text-inverse"], strong), 4.5],
      ["strong/nav", ratio(strong, navBg), 4.5],
      ["balance@200", ratio(T.text, washAt(top, T["app-bg"], 200, 385)), 3.0],
    ]
      .map(([l, r, need]) => `${l}=${fmt(r)}${r >= need ? "" : "(FAIL)"}`)
      .join(" ");
    console.log(`${name} ${mode}: strong=${strong} ${out} ${mutedResult} wash-top=${top}`);
  }
}

console.log("\n===== SOLVER =====");
for (const [name, th] of Object.entries(THEMES)) {
  const P = solveAccentStrong(name, th);
  const Q = solveHeroMuted(th);
  // balance (46px bold, large text -> 3.0) + welcome with default muted at real positions
  const checks = [];
  for (const mode of ["light", "dark"]) {
    const T = TOKENS[mode];
    const top =
      th.wash.length === 4
        ? mix(T[th.wash[2]], th.wash[3], T[th.wash[0]])
        : mix(T[th.wash[0]], th.wash[1], T["app-bg"]);
    checks.push(
      `${mode}: balance@200 ${fmt(ratio(T.text, washAt(top, T["app-bg"], 200, 385)))} (>=3)` +
        ` welcome-defaultmuted@162 ${fmt(ratio(mix(T["text-muted"], 82, T[th.accent3]), washAt(top, T["app-bg"], 162, 385)))}`,
    );
  }
  console.log(`${name}: accentStrong P=${P} heroMuted Q=${Q} | ${checks.join(" | ")}`);
}

for (const mode of ["light", "dark"]) {
  const T = TOKENS[mode];
  console.log(`\n===== ${mode.toUpperCase()} MODE =====`);
  for (const [name, th] of Object.entries(THEMES)) {
    const accent = T[th.accent];
    const accent3 = T[th.accent3];
    const cardBg = mix(T.surface, th.surfaceWeight, accent);
    const progressBg = mix(T["surface-muted"], 78, accent);
    const navBg = mix(T["bottom-bar-bg"], th.navWeight, accent);
    // top wash: blue-lines uses mix(primary-k1 18%, product-blue); others mix(accent N%, app-bg)
    const wash =
      th.wash.length === 4
        ? mix(T[th.wash[2]], th.wash[3], T[th.wash[0]])
        : mix(T[th.wash[0]], th.wash[1], T["app-bg"]);
    const heroMuted = mix(T["text-muted"], 82, accent3);
    const controlBg = mix(T.surface, 78, accent); // hero control circles
    const rows = [
      ["accent text on card (links, 13px bold)  >=4.5", ratio(accent, cardBg)],
      ["accent on progress track (non-text)     >=3.0", ratio(accent, progressBg)],
      ["text-inverse on accent (Add goal chip)  >=4.5", ratio(T["text-inverse"], accent)],
      ["accent on nav bg (active tab)           >=4.5", ratio(accent, navBg)],
      ["hero-muted on top wash (welcome/labels) >=4.5", ratio(heroMuted, wash)],
      ["text on top wash (balance)              >=4.5", ratio(T.text, wash)],
      ["text on card (body)                     >=4.5", ratio(T.text, cardBg)],
      ["control-fg(text) on control circle      >=4.5", ratio(T.text, controlBg)],
    ];
    console.log(`\n--- ${name} (accent ${th.accent}=${accent}, card ${cardBg}, wash ${wash})`);
    for (const [label, r] of rows) {
      const need = parseFloat(label.match(/>=([\d.]+)/)[1]);
      console.log(`${r >= need ? "  ok " : "FAIL "}${fmt(r)}  ${label}`);
    }
  }
}
