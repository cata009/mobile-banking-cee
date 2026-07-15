import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TRACKED_ASSET_EXTENSIONS = new Set([
  ".avif",
  ".bmp",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".tif",
  ".tiff",
  ".webp",
]);

const CODE_REFERENCE_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".mjs",
  ".scss",
  ".ts",
  ".tsx",
]);

function normalizePath(path) {
  return path.replaceAll("\\", "/");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function isTrackedAssetPath(path) {
  return TRACKED_ASSET_EXTENSIONS.has(extname(path).toLowerCase());
}

function isCodeReferencePath(path) {
  return CODE_REFERENCE_EXTENSIONS.has(extname(path).toLowerCase());
}

function getReferenceTokens(assetPath) {
  const tokens = new Set([assetPath, `/${assetPath}`, basename(assetPath)]);
  if (assetPath.startsWith("src/")) {
    tokens.add(`@/${assetPath.slice("src/".length)}`);
  }
  if (assetPath.startsWith("src/assets/")) {
    tokens.add(`figma:asset/${assetPath.slice("src/assets/".length)}`);
  }
  return [...tokens];
}

export function buildAssetAudit({ trackedFiles, readFile }) {
  if (!Array.isArray(trackedFiles) || typeof readFile !== "function") {
    throw new TypeError("buildAssetAudit requires trackedFiles and a readFile function");
  }

  const normalizedTrackedFiles = trackedFiles.map(normalizePath).sort();
  if (new Set(normalizedTrackedFiles).size !== normalizedTrackedFiles.length) {
    throw new Error("Tracked file inventory contains duplicate paths");
  }

  const buffers = new Map();
  for (const path of normalizedTrackedFiles) {
    const value = readFile(path);
    if (!Buffer.isBuffer(value) && !(value instanceof Uint8Array)) {
      throw new TypeError(`readFile must return bytes for ${path}`);
    }
    buffers.set(path, Buffer.from(value));
  }

  const assets = normalizedTrackedFiles
    .filter(isTrackedAssetPath)
    .map((path) => {
      const bytes = buffers.get(path);
      return { path, bytes: bytes.byteLength, sha256: sha256(bytes) };
    });

  const codeSources = normalizedTrackedFiles
    .filter((path) => !isTrackedAssetPath(path) && isCodeReferencePath(path))
    .map((path) => ({ path, source: buffers.get(path).toString("utf8") }));

  const referencedAssets = [];
  const candidateUnreferencedAssets = [];
  for (const asset of assets) {
    const tokens = getReferenceTokens(asset.path);
    const referencedBy = codeSources
      .filter(({ source }) => tokens.some((token) => source.includes(token)))
      .map(({ path }) => path);
    const reference = { path: asset.path, referencedBy };
    if (referencedBy.length > 0) referencedAssets.push(reference);
    else candidateUnreferencedAssets.push(reference);
  }

  const pathsByBlob = new Map();
  for (const asset of assets) {
    const paths = pathsByBlob.get(asset.sha256) ?? [];
    paths.push(asset.path);
    pathsByBlob.set(asset.sha256, paths);
  }
  const duplicateBlobGroups = [...pathsByBlob.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([blobSha256, paths]) => ({ sha256: blobSha256, paths: paths.sort() }))
    .sort((left, right) => left.sha256.localeCompare(right.sha256));

  const pathBlobManifest = assets.map(({ path, sha256: blobSha256 }) => `${path}\0${blobSha256}\n`).join("");

  return {
    assetCount: assets.length,
    assets,
    duplicateBlobGroups,
    referencedAssets,
    candidateUnreferencedAssets,
    pathBlobSha256Aggregate: sha256(pathBlobManifest),
  };
}

export function auditTrackedAssets(root = process.cwd()) {
  const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
  }).split("\0").filter(Boolean);

  return buildAssetAudit({
    trackedFiles,
    readFile: (path) => readFileSync(resolve(root, path)),
  });
}

export function formatAssetAuditReport(report) {
  return JSON.stringify({
    status: "asset audit ok",
    assetCount: report.assetCount,
    referencedCount: report.referencedAssets.length,
    candidateUnreferencedCount: report.candidateUnreferencedAssets.length,
    exactDuplicateBlobGroups: report.duplicateBlobGroups,
    candidateUnreferencedAssets: report.candidateUnreferencedAssets.map(({ path }) => path),
    pathBlobSha256Aggregate: report.pathBlobSha256Aggregate,
  }, null, 2);
}

export function assertAssetBaseline(report, baseline) {
  if (
    report.assetCount !== baseline.assetCount ||
    report.pathBlobSha256Aggregate !== baseline.pathBlobSha256Aggregate
  ) {
    throw new Error(
      `Asset baseline mismatch: expected ${baseline.assetCount}/${baseline.pathBlobSha256Aggregate}, ` +
      `received ${report.assetCount}/${report.pathBlobSha256Aggregate}`,
    );
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  const report = auditTrackedAssets();
  const baselinePath = resolve(dirname(fileURLToPath(import.meta.url)), "asset-baseline.json");
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  assertAssetBaseline(report, baseline);
  console.log(formatAssetAuditReport(report));
}
