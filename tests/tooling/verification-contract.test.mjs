import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pkg = JSON.parse(await readFile(new URL("../../package.json", import.meta.url), "utf8"));

test("root package exposes the complete verification contract", () => {
  for (const script of ["typecheck", "lint", "test", "audit:all", "verify"]) {
    assert.equal(typeof pkg.scripts[script], "string", `missing ${script}`);
  }
  assert.equal(pkg.packageManager, "npm@11.6.2");
  assert.deepEqual(pkg.engines, { node: ">=22 <25" });
});
