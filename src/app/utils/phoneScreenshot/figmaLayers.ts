/**
 * Turns a captured DOM layer tree into Figma-ready layers: bounds, auto-layout intent, paints, effects, and colour parsing.
 *
 * Extracted verbatim from phoneScreenshot.ts.
 */

import { DEVICE_SHELL_BACKGROUND_HEXES } from "./constants";
import { round } from "./domCapture";
import type { FigmaReadyAsset, FigmaReadyBounds, FigmaReadyEffect, FigmaReadyLayer, FigmaReadyLayerType, FigmaReadyLayout, FigmaReadyPaint, FigmaReadyStyles, FigmaReadyText, PhoneFigmaLayer } from "./figmaTypes";
export const AUTOLAYOUT_TOLERANCE = 2;

export const TEXT_WIDTH_SAFETY = 16;

export const WRAPPED_TEXT_HEIGHT_RATIO = 1.35;

export function toFigmaReadyLayer(
  layer: PhoneFigmaLayer,
  assets: FigmaReadyAsset[],
  frameWidth: number,
): FigmaReadyLayer | null {
  const children = (layer.children ?? [])
    .map((child) => toFigmaReadyLayer(child, assets, frameWidth))
    .filter((child): child is FigmaReadyLayer => Boolean(child));
  const assetRef = registerFigmaReadyAsset(layer, assets);
  const type = inferFigmaReadyLayerType(layer, children, assetRef);

  if ((type === "vector" || type === "image") && !assetRef) {
    return null;
  }

  if (type === "container" && children.length === 0 && !hasVisibleFill(layer.styles.backgroundColor)) {
    return null;
  }

  const layout = type === "container" ? inferFigmaReadyLayout(layer, children) : null;
  const nextChildren = layout
    ? applyAutoLayoutChildIntent(layer, children, layout)
    : children;
  const styles = createFigmaReadyStyles(layer, type);
  const readyLayer: FigmaReadyLayer = {
    type,
    name: getFigmaReadyLayerName(layer, type, layout),
    bounds: createFigmaReadyBounds(layer, type, frameWidth),
    ...(layout ? { layout } : {}),
    ...(assetRef ? { assetRef } : {}),
    ...(styles ? { styles } : {}),
    ...(nextChildren.length > 0 ? { children: nextChildren } : {}),
  };

  if (type === "text") {
    const fontSize = parsePixelNumber(layer.styles.fontSize, 14);
    const lineHeight = parsePixelNumber(layer.styles.lineHeight, Math.round(fontSize * 1.2));

    readyLayer.text = {
      characters: layer.text ?? "",
      fontName: {
        family: "Inter",
        style: getFigmaReadyFontStyle(layer.styles.fontWeight),
      },
      fontSize,
      lineHeight: {
        unit: "PIXELS",
        value: lineHeight,
      },
      letterSpacing: {
        unit: "PIXELS",
        value: parsePixelNumber(layer.styles.letterSpacing, 0),
      },
      textAlignHorizontal: getFigmaReadyTextAlign(layer.styles.textAlign),
      textAlignVertical: "TOP",
      ...(isTextWrapIntended(layer, fontSize, lineHeight) ? { allowWrap: true } : {}),
    };
  }

  return readyLayer;
}

export function createFigmaReadyBounds(layer: PhoneFigmaLayer, type: FigmaReadyLayerType, frameWidth: number): FigmaReadyBounds {
  const bounds = {
    x: layer.x,
    y: layer.y,
    width: layer.width,
    height: layer.height,
  };

  if (type !== "text" || !layer.text) return bounds;

  const fontSize = parsePixelNumber(layer.styles.fontSize, 14);
  const lineHeight = parsePixelNumber(layer.styles.lineHeight, Math.round(fontSize * 1.2));
  const allowWrap = isTextWrapIntended(layer, fontSize, lineHeight);
  const safeWidth = allowWrap
    ? Math.max(layer.width + 8, estimateLongestWordWidth(layer.text, fontSize) + TEXT_WIDTH_SAFETY)
    : Math.max(layer.width + TEXT_WIDTH_SAFETY, estimateTextWidth(layer.text, fontSize, layer.styles.fontWeight) + TEXT_WIDTH_SAFETY);
  const frameRemainingWidth = Math.max(1, frameWidth - layer.x);

  return {
    ...bounds,
    width: round(Math.min(Math.max(bounds.width, safeWidth), Math.max(frameRemainingWidth, bounds.width))),
  };
}

export function isTextWrapIntended(layer: PhoneFigmaLayer, fontSize: number, lineHeight: number) {
  if (!layer.text) return false;
  if (layer.styles.whiteSpace === "nowrap") return false;

  const expectedSingleLineHeight = Math.max(lineHeight, fontSize);
  return layer.height > expectedSingleLineHeight * WRAPPED_TEXT_HEIGHT_RATIO;
}

export function estimateTextWidth(text: string, fontSize: number, fontWeight: string | undefined) {
  const weight = Number(fontWeight);
  const averageCharacterWidth = Number.isFinite(weight) && weight >= 700 ? 0.61 : 0.56;
  return round(text.length * fontSize * averageCharacterWidth);
}

export function estimateLongestWordWidth(text: string, fontSize: number) {
  const longestWord = text
    .split(/\s+/)
    .reduce((longest, word) => (word.length > longest.length ? word : longest), "");

  return round(longestWord.length * fontSize * 0.62);
}

export function createFixedRootLayout(): FigmaReadyLayout {
  return {
    mode: "VERTICAL",
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    gap: 0,
    primaryAxisSizingMode: "FIXED",
    counterAxisSizingMode: "FIXED",
    primaryAxisAlignItems: "MIN",
    counterAxisAlignItems: "MIN",
  };
}

export function inferFigmaReadyLayout(parent: PhoneFigmaLayer, children: FigmaReadyLayer[]): FigmaReadyLayout | null {
  const layoutChildren = children.filter((child) => !isLikelyBackgroundLayer(parent, child));
  if (layoutChildren.length < 2 || layoutChildren.length > 16) return null;

  const vertical = buildLayoutCandidate(parent, layoutChildren, "VERTICAL");
  const horizontal = buildLayoutCandidate(parent, layoutChildren, "HORIZONTAL");
  const candidates = [vertical, horizontal].filter((candidate): candidate is LayoutCandidate => Boolean(candidate));
  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);
  const firstCandidate = candidates[0];
  return firstCandidate?.layout ?? null;
}

export type LayoutCandidate = {
  layout: FigmaReadyLayout;
  score: number;
};

export function buildLayoutCandidate(
  parent: PhoneFigmaLayer,
  children: FigmaReadyLayer[],
  mode: FigmaReadyLayout["mode"],
): LayoutCandidate | null {
  const sorted = [...children].sort((a, b) => (
    mode === "VERTICAL" ? a.bounds.y - b.bounds.y : a.bounds.x - b.bounds.x
  ));

  const hasPrimaryOverlap = sorted.some((child, index) => {
    const next = sorted[index + 1];
    if (!next) return false;

    return mode === "VERTICAL"
      ? child.bounds.y + child.bounds.height > next.bounds.y + AUTOLAYOUT_TOLERANCE
      : child.bounds.x + child.bounds.width > next.bounds.x + AUTOLAYOUT_TOLERANCE;
  });

  if (hasPrimaryOverlap) return null;

  const gaps: number[] = [];
  for (let index = 1; index < sorted.length; index += 1) {
    const child = sorted[index];
    const previous = sorted[index - 1];
    if (!child || !previous) return null;

    gaps.push(mode === "VERTICAL"
      ? child.bounds.y - (previous.bounds.y + previous.bounds.height)
      : child.bounds.x - (previous.bounds.x + previous.bounds.width));
  }
  if (gaps.some((gap) => gap < -AUTOLAYOUT_TOLERANCE)) return null;

  const gap = getConsistentGap(gaps);
  if (gap === null) return null;

  const minX = Math.min(...sorted.map((child) => child.bounds.x));
  const minY = Math.min(...sorted.map((child) => child.bounds.y));
  const maxX = Math.max(...sorted.map((child) => child.bounds.x + child.bounds.width));
  const maxY = Math.max(...sorted.map((child) => child.bounds.y + child.bounds.height));
  const padding = {
    top: Math.max(0, round(minY - parent.y)),
    right: Math.max(0, round(parent.x + parent.width - maxX)),
    bottom: Math.max(0, round(parent.y + parent.height - maxY)),
    left: Math.max(0, round(minX - parent.x)),
  };
  const counterAxisAlignItems = getStableCounterAxisAlignment(parent, sorted, mode);
  if (!counterAxisAlignItems) return null;

  const score = getLayoutCandidateScore(parent, sorted, mode, gap, padding, counterAxisAlignItems);

  return {
    layout: {
      mode,
      padding,
      gap,
      primaryAxisSizingMode: "FIXED",
      counterAxisSizingMode: "FIXED",
      primaryAxisAlignItems: "MIN",
      counterAxisAlignItems,
    },
    score,
  };
}

export function getConsistentGap(gaps: number[]) {
  if (gaps.length === 0) return 0;

  const roundedGaps = gaps.map((gap) => round(gap));
  const minGap = Math.min(...roundedGaps);
  const maxGap = Math.max(...roundedGaps);
  if (maxGap - minGap > AUTOLAYOUT_TOLERANCE) return null;

  return round(roundedGaps.reduce((total, gap) => total + gap, 0) / roundedGaps.length);
}

export function getStableCounterAxisAlignment(
  parent: PhoneFigmaLayer,
  children: FigmaReadyLayer[],
  mode: FigmaReadyLayout["mode"],
): FigmaReadyLayout["counterAxisAlignItems"] | null {
  if (mode === "VERTICAL") {
    const leftOffsets = children.map((child) => child.bounds.x - parent.x);
    const rightOffsets = children.map((child) => parent.x + parent.width - (child.bounds.x + child.bounds.width));
    const centerOffsets = children.map((child) => (
      child.bounds.x + child.bounds.width / 2 - (parent.x + parent.width / 2)
    ));

    if (isConsistentOffset(centerOffsets)) return "CENTER";
    if (isConsistentOffset(rightOffsets) && !isConsistentOffset(leftOffsets)) return "MAX";
    if (isConsistentOffset(leftOffsets)) return "MIN";
    return null;
  }

  const topOffsets = children.map((child) => child.bounds.y - parent.y);
  const bottomOffsets = children.map((child) => parent.y + parent.height - (child.bounds.y + child.bounds.height));
  const centerOffsets = children.map((child) => (
    child.bounds.y + child.bounds.height / 2 - (parent.y + parent.height / 2)
  ));

  if (isConsistentOffset(centerOffsets)) return "CENTER";
  if (isConsistentOffset(bottomOffsets) && !isConsistentOffset(topOffsets)) return "MAX";
  if (isConsistentOffset(topOffsets)) return "MIN";
  return null;
}

export function isConsistentOffset(offsets: number[]) {
  if (offsets.length === 0) return false;
  return Math.max(...offsets) - Math.min(...offsets) <= AUTOLAYOUT_TOLERANCE;
}

export function getLayoutCandidateScore(
  parent: PhoneFigmaLayer,
  children: FigmaReadyLayer[],
  mode: FigmaReadyLayout["mode"],
  gap: number,
  padding: FigmaReadyLayout["padding"],
  counterAxisAlignItems: FigmaReadyLayout["counterAxisAlignItems"],
) {
  const primarySpan = mode === "VERTICAL"
    ? Math.max(...children.map((child) => child.bounds.y + child.bounds.height)) - Math.min(...children.map((child) => child.bounds.y))
    : Math.max(...children.map((child) => child.bounds.x + child.bounds.width)) - Math.min(...children.map((child) => child.bounds.x));
  const parentPrimarySize = mode === "VERTICAL" ? parent.height : parent.width;
  const paddingScore = Math.max(0, 20 - Math.abs(padding.top - padding.bottom)) +
    Math.max(0, 20 - Math.abs(padding.left - padding.right));
  const alignmentScore = counterAxisAlignItems === "MIN" ? 6 : 10;

  return children.length * 10 + alignmentScore + paddingScore + Math.min(20, primarySpan / Math.max(parentPrimarySize, 1) * 20) - Math.abs(gap) * 0.1;
}

export function applyAutoLayoutChildIntent(
  parent: PhoneFigmaLayer,
  children: FigmaReadyLayer[],
  layout: FigmaReadyLayout,
): FigmaReadyLayer[] {
  return children.map((child) => {
    const layoutPositioning = isLikelyBackgroundLayer(parent, child) ? "ABSOLUTE" : "AUTO";
    const layoutGrow = getLayoutGrow(parent, child, layout);

    return {
      ...child,
      autoLayoutChild: layoutPositioning === "ABSOLUTE"
        ? { layoutPositioning }
        : {
          layoutPositioning,
          layoutGrow,
          layoutAlign: "INHERIT",
        },
    };
  });
}

export function getLayoutGrow(parent: PhoneFigmaLayer, child: FigmaReadyLayer, layout: FigmaReadyLayout) {
  if (layout.mode === "HORIZONTAL") {
    const innerWidth = parent.width - layout.padding.left - layout.padding.right;
    return child.bounds.width >= innerWidth * 0.55 ? 1 : 0;
  }

  const innerHeight = parent.height - layout.padding.top - layout.padding.bottom;
  return child.bounds.height >= innerHeight * 0.55 ? 1 : 0;
}

export function isLikelyBackgroundLayer(parent: PhoneFigmaLayer, child: FigmaReadyLayer) {
  const sameX = Math.abs(child.bounds.x - parent.x) <= AUTOLAYOUT_TOLERANCE;
  const sameY = Math.abs(child.bounds.y - parent.y) <= AUTOLAYOUT_TOLERANCE;
  const sameWidth = Math.abs(child.bounds.width - parent.width) <= AUTOLAYOUT_TOLERANCE;
  const sameHeight = Math.abs(child.bounds.height - parent.height) <= AUTOLAYOUT_TOLERANCE;

  return sameX && sameY && sameWidth && sameHeight && (child.type === "shape" || child.type === "image");
}

export function inferFigmaReadyLayerType(
  layer: PhoneFigmaLayer,
  children: FigmaReadyLayer[],
  assetRef: string | undefined,
): FigmaReadyLayerType {
  if (layer.type === "text") return "text";
  if (layer.type === "vector" && assetRef) return "vector";
  if (layer.type === "image" && assetRef) return "image";
  if (children.length > 0) return "container";
  if (isLineLayer(layer)) return "line";
  if (isEllipseLayer(layer)) return "ellipse";
  return "shape";
}

export function isLineLayer(layer: PhoneFigmaLayer) {
  return (
    (layer.width <= 1.5 || layer.height <= 1.5) &&
    (hasVisibleFill(layer.styles.backgroundColor) || parsePixelNumber(layer.styles.borderWidth, 0) > 0)
  );
}

export function isEllipseLayer(layer: PhoneFigmaLayer) {
  const radius = getCornerRadius(layer.styles.borderRadius, layer.width, layer.height);
  return radius >= Math.min(layer.width, layer.height) / 2 - 1;
}

export function createFigmaReadyStyles(layer: PhoneFigmaLayer, type: FigmaReadyLayerType): FigmaReadyStyles | undefined {
  const styles: FigmaReadyStyles = {};
  const opacity = Number(layer.styles.opacity);
  const fills = type === "text"
    ? getFigmaReadyPaints(layer.styles.color)
    : getFigmaReadyPaints(layer.styles.backgroundColor);
  const strokes = getFigmaReadyPaints(layer.styles.borderColor);
  const strokeWeight = parsePixelNumber(layer.styles.borderWidth, 0);
  const cornerRadius = getCornerRadius(layer.styles.borderRadius, layer.width, layer.height);
  const effects = getFigmaReadyEffects(layer.styles.boxShadow);

  if (fills.length > 0 && type !== "vector" && type !== "image") {
    styles.fills = fills;
  }

  if (strokes.length > 0 && strokeWeight > 0) {
    styles.strokes = strokes;
    styles.strokeWeight = strokeWeight;
  }

  if (cornerRadius > 0 && type !== "line") {
    styles.cornerRadius = cornerRadius;
  }

  if (effects.length > 0) {
    styles.effects = effects;
  }

  if (Number.isFinite(opacity) && opacity >= 0 && opacity < 1) {
    styles.opacity = opacity;
  }

  return Object.keys(styles).length > 0 ? styles : undefined;
}

export function registerFigmaReadyAsset(layer: PhoneFigmaLayer, assets: FigmaReadyAsset[]) {
  if (!layer.asset) return undefined;

  const isSvg = layer.asset.mimeType === "image/svg+xml";
  const assetId = `${isSvg ? "svg" : "image"}-${layer.id.replace(/\./g, "-")}`;
  if (assets.some((asset) => asset.id === assetId)) return assetId;

  assets.push({
    id: assetId,
    kind: isSvg ? "svg" : "image",
    mimeType: layer.asset.mimeType,
    encoding: isSvg ? "plain" : "base64",
    content: isSvg ? decodeSvgDataUrl(layer.asset.dataUrl) : getDataUrlBase64(layer.asset.dataUrl),
  });

  return assetId;
}

export function getFigmaReadyLayerName(
  layer: PhoneFigmaLayer,
  type: FigmaReadyLayerType,
  layout: FigmaReadyLayout | null,
) {
  if (type === "text" && layer.text) return layer.text.slice(0, 48);

  const isDomGeneratedName = /^[a-z]+:[a-z0-9-]+$/i.test(layer.name);
  if (layer.name && !isDomGeneratedName) return layer.name.slice(0, 48);

  const textHint = getLayerTextHint(layer);
  if (textHint && type === "container") return `${textHint} Container`.slice(0, 64);
  if (textHint && (type === "shape" || type === "ellipse")) return `${textHint} Shape`.slice(0, 64);
  if (type === "container" && layout?.mode === "VERTICAL") return "Vertical Stack";
  if (type === "container" && layout?.mode === "HORIZONTAL") return "Horizontal Row";
  if (type === "container") return "Group";

  const labelByType: Record<FigmaReadyLayerType, string> = {
    container: "Group",
    shape: "Shape",
    text: "Text",
    ellipse: "Ellipse",
    line: "Line",
    vector: "Vector",
    image: "Image",
  };

  return labelByType[type];
}

export function getLayerTextHint(layer: PhoneFigmaLayer): string {
  if (layer.text) return layer.text;

  const childHints = (layer.children ?? [])
    .map(getLayerTextHint)
    .filter(Boolean);

  return childHints[0] ?? "";
}

export function getFigmaReadyRootBackground(
  element: HTMLElement,
  children: FigmaReadyLayer[],
  frameWidth: number,
  frameHeight: number,
) {
  const layerBackground = findDominantLayerBackground(children, frameWidth, frameHeight);
  if (layerBackground) return layerBackground;

  const frameBackground = getFrameBackground(element);
  if (!DEVICE_SHELL_BACKGROUND_HEXES.has(frameBackground)) return frameBackground;

  return getCssVariableColor(element, "--uc-app-bg") ?? "#F5F5F5";
}

export function findDominantLayerBackground(children: FigmaReadyLayer[], frameWidth: number, frameHeight: number) {
  const candidates: Array<{ color: string; area: number; isShellColor: boolean }> = [];
  const minimumArea = frameWidth * frameHeight * 0.35;

  function visit(layer: FigmaReadyLayer) {
    const fill = layer.styles?.fills?.[0]?.color.hex;
    const area = layer.bounds.width * layer.bounds.height;
    const coversWidth = layer.bounds.x <= AUTOLAYOUT_TOLERANCE &&
      layer.bounds.width >= frameWidth - AUTOLAYOUT_TOLERANCE * 2;

    if (fill && coversWidth && area >= minimumArea) {
      candidates.push({
        color: fill,
        area,
        isShellColor: DEVICE_SHELL_BACKGROUND_HEXES.has(fill),
      });
    }

    for (const child of layer.children ?? []) {
      visit(child);
    }
  }

  for (const child of children) {
    visit(child);
  }

  const nonShellCandidate = candidates
    .filter((candidate) => !candidate.isShellColor)
    .sort((a, b) => b.area - a.area)[0];
  if (nonShellCandidate) return nonShellCandidate.color;

  return candidates.sort((a, b) => b.area - a.area)[0]?.color ?? null;
}

export function getFrameBackground(element: HTMLElement) {
  const inlineColor = element.style.backgroundColor;
  const computedColor = document.body.contains(element)
    ? window.getComputedStyle(element).backgroundColor
    : "";
  const parsedColor = parseCssColor(inlineColor || computedColor);

  return parsedColor?.hex ?? "#F5F5F5";
}

export function getCssVariableColor(element: HTMLElement, variableName: string) {
  const ownerDocument = element.ownerDocument;
  const rootElement = ownerDocument.documentElement;
  const value = window.getComputedStyle(rootElement).getPropertyValue(variableName).trim();
  const parsedColor = parseCssColor(value);

  return parsedColor?.hex ?? null;
}

export function getFigmaReadyPaints(cssColor: string | undefined): FigmaReadyPaint[] {
  const color = parseCssColor(cssColor);
  if (!color || color.a <= 0) return [];

  return [{
    type: "SOLID",
    color: {
      hex: color.hex,
    },
    ...(color.a < 1 ? { opacity: roundFraction(color.a) } : {}),
  }];
}

export function getFigmaReadyEffects(boxShadow: string | undefined): FigmaReadyEffect[] {
  if (!boxShadow || boxShadow === "none") return [];

  return splitCssShadowList(boxShadow)
    .map((shadow) => parseDropShadowEffect(shadow))
    .filter((effect): effect is FigmaReadyEffect => Boolean(effect));
}

export function parseDropShadowEffect(shadow: string): FigmaReadyEffect | null {
  if (!shadow || shadow.includes("inset")) return null;

  const colorMatch = shadow.match(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/);
  const color = parseCssColor(colorMatch?.[0]);
  if (!color || color.a <= 0) return null;

  const numericValues = shadow
    .replace(colorMatch?.[0] ?? "", "")
    .match(/-?\d+(?:\.\d+)?px/g)
    ?.map((value) => parsePixelNumber(value, 0)) ?? [];

  const [offsetX, offsetY, radius = 0, spread = 0] = numericValues;
  if (offsetX === undefined || offsetY === undefined) return null;

  return {
    type: "DROP_SHADOW",
    color: {
      rgba: {
        r: roundFraction(color.r / 255),
        g: roundFraction(color.g / 255),
        b: roundFraction(color.b / 255),
        a: roundFraction(color.a),
      },
    },
    offset: {
      x: offsetX,
      y: offsetY,
    },
    radius,
    spread,
    visible: true,
    blendMode: "NORMAL",
  };
}

export function splitCssShadowList(boxShadow: string) {
  const shadows: string[] = [];
  let depth = 0;
  let current = "";

  for (const character of boxShadow) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;

    if (character === "," && depth === 0) {
      shadows.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  if (current.trim()) shadows.push(current.trim());
  return shadows;
}

export function getCornerRadius(value: string | undefined, width: number, height: number) {
  if (!value || value === "0px") return 0;
  if (value.includes("%")) {
    const percent = Number.parseFloat(value);
    return Number.isFinite(percent) ? round((Math.min(width, height) * percent) / 100) : 0;
  }

  return parsePixelNumber(value.split(" ")[0], 0);
}

export function getFigmaReadyFontStyle(fontWeight: string | undefined): FigmaReadyText["fontName"]["style"] {
  const weight = Number(fontWeight);
  if (!Number.isFinite(weight)) return "Regular";
  if (weight >= 700) return "Bold";
  if (weight >= 600) return "Semi Bold";
  if (weight >= 500) return "Medium";
  return "Regular";
}

export function getFigmaReadyTextAlign(textAlign: string | undefined): FigmaReadyText["textAlignHorizontal"] {
  if (textAlign === "center") return "CENTER";
  if (textAlign === "right" || textAlign === "end") return "RIGHT";
  return "LEFT";
}

export function hasVisibleFill(cssColor: string | undefined) {
  const color = parseCssColor(cssColor);
  return Boolean(color && color.a > 0);
}

export function parseCssColor(value: string | undefined) {
  if (!value || value === "transparent" || value === "rgba(0, 0, 0, 0)") return null;

  const hexMatch = value.match(/^#([0-9a-fA-F]{3,8})$/);
  if (hexMatch) {
    const hexValue = hexMatch[1];
    if (!hexValue) return null;
    const hex = expandHexColor(hexValue);
    if (!hex) return null;

    return {
      r: Number.parseInt(hex.slice(1, 3), 16),
      g: Number.parseInt(hex.slice(3, 5), 16),
      b: Number.parseInt(hex.slice(5, 7), 16),
      a: 1,
      hex,
    };
  }

  const rgbMatch = value.match(/^rgba?\(([^)]+)\)$/);
  if (!rgbMatch) return null;

  const rgbValue = rgbMatch[1];
  if (!rgbValue) return null;
  const parts = rgbValue.includes(",")
    ? rgbValue.split(",").map((part) => part.trim())
    : rgbValue.replace("/", " ").split(/\s+/).filter(Boolean);
  const [red, green, blue, alpha] = parts;
  if (red === undefined || green === undefined || blue === undefined) return null;

  const r = Number.parseFloat(red);
  const g = Number.parseFloat(green);
  const b = Number.parseFloat(blue);
  const a = alpha === undefined ? 1 : Number.parseFloat(alpha);

  if (![r, g, b, a].every(Number.isFinite)) return null;

  return {
    r,
    g,
    b,
    a: Math.max(0, Math.min(1, a)),
    hex: rgbToHex(r, g, b),
  };
}

export function expandHexColor(hexValue: string) {
  if (hexValue.length === 3) {
    return `#${hexValue.split("").map((part) => part + part).join("")}`.toUpperCase();
  }

  if (hexValue.length >= 6) {
    return `#${hexValue.slice(0, 6)}`.toUpperCase();
  }

  return null;
}

export function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((channel) => (
    Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0")
  )).join("")}`.toUpperCase();
}

export function parsePixelNumber(value: string | undefined, fallback: number) {
  if (!value || value === "normal") return fallback;

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? round(parsed) : fallback;
}

export function decodeSvgDataUrl(dataUrl: string) {
  const [metadata, content] = dataUrl.split(",");
  if (!metadata || !content) return "";

  return metadata.includes(";base64") ? window.atob(content) : decodeURIComponent(content);
}

export function getDataUrlBase64(dataUrl: string) {
  const [, content] = dataUrl.split(",");
  return content ?? "";
}

export function roundFraction(value: number) {
  return Math.round(value * 1000) / 1000;
}
