import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, expectTypeOf, it } from "vitest";
import {
  HU_DEFAULT_KIDS_CARD,
  HU_KIDS_CARDS,
  type HuKidsCard,
} from "@/app/screens/kids/hu/cards";
import {
  HU_DEFAULT_THEME,
  HU_THEME_PRESETS,
  getHuTheme,
  getHuThemeStyle,
  type HuThemePreset,
} from "@/app/screens/kids/hu/theme";
import * as compatibility from "@/app/screens/kids/KidsMarketHomeApp";

const kidsAppSource = readFileSync(
  fileURLToPath(new URL("../../src/app/screens/kids/KidsMarketHomeApp.tsx", import.meta.url)),
  "utf8",
);

describe("HU Kids domain module boundaries", () => {
  it("owns the exact seven-theme registry in the dedicated theme module", () => {
    expectTypeOf(HU_THEME_PRESETS).toMatchTypeOf<readonly [HuThemePreset, ...HuThemePreset[]]>();
    expect(HU_THEME_PRESETS.map(({ name, id }) => [name, id])).toEqual([
      ["Standard", "default"],
      ["Nordlys", "nordlys"],
      ["Blue Lines", "blue-lines"],
      ["Blockcraft", "bubbles"],
      ["Aurora", "aurora"],
      ["Garden", "garden"],
      ["Solar", "solar"],
    ]);
    expect(HU_DEFAULT_THEME).toBe(HU_THEME_PRESETS[0]);
    expect(Reflect.apply(getHuTheme, undefined, ["unknown-theme"])).toBe(HU_DEFAULT_THEME);
    expect(Reflect.get(getHuThemeStyle(HU_DEFAULT_THEME), "--hu-theme-page-bg")).toBe("var(--uc-app-bg)");
  });

  it("owns the default card registry in the dedicated card-data module", () => {
    expectTypeOf(HU_KIDS_CARDS).toMatchTypeOf<readonly [HuKidsCard, ...HuKidsCard[]]>();
    expect(HU_DEFAULT_KIDS_CARD).toBe(HU_KIDS_CARDS[0]);
    expect(HU_DEFAULT_KIDS_CARD).toEqual({
      id: "alexandra-standard-main",
      title: "Mastercard Standard",
      lastDigits: "5678",
      holderName: "ALEXANDRA ALBON",
    });
  });

  it("keeps temporary compatibility re-exports without duplicate ownership", () => {
    expect(compatibility.HU_THEME_PRESETS).toBe(HU_THEME_PRESETS);
    expect(compatibility.HU_DEFAULT_THEME).toBe(HU_DEFAULT_THEME);
    expect(compatibility.getHuTheme).toBe(getHuTheme);
    expect(compatibility.HU_KIDS_CARDS).toBe(HU_KIDS_CARDS);
    expect(compatibility.HU_DEFAULT_KIDS_CARD).toBe(HU_DEFAULT_KIDS_CARD);

    expect(kidsAppSource).toContain('from "./hu/theme"');
    expect(kidsAppSource).toContain('from "./hu/cards"');
    expect(kidsAppSource).not.toMatch(/export type HuThemeId\s*=/);
    expect(kidsAppSource).not.toMatch(/export type HuThemePreset\s*=/);
    expect(kidsAppSource).not.toMatch(/export const HU_THEME_PRESETS\s*:/);
    expect(kidsAppSource).not.toMatch(/export type HuKidsCard\s*=/);
    expect(kidsAppSource).not.toMatch(/export const HU_KIDS_CARDS\s*:/);
  });
});
