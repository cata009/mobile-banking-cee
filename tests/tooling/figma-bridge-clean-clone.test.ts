import { execFileSync } from "node:child_process";
import { expect, test } from "vitest";

test("figma bridge audit can prefer tracked TypeScript sources", () => {
  const output = execFileSync(
    process.execPath,
    ["scripts/audit-figma-bridge.mjs", "--source-only"],
    { encoding: "utf8" },
  );

  expect(output).toContain("codeMode=source-preferred");
  expect(output).toContain("Component-E Build UI Bridge: codeSource=typescript");
});
