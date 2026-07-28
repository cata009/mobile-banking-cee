import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import viteConfig from "../../vite.config";

describe("production cache compatibility", () => {
  it("keeps JavaScript and CSS entrypoints stable across deployments", () => {
    const output = viteConfig.build?.rollupOptions?.output;

    expect(Array.isArray(output)).toBe(false);
    if (!output || Array.isArray(output)) {
      throw new Error("Expected one Rollup output configuration.");
    }

    expect(output.entryFileNames).toBe("assets/app.js");
    expect(output.chunkFileNames).toBe("assets/chunks/[name].js");
    expect(output.assetFileNames).toBeTypeOf("function");

    const assetFileNames = output.assetFileNames as (asset: { names: string[] }) => string;
    expect(assetFileNames({ names: ["index.css"] })).toBe("assets/app.css");
    expect(assetFileNames({ names: ["merchant-logo.svg"] })).toBe("assets/[name]-[hash][extname]");
  });

  it("prevents stale corporate HTML from losing the application entrypoint", () => {
    const configPath = resolve(process.cwd(), "vercel.json");

    expect(existsSync(configPath)).toBe(true);
    if (!existsSync(configPath)) {
      return;
    }

    const config = JSON.parse(readFileSync(configPath, "utf8")) as {
      headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
      rewrites?: Array<{ source: string; destination: string }>;
    };

    expect(config.headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/",
          headers: expect.arrayContaining([
            { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
          ]),
        }),
      ]),
    );
    expect(config.rewrites).toEqual(
      expect.arrayContaining([
        { source: "/assets/index-BFn-Zxi0.js", destination: "/assets/app.js" },
        { source: "/assets/index-BnjweOiM.css", destination: "/assets/app.css" },
      ]),
    );
  });
});
