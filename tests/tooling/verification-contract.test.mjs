import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";

const pkg = JSON.parse(await readFile(new URL("../../package.json", import.meta.url), "utf8"));

test("root package exposes the complete verification contract", () => {
  for (const script of ["typecheck", "lint", "test", "audit:all", "verify"]) {
    expect(pkg.scripts[script], `missing ${script}`).toEqual(expect.any(String));
  }
  expect(pkg.packageManager).toBe("npm@11.6.2");
  expect(pkg.engines).toEqual({ node: ">=22 <25" });
});
