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

test('the mandatory gate enforces zero warnings and coverage over the complete suite', () => {
  expect(pkg.scripts.lint).toContain('--max-warnings 0');
  expect(pkg.scripts.verify).toContain('npm run test:coverage');
  expect(pkg.scripts['test:coverage']).toBe('vitest run --coverage --maxWorkers=1');
  for (const stage of ['typecheck','lint','format:check','audit:all','build']) expect(pkg.scripts.verify).toContain(`npm run ${stage}`);
});
