import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

test("figma bridge audit runs without ignored Component-E output", () => {
  expect(existsSync(resolve("screenshots/FIgma plugins/Component-E/code.js"))).toBe(false);
  expect(() =>
    execFileSync(process.execPath, ["scripts/audit-figma-bridge.mjs"], {
      stdio: "pipe",
    }),
  ).not.toThrow();
});
