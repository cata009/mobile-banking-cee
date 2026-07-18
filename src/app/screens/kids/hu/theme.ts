import type { CSSProperties } from "react";

export type HuThemeId = "default" | "nordlys" | "blue-lines" | "bubbles" | "aurora" | "garden" | "solar";

type HuThemeMotionLayerSpec = {
  role: string;
  background: string;
  className?: string;
  blendMode?: CSSProperties["mixBlendMode"];
  opacity?: number;
};

export type HuThemePreset = {
  id: HuThemeId;
  name: string;
  hint: string;
  accent: string;
  accent2: string;
  accent3: string;
  accentStrong?: string;
  pageBackground: string;
  /** Opaque solid that equals the first stop of pageBackground. Used as the
   *  sticky hero header background so it occludes scrolled content while
   *  blending seamlessly into the top of the page gradient. */
  pageTopColor?: string;
  motionBackground: string;
  swatchBackground: string;
  surfaceWeight: number;
  navWeight: number;
  motionLayers?: HuThemeMotionLayerSpec[];
  motionHeight?: number;
  motionMask?: string;
  heroForeground?: string;
  heroMutedForeground?: string;
  heroControlBackground?: string;
  heroControlForeground?: string;
  heroControlBorder?: string;
};

export const HU_DEFAULT_THEME: HuThemePreset = {
  id: "default",
  name: "Standard",
  hint: "no theme",
  accent: "var(--uc-action)",
  accent2: "var(--uc-surface)",
  accent3: "var(--uc-text-muted)",
  pageBackground: "var(--uc-app-bg)",
  motionBackground: "none",
  swatchBackground:
    "linear-gradient(135deg, var(--uc-surface) 0%, var(--uc-app-bg) 58%, var(--uc-border) 100%)",
  surfaceWeight: 100,
  navWeight: 100,
};

export const HU_THEME_PRESETS: readonly [HuThemePreset, ...HuThemePreset[]] = [
  HU_DEFAULT_THEME,
  {
    id: "nordlys",
    name: "Nordlys",
    hint: "polar night",
    accent: "var(--uc-product-blue-deep)",
    accent2: "var(--uc-teal-bright)",
    accent3: "var(--uc-yellow-gold)",
    accentStrong: "color-mix(in srgb, var(--uc-product-blue-deep) 85%, var(--uc-text))",
    pageBackground:
      "linear-gradient(180deg, #03141C 0px, #042430 240px, #0A3A4A 400px, #155666 455px, color-mix(in srgb, var(--uc-app-bg) 52%, var(--uc-teal-blue)) 486px, color-mix(in srgb, var(--uc-app-bg) 78%, var(--uc-teal-soft)) 530px, var(--uc-app-bg) 600px)",
    pageTopColor: "#03141C",
    motionBackground: "none",
    swatchBackground:
      "radial-gradient(55% 38% at 72% 86%, rgba(251, 184, 0, 0.95), rgba(240, 135, 29, 0.5) 45%, transparent 72%), linear-gradient(116deg, transparent 30%, rgba(62, 214, 200, 0.85) 46%, rgba(79, 198, 221, 0.5) 58%, transparent 74%), radial-gradient(140% 110% at 50% -20%, #155666, #0A3A4A 45%, #03141C 100%)",
    surfaceWeight: 92,
    navWeight: 90,
    motionHeight: 560,
    motionMask: "linear-gradient(180deg, var(--uc-static-black) 64%, transparent 100%)",
    heroForeground: "var(--uc-static-white)",
    heroMutedForeground: "rgba(255, 255, 255, 0.68)",
    heroControlBackground: "rgba(255, 255, 255, 0.14)",
    heroControlForeground: "var(--uc-static-white)",
    heroControlBorder: "rgba(255, 255, 255, 0.22)",
    motionLayers: [
      {
        role: "polar-veil",
        background:
          "radial-gradient(150% 110% at 50% -20%, rgba(21, 86, 102, 0.55), rgba(21, 86, 102, 0) 62%)",
        className: "hu-nordlys-veil opacity-[0.7]",
        blendMode: "screen",
      },
      {
        role: "silk-beam-a",
        background:
          "linear-gradient(112deg, transparent 28%, color-mix(in srgb, var(--uc-teal-bright) 52%, transparent) 44%, color-mix(in srgb, var(--uc-teal-blue) 34%, transparent) 56%, transparent 72%)",
        className: "hu-nordlys-silk-a opacity-[0.5] dark:opacity-[0.42]",
        blendMode: "screen",
      },
      {
        role: "silk-beam-b",
        background:
          "linear-gradient(248deg, transparent 34%, color-mix(in srgb, var(--uc-product-blue) 42%, transparent) 49%, color-mix(in srgb, var(--uc-teal-blue) 22%, transparent) 57%, transparent 70%)",
        className: "hu-nordlys-silk-b opacity-[0.38] dark:opacity-[0.32]",
        blendMode: "screen",
      },
      {
        role: "prism-glint",
        background:
          "linear-gradient(116deg, transparent 47.4%, rgba(214, 248, 252, 0.85) 48.4%, rgba(143, 211, 224, 0.45) 49.2%, transparent 50.2%)",
        className: "hu-nordlys-glint",
        blendMode: "screen",
      },
      {
        role: "polar-ember",
        background:
          "radial-gradient(44% 26% at 86% 71%, color-mix(in srgb, var(--uc-static-white) 36%, var(--uc-yellow-gold)), color-mix(in srgb, var(--uc-yellow-gold) 82%, transparent) 16%, color-mix(in srgb, var(--uc-orange-bright) 34%, transparent) 46%, transparent 72%)",
        className: "hu-nordlys-ember",
        blendMode: "screen",
      },
    ],
  },
  {
    id: "blue-lines",
    name: "Blue Lines",
    hint: "kinetic lines",
    accent: "var(--uc-product-blue)",
    accent2: "var(--uc-teal-bright)",
    accent3: "var(--uc-product-blue-deep)",
    accentStrong: "color-mix(in srgb, var(--uc-product-blue) 65%, var(--uc-text))",
    heroMutedForeground: "color-mix(in srgb, var(--uc-text-muted) 10%, var(--uc-text))",
    pageBackground: "linear-gradient(180deg, color-mix(in srgb, var(--uc-static-black) 26%, var(--uc-product-blue)) 0%, var(--uc-app-bg) 390px)",
    pageTopColor: "color-mix(in srgb, var(--uc-static-black) 26%, var(--uc-product-blue))",
    motionBackground:
      "radial-gradient(circle at 74% 18%, color-mix(in srgb, var(--hu-theme-accent-2) 28%, transparent), transparent 30%), repeating-linear-gradient(124deg, transparent 0 13px, color-mix(in srgb, var(--hu-theme-accent) 72%, transparent) 14px 16px, transparent 17px 31px), repeating-linear-gradient(64deg, transparent 0 30px, color-mix(in srgb, var(--hu-theme-accent-3) 46%, transparent) 31px 32px, transparent 33px 58px)",
    swatchBackground:
      "radial-gradient(circle at 68% 28%, var(--uc-teal-bright), transparent 35%), linear-gradient(135deg, var(--uc-primary-k1), var(--uc-product-blue) 54%, var(--uc-teal-main))",
    surfaceWeight: 87,
    navWeight: 78,
    motionLayers: [
      {
        role: "meridian-veil",
        background:
          "radial-gradient(130% 95% at 84% -14%, color-mix(in srgb, var(--uc-teal-blue) 64%, transparent), color-mix(in srgb, var(--uc-product-blue) 36%, transparent) 42%, transparent 62%)",
        className: "hu-motion-breathe-38 opacity-[0.85]",
        blendMode: "screen",
      },
      {
        role: "meridian-blades",
        background:
          "linear-gradient(118deg, transparent 29%, color-mix(in srgb, var(--uc-teal-bright) 78%, transparent) 33%, color-mix(in srgb, var(--uc-teal-bright) 78%, transparent) 34.4%, transparent 38.5%, transparent 46%, color-mix(in srgb, var(--uc-static-white) 72%, transparent) 49.6%, color-mix(in srgb, var(--uc-teal-blue) 62%, transparent) 51.2%, transparent 55.5%, transparent 62%, color-mix(in srgb, var(--uc-teal-bright) 44%, transparent) 64.6%, transparent 67.5%)",
        className: "hu-motion-slide-28 opacity-[0.8] dark:opacity-[0.6]",
        blendMode: "screen",
      },
      {
        role: "meridian-counter-band",
        background:
          "linear-gradient(118deg, transparent 52%, color-mix(in srgb, var(--uc-product-blue-deep) 46%, transparent) 64%, transparent 79%)",
        className: "hu-motion-slide-counter-40 opacity-[0.9]",
        blendMode: "soft-light",
      },
    ],
  },
  {
    id: "bubbles",
    name: "Blockcraft",
    hint: "pixel blocks",
    accent: "var(--uc-green-olive)",
    accent2: "var(--uc-green-deep)",
    accent3: "var(--uc-yellow-brown)",
    accentStrong: "color-mix(in srgb, var(--uc-green-olive) 65%, var(--uc-text))",
    heroMutedForeground: "color-mix(in srgb, var(--uc-text-muted) 90%, var(--uc-text))",
    pageBackground:
      "linear-gradient(180deg, color-mix(in srgb, var(--uc-green-olive) 30%, var(--uc-app-bg)) 0%, color-mix(in srgb, var(--uc-yellow-brown) 10%, var(--uc-app-bg)) 275px, var(--uc-app-bg) 395px)",
    pageTopColor: "color-mix(in srgb, var(--uc-green-olive) 30%, var(--uc-app-bg))",
    motionBackground:
      "linear-gradient(90deg, transparent 0 10%, color-mix(in srgb, var(--hu-theme-accent) 34%, transparent) 10% 21%, transparent 21% 100%), linear-gradient(0deg, transparent 0 18%, color-mix(in srgb, var(--hu-theme-accent-3) 26%, transparent) 18% 30%, transparent 30% 100%), radial-gradient(80% 55% at 72% 0%, color-mix(in srgb, var(--hu-theme-accent-2) 32%, transparent), transparent 70%)",
    swatchBackground:
      "linear-gradient(90deg, color-mix(in srgb, var(--uc-green-olive) 90%, var(--uc-static-white)) 0 22%, var(--uc-green-deep) 22% 44%, var(--uc-yellow-brown) 44% 66%, var(--uc-green-olive) 66% 100%)",
    surfaceWeight: 88,
    navWeight: 80,
    motionLayers: [
      {
        role: "blockcraft-sky-veil",
        background:
          "radial-gradient(120% 80% at 52% -18%, color-mix(in srgb, var(--uc-green-olive) 42%, transparent), transparent 62%), radial-gradient(72% 42% at 82% 4%, color-mix(in srgb, var(--uc-yellow-gold) 30%, transparent), transparent 68%)",
        className: "hu-motion-breathe-38 opacity-[0.82]",
        blendMode: "soft-light",
      },
      {
        role: "blockcraft-grid",
        background:
          "conic-gradient(from 45deg at 22% 24%, color-mix(in srgb, var(--uc-static-white) 24%, transparent) 0 25%, color-mix(in srgb, var(--uc-green-olive) 36%, transparent) 0 50%, color-mix(in srgb, var(--uc-green-deep) 34%, transparent) 0 75%, transparent 0 100%), conic-gradient(from 45deg at 72% 38%, color-mix(in srgb, var(--uc-yellow-gold) 24%, transparent) 0 25%, color-mix(in srgb, var(--uc-yellow-brown) 34%, transparent) 0 50%, color-mix(in srgb, var(--uc-green-deep) 28%, transparent) 0 75%, transparent 0 100%), linear-gradient(180deg, color-mix(in srgb, var(--uc-green-deep) 10%, transparent), transparent 58%)",
        className: "hu-motion-craft-cubes-36 opacity-[0.58] dark:opacity-[0.5]",
        blendMode: "soft-light",
      },
      {
        role: "blockcraft-pixels",
        background:
          "conic-gradient(from 45deg at 18% 20%, color-mix(in srgb, var(--uc-static-white) 22%, transparent) 0 25%, color-mix(in srgb, var(--uc-green-olive) 46%, transparent) 0 50%, color-mix(in srgb, var(--uc-green-deep) 42%, transparent) 0 75%, transparent 0), conic-gradient(from 45deg at 62% 66%, color-mix(in srgb, var(--uc-yellow-gold) 28%, transparent) 0 25%, color-mix(in srgb, var(--uc-yellow-brown) 44%, transparent) 0 50%, color-mix(in srgb, var(--uc-green-deep) 34%, transparent) 0 75%, transparent 0)",
        className: "hu-motion-craft-float-42 opacity-[0.7] dark:opacity-[0.56]",
        blendMode: "screen",
      },
    ],
  },
  {
    id: "aurora",
    name: "Aurora",
    hint: "magenta glow",
    accent: "var(--uc-product-pink)",
    accent2: "var(--uc-product-mauve)",
    accent3: "var(--uc-red-main)",
    accentStrong: "color-mix(in srgb, var(--uc-product-pink) 46%, var(--uc-text))",
    heroMutedForeground: "color-mix(in srgb, var(--uc-text-muted) 85%, var(--uc-text))",
    pageBackground: "linear-gradient(180deg, color-mix(in srgb, var(--uc-product-pink) 30%, var(--uc-app-bg)) 0%, var(--uc-app-bg) 385px)",
    pageTopColor: "color-mix(in srgb, var(--uc-product-pink) 30%, var(--uc-app-bg))",
    motionBackground:
      "radial-gradient(circle at 18% 24%, color-mix(in srgb, var(--hu-theme-accent-3) 38%, transparent), transparent 28%), radial-gradient(circle at 70% 10%, color-mix(in srgb, var(--hu-theme-accent) 48%, transparent), transparent 34%), linear-gradient(130deg, color-mix(in srgb, var(--hu-theme-accent-2) 42%, transparent), transparent 52%), repeating-linear-gradient(38deg, transparent 0 28px, color-mix(in srgb, var(--hu-theme-accent) 26%, transparent) 29px 30px, transparent 31px 54px)",
    swatchBackground:
      "linear-gradient(135deg, var(--uc-product-mauve), var(--uc-product-pink) 52%, var(--uc-red-main))",
    surfaceWeight: 87,
    navWeight: 78,
    motionLayers: [
      {
        role: "aurora-veil",
        background:
          "radial-gradient(120% 90% at 26% -14%, color-mix(in srgb, var(--uc-product-mauve) 48%, transparent), transparent 60%)",
        className: "hu-motion-breathe-38 opacity-[0.75]",
        blendMode: "screen",
      },
      {
        role: "aurora-curtains",
        background:
          "linear-gradient(96deg, transparent 16%, color-mix(in srgb, var(--uc-product-pink) 40%, transparent) 30%, transparent 44%, transparent 56%, color-mix(in srgb, var(--uc-product-mauve) 34%, transparent) 70%, transparent 84%)",
        className: "hu-motion-sway-32 opacity-[0.55] dark:opacity-[0.5]",
        blendMode: "screen",
      },
      {
        role: "aurora-glow-arc",
        background:
          "radial-gradient(56% 38% at 72% 16%, color-mix(in srgb, var(--uc-red-main) 26%, transparent), transparent 62%)",
        className: "hu-motion-drift-46 opacity-[0.8]",
        blendMode: "soft-light",
      },
    ],
  },
  {
    id: "garden",
    name: "Garden",
    hint: "fresh lines",
    accent: "var(--uc-green-success)",
    accent2: "var(--uc-yellow-gold)",
    accent3: "var(--uc-green-deep)",
    accentStrong: "color-mix(in srgb, var(--uc-green-success) 60%, var(--uc-text))",
    heroMutedForeground: "color-mix(in srgb, var(--uc-text-muted) 95%, var(--uc-text))",
    pageBackground: "linear-gradient(180deg, color-mix(in srgb, var(--uc-green-success) 28%, var(--uc-app-bg)) 0%, var(--uc-app-bg) 385px)",
    pageTopColor: "color-mix(in srgb, var(--uc-green-success) 28%, var(--uc-app-bg))",
    motionBackground:
      "radial-gradient(circle at 82% 18%, color-mix(in srgb, var(--hu-theme-accent-2) 34%, transparent), transparent 28%), repeating-linear-gradient(110deg, transparent 0 12px, color-mix(in srgb, var(--hu-theme-accent) 56%, transparent) 13px 14px, transparent 15px 28px), repeating-linear-gradient(150deg, transparent 0 38px, color-mix(in srgb, var(--hu-theme-accent-3) 28%, transparent) 39px 41px, transparent 42px 76px)",
    swatchBackground:
      "linear-gradient(135deg, var(--uc-green-deep), var(--uc-green-success) 58%, var(--uc-yellow-gold))",
    surfaceWeight: 88,
    navWeight: 80,
    motionLayers: [
      {
        role: "canopy-shade",
        background:
          "radial-gradient(64% 42% at 18% -6%, color-mix(in srgb, var(--uc-green-deep) 52%, transparent), transparent 64%), radial-gradient(58% 38% at 86% 4%, color-mix(in srgb, var(--uc-green-success) 44%, transparent), transparent 62%)",
        className: "hu-motion-sway-34 opacity-[0.85]",
        blendMode: "soft-light",
      },
      {
        role: "sun-pockets",
        background:
          "radial-gradient(30% 20% at 72% 22%, color-mix(in srgb, var(--uc-yellow-gold) 58%, transparent), transparent 70%), radial-gradient(20% 14% at 38% 34%, color-mix(in srgb, var(--uc-yellow-gold) 34%, transparent), transparent 70%)",
        className: "hu-motion-breathe-26 opacity-[0.75]",
        blendMode: "screen",
      },
      {
        role: "leaf-dapple",
        background:
          "radial-gradient(16% 11% at 56% 12%, color-mix(in srgb, var(--uc-green-success) 50%, transparent), transparent 70%), radial-gradient(13% 9% at 12% 38%, color-mix(in srgb, var(--uc-teal-bright) 30%, transparent), transparent 70%)",
        className: "hu-motion-drift-34 opacity-[0.6]",
        blendMode: "screen",
      },
    ],
  },
  {
    id: "solar",
    name: "Solar",
    hint: "warm rings",
    accent: "var(--uc-orange-main)",
    accent2: "var(--uc-yellow-gold)",
    accent3: "var(--uc-red-main)",
    accentStrong: "color-mix(in srgb, var(--uc-orange-main) 60%, var(--uc-text))",
    heroMutedForeground: "color-mix(in srgb, var(--uc-text-muted) 95%, var(--uc-text))",
    pageBackground: "linear-gradient(180deg, color-mix(in srgb, var(--uc-orange-main) 30%, var(--uc-app-bg)) 0%, var(--uc-app-bg) 380px)",
    pageTopColor: "color-mix(in srgb, var(--uc-orange-main) 30%, var(--uc-app-bg))",
    motionBackground:
      "radial-gradient(circle at 56% 22%, color-mix(in srgb, var(--hu-theme-accent-2) 38%, transparent), transparent 28%), repeating-radial-gradient(circle at 42% 22%, transparent 0 16px, color-mix(in srgb, var(--hu-theme-accent) 32%, transparent) 17px 18px, transparent 19px 34px), linear-gradient(140deg, color-mix(in srgb, var(--hu-theme-accent-3) 22%, transparent), transparent 55%)",
    swatchBackground:
      "radial-gradient(circle at 70% 28%, var(--uc-yellow-gold), transparent 30%), linear-gradient(135deg, var(--uc-red-main), var(--uc-orange-main) 58%, var(--uc-yellow-gold))",
    surfaceWeight: 88,
    navWeight: 80,
    motionLayers: [
      {
        role: "halo-glow",
        background:
          "radial-gradient(46% 30% at 70% 12%, color-mix(in srgb, var(--uc-yellow-gold) 66%, transparent), color-mix(in srgb, var(--uc-orange-main) 34%, transparent) 46%, transparent 70%)",
        className: "hu-motion-breathe-26 opacity-[0.85]",
        blendMode: "screen",
      },
      {
        role: "halo-rings",
        background:
          "repeating-radial-gradient(circle at 70% 12%, transparent 0 54px, color-mix(in srgb, var(--uc-orange-main) 38%, transparent) 55px 57.5px, transparent 58.5px 118px)",
        className: "hu-motion-breathe-38 opacity-[0.5] dark:opacity-[0.45]",
        blendMode: "screen",
      },
      {
        role: "warm-band",
        background:
          "linear-gradient(150deg, color-mix(in srgb, var(--uc-red-main) 18%, transparent), transparent 55%)",
        className: "hu-motion-drift-46 opacity-[0.8]",
        blendMode: "soft-light",
      },
    ],
  },
];

export function getHuTheme(themeId: HuThemeId) {
  return HU_THEME_PRESETS.find((theme) => theme.id === themeId) ?? HU_DEFAULT_THEME;
}
export function getHuThemeStyle(theme: HuThemePreset): CSSProperties {
  const isStandard = theme.id === "default";

  return {
    "--hu-theme-accent": theme.accent,
    "--hu-theme-accent-2": theme.accent2,
    "--hu-theme-accent-3": theme.accent3,
    "--hu-theme-accent-strong": theme.accentStrong ?? "var(--hu-theme-accent)",
    "--hu-theme-app-bg": isStandard
      ? "var(--uc-app-bg)"
      : "color-mix(in srgb, var(--uc-app-bg) 94%, var(--hu-theme-accent))",
    "--hu-theme-subpage-bg": isStandard
      ? "var(--uc-surface)"
      : "linear-gradient(180deg, color-mix(in srgb, var(--hu-theme-accent) 22%, var(--uc-surface)) 0%, color-mix(in srgb, var(--hu-theme-accent-2) 16%, var(--uc-surface)) 50%, color-mix(in srgb, var(--hu-theme-accent) 12%, var(--uc-bottom-bar-bg)) 100%)",
    // Must EXACTLY match the subpage-bg gradient's top stop (accent 22%) so the
    // opaque sticky header occludes scrolled content while blending seamlessly
    // into the page gradient — no color step / hairline at the header/content seam.
    "--hu-theme-subpage-header-bg": isStandard
      ? "var(--uc-surface)"
      : "color-mix(in srgb, var(--hu-theme-accent) 22%, var(--uc-surface))",
    "--hu-theme-pi-card-bg": isStandard
      ? "var(--uc-surface)"
      : "var(--uc-surface)",
    "--hu-theme-pi-card-shadow": isStandard
      ? "var(--hu-theme-native-card-shadow)"
      : "0 2px 12px color-mix(in srgb, var(--uc-static-black) 12%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--hu-theme-accent) 16%, var(--uc-border))",
    "--hu-theme-native-card-bg":
      "linear-gradient(105deg, var(--uc-surface-muted) 0%, var(--uc-neutral-200) 48%, var(--uc-neutral-300) 100%)",
    "--hu-theme-native-card-shadow":
      "inset 0 0 0 1px color-mix(in srgb, var(--uc-text) 6%, transparent), 0 10px 22px color-mix(in srgb, var(--uc-static-black) 7%, transparent)",
    "--hu-theme-page-bg": theme.pageBackground,
    // Opaque sticky-header backing for hero pages (Home/Earning/Saving): equals
    // the page gradient's first stop so the header occludes scrolled content
    // while blending into the top of the hero atmosphere.
    "--hu-theme-hero-header-bg": isStandard
      ? "var(--uc-app-bg)"
      : theme.pageTopColor ?? "var(--uc-app-bg)",
    "--hu-theme-motion-bg": theme.motionBackground,
    "--hu-theme-swatch-bg": theme.swatchBackground,
    // Surfaces stay CLEAN by default (native surface). The theme lives in the
    // page atmosphere, not as pigment mixed into every card. Home/Analytics
    // scope swaps these to the translucent glass variants via HuThemeShell so
    // the atmosphere only bleeds through on the L1 hero page, never on detail
    // or menu pages (which would otherwise leak the dark/colored top).
    "--hu-theme-card-bg": "var(--uc-surface)",
    "--hu-theme-card-strong-bg": "var(--uc-surface-muted)",
    "--hu-theme-glass-bg": isStandard
      ? "var(--uc-surface)"
      : "color-mix(in srgb, var(--uc-surface) 78%, transparent)",
    "--hu-theme-glass-strong-bg": isStandard
      ? "var(--uc-surface-muted)"
      : "color-mix(in srgb, var(--uc-surface) 68%, transparent)",
    "--hu-theme-control-bg": "var(--uc-surface-muted)",
    "--hu-theme-control-fg": "var(--uc-text)",
    "--hu-theme-progress-bg": "var(--uc-surface-muted)",
    "--hu-learn-card-bg": isStandard
      ? "var(--uc-surface)"
      : "linear-gradient(135deg, color-mix(in srgb, var(--uc-neutral-white) 94%, var(--hu-theme-accent)) 0%, color-mix(in srgb, var(--uc-neutral-white) 90%, var(--hu-theme-accent-2)) 58%, color-mix(in srgb, var(--uc-neutral-white) 86%, var(--hu-theme-accent-3)) 100%)",
    "--hu-learn-card-border": isStandard
      ? "color-mix(in srgb, var(--uc-text) 8%, transparent)"
      : "color-mix(in srgb, var(--uc-text) 11%, transparent)",
    "--hu-learn-card-glow": isStandard
      ? "radial-gradient(circle at 84% 18%, color-mix(in srgb, var(--uc-static-white) 38%, transparent), transparent 35%)"
      : "radial-gradient(circle at 86% 14%, color-mix(in srgb, var(--hu-theme-accent-strong) 12%, transparent), transparent 36%), radial-gradient(circle at 10% 110%, color-mix(in srgb, var(--hu-theme-accent-2) 8%, transparent), transparent 48%)",
    "--hu-learn-card-shadow": isStandard
      ? "0 10px 22px color-mix(in srgb, var(--uc-static-black) 8%, transparent)"
      : "0 14px 30px color-mix(in srgb, var(--uc-static-black) 13%, transparent)",
    "--hu-learn-art-bg": isStandard
      ? "radial-gradient(circle at 28% 22%, color-mix(in srgb, var(--uc-static-white) 42%, transparent), transparent 34%), linear-gradient(135deg, color-mix(in srgb, var(--uc-neutral-white) 72%, var(--uc-neutral-400)), color-mix(in srgb, var(--uc-neutral-white) 52%, var(--uc-neutral-500)))"
      : "radial-gradient(circle at 28% 22%, color-mix(in srgb, var(--uc-static-white) 30%, transparent), transparent 35%), linear-gradient(135deg, color-mix(in srgb, var(--uc-neutral-white) 84%, var(--hu-theme-accent)), color-mix(in srgb, var(--uc-neutral-white) 74%, var(--hu-theme-accent-2)))",
    "--hu-learn-art-soft": isStandard
      ? "color-mix(in srgb, var(--uc-neutral-white) 68%, var(--uc-neutral-400))"
      : "color-mix(in srgb, var(--uc-neutral-white) 78%, var(--hu-theme-accent))",
    "--hu-learn-art-ink": isStandard
      ? "color-mix(in srgb, var(--uc-text) 78%, var(--uc-neutral-400))"
      : "color-mix(in srgb, var(--uc-text) 72%, var(--hu-theme-accent-strong))",
    "--hu-theme-nav-bg": isStandard
      ? "var(--uc-bottom-bar-bg)"
      : "color-mix(in srgb, var(--uc-bottom-bar-bg) 80%, transparent)",
    "--hu-theme-hero-fg": theme.heroForeground ?? "var(--uc-text)",
    "--hu-theme-hero-muted":
      theme.heroMutedForeground ?? "color-mix(in srgb, var(--uc-text-muted) 82%, var(--hu-theme-accent-3))",
    "--hu-theme-hero-control-bg":
      theme.heroControlBackground ??
      (isStandard ? "var(--uc-surface)" : "color-mix(in srgb, var(--uc-surface) 58%, transparent)"),
    "--hu-theme-hero-control-fg": theme.heroControlForeground ?? "var(--uc-text)",
    "--hu-theme-hero-control-border": theme.heroControlBorder ?? "transparent",
    // NOTE: the global UniCredit design tokens (--uc-surface, --uc-action,
    // --uc-brand, --card, --secondary, --border, ...) are intentionally NOT
    // overridden here. The theme is an atmosphere layer + functional accent,
    // not a repaint of the whole design system. Components keep their native
    // identity; theme presence comes only through the page background, the
    // translucent glass cards on Home, and accent-strong on functional bits
    // (progress fill, links, active nav tab, selected states).
  } as CSSProperties;
}
