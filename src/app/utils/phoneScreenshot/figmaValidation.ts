/**
 * Preflight validation of a generated Figma payload, and the quality report it produces.
 *
 * Extracted verbatim from phoneScreenshot.ts.
 */

import { TEXT_WIDTH_SAFETY } from "./figmaLayers";
import type {
  FigmaJsonQualityReport,
  FigmaReadyAsset,
  FigmaReadyBounds,
  FigmaReadyLayer,
  FigmaReadyLayerType,
  PhoneFigmaJsonPayload,
} from "./figmaTypes";
export const FIGMA_READY_LAYER_TYPES = new Set<FigmaReadyLayerType>(["container", "shape", "text", "ellipse", "line", "vector", "image"]);

export const FIGMA_JSON_FORBIDDEN_KEYS = new Set(["backgroundColor", "boxShadow", "borderRadius", "className", "computedStyle", "cssText", "dataUrl"]);

export const MAX_FIGMA_JSON_QUALITY_MESSAGES = 24;

export function validateGeneratedFigmaPayload(payload: PhoneFigmaJsonPayload): FigmaJsonQualityReport {
  const report: FigmaJsonQualityReport = {
    errors: [],
    warnings: [],
    stats: {
      layerCount: 0,
      textLayerCount: 0,
      assetCount: payload.assets.length,
      maxDepth: 0,
    },
  };
  const assetIds = collectGeneratedAssetIds(payload.assets, report);
  collectGeneratedForbiddenKeys(payload, "", report);

  validateGeneratedPositiveNumber(payload.frame.width, "frame.width", report);
  validateGeneratedPositiveNumber(payload.frame.height, "frame.height", report);
  if (!payload.frame.background.startsWith("#")) {
    addGeneratedWarning(report, "frame.background should be a hex color.");
  }

  validateGeneratedLayer(payload.root, "root", 0, assetIds, report);
  return finalizeGeneratedQualityReport(report);
}

export function collectGeneratedAssetIds(assets: FigmaReadyAsset[], report: FigmaJsonQualityReport) {
  const assetIds = new Set<string>();
  for (const [index, asset] of assets.entries()) {
    const path = `assets[${index}]`;
    if (!asset.id) {
      addGeneratedError(report, `${path}.id must be a non-empty string.`);
      continue;
    }
    if (assetIds.has(asset.id)) {
      addGeneratedError(report, `Duplicate asset id "${asset.id}".`);
    }
    assetIds.add(asset.id);
    if (!asset.content) {
      addGeneratedWarning(report, `${path} has no content.`);
    }
  }
  return assetIds;
}

export function validateGeneratedLayer(
  layer: FigmaReadyLayer,
  path: string,
  depth: number,
  assetIds: Set<string>,
  report: FigmaJsonQualityReport,
) {
  report.stats.layerCount += 1;
  report.stats.maxDepth = Math.max(report.stats.maxDepth, depth);

  if (!FIGMA_READY_LAYER_TYPES.has(layer.type)) {
    addGeneratedError(report, `${path}.type "${layer.type}" is not supported.`);
  }
  if (!layer.name.trim()) {
    addGeneratedWarning(report, `${path} should have a designer-friendly name.`);
  }

  validateGeneratedBounds(layer.bounds, `${path}.bounds`, report);

  if ((layer.type === "vector" || layer.type === "image") && !layer.assetRef) {
    addGeneratedWarning(report, `${path} is ${layer.type} but has no assetRef.`);
  }
  if (layer.assetRef && !assetIds.has(layer.assetRef)) {
    addGeneratedWarning(report, `${path}.assetRef "${layer.assetRef}" does not exist in assets[].`);
  }

  if (layer.type === "text") {
    validateGeneratedTextLayer(layer, path, report);
  }

  if (layer.layout && !["VERTICAL", "HORIZONTAL"].includes(layer.layout.mode)) {
    addGeneratedWarning(report, `${path}.layout.mode should be VERTICAL or HORIZONTAL.`);
  }

  layer.children?.forEach((child, index) => {
    validateGeneratedLayer(child, `${path}.children[${index}]`, depth + 1, assetIds, report);
  });
}

export function validateGeneratedBounds(bounds: FigmaReadyBounds, path: string, report: FigmaJsonQualityReport) {
  validateGeneratedNumber(bounds.x, `${path}.x`, report);
  validateGeneratedNumber(bounds.y, `${path}.y`, report);
  validateGeneratedPositiveNumber(bounds.width, `${path}.width`, report);
  validateGeneratedPositiveNumber(bounds.height, `${path}.height`, report);
}

export function validateGeneratedNumber(value: number, path: string, report: FigmaJsonQualityReport) {
  if (!Number.isFinite(value)) {
    addGeneratedError(report, `${path} must be a finite number.`);
  }
}

export function validateGeneratedPositiveNumber(value: number, path: string, report: FigmaJsonQualityReport) {
  if (!Number.isFinite(value) || value <= 0) {
    addGeneratedError(report, `${path} must be a positive number.`);
  }
}

export function validateGeneratedTextLayer(layer: FigmaReadyLayer, path: string, report: FigmaJsonQualityReport) {
  report.stats.textLayerCount += 1;
  const text = layer.text;
  if (!text) {
    addGeneratedError(report, `${path}.text is required for text layers.`);
    return;
  }
  if (!text.characters) {
    addGeneratedWarning(report, `${path}.text.characters is empty.`);
  }
  if (!Number.isFinite(text.fontSize) || text.fontSize <= 0) {
    addGeneratedError(report, `${path}.text.fontSize must be a positive number.`);
  }
  const longestLine = text.characters.split(/\r?\n/).reduce((max, line) => Math.max(max, line.length), 0);
  const estimatedWidth = longestLine * text.fontSize * 0.58;
  if (text.allowWrap !== true && longestLine > 0 && layer.bounds.width + TEXT_WIDTH_SAFETY < estimatedWidth * 0.72) {
    addGeneratedWarning(report, `${path} text bounds may be too narrow for "${text.characters.slice(0, 32)}".`);
  }
}

export function collectGeneratedForbiddenKeys(value: unknown, path: string, report: FigmaJsonQualityReport) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectGeneratedForbiddenKeys(item, `${path}[${index}]`, report));
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [key, child] of Object.entries(value)) {
    const nextPath = path ? `${path}.${key}` : key;
    if (FIGMA_JSON_FORBIDDEN_KEYS.has(key)) {
      addGeneratedWarning(report, `${nextPath} is CSS/DOM-style data and should not be present in generated Figma JSON.`);
    }
    collectGeneratedForbiddenKeys(child, nextPath, report);
  }
}

export function addGeneratedError(report: FigmaJsonQualityReport, message: string) {
  addGeneratedMessage(report.errors, message);
}

export function addGeneratedWarning(report: FigmaJsonQualityReport, message: string) {
  addGeneratedMessage(report.warnings, message);
}

export function addGeneratedMessage(list: string[], message: string) {
  if (list.length < MAX_FIGMA_JSON_QUALITY_MESSAGES && !list.includes(message)) {
    list.push(message);
  }
}

export function finalizeGeneratedQualityReport(report: FigmaJsonQualityReport) {
  report.errors = [...new Set(report.errors)];
  report.warnings = [...new Set(report.warnings)];
  if (report.errors.length >= MAX_FIGMA_JSON_QUALITY_MESSAGES) {
    report.errors.push("More generated Figma JSON errors were omitted.");
  }
  if (report.warnings.length >= MAX_FIGMA_JSON_QUALITY_MESSAGES) {
    report.warnings.push("More generated Figma JSON warnings were omitted.");
  }
  return report;
}
