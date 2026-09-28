import { describe, expect, it } from "vitest";
import { shouldUseLocalAccess } from "../../src/app/components/security/accessGatePolicy";

describe("access gate policy", () => {
  it("uses local access on loopback hosts even when the runtime is not marked as dev", () => {
    expect(shouldUseLocalAccess({ isDev: false, hostname: "127.0.0.1" })).toBe(true);
    expect(shouldUseLocalAccess({ isDev: false, hostname: "localhost" })).toBe(true);
  });
});
