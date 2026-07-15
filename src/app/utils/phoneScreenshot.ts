export type PhoneScreenshotMode = "visible" | "full";

export type PhoneFigmaLayerType = "group" | "shape" | "text" | "image" | "vector";

export type FigmaReadyLayerType = "container" | "shape" | "text" | "ellipse" | "line" | "vector" | "image";

export type FigmaReadyBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FigmaReadyPaint = {
  type: "SOLID";
  color: {
    hex: string;
  };
  opacity?: number;
};

export type FigmaReadyEffect = {
  type: "DROP_SHADOW";
  color: {
    rgba: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  };
  offset: {
    x: number;
    y: number;
  };
  radius: number;
  spread: number;
  visible: boolean;
  blendMode: "NORMAL";
};

export type FigmaReadyStyles = {
  fills?: FigmaReadyPaint[];
  strokes?: FigmaReadyPaint[];
  strokeWeight?: number;
  cornerRadius?: number;
  effects?: FigmaReadyEffect[];
  opacity?: number;
};

export type FigmaReadyLayout = {
  mode: "VERTICAL" | "HORIZONTAL";
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  gap: number;
  primaryAxisSizingMode: "FIXED" | "AUTO";
  counterAxisSizingMode: "FIXED" | "AUTO";
  primaryAxisAlignItems: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlignItems: "MIN" | "CENTER" | "MAX";
};

export type FigmaReadyAutoLayoutChild = {
  layoutPositioning: "AUTO" | "ABSOLUTE";
  layoutGrow?: number;
  layoutAlign?: "INHERIT";
};

export type FigmaReadyLayer = {
  type: FigmaReadyLayerType;
  name: string;
  bounds: FigmaReadyBounds;
  layout?: FigmaReadyLayout;
  autoLayoutChild?: FigmaReadyAutoLayoutChild;
  assetRef?: string;
  text?: {
    characters: string;
    fontName: {
      family: "Inter";
      style: "Regular" | "Medium" | "Semi Bold" | "Bold";
    };
    fontSize: number;
    lineHeight: {
      unit: "PIXELS";
      value: number;
    };
      letterSpacing: {
        unit: "PIXELS";
        value: number;
      };
      textAlignHorizontal: "LEFT" | "CENTER" | "RIGHT";
      textAlignVertical: "TOP";
      allowWrap?: boolean;
    };
  styles?: FigmaReadyStyles;
  children?: FigmaReadyLayer[];
};

type FigmaReadyText = NonNullable<FigmaReadyLayer["text"]>;

export type FigmaReadyAsset = {
  id: string;
  kind: "svg" | "image";
  mimeType: "image/png" | "image/svg+xml" | "image/jpeg" | "image/webp";
  encoding: "plain" | "base64";
  content: string;
};

export type PhoneFigmaLayerAsset = {
  mimeType: "image/png" | "image/svg+xml" | "image/jpeg" | "image/webp";
  dataUrl: string;
};

export type PhoneFigmaLayer = {
  id: string;
  type: PhoneFigmaLayerType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  asset?: PhoneFigmaLayerAsset;
  styles: Record<string, string>;
  children?: PhoneFigmaLayer[];
};

export type PhoneFigmaJsonPayload = {
  schema: "build-ui.screen.v1";
  frame: {
    width: number;
    height: number;
    background: string;
  };
  root: FigmaReadyLayer & { type: "container"; children: FigmaReadyLayer[] };
  assets: FigmaReadyAsset[];
  warnings?: string[];
  source?: {
    generator: "phone-screenshot";
    mode: PhoneScreenshotMode;
  };
};

type FigmaJsonQualityReport = {
  errors: string[];
  warnings: string[];
  stats: {
    layerCount: number;
    textLayerCount: number;
    assetCount: number;
    maxDepth: number;
  };
};

type DownloadPhoneScreenshotOptions = {
  screenElement: HTMLElement;
  mode: PhoneScreenshotMode;
  filenamePrefix?: string;
};

type CreatePhoneScreenshotBlobOptions = {
  screenElement: HTMLElement;
  mode: PhoneScreenshotMode;
};

type CreatePhoneFigmaJsonOptions = {
  screenElement: HTMLElement;
  mode?: PhoneScreenshotMode;
};

type ElementPair = {
  source: Element;
  clone: Element;
  computedStyle: CSSStyleDeclaration;
};

type ScrollablePair = ElementPair & {
  clientHeight: number;
  extraHeight: number;
  scrollHeight: number;
  scrollTop: number;
};

const SCREEN_WIDTH_FALLBACK = 375;
const SCREEN_HEIGHT_FALLBACK = 812;
const CANVAS_SCALE = 1;
const BOTTOM_NAVIGATION_SELECTOR = "[data-phone-bottom-navigation='true']";
const AUTOLAYOUT_TOLERANCE = 2;
const TEXT_WIDTH_SAFETY = 16;
const WRAPPED_TEXT_HEIGHT_RATIO = 1.35;
const DEVICE_SHELL_BACKGROUND_HEXES = new Set(["#000000", "#1F1F1F", "#262626"]);
const FIGMA_READY_LAYER_TYPES = new Set<FigmaReadyLayerType>(["container", "shape", "text", "ellipse", "line", "vector", "image"]);
const FIGMA_JSON_FORBIDDEN_KEYS = new Set(["backgroundColor", "boxShadow", "borderRadius", "className", "computedStyle", "cssText", "dataUrl"]);
const MAX_FIGMA_JSON_QUALITY_MESSAGES = 24;

export async function downloadPhoneScreenshot({
  screenElement,
  mode,
  filenamePrefix = "unicredit-phone",
}: DownloadPhoneScreenshotOptions) {
  const { blob } = await createPhoneScreenshotBlob({ screenElement, mode });
  downloadBlob(blob, `${filenamePrefix}-${mode}-${createTimestamp()}.png`);
}

export async function createPhoneScreenshotBlob({
  screenElement,
  mode,
}: CreatePhoneScreenshotBlobOptions) {
  const capture = await createPhoneCaptureClone(screenElement, mode);
  const blob = await renderElementToPng(capture.clone, capture.width, capture.height);

  return {
    blob,
    width: capture.width,
    height: capture.height,
  };
}

export async function createPhoneFigmaJson({
  screenElement,
  mode = "visible",
}: CreatePhoneFigmaJsonOptions) {
  const figmaSource = await createPhoneCaptureClone(screenElement, mode);
  const sourceElement = figmaSource.clone;
  const width = figmaSource.width;
  const height = figmaSource.height;
  const layers = await extractFigmaLayersFromCaptureClone(figmaSource.clone);
  const assets: FigmaReadyAsset[] = [];
  const rootChildren = layers
    .map((layer) => toFigmaReadyLayer(layer, assets, width))
    .filter((layer): layer is FigmaReadyLayer => Boolean(layer))
    .map((layer) => ({
      ...layer,
      autoLayoutChild: { layoutPositioning: "ABSOLUTE" as const },
    }));
  const rootBackground = getFigmaReadyRootBackground(sourceElement, rootChildren, width, height);
  const payload: PhoneFigmaJsonPayload = {
    schema: "build-ui.screen.v1",
    frame: {
      width,
      height,
      background: rootBackground,
    },
    root: {
      type: "container",
      name: "Screen",
      bounds: { x: 0, y: 0, width, height },
      layout: createFixedRootLayout(),
      styles: {
        fills: [{ type: "SOLID", color: { hex: rootBackground } }],
        effects: [],
      },
      children: rootChildren,
    },
    assets,
    source: {
      generator: "phone-screenshot",
      mode,
    },
  };
  const quality = validateGeneratedFigmaPayload(payload);
  if (quality.errors.length > 0) {
    throw new Error(`Generated Figma JSON failed validation: ${quality.errors.slice(0, 3).join(" ")}`);
  }
  if (quality.warnings.length > 0) {
    payload.warnings = quality.warnings;
  }

  return JSON.stringify(payload, null, 2);
}

function validateGeneratedFigmaPayload(payload: PhoneFigmaJsonPayload): FigmaJsonQualityReport {
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

function collectGeneratedAssetIds(assets: FigmaReadyAsset[], report: FigmaJsonQualityReport) {
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

function validateGeneratedLayer(
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

function validateGeneratedBounds(bounds: FigmaReadyBounds, path: string, report: FigmaJsonQualityReport) {
  validateGeneratedNumber(bounds.x, `${path}.x`, report);
  validateGeneratedNumber(bounds.y, `${path}.y`, report);
  validateGeneratedPositiveNumber(bounds.width, `${path}.width`, report);
  validateGeneratedPositiveNumber(bounds.height, `${path}.height`, report);
}

function validateGeneratedNumber(value: number, path: string, report: FigmaJsonQualityReport) {
  if (!Number.isFinite(value)) {
    addGeneratedError(report, `${path} must be a finite number.`);
  }
}

function validateGeneratedPositiveNumber(value: number, path: string, report: FigmaJsonQualityReport) {
  if (!Number.isFinite(value) || value <= 0) {
    addGeneratedError(report, `${path} must be a positive number.`);
  }
}

function validateGeneratedTextLayer(layer: FigmaReadyLayer, path: string, report: FigmaJsonQualityReport) {
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

function collectGeneratedForbiddenKeys(value: unknown, path: string, report: FigmaJsonQualityReport) {
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

function addGeneratedError(report: FigmaJsonQualityReport, message: string) {
  addGeneratedMessage(report.errors, message);
}

function addGeneratedWarning(report: FigmaJsonQualityReport, message: string) {
  addGeneratedMessage(report.warnings, message);
}

function addGeneratedMessage(list: string[], message: string) {
  if (list.length < MAX_FIGMA_JSON_QUALITY_MESSAGES && !list.includes(message)) {
    list.push(message);
  }
}

function finalizeGeneratedQualityReport(report: FigmaJsonQualityReport) {
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

async function createPhoneCaptureClone(screenElement: HTMLElement, mode: PhoneScreenshotMode) {
  const clone = screenElement.cloneNode(true) as HTMLElement;
  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

  const sourceElements = [screenElement, ...Array.from(screenElement.querySelectorAll("*"))];
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll("*"))];
  const pairs = sourceElements
    .map((source, index): ElementPair | null => {
      const cloneElement = cloneElements[index];
      if (!cloneElement) return null;
      return {
        source,
        clone: cloneElement,
        computedStyle: window.getComputedStyle(source),
      };
    })
    .filter((pair): pair is ElementPair => Boolean(pair));

  const scrollablePairs = pairs
    .map(toScrollablePair)
    .filter((pair): pair is ScrollablePair => Boolean(pair))
    .sort((a, b) => b.extraHeight - a.extraHeight);

  await inlineComputedStyles(pairs);
  copyFormState(pairs);

  const width = screenElement.clientWidth || SCREEN_WIDTH_FALLBACK;
  const visibleHeight = screenElement.clientHeight || SCREEN_HEIGHT_FALLBACK;
  const fullExtraHeight = scrollablePairs[0]?.extraHeight ?? 0;
  const height = mode === "full" ? Math.max(visibleHeight, visibleHeight + fullExtraHeight) : visibleHeight;

  prepareRootClone(clone, width, height);

  if (mode === "full") {
    expandScrollableContent(scrollablePairs, pairs, screenElement, clone, height);
  } else {
    preserveVisibleScrollOffsets(scrollablePairs);
  }

  await inlineImageSources(pairs);
  await inlineBackgroundImages(pairs);

  return { clone, width, height };
}

async function extractFigmaLayers(screenElement: HTMLElement, mode: PhoneScreenshotMode) {
  const rootRect = screenElement.getBoundingClientRect();
  const scrollableElement = findPrimaryScrollableElement(screenElement);
  const children = mode === "visible"
    ? Array.from(screenElement.children)
    : Array.from((scrollableElement ?? screenElement).children);

  const layers = await Promise.all(
    children.map((child, index) => createFigmaLayer(child, rootRect, `${index + 1}`)),
  );

  return layers.filter((layer): layer is PhoneFigmaLayer => Boolean(layer));
}

async function extractFigmaLayersFromCaptureClone(clone: HTMLElement) {
  const mount = document.createElement("div");
  mount.style.position = "fixed";
  mount.style.left = "-10000px";
  mount.style.top = "0";
  mount.style.width = clone.style.width || `${SCREEN_WIDTH_FALLBACK}px`;
  mount.style.pointerEvents = "none";
  mount.style.zIndex = "-1";
  document.body.appendChild(mount);
  mount.appendChild(clone);

  try {
    await waitForLayoutFrame();
    return await extractFigmaLayers(clone, "visible");
  } finally {
    mount.remove();
  }
}

function toFigmaReadyLayer(
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

function createFigmaReadyBounds(layer: PhoneFigmaLayer, type: FigmaReadyLayerType, frameWidth: number): FigmaReadyBounds {
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

function isTextWrapIntended(layer: PhoneFigmaLayer, fontSize: number, lineHeight: number) {
  if (!layer.text) return false;
  if (layer.styles.whiteSpace === "nowrap") return false;

  const expectedSingleLineHeight = Math.max(lineHeight, fontSize);
  return layer.height > expectedSingleLineHeight * WRAPPED_TEXT_HEIGHT_RATIO;
}

function estimateTextWidth(text: string, fontSize: number, fontWeight: string | undefined) {
  const weight = Number(fontWeight);
  const averageCharacterWidth = Number.isFinite(weight) && weight >= 700 ? 0.61 : 0.56;
  return round(text.length * fontSize * averageCharacterWidth);
}

function estimateLongestWordWidth(text: string, fontSize: number) {
  const longestWord = text
    .split(/\s+/)
    .reduce((longest, word) => (word.length > longest.length ? word : longest), "");

  return round(longestWord.length * fontSize * 0.62);
}

function createFixedRootLayout(): FigmaReadyLayout {
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

function inferFigmaReadyLayout(parent: PhoneFigmaLayer, children: FigmaReadyLayer[]): FigmaReadyLayout | null {
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

type LayoutCandidate = {
  layout: FigmaReadyLayout;
  score: number;
};

function buildLayoutCandidate(
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

function getConsistentGap(gaps: number[]) {
  if (gaps.length === 0) return 0;

  const roundedGaps = gaps.map((gap) => round(gap));
  const minGap = Math.min(...roundedGaps);
  const maxGap = Math.max(...roundedGaps);
  if (maxGap - minGap > AUTOLAYOUT_TOLERANCE) return null;

  return round(roundedGaps.reduce((total, gap) => total + gap, 0) / roundedGaps.length);
}

function getStableCounterAxisAlignment(
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

function isConsistentOffset(offsets: number[]) {
  if (offsets.length === 0) return false;
  return Math.max(...offsets) - Math.min(...offsets) <= AUTOLAYOUT_TOLERANCE;
}

function getLayoutCandidateScore(
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

function applyAutoLayoutChildIntent(
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

function getLayoutGrow(parent: PhoneFigmaLayer, child: FigmaReadyLayer, layout: FigmaReadyLayout) {
  if (layout.mode === "HORIZONTAL") {
    const innerWidth = parent.width - layout.padding.left - layout.padding.right;
    return child.bounds.width >= innerWidth * 0.55 ? 1 : 0;
  }

  const innerHeight = parent.height - layout.padding.top - layout.padding.bottom;
  return child.bounds.height >= innerHeight * 0.55 ? 1 : 0;
}

function isLikelyBackgroundLayer(parent: PhoneFigmaLayer, child: FigmaReadyLayer) {
  const sameX = Math.abs(child.bounds.x - parent.x) <= AUTOLAYOUT_TOLERANCE;
  const sameY = Math.abs(child.bounds.y - parent.y) <= AUTOLAYOUT_TOLERANCE;
  const sameWidth = Math.abs(child.bounds.width - parent.width) <= AUTOLAYOUT_TOLERANCE;
  const sameHeight = Math.abs(child.bounds.height - parent.height) <= AUTOLAYOUT_TOLERANCE;

  return sameX && sameY && sameWidth && sameHeight && (child.type === "shape" || child.type === "image");
}

function inferFigmaReadyLayerType(
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

function isLineLayer(layer: PhoneFigmaLayer) {
  return (
    (layer.width <= 1.5 || layer.height <= 1.5) &&
    (hasVisibleFill(layer.styles.backgroundColor) || parsePixelNumber(layer.styles.borderWidth, 0) > 0)
  );
}

function isEllipseLayer(layer: PhoneFigmaLayer) {
  const radius = getCornerRadius(layer.styles.borderRadius, layer.width, layer.height);
  return radius >= Math.min(layer.width, layer.height) / 2 - 1;
}

function createFigmaReadyStyles(layer: PhoneFigmaLayer, type: FigmaReadyLayerType): FigmaReadyStyles | undefined {
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

function registerFigmaReadyAsset(layer: PhoneFigmaLayer, assets: FigmaReadyAsset[]) {
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

function getFigmaReadyLayerName(
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

function getLayerTextHint(layer: PhoneFigmaLayer): string {
  if (layer.text) return layer.text;

  const childHints = (layer.children ?? [])
    .map(getLayerTextHint)
    .filter(Boolean);

  return childHints[0] ?? "";
}

function getFigmaReadyRootBackground(
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

function findDominantLayerBackground(children: FigmaReadyLayer[], frameWidth: number, frameHeight: number) {
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

function getFrameBackground(element: HTMLElement) {
  const inlineColor = element.style.backgroundColor;
  const computedColor = document.body.contains(element)
    ? window.getComputedStyle(element).backgroundColor
    : "";
  const parsedColor = parseCssColor(inlineColor || computedColor);

  return parsedColor?.hex ?? "#F5F5F5";
}

function getCssVariableColor(element: HTMLElement, variableName: string) {
  const ownerDocument = element.ownerDocument;
  const rootElement = ownerDocument.documentElement;
  const value = window.getComputedStyle(rootElement).getPropertyValue(variableName).trim();
  const parsedColor = parseCssColor(value);

  return parsedColor?.hex ?? null;
}

function getFigmaReadyPaints(cssColor: string | undefined): FigmaReadyPaint[] {
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

function getFigmaReadyEffects(boxShadow: string | undefined): FigmaReadyEffect[] {
  if (!boxShadow || boxShadow === "none") return [];

  return splitCssShadowList(boxShadow)
    .map((shadow) => parseDropShadowEffect(shadow))
    .filter((effect): effect is FigmaReadyEffect => Boolean(effect));
}

function parseDropShadowEffect(shadow: string): FigmaReadyEffect | null {
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

function splitCssShadowList(boxShadow: string) {
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

function getCornerRadius(value: string | undefined, width: number, height: number) {
  if (!value || value === "0px") return 0;
  if (value.includes("%")) {
    const percent = Number.parseFloat(value);
    return Number.isFinite(percent) ? round((Math.min(width, height) * percent) / 100) : 0;
  }

  return parsePixelNumber(value.split(" ")[0], 0);
}

function getFigmaReadyFontStyle(fontWeight: string | undefined): FigmaReadyText["fontName"]["style"] {
  const weight = Number(fontWeight);
  if (!Number.isFinite(weight)) return "Regular";
  if (weight >= 700) return "Bold";
  if (weight >= 600) return "Semi Bold";
  if (weight >= 500) return "Medium";
  return "Regular";
}

function getFigmaReadyTextAlign(textAlign: string | undefined): FigmaReadyText["textAlignHorizontal"] {
  if (textAlign === "center") return "CENTER";
  if (textAlign === "right" || textAlign === "end") return "RIGHT";
  return "LEFT";
}

function hasVisibleFill(cssColor: string | undefined) {
  const color = parseCssColor(cssColor);
  return Boolean(color && color.a > 0);
}

function parseCssColor(value: string | undefined) {
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

function expandHexColor(hexValue: string) {
  if (hexValue.length === 3) {
    return `#${hexValue.split("").map((part) => part + part).join("")}`.toUpperCase();
  }

  if (hexValue.length >= 6) {
    return `#${hexValue.slice(0, 6)}`.toUpperCase();
  }

  return null;
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((channel) => (
    Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0")
  )).join("")}`.toUpperCase();
}

function parsePixelNumber(value: string | undefined, fallback: number) {
  if (!value || value === "normal") return fallback;

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? round(parsed) : fallback;
}

function decodeSvgDataUrl(dataUrl: string) {
  const [metadata, content] = dataUrl.split(",");
  if (!metadata || !content) return "";

  return metadata.includes(";base64") ? window.atob(content) : decodeURIComponent(content);
}

function getDataUrlBase64(dataUrl: string) {
  const [, content] = dataUrl.split(",");
  return content ?? "";
}

function roundFraction(value: number) {
  return Math.round(value * 1000) / 1000;
}

function waitForLayoutFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
  });
}

function findPrimaryScrollableElement(screenElement: HTMLElement) {
  const candidates = [screenElement, ...Array.from(screenElement.querySelectorAll("*"))]
    .filter((element): element is HTMLElement => element instanceof HTMLElement)
    .map((element) => ({
      element,
      extraHeight: element.scrollHeight - element.clientHeight,
      computedStyle: window.getComputedStyle(element),
    }))
    .filter(({ extraHeight, computedStyle }) => {
      const canScroll =
        computedStyle.overflowY === "auto" ||
        computedStyle.overflowY === "scroll" ||
        computedStyle.overflowY === "overlay";

      return canScroll && extraHeight > 1;
    })
    .sort((a, b) => b.extraHeight - a.extraHeight);

  return candidates[0]?.element ?? null;
}

async function createFigmaLayer(
  element: Element,
  rootRect: DOMRect,
  id: string,
): Promise<PhoneFigmaLayer | null> {
  if (!(element instanceof HTMLElement || element instanceof SVGElement)) return null;

  const computedStyle = window.getComputedStyle(element);
  if (
    computedStyle.display === "none" ||
    computedStyle.visibility === "hidden" ||
    Number(computedStyle.opacity) === 0
  ) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0.5 || rect.height <= 0.5) return null;
  if (isRectOutsideFrame(rect, rootRect)) return null;

  const children = await Promise.all(
    Array.from(element.children).map((child, index) => (
      createFigmaLayer(child, rootRect, `${id}.${index + 1}`)
    )),
  );
  const visibleChildren = children.filter((layer): layer is PhoneFigmaLayer => Boolean(layer));
  const text = getDirectElementText(element);
  const type = inferFigmaLayerType(element, computedStyle, text, visibleChildren);
  const asset = await getLayerAsset(element, computedStyle);

  if (type === "group" && visibleChildren.length === 0) return null;

  return {
    id,
    type,
    name: getLayerName(element, type, text),
    x: round(rect.left - rootRect.left),
    y: round(rect.top - rootRect.top),
    width: round(rect.width),
    height: round(rect.height),
    ...(text ? { text } : {}),
    ...(asset ? { asset } : {}),
    styles: pickSerializableStyles(computedStyle),
    ...(visibleChildren.length > 0 ? { children: visibleChildren } : {}),
  };
}

function isRectOutsideFrame(rect: DOMRect, frameRect: DOMRect) {
  return (
    rect.right < frameRect.left ||
    rect.left > frameRect.right ||
    rect.bottom < frameRect.top ||
    rect.top > frameRect.bottom
  );
}

function inferFigmaLayerType(
  element: Element,
  computedStyle: CSSStyleDeclaration,
  text: string,
  children: PhoneFigmaLayer[],
): PhoneFigmaLayerType {
  const tagName = element.tagName.toLowerCase();

  if (element instanceof HTMLImageElement) return "image";
  if (element instanceof SVGElement || tagName === "svg") return "vector";
  if (text && children.length === 0) return "text";
  if (
    computedStyle.backgroundColor !== "rgba(0, 0, 0, 0)" ||
    computedStyle.backgroundImage !== "none" ||
    computedStyle.borderTopWidth !== "0px" ||
    computedStyle.boxShadow !== "none"
  ) {
    return "shape";
  }

  return "group";
}

function getDirectElementText(element: Element) {
  const text = Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (text) return text;
  if (element.children.length > 0) return "";

  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
}

function getLayerName(element: Element, type: PhoneFigmaLayerType, text: string) {
  const explicitName =
    element.getAttribute("data-ds-label") ||
    element.getAttribute("data-name") ||
    element.getAttribute("aria-label");

  if (explicitName) return explicitName;
  if (text) return text.slice(0, 48);

  return `${type}:${element.tagName.toLowerCase()}`;
}

async function getLayerAsset(element: Element, computedStyle: CSSStyleDeclaration) {
  if (element instanceof HTMLImageElement) {
    const sourceUrl = element.currentSrc || element.src;
    const dataUrl = await resourceToDataUrl(sourceUrl);
    return dataUrl ? { mimeType: getImageMimeType(dataUrl), dataUrl } : undefined;
  }

  if (element instanceof SVGElement && element.tagName.toLowerCase() === "svg") {
    const serializedSvg = new XMLSerializer().serializeToString(element);
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializedSvg)}`;
    return { mimeType: "image/svg+xml" as const, dataUrl };
  }

  const backgroundImage = computedStyle.backgroundImage;
  if (!backgroundImage || backgroundImage === "none") return undefined;

  const urlMatch = backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
  if (!urlMatch) return undefined;

  const backgroundUrl = urlMatch[1];
  if (!backgroundUrl) return undefined;
  const dataUrl = await resourceToDataUrl(backgroundUrl);
  return dataUrl ? { mimeType: getImageMimeType(dataUrl), dataUrl } : undefined;
}

function getImageMimeType(dataUrl: string): PhoneFigmaLayerAsset["mimeType"] {
  if (dataUrl.startsWith("data:image/jpeg")) return "image/jpeg";
  if (dataUrl.startsWith("data:image/webp")) return "image/webp";
  if (dataUrl.startsWith("data:image/svg+xml")) return "image/svg+xml";
  return "image/png";
}

function pickSerializableStyles(computedStyle: CSSStyleDeclaration) {
  return {
    display: computedStyle.display,
    position: computedStyle.position,
    backgroundColor: computedStyle.backgroundColor,
    backgroundImage: computedStyle.backgroundImage,
    color: computedStyle.color,
    opacity: computedStyle.opacity,
    fontFamily: computedStyle.fontFamily,
    fontSize: computedStyle.fontSize,
    fontWeight: computedStyle.fontWeight,
    lineHeight: computedStyle.lineHeight,
    letterSpacing: computedStyle.letterSpacing,
    textAlign: computedStyle.textAlign,
    whiteSpace: computedStyle.whiteSpace,
    borderRadius: computedStyle.borderRadius,
    borderColor: computedStyle.borderTopColor,
    borderWidth: computedStyle.borderTopWidth,
    boxShadow: computedStyle.boxShadow,
    overflow: computedStyle.overflow,
    transform: computedStyle.transform,
  };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function toScrollablePair(pair: ElementPair): ScrollablePair | null {
  if (!(pair.source instanceof HTMLElement)) return null;

  const overflowY = pair.computedStyle.overflowY;
  const canScroll = overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
  const extraHeight = pair.source.scrollHeight - pair.source.clientHeight;

  if (!canScroll || extraHeight <= 1) return null;

  return {
    ...pair,
    clientHeight: pair.source.clientHeight,
    extraHeight,
    scrollHeight: pair.source.scrollHeight,
    scrollTop: pair.source.scrollTop,
  };
}

async function inlineComputedStyles(pairs: ElementPair[]) {
  for (const { source, clone, computedStyle } of pairs) {
    if (!(clone instanceof HTMLElement || clone instanceof SVGElement)) continue;

    let cssText = "";
    for (let index = 0; index < computedStyle.length; index += 1) {
      const propertyName = computedStyle.item(index);
      if (!propertyName) continue;
      const propertyValue = computedStyle.getPropertyValue(propertyName);
      const propertyPriority = computedStyle.getPropertyPriority(propertyName);
      cssText += `${propertyName}:${propertyValue}${propertyPriority ? ` !${propertyPriority}` : ""};`;
    }

    const existingStyle = clone.getAttribute("style");
    clone.setAttribute("style", existingStyle ? `${existingStyle};${cssText}` : cssText);

    if (source instanceof HTMLElement && clone instanceof HTMLElement) {
      clone.style.transform = computedStyle.transform === "none" ? "" : computedStyle.transform;
      clone.style.transformOrigin = computedStyle.transformOrigin;
    }
  }
}

function copyFormState(pairs: ElementPair[]) {
  for (const { source, clone } of pairs) {
    if (source instanceof HTMLInputElement && clone instanceof HTMLInputElement) {
      clone.value = source.value;
      if (source.checked) clone.setAttribute("checked", "checked");
      continue;
    }

    if (source instanceof HTMLTextAreaElement && clone instanceof HTMLTextAreaElement) {
      clone.value = source.value;
      clone.textContent = source.value;
      continue;
    }

    if (source instanceof HTMLSelectElement && clone instanceof HTMLSelectElement) {
      clone.value = source.value;
      Array.from(clone.options).forEach((option) => {
        if (option.value === source.value) {
          option.setAttribute("selected", "selected");
        } else {
          option.removeAttribute("selected");
        }
      });
    }
  }
}

function prepareRootClone(clone: HTMLElement, width: number, height: number) {
  clone.style.width = `${width}px`;
  clone.style.minWidth = `${width}px`;
  clone.style.maxWidth = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.minHeight = `${height}px`;
  clone.style.maxHeight = `${height}px`;
  clone.style.borderRadius = "0";
  clone.style.overflow = "hidden";
  clone.style.transform = "none";
  clone.style.position = "relative";
}

function expandScrollableContent(
  scrollablePairs: ScrollablePair[],
  pairs: ElementPair[],
  screenElement: HTMLElement,
  screenClone: HTMLElement,
  outputHeight: number,
) {
  const primaryScrollable = scrollablePairs[0];
  const cloneBySource = new Map<Element, Element>(
    pairs.map(({ source, clone }) => [source, clone]),
  );

  for (const pair of scrollablePairs) {
    if (!(pair.clone instanceof HTMLElement)) continue;

    pair.clone.style.overflow = "visible";
    pair.clone.style.overflowY = "visible";
    pair.clone.style.height = `${pair.scrollHeight}px`;
    pair.clone.style.minHeight = `${pair.scrollHeight}px`;
    pair.clone.style.maxHeight = "none";
    pair.clone.style.scrollBehavior = "auto";

    if (pair.computedStyle.position === "absolute") {
      pair.clone.style.bottom = "auto";
    }
  }

  if (primaryScrollable) {
    let ancestor = primaryScrollable.source.parentElement;
    while (ancestor && ancestor !== screenElement.parentElement) {
      const cloneAncestor = cloneBySource.get(ancestor);
      if (cloneAncestor instanceof HTMLElement) {
        cloneAncestor.style.height = `${outputHeight}px`;
        cloneAncestor.style.minHeight = `${outputHeight}px`;
        cloneAncestor.style.maxHeight = "none";
        if (window.getComputedStyle(ancestor).position === "absolute") {
          cloneAncestor.style.bottom = "auto";
        }
      }

      if (ancestor === screenElement) break;
      ancestor = ancestor.parentElement;
    }
  }

  anchorBottomNavigationAtCaptureEnd(cloneBySource, screenElement, screenClone, outputHeight);
}

function anchorBottomNavigationAtCaptureEnd(
  cloneBySource: Map<Element, Element>,
  screenElement: HTMLElement,
  screenClone: HTMLElement,
  outputHeight: number,
) {
  const bottomNavigation = screenElement.querySelector(BOTTOM_NAVIGATION_SELECTOR);
  if (!(bottomNavigation instanceof HTMLElement)) return;

  const bottomNavigationWrapper = findBottomNavigationWrapper(bottomNavigation);
  const cloneWrapper = cloneBySource.get(bottomNavigationWrapper);
  if (!(cloneWrapper instanceof HTMLElement)) return;

  const wrapperHeight =
    bottomNavigationWrapper.getBoundingClientRect().height ||
    bottomNavigation.getBoundingClientRect().height ||
    54;

  screenClone.appendChild(cloneWrapper);
  cloneWrapper.style.position = "absolute";
  cloneWrapper.style.left = "0";
  cloneWrapper.style.right = "0";
  cloneWrapper.style.top = `${Math.max(0, outputHeight - wrapperHeight)}px`;
  cloneWrapper.style.bottom = "auto";
  cloneWrapper.style.width = `${screenElement.clientWidth || SCREEN_WIDTH_FALLBACK}px`;
  cloneWrapper.style.height = `${wrapperHeight}px`;
  cloneWrapper.style.minHeight = `${wrapperHeight}px`;
  cloneWrapper.style.maxHeight = `${wrapperHeight}px`;
  cloneWrapper.style.overflow = "visible";
  cloneWrapper.style.transform = "none";
  cloneWrapper.style.zIndex = "200";
}

function findBottomNavigationWrapper(bottomNavigation: HTMLElement) {
  let current = bottomNavigation.parentElement;

  while (current) {
    const computedStyle = window.getComputedStyle(current);
    const className = typeof current.className === "string" ? current.className : "";
    const isAnchoredWrapper =
      (computedStyle.position === "absolute" ||
        computedStyle.position === "fixed" ||
        computedStyle.position === "sticky") &&
      (computedStyle.bottom === "0px" || className.includes("bottom-0"));

    if (isAnchoredWrapper) return current;
    if (current.hasAttribute("data-phone-screen")) break;

    current = current.parentElement;
  }

  return bottomNavigation.parentElement ?? bottomNavigation;
}

function preserveVisibleScrollOffsets(scrollablePairs: ScrollablePair[]) {
  for (const pair of scrollablePairs) {
    if (!(pair.source instanceof HTMLElement) || !(pair.clone instanceof HTMLElement)) continue;
    if (pair.scrollTop <= 0) continue;

    pair.clone.style.overflow = "hidden";
    pair.clone.style.overflowY = "hidden";

    const cloneChildren = Array.from(pair.clone.childNodes);
    const sourceChildren = Array.from(pair.source.childNodes);
    const shiftedWrapper = document.createElement("div");
    shiftedWrapper.style.transform = `translateY(-${pair.scrollTop}px)`;
    shiftedWrapper.style.transformOrigin = "top left";
    shiftedWrapper.style.width = "100%";

    cloneChildren.forEach((child, index) => {
      const sourceChild = sourceChildren[index];
      const shouldStayPinned =
        sourceChild instanceof Element &&
        (window.getComputedStyle(sourceChild).position === "sticky" ||
          window.getComputedStyle(sourceChild).position === "fixed");

      if (!shouldStayPinned) {
        shiftedWrapper.appendChild(child);
      }
    });

    pair.clone.appendChild(shiftedWrapper);
  }
}

async function inlineImageSources(pairs: ElementPair[]) {
  await Promise.all(
    pairs.map(async ({ source, clone }) => {
      if (!(source instanceof HTMLImageElement) || !(clone instanceof HTMLImageElement)) return;

      const sourceUrl = source.currentSrc || source.src;
      const dataUrl = await resourceToDataUrl(sourceUrl);
      if (!dataUrl) return;

      clone.setAttribute("src", dataUrl);
      clone.removeAttribute("srcset");
      clone.removeAttribute("loading");
    }),
  );
}

async function inlineBackgroundImages(pairs: ElementPair[]) {
  await Promise.all(
    pairs.map(async ({ clone }) => {
      if (!(clone instanceof HTMLElement)) return;

      const backgroundImage = clone.style.backgroundImage;
      if (!backgroundImage || backgroundImage === "none") return;

      const urls = Array.from(backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g));
      if (urls.length === 0) return;

      let nextBackgroundImage = backgroundImage;
      for (const match of urls) {
        const backgroundUrl = match[1];
        if (!backgroundUrl) continue;
        const dataUrl = await resourceToDataUrl(backgroundUrl);
        if (dataUrl) {
          nextBackgroundImage = nextBackgroundImage.replace(backgroundUrl, dataUrl);
        }
      }

      clone.style.backgroundImage = nextBackgroundImage;
    }),
  );
}

async function resourceToDataUrl(rawUrl: string) {
  if (!rawUrl || rawUrl.startsWith("data:")) return rawUrl;

  try {
    const absoluteUrl = new URL(rawUrl, window.location.href).href;
    const response = await fetch(absoluteUrl, { cache: "force-cache" });
    if (!response.ok) return null;

    const blob = await response.blob();
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function renderElementToPng(element: HTMLElement, width: number, height: number) {
  const serializedElement = new XMLSerializer().serializeToString(element);
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<foreignObject width="100%" height="100%">${serializedElement}</foreignObject>`,
    "</svg>",
  ].join("");
  const imageUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const image = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * CANVAS_SCALE);
  canvas.height = Math.ceil(height * CANVAS_SCALE);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not create screenshot canvas context.");
  }

  context.scale(CANVAS_SCALE, CANVAS_SCALE);
  context.drawImage(image, 0, 0, width, height);

  return await canvasToBlob(canvas);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not render screenshot image."));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not export screenshot PNG."));
        }
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function createTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
