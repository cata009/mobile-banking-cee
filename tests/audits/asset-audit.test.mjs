import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildAssetAudit,
  assertAssetBaseline,
  isTrackedAssetPath,
} from "../../scripts/audit-assets.mjs";

describe("tracked asset audit", () => {
  it("fails closed when a tracked asset path or blob changes from the approved baseline", () => {
    const report = { assetCount: 2, pathBlobSha256Aggregate: "approved" };
    expect(() => assertAssetBaseline(report, { assetCount: 2, pathBlobSha256Aggregate: "approved" }))
      .not.toThrow();
    expect(() => assertAssetBaseline(report, { assetCount: 2, pathBlobSha256Aggregate: "changed" }))
      .toThrow(/baseline mismatch/i);
  });

  it("recognizes supported raster and vector assets without treating source files as assets", () => {
    expect([
      "src/assets/card.PNG",
      "src/assets/photo.jpg",
      "src/assets/photo.jpeg",
      "src/assets/animation.gif",
      "src/assets/photo.webp",
      "src/assets/photo.avif",
      "src/assets/icon.svg",
      "src/assets/icon.ico",
      "src/assets/photo.bmp",
      "src/assets/photo.tif",
      "src/assets/photo.tiff",
    ].every(isTrackedAssetPath)).toBe(true);
    expect(isTrackedAssetPath("src/app/Card.tsx")).toBe(false);
  });

  it("inventories tracked assets, exact duplicate blobs, conservative code references, and the path+blob aggregate", () => {
    const trackedFiles = [
      "src/app/Card.tsx",
      "src/styles/card.css",
      "src/assets/card.png",
      "src/assets/card-copy.png",
      "src/assets/unused.svg",
      "docs/different.png",
    ];
    const files = new Map([
      ["src/app/Card.tsx", Buffer.from('import card from "@/assets/card.png";')],
      ["src/styles/card.css", Buffer.from("/* card-copy.png is selected by the runtime theme */")],
      ["src/assets/card.png", Buffer.from("same pixels")],
      ["src/assets/card-copy.png", Buffer.from("same pixels")],
      ["src/assets/unused.svg", Buffer.from("<svg />")],
      ["docs/different.png", Buffer.from("different pixels")],
    ]);

    const report = buildAssetAudit({
      trackedFiles,
      readFile: (path) => files.get(path),
    });

    const expectedAggregate = createHash("sha256")
      .update(report.assets.map(({ path, sha256 }) => `${path}\0${sha256}\n`).join(""))
      .digest("hex");

    expect(report.assets).toHaveLength(4);
    expect(report.duplicateBlobGroups).toEqual([{
      sha256: createHash("sha256").update("same pixels").digest("hex"),
      paths: ["src/assets/card-copy.png", "src/assets/card.png"],
    }]);
    expect(report.referencedAssets.map(({ path }) => path)).toEqual([
      "src/assets/card-copy.png",
      "src/assets/card.png",
    ]);
    expect(report.candidateUnreferencedAssets.map(({ path }) => path)).toEqual([
      "docs/different.png",
      "src/assets/unused.svg",
    ]);
    expect(report.pathBlobSha256Aggregate).toBe(expectedAggregate);
  });

  it("uses basename matches as conservative evidence and never reads untracked files", () => {
    const reads = [];
    const trackedFiles = ["src/app/theme.ts", "src/assets/nested/hero.svg"];
    const files = new Map([
      ["src/app/theme.ts", Buffer.from('const selectedAsset = "hero.svg";')],
      ["src/assets/nested/hero.svg", Buffer.from("<svg />")],
    ]);

    const report = buildAssetAudit({
      trackedFiles,
      readFile: (path) => {
        reads.push(path);
        return files.get(path);
      },
    });

    expect(report.referencedAssets[0]).toEqual({
      path: "src/assets/nested/hero.svg",
      referencedBy: ["src/app/theme.ts"],
    });
    expect(reads.sort()).toEqual([...trackedFiles].sort());
  });

  it("can hash canonical Git asset bytes instead of platform-specific worktree bytes", () => {
    const trackedFiles = ["src/assets/icon.svg"];
    const report = buildAssetAudit({
      trackedFiles,
      readFile: () => Buffer.from("<svg>\r\n  <path />\r\n</svg>\r\n"),
      readAssetFile: () => Buffer.from("<svg>\n  <path />\n</svg>\n"),
    });
    const canonicalSha = createHash("sha256")
      .update("<svg>\n  <path />\n</svg>\n")
      .digest("hex");

    expect(report.assets[0].sha256).toBe(canonicalSha);
  });
});
