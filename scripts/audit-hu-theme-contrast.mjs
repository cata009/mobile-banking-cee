// WCAG contrast audit for the active HU Kids theme architecture.
// The runtime model is intentionally Revolut-like: themes provide atmosphere
// and a functional accent, while DS component surfaces stay native.
//
// Run: node scripts/audit-hu-theme-contrast.mjs

const TOKENS = {
  light: {
    appBg: "#F5F5F5",
    surface: "#FFFFFF",
    surfaceMuted: "#F5F5F5",
    neutral200: "#E5E5E5",
    neutral300: "#D8D8D8",
    text: "#262626",
    textMuted: "#666666",
    textInverse: "#FFFFFF",
    bottomBarBg: "#FFFFFF",
    productBlue: "#3F6A8B",
    productBlueDeep: "#244858",
    productPink: "#DD1860",
    productMauve: "#A26077",
    tealBright: "#00A197",
    redMain: "#E2001A",
    greenSuccess: "#2FA358",
    greenDeep: "#004C3D",
    greenOlive: "#3D7D43",
    orangeMain: "#E67300",
    yellowBrown: "#D1960A",
    yellowGold: "#FBB800",
  },
  dark: {
    appBg: "#121212",
    surface: "#333333",
    surfaceMuted: "#555555",
    neutral200: "#333333",
    neutral300: "#555555",
    text: "#FFFFFF",
    textMuted: "#CCCCCC",
    textInverse: "#262626",
    bottomBarBg: "#333333",
    productBlue: "#78B6E8",
    productBlueDeep: "#91D1DD",
    productPink: "#FF5F9A",
    productMauve: "#D38AA3",
    tealBright: "#3ED6C8",
    redMain: "#E2001A",
    greenSuccess: "#59D37F",
    greenDeep: "#004C3D",
    greenOlive: "#26EDA9",
    orangeMain: "#FF9D3B",
    yellowBrown: "#E8BF52",
    yellowGold: "#FFD24D",
  },
};

const THEMES = {
  nordlys: {
    accent: "productBlueDeep",
    accent2: "tealBright",
    accent3: "yellowGold",
    strongP: 85,
  },
  "blue-lines": {
    accent: "productBlue",
    accent2: "tealBright",
    accent3: "productBlueDeep",
    strongP: 65,
  },
  bubbles: {
    accent: "greenOlive",
    accent2: "greenDeep",
    accent3: "yellowBrown",
    strongP: 65,
  },
  aurora: {
    accent: "productPink",
    accent2: "productMauve",
    accent3: "redMain",
    strongP: 46,
  },
  garden: {
    accent: "greenSuccess",
    accent2: "yellowGold",
    accent3: "greenDeep",
    strongP: 60,
  },
  solar: {
    accent: "orangeMain",
    accent2: "yellowGold",
    accent3: "redMain",
    strongP: 60,
  },
};

function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function rgbToHex(rgb) {
  return `#${rgb.map((value) => Math.round(value).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function mix(a, percentA, b) {
  const rgbA = hexToRgb(a);
  const rgbB = hexToRgb(b);
  return rgbToHex(rgbA.map((value, index) => (value * percentA + rgbB[index] * (100 - percentA)) / 100));
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function formatRatio(value) {
  return value.toFixed(2);
}

function check(label, foreground, background, minimum, failures) {
  const ratio = contrast(foreground, background);
  const ok = ratio >= minimum;
  console.log(`${ok ? "ok  " : "FAIL"} ${formatRatio(ratio)}  ${label} (${foreground} on ${background}) >=${minimum}`);

  if (!ok) {
    failures.push({ label, foreground, background, minimum, ratio });
  }
}

const failures = [];

for (const [mode, tokens] of Object.entries(TOKENS)) {
  console.log(`\n===== ${mode.toUpperCase()} MODE =====`);

  for (const [themeName, theme] of Object.entries(THEMES)) {
    const accent = tokens[theme.accent];
    const accent2 = tokens[theme.accent2];
    const strong = mix(accent, theme.strongP, tokens.text);
    const subpageTop = mix(tokens.surface, 97, accent);
    const subpageMid = mix(tokens.surface, 99, accent2);
    const subpageBottom = mix(tokens.bottomBarBg, 96, accent);

    console.log(`\n--- ${themeName} strong=${strong}`);
    check("accent text on native surface", strong, tokens.surface, 4.5, failures);
    check("accent text on native muted surface", strong, tokens.surfaceMuted, 4.5, failures);
    check("active nav on bottom bar", strong, tokens.bottomBarBg, 4.5, failures);
    check("progress fill on muted track", strong, tokens.surfaceMuted, 3, failures);
    check("inverse text/icon on accent control", tokens.textInverse, strong, 4.5, failures);
    check("primary text on subpage top wash", tokens.text, subpageTop, 4.5, failures);
    check("muted text on subpage top wash", tokens.textMuted, subpageTop, 4.5, failures);
    check("primary text on subpage middle wash", tokens.text, subpageMid, 4.5, failures);
    check("primary text near bottom nav wash", tokens.text, subpageBottom, 4.5, failures);
    check("payment hero title on native card left", tokens.text, tokens.surfaceMuted, 4.5, failures);
    check("payment hero title on native card middle", tokens.text, tokens.neutral200, 4.5, failures);
    check("payment hero title on native card right", tokens.text, tokens.neutral300, 4.5, failures);
  }
}

if (failures.length > 0) {
  console.error(`\nHU theme contrast audit failed: ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log("\nHU theme contrast audit passed.");
}
