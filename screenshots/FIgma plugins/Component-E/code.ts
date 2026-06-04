// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
figma.showUI(__html__, { width: 720, height: 780, themeColors: true });

const SCHEMA = "build-ui.screen.v1";
const PLUGIN_DATA_KEY = "build-ui-generated";
const PLUGIN_DATA_VALUE = "1";
const DEFAULT_FONT = { family: "Inter", style: "Regular" };
const FONT_CACHE = new Map();
const DEFAULT_FRAME = { width: 393, height: 852, background: "#F5F5F5" };
const DARK_SHELL_HEXES = new Set(["#000000", "#1F1F1F", "#262626"]);
const SUPPORTED_LAYER_TYPES = new Set(["container", "shape", "text", "ellipse", "line", "vector", "image"]);
const CANONICAL_FORBIDDEN_KEYS = new Set(["backgroundColor", "boxShadow", "borderRadius", "className", "computedStyle", "cssText", "dataUrl"]);
const MAX_PREFLIGHT_MESSAGES = 24;

figma.ui.onmessage = async (message) => {
  if (!message || message.type === "cancel") {
    figma.closePlugin();
    return;
  }

  try {
    if (message.type === "build-ui" || message.type === "import-screen-json") {
      await buildFromJson(message);
      return;
    }

    if (message.type === "extract-selection") {
      await extractSelection(message);
    }
  } catch (error) {
    const messageText = error instanceof Error ? error.message : String(error);
    figma.notify(messageText, { error: true });
    figma.ui.postMessage({ type: "error", message: messageText });
  }
};

async function buildFromJson(message) {
  const options = normalizeBuildOptions(message);
  const payload = parseBuildPayload(message.json);
  const preflight = createBuildPreflightReport(payload);
  if (preflight.errors.length > 0) {
    throw new Error(`JSON preflight failed: ${preflight.errors.slice(0, 3).join(" ")}`);
  }
  const targetFrame = resolveBuildTarget(payload, options);
  const assetMap = new Map((payload.assets || []).map((asset) => [asset.id, asset]));
  const sourceBounds = getLayerBounds(payload.root) || {
    x: 0,
    y: 0,
    width: payload.frame.width,
    height: payload.frame.height,
  };
  const scale = options.fitToFrame && sourceBounds.width > 0 ? targetFrame.width / sourceBounds.width : 1;
  const context = {
    assetMap,
    layoutMode: options.layoutMode,
    scale,
    warnings: dedupeStrings([...(Array.isArray(payload.warnings) ? payload.warnings : []), ...preflight.warnings]),
    createdNodes: [],
    preflight,
  };

  figma.ui.postMessage({
    type: "status",
    message: `Preflight passed: ${preflight.stats.layerCount} layer(s), ${preflight.stats.assetCount} asset(s). Loading fonts...`,
  });
  await loadFonts(payload.root);

  if (options.clearFrame) {
    removeAllChildren(targetFrame);
  } else if (options.removePreviousOutput) {
    removeGeneratedChildren(targetFrame);
  }

  if (options.resizeFrame) {
    const nextWidth = options.fitToFrame ? targetFrame.width : payload.frame.width;
    const nextHeight = options.fitToFrame ? sourceBounds.height * scale : payload.frame.height;
    resizeNode(targetFrame, Math.max(1, nextWidth), Math.max(1, nextHeight));
  }

  targetFrame.name = targetFrame.name || payload.root.name || "Imported screen";
  targetFrame.clipsContent = true;
  applyRootFrameStyles(targetFrame, payload, context);
  targetFrame.setPluginData("buildUiScreenSchema", SCHEMA);
  targetFrame.setPluginData(PLUGIN_DATA_KEY, PLUGIN_DATA_VALUE);

  const rootChildren = [];
  for (const childLayer of payload.root.children || []) {
    const childNode = await createNodeFromLayer(childLayer, sourceBounds, context);
    targetFrame.appendChild(childNode);
    applyAutoLayoutChild(childNode, childLayer.autoLayoutChild, context);
    rootChildren.push({ node: childNode, layer: childLayer });
    context.createdNodes.push(childNode);
  }

  applyLayoutIfSafe(targetFrame, payload.root, rootChildren, context);

  if (options.lockGeneratedLayers) {
    for (const node of context.createdNodes) {
      node.locked = true;
    }
  }

  figma.currentPage.selection = context.createdNodes.slice(0, 100);
  figma.viewport.scrollAndZoomIntoView(context.createdNodes.length > 0 ? context.createdNodes : [targetFrame]);
  figma.notify(`Built ${context.createdNodes.length} layers in "${targetFrame.name}".`);
  figma.ui.postMessage({
    type: "built",
    summary: {
      created: context.createdNodes.length,
      warnings: context.warnings,
      targetName: targetFrame.name,
      preflight: context.preflight.stats,
    },
  });
}

function normalizeBuildOptions(message) {
  const raw = message.options || message;
  return {
    targetMode: ["selected", "new", "auto"].includes(raw.targetMode) ? raw.targetMode : "auto",
    newFrameWidth: ["375", "393", "json"].includes(raw.newFrameWidth) ? raw.newFrameWidth : "json",
    layoutMode: ["smart", "pixel", "trust"].includes(raw.layoutMode)
      ? raw.layoutMode
      : raw.autoLayoutMode === "off"
        ? "pixel"
        : raw.autoLayoutMode === "explicit"
          ? "trust"
          : "smart",
    clearFrame: raw.clearFrame === true,
    removePreviousOutput: raw.removePreviousOutput !== false,
    resizeFrame: raw.resizeFrame !== false,
    fitToFrame: raw.fitToFrame === true,
    lockGeneratedLayers: raw.lockGeneratedLayers === true,
  };
}

function parseBuildPayload(rawJson) {
  if (!rawJson || !rawJson.trim()) {
    throw new Error("Paste a JSON payload first.");
  }

  const parsed = JSON.parse(rawJson);
  const payload = parsed?.schema === SCHEMA
    ? normalizeCanonicalBuildPayload(parsed)
    : normalizeLegacyBuildPayload(parsed);

  return payload;
}

function createBuildPreflightReport(payload) {
  const report = {
    errors: [],
    warnings: [],
    stats: {
      layerCount: 0,
      textLayerCount: 0,
      assetCount: Array.isArray(payload.assets) ? payload.assets.length : 0,
      maxDepth: 0,
    },
  };
  const assetIds = collectAssetIds(payload.assets, report);
  collectForbiddenKeys(payload, "", report);

  if (!isObject(payload.frame)) {
    addPreflightError(report, "Missing frame object.");
  } else {
    validatePositiveNumber(payload.frame.width, "frame.width", report);
    validatePositiveNumber(payload.frame.height, "frame.height", report);
    if (typeof payload.frame.background !== "string") {
      addPreflightWarning(report, "frame.background should be a hex string.");
    }
  }

  if (!isObject(payload.root)) {
    addPreflightError(report, "Missing root object.");
    return finalizePreflightReport(report);
  }

  validateLayerForBuild(payload.root, "root", 0, assetIds, report);
  return finalizePreflightReport(report);
}

function collectAssetIds(assets, report) {
  const assetIds = new Set();
  if (!Array.isArray(assets)) {
    addPreflightError(report, "assets must be an array.");
    return assetIds;
  }

  assets.forEach((asset, index) => {
    const path = `assets[${index}]`;
    if (!isObject(asset)) {
      addPreflightWarning(report, `${path} is not an object and will be ignored.`);
      return;
    }
    if (typeof asset.id !== "string" || !asset.id.trim()) {
      addPreflightError(report, `${path}.id must be a non-empty string.`);
      return;
    }
    if (assetIds.has(asset.id)) {
      addPreflightError(report, `Duplicate asset id "${asset.id}".`);
    }
    assetIds.add(asset.id);
    if (typeof asset.content !== "string" || !asset.content.trim()) {
      addPreflightWarning(report, `${path} has no content.`);
    }
  });

  return assetIds;
}

function validateLayerForBuild(layer, path, depth, assetIds, report) {
  if (!isObject(layer)) {
    addPreflightError(report, `${path} must be an object.`);
    return;
  }

  report.stats.layerCount += 1;
  report.stats.maxDepth = Math.max(report.stats.maxDepth, depth);

  const type = typeof layer.type === "string" ? layer.type : "shape";
  if (!SUPPORTED_LAYER_TYPES.has(type)) {
    addPreflightError(report, `${path}.type "${type}" is not supported.`);
  }

  if (typeof layer.name !== "string" || !layer.name.trim()) {
    addPreflightWarning(report, `${path} should have a designer-friendly name.`);
  }

  validateBounds(layer.bounds, `${path}.bounds`, report);

  if ((type === "vector" || type === "image") && !layer.assetRef && !hasImageLikeFill(layer)) {
    addPreflightWarning(report, `${path} is ${type} but has no assetRef; a placeholder may be created.`);
  }
  if (typeof layer.assetRef === "string" && !assetIds.has(layer.assetRef)) {
    addPreflightWarning(report, `${path}.assetRef "${layer.assetRef}" does not exist in assets[].`);
  }

  if (type === "text") {
    validateTextLayerForBuild(layer, path, report);
  }

  if (layer.layout && !isAutoLayoutDirection(layer.layout.mode)) {
    addPreflightWarning(report, `${path}.layout.mode should be VERTICAL or HORIZONTAL.`);
  }

  if (Array.isArray(layer.children)) {
    layer.children.forEach((child, index) => {
      validateLayerForBuild(child, `${path}.children[${index}]`, depth + 1, assetIds, report);
    });
  } else if (type === "container") {
    addPreflightWarning(report, `${path} is a container without children.`);
  }
}

function validateBounds(bounds, path, report) {
  if (!isObject(bounds)) {
    addPreflightError(report, `${path} must be an object with numeric x, y, width, and height.`);
    return;
  }

  for (const key of ["x", "y", "width", "height"]) {
    if (readNumber(bounds[key]) === undefined) {
      addPreflightError(report, `${path}.${key} must be a number.`);
    }
  }

  if (readNumber(bounds.width) !== undefined && readNumber(bounds.width) <= 0) {
    addPreflightError(report, `${path}.width must be greater than 0.`);
  }
  if (readNumber(bounds.height) !== undefined && readNumber(bounds.height) <= 0) {
    addPreflightError(report, `${path}.height must be greater than 0.`);
  }
}

function validatePositiveNumber(value, path, report) {
  if (readNumber(value) === undefined || value <= 0) {
    addPreflightError(report, `${path} must be a positive number.`);
  }
}

function validateTextLayerForBuild(layer, path, report) {
  report.stats.textLayerCount += 1;
  const text = layer.text || {};
  if (typeof text.characters !== "string") {
    addPreflightError(report, `${path}.text.characters must be a string.`);
    return;
  }

  if (readNumber(text.fontSize) === undefined) {
    addPreflightWarning(report, `${path}.text.fontSize should be a number.`);
  }

  const bounds = getLayerBounds(layer);
  const fontSize = readNumber(text.fontSize) || 14;
  const longestLine = text.characters.split(/\r?\n/).reduce((max, line) => Math.max(max, line.length), 0);
  const estimatedWidth = longestLine * fontSize * 0.58;
  if (text.allowWrap !== true && longestLine > 0 && bounds.width + 16 < estimatedWidth * 0.72) {
    addPreflightWarning(report, `${path} text bounds may be too narrow for "${text.characters.slice(0, 32)}".`);
  }
}

function collectForbiddenKeys(value, path, report) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenKeys(item, `${path}[${index}]`, report));
    return;
  }
  if (!isObject(value)) return;

  for (const [key, child] of Object.entries(value)) {
    const nextPath = path ? `${path}.${key}` : key;
    if (CANONICAL_FORBIDDEN_KEYS.has(key)) {
      addPreflightWarning(report, `${nextPath} is CSS/DOM-style data and is ignored by the canonical builder.`);
    }
    collectForbiddenKeys(child, nextPath, report);
  }
}

function addPreflightError(report, message) {
  addPreflightMessage(report.errors, message);
}

function addPreflightWarning(report, message) {
  addPreflightMessage(report.warnings, message);
}

function addPreflightMessage(list, message) {
  if (list.length < MAX_PREFLIGHT_MESSAGES && !list.includes(message)) {
    list.push(message);
  }
}

function finalizePreflightReport(report) {
  report.errors = dedupeStrings(report.errors);
  report.warnings = dedupeStrings(report.warnings);
  if (report.errors.length >= MAX_PREFLIGHT_MESSAGES) {
    report.errors.push("More preflight errors were omitted.");
  }
  if (report.warnings.length >= MAX_PREFLIGHT_MESSAGES) {
    report.warnings.push("More preflight warnings were omitted.");
  }
  return report;
}

function dedupeStrings(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim()))];
}

function normalizeCanonicalBuildPayload(payload) {
  if (payload.schema !== SCHEMA) {
    throw new Error(`Unsupported JSON schema. Expected ${SCHEMA}.`);
  }

  if (!payload.frame || !payload.root || !Array.isArray(payload.root.children) || !Array.isArray(payload.assets)) {
    throw new Error("Invalid build-ui screen JSON payload.");
  }

  payload.frame = {
    width: readNumber(payload.frame.width) || DEFAULT_FRAME.width,
    height: readNumber(payload.frame.height) || DEFAULT_FRAME.height,
    background: typeof payload.frame.background === "string" ? payload.frame.background : DEFAULT_FRAME.background,
  };

  return payload;
}

function normalizeLegacyBuildPayload(document) {
  if (!isObject(document)) {
    throw new Error("JSON must be an object.");
  }

  const legacyContext = createLegacyImportContext(document);
  const roots = extractLegacyRoots(document).map((root) => normalizeLegacyLayer(root, legacyContext));
  if (roots.length === 0) {
    throw new Error("Unsupported JSON. Expected build-ui.screen.v1, Component-E JSON, roots[], root, screen, children[], or layers[].");
  }

  const frame = normalizeLegacyFrame(document, roots);
  const root = createLegacyScreenRoot(document, roots, frame);
  return {
    schema: SCHEMA,
    generatedAt: new Date().toISOString(),
    source: {
      pluginName: "Component-E Build UI Bridge",
      importedFromSchema: typeof document.schema === "string" ? document.schema : "legacy-build-ui-compatible",
      normalizedFromLegacyJson: true,
    },
    frame,
    root,
    assets: legacyContext.assets,
    warnings: [
      "Legacy JSON was normalized to build-ui.screen.v1 before rendering.",
      ...(Array.isArray(document.warnings) ? document.warnings.filter((warning) => typeof warning === "string") : []),
    ],
  };
}

function extractLegacyRoots(document) {
  const roots = [];
  const components = Array.isArray(document.components) ? document.components.filter(isObject) : [];

  for (const component of components) {
    if (isObject(component.root)) roots.push(component.root);
  }

  if (roots.length > 0) return roots;

  if (Array.isArray(document.roots)) {
    roots.push(...document.roots.filter(isObject));
  }

  if (roots.length > 0) return roots;

  if (isObject(document.root)) return [document.root];

  if (isObject(document.screen)) {
    if (isObject(document.screen.root)) return [document.screen.root];
    if (hasLegacyRenderableContent(document.screen)) return [document.screen];
  }

  const children = getLegacyChildren(document);
  if (children.length > 0) return [createVirtualLegacyRoot(document, children)];
  if (hasLegacyRenderableContent(document)) return [document];
  return [];
}

function createVirtualLegacyRoot(document, children) {
  const screen = isObject(document.screen) ? document.screen : document;
  const width = readNumber(screen.width) ?? readNumber(document.width) ?? DEFAULT_FRAME.width;
  const height = readNumber(screen.height) ?? readNumber(document.height) ?? DEFAULT_FRAME.height;
  const background = screen.background ?? document.background ?? document.fill ?? document.fills;
  return {
    type: "container",
    name: document.name || document.componentName || document.title || "Screen",
    bounds: { x: 0, y: 0, width, height },
    styles: background ? { fills: normalizeLegacyPaintArray(background) } : undefined,
    children,
  };
}

function normalizeLegacyFrame(document, roots) {
  const screen = isObject(document.screen) ? document.screen : {};
  const frame = isObject(document.frame) ? document.frame : {};
  const rootBounds = roots.length === 1 ? roots[0].bounds : getBoundsUnion(roots.map((root) => root.bounds));
  const width = readNumber(frame.width) ?? readNumber(screen.width) ?? readNumber(document.width) ?? rootBounds?.width ?? DEFAULT_FRAME.width;
  const height = readNumber(frame.height) ?? readNumber(screen.height) ?? readNumber(document.height) ?? rootBounds?.height ?? DEFAULT_FRAME.height;
  const background =
    normalizeHexColor(frame.background) ||
    normalizeHexColor(screen.background) ||
    normalizeHexColor(document.background) ||
    getFirstLegacyFillHex(roots) ||
    DEFAULT_FRAME.background;

  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
    background,
  };
}

function createLegacyScreenRoot(document, roots, frame) {
  const screen = isObject(document.screen) ? document.screen : {};
  const name = document.name || document.componentName || document.title || screen.name || "Screen";

  if (roots.length === 1 && roots[0].type === "container" && Array.isArray(roots[0].children)) {
    const root = roots[0];
    const sourceBounds = getLayerBounds(root);
    return {
      ...root,
      name: root.name || name,
      bounds: { x: 0, y: 0, width: frame.width, height: frame.height },
      styles: ensureRootStyles(root.styles, frame.background),
      children: root.children.map((child) => shiftLegacyLayerBounds(child, -sourceBounds.x, -sourceBounds.y)),
    };
  }

  return {
    type: "container",
    name,
    bounds: { x: 0, y: 0, width: frame.width, height: frame.height },
    layout: createFixedRootLayout(),
    styles: ensureRootStyles({}, frame.background),
    children: roots.map((root) => ({
      ...root,
      autoLayoutChild: root.autoLayoutChild || { layoutPositioning: "ABSOLUTE" },
    })),
  };
}

function normalizeLegacyLayer(layer, legacyContext) {
  const inlineAsset = extractLegacyInlineAsset(layer, legacyContext);
  const bounds = normalizeLegacyBounds(layer);
  const type = normalizeLegacyLayerType(layer, inlineAsset);
  const text = normalizeLegacyText(layer);
  const styles = normalizeLegacyStyles(layer, type);
  const children = getLegacyChildren(layer).map((child) => normalizeLegacyLayer(child, legacyContext));
  const normalized = {
    type,
    name: cleanLayerName(layer.name || layer.id || layer.componentName, type),
    bounds,
  };

  if (Object.keys(styles).length > 0) normalized.styles = styles;
  if (text) normalized.text = text;
  if (children.length > 0) normalized.children = children;
  if (isObject(layer.layout) && isAutoLayoutDirection(layer.layout.mode || layer.layout.layoutMode)) normalized.layout = normalizeLegacyLayout(layer.layout);
  if (isObject(layer.autoLayoutChild)) normalized.autoLayoutChild = normalizeLegacyAutoLayoutChild(layer.autoLayoutChild);
  if (inlineAsset) normalized.assetRef = inlineAsset.id;
  if (typeof layer.assetRef === "string" && !normalized.assetRef) normalized.assetRef = layer.assetRef;
  if (typeof layer.assetId === "string" && !normalized.assetRef) normalized.assetRef = layer.assetId;
  if (typeof layer.visible === "boolean") normalized.visible = layer.visible;
  if (typeof layer.locked === "boolean") normalized.locked = layer.locked;
  if (readNumber(layer.rotation) !== undefined) normalized.rotation = readNumber(layer.rotation);

  const figma = normalizeLegacyFigmaMetadata(layer);
  if (Object.keys(figma).length > 0) normalized.figma = figma;
  if (type === "container") normalized.clipsContent = layer.clipsContent !== false && layer.layout?.clipsContent !== false;
  return normalized;
}

function normalizeLegacyLayerType(layer, inlineAsset) {
  if (inlineAsset?.kind === "svg") return "vector";
  if (inlineAsset?.kind === "image" || inlineAsset?.kind === "png2x") return "image";
  const type = String(layer.type || "").toLowerCase();
  const figmaType = String(layer.figmaType || "").toUpperCase();
  if (type === "text" || figmaType === "TEXT" || typeof layer.characters === "string" || isObject(layer.text)) return "text";
  if (type === "ellipse" || figmaType === "ELLIPSE") return "ellipse";
  if (type === "line" || figmaType === "LINE") return "line";
  if (type === "image" || (figmaType === "RECTANGLE" && hasImageLikeFill(layer))) return "image";
  if (type === "vector" || figmaType === "VECTOR" || figmaType === "BOOLEAN_OPERATION" || figmaType === "POLYGON" || figmaType === "STAR") return "vector";
  if (type === "container" || type === "frame" || type === "group" || type === "component" || type === "component_set" || type === "instance" || figmaType === "FRAME" || figmaType === "GROUP" || figmaType === "COMPONENT" || figmaType === "COMPONENT_SET" || figmaType === "INSTANCE" || getLegacyChildren(layer).length > 0) return "container";
  return "shape";
}

function normalizeLegacyBounds(layer) {
  const bounds = isObject(layer.bounds) ? layer.bounds : {};
  const legacyLayer = isObject(layer.layer) ? layer.layer : {};
  return {
    x: readNumber(bounds.x) ?? readNumber(layer.x) ?? readNumber(legacyLayer.x) ?? 0,
    y: readNumber(bounds.y) ?? readNumber(layer.y) ?? readNumber(legacyLayer.y) ?? 0,
    width: Math.max(0.01, readNumber(bounds.width) ?? readNumber(layer.width) ?? readNumber(legacyLayer.width) ?? 1),
    height: Math.max(0.01, readNumber(bounds.height) ?? readNumber(layer.height) ?? readNumber(legacyLayer.height) ?? 1),
  };
}

function normalizeLegacyText(layer) {
  const text = isObject(layer.text) ? layer.text : {};
  const characters = typeof text.characters === "string" ? text.characters : typeof layer.characters === "string" ? layer.characters : null;
  if (characters === null) return null;

  return {
    characters,
    fontName: normalizeFontName(text.fontName || layer.fontName || DEFAULT_FONT),
    fontSize: readNumber(text.fontSize) ?? readNumber(layer.fontSize) ?? 14,
    lineHeight: normalizeLegacyLineHeight(text.lineHeight ?? layer.lineHeight, readNumber(text.fontSize) ?? readNumber(layer.fontSize) ?? 14),
    letterSpacing: normalizeLegacyLetterSpacing(text.letterSpacing ?? layer.letterSpacing),
    textAlignHorizontal: isTextAlignHorizontal(text.textAlignHorizontal || layer.textAlignHorizontal) ? (text.textAlignHorizontal || layer.textAlignHorizontal) : "LEFT",
    textAlignVertical: isTextAlignVertical(text.textAlignVertical || layer.textAlignVertical) ? (text.textAlignVertical || layer.textAlignVertical) : "TOP",
    allowWrap: text.allowWrap === true,
    segments: Array.isArray(text.segments) ? text.segments.map(normalizeLegacyTextSegment).filter(Boolean) : undefined,
  };
}

function normalizeLegacyTextSegment(segment) {
  if (!isObject(segment)) return null;
  return {
    start: readNumber(segment.start) ?? 0,
    end: readNumber(segment.end) ?? readNumber(segment.start) ?? 0,
    characters: typeof segment.characters === "string" ? segment.characters : undefined,
    fontName: normalizeFontName(segment.fontName || DEFAULT_FONT),
    fontSize: readNumber(segment.fontSize),
    fills: Array.isArray(segment.fills) ? segment.fills : undefined,
    lineHeight: segment.lineHeight,
    letterSpacing: segment.letterSpacing,
    textDecoration: segment.textDecoration,
    textCase: segment.textCase,
  };
}

function normalizeLegacyStyles(layer, type) {
  const input = isObject(layer.styles) ? { ...layer.styles } : {};
  const styles = {};
  const fills = firstLegacyPaintInput(input.fills, layer.fills, layer.fill, layer.background, layer.backgroundColor, layer.color);
  const strokes = firstLegacyPaintInput(input.strokes, layer.strokes, layer.stroke, layer.borderColor);

  if (fills !== undefined && type !== "image") styles.fills = normalizeLegacyPaintArray(fills);
  if (strokes !== undefined) styles.strokes = normalizeLegacyPaintArray(strokes);
  if (readNumber(input.strokeWeight) !== undefined || readNumber(layer.strokeWeight) !== undefined) styles.strokeWeight = readNumber(input.strokeWeight) ?? readNumber(layer.strokeWeight);
  if (isStrokeAlign(input.strokeAlign || layer.strokeAlign)) styles.strokeAlign = input.strokeAlign || layer.strokeAlign;
  if (Array.isArray(input.dashPattern || layer.dashPattern)) styles.dashPattern = input.dashPattern || layer.dashPattern;
  if (readNumber(input.cornerRadius) !== undefined || readNumber(layer.radius) !== undefined || readNumber(layer.borderRadius) !== undefined) styles.cornerRadius = readNumber(input.cornerRadius) ?? readNumber(layer.radius) ?? readNumber(layer.borderRadius);
  if (isObject(input.cornerRadii)) styles.cornerRadii = input.cornerRadii;
  if (Array.isArray(input.effects || layer.effects)) styles.effects = input.effects || layer.effects;
  if (readNumber(input.opacity) !== undefined || readNumber(layer.opacity) !== undefined) styles.opacity = readNumber(input.opacity) ?? readNumber(layer.opacity);
  if (isObject(input.styleRefs)) styles.styleRefs = input.styleRefs;
  return styles;
}

function normalizeLegacyLayout(layout) {
  const padding = isObject(layout.padding) ? layout.padding : layout;
  return {
    mode: layout.mode || layout.layoutMode,
    padding: {
      top: readNumber(padding.top) ?? 0,
      right: readNumber(padding.right) ?? 0,
      bottom: readNumber(padding.bottom) ?? 0,
      left: readNumber(padding.left) ?? 0,
    },
    gap: readNumber(layout.gap) ?? readNumber(layout.itemSpacing) ?? 0,
    primaryAxisSizingMode: layout.primaryAxisSizingMode === "AUTO" ? "AUTO" : "FIXED",
    counterAxisSizingMode: layout.counterAxisSizingMode === "AUTO" ? "AUTO" : "FIXED",
    primaryAxisAlignItems: layout.primaryAxisAlignItems || "MIN",
    counterAxisAlignItems: layout.counterAxisAlignItems || "MIN",
  };
}

function normalizeLegacyAutoLayoutChild(autoLayoutChild) {
  return {
    layoutPositioning: autoLayoutChild.layoutPositioning === "AUTO" ? "AUTO" : "ABSOLUTE",
    layoutGrow: readNumber(autoLayoutChild.layoutGrow) ?? 0,
    layoutAlign: autoLayoutChild.layoutAlign || "INHERIT",
  };
}

function normalizeLegacyFigmaMetadata(layer) {
  const meta = {};
  if (typeof layer.id === "string") meta.id = layer.id;
  if (typeof layer.figmaType === "string") meta.type = layer.figmaType;
  if (typeof layer.visible === "boolean") meta.visible = layer.visible;
  if (typeof layer.locked === "boolean") meta.locked = layer.locked;
  if (isObject(layer.layer)) meta.layer = layer.layer;
  if (isObject(layer.constraints)) meta.constraints = layer.constraints;
  if (isObject(layer.component)) meta.component = layer.component;
  if (Array.isArray(layer.variables)) meta.variables = layer.variables;
  return meta;
}

function normalizeLegacyAssets(assets) {
  if (!Array.isArray(assets)) return [];
  return assets.filter(isObject).map((asset, index) => ({
    id: typeof asset.id === "string" ? asset.id : `legacy-asset-${index + 1}`,
    kind: typeof asset.kind === "string" ? asset.kind : "image",
    mimeType: typeof asset.mimeType === "string" ? asset.mimeType : "application/octet-stream",
    encoding: typeof asset.encoding === "string" ? asset.encoding : "base64",
    content: typeof asset.content === "string" ? asset.content : "",
    nodeId: asset.nodeId,
    nodeName: asset.nodeName,
    byteLength: asset.byteLength,
  })).filter((asset) => asset.content);
}

function createLegacyImportContext(document) {
  const assets = normalizeLegacyAssets(document.assets);
  return {
    assets,
    assetIds: new Set(assets.map((asset) => asset.id)),
  };
}

function extractLegacyInlineAsset(layer, legacyContext) {
  const parsed = parseLegacyInlineAsset(layer);
  if (!parsed) return null;

  const baseId = sanitizeName(parsed.id || layer.id || layer.name || "inline-asset");
  let id = baseId;
  let index = 2;
  while (legacyContext.assetIds.has(id)) {
    id = `${baseId}-${index}`;
    index += 1;
  }

  const asset = {
    ...parsed,
    id,
    nodeId: layer.id,
    nodeName: layer.name,
    byteLength: parsed.content.length,
  };
  legacyContext.assets.push(asset);
  legacyContext.assetIds.add(id);
  return asset;
}

function parseLegacyInlineAsset(layer) {
  const asset = isObject(layer.asset) ? layer.asset : {};
  const dataUrl = stringValue(asset.dataUrl) || stringValue(asset.url) || stringValue(layer.dataUrl);
  if (dataUrl) return parseLegacyDataUrl(dataUrl, asset.id || layer.id || layer.name);

  const content = stringValue(asset.content);
  if (!content) return null;

  const mimeType = stringValue(asset.mimeType) || stringValue(asset.type) || "application/octet-stream";
  const kind = inferAssetKind(mimeType, stringValue(asset.kind));
  return {
    id: stringValue(asset.id) || stringValue(layer.id) || stringValue(layer.name) || "inline-asset",
    kind,
    mimeType,
    encoding: stringValue(asset.encoding) || (kind === "svg" ? "plain" : "base64"),
    content,
  };
}

function parseLegacyDataUrl(dataUrl, fallbackId) {
  const match = String(dataUrl).match(/^data:([^;,]+)(?:;charset=[^;,]+)?(;base64)?,([\s\S]*)$/i);
  if (!match) return null;

  const mimeType = match[1].toLowerCase();
  const isBase64 = Boolean(match[2]);
  const payload = match[3];
  const kind = inferAssetKind(mimeType);

  if (isBase64) {
    return {
      id: stringValue(fallbackId) || "inline-asset",
      kind,
      mimeType,
      encoding: kind === "svg" ? "plain" : "base64",
      content: kind === "svg" ? base64ToText(payload) : payload,
    };
  }

  return {
    id: stringValue(fallbackId) || "inline-asset",
    kind,
    mimeType,
    encoding: "plain",
    content: decodeDataUrlPayload(payload),
  };
}

function inferAssetKind(mimeType, explicitKind) {
  const kind = String(explicitKind || "").toLowerCase();
  const mime = String(mimeType || "").toLowerCase();
  if (kind === "svg" || mime.includes("svg")) return "svg";
  if (kind.includes("png2x")) return "png2x";
  if (kind.includes("png") || kind === "image" || mime.includes("png") || mime.startsWith("image/")) return "image";
  return "image";
}

function base64ToText(value) {
  const binary = atob(String(value).replace(/\s/g, ""));
  try {
    return decodeURIComponent(binary.split("").map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""));
  } catch (_error) {
    return binary;
  }
}

function decodeDataUrlPayload(payload) {
  try {
    return decodeURIComponent(payload);
  } catch (_error) {
    return payload;
  }
}

function stringValue(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function hasLegacyRenderableContent(value) {
  return isObject(value) && (
    typeof value.type === "string" ||
    typeof value.figmaType === "string" ||
    typeof value.characters === "string" ||
    isObject(value.text) ||
    getLegacyChildren(value).length > 0
  );
}

function getLegacyChildren(value) {
  if (!isObject(value)) return [];
  if (Array.isArray(value.children)) return value.children.filter(isObject);
  if (Array.isArray(value.layers)) return value.layers.filter(isObject);
  return [];
}

function getBoundsUnion(boundsList) {
  const validBounds = boundsList.filter(Boolean);
  if (validBounds.length === 0) return null;
  const minX = Math.min(...validBounds.map((bounds) => bounds.x));
  const minY = Math.min(...validBounds.map((bounds) => bounds.y));
  const maxX = Math.max(...validBounds.map((bounds) => bounds.x + bounds.width));
  const maxY = Math.max(...validBounds.map((bounds) => bounds.y + bounds.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function shiftLegacyLayerBounds(layer, dx, dy) {
  if (!dx && !dy) return layer;
  return {
    ...layer,
    bounds: {
      ...layer.bounds,
      x: round((readNumber(layer.bounds?.x) ?? 0) + dx),
      y: round((readNumber(layer.bounds?.y) ?? 0) + dy),
    },
    children: Array.isArray(layer.children)
      ? layer.children.map((child) => shiftLegacyLayerBounds(child, dx, dy))
      : layer.children,
  };
}

function ensureRootStyles(styles, background) {
  const nextStyles = isObject(styles) ? { ...styles } : {};
  if (!Array.isArray(nextStyles.fills) || nextStyles.fills.length === 0) {
    nextStyles.fills = [{ type: "SOLID", color: { hex: background } }];
  }
  return nextStyles;
}

function getFirstLegacyFillHex(layers) {
  for (const layer of layers) {
    const fill = layer.styles?.fills?.[0]?.color?.hex;
    const hex = normalizeHexColor(fill);
    if (hex) return hex;
  }
  return null;
}

function firstLegacyPaintInput(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "mixed");
}

function normalizeLegacyPaintArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (isObject(value) && Array.isArray(value.fills)) return value.fills.filter(Boolean);
  const hex = normalizeHexColor(value);
  if (hex) return [{ type: "SOLID", color: { hex } }];
  if (isObject(value)) return [value];
  return [];
}

function normalizeHexColor(value) {
  if (typeof value === "string") {
    const rgba = parseColorString(value);
    return rgba ? rgbToHex(rgba) : null;
  }
  if (isObject(value) && typeof value.hex === "string") return normalizeHexColor(value.hex);
  if (isObject(value) && isObject(value.color)) return normalizeHexColor(value.color);
  if (isObject(value) && (readNumber(value.r) !== undefined || readNumber(value.g) !== undefined || readNumber(value.b) !== undefined)) {
    return rgbToHex(normalizeRgba(value));
  }
  return null;
}

function hasImageLikeFill(layer) {
  const fills = Array.isArray(layer.styles?.fills) ? layer.styles.fills : Array.isArray(layer.fills) ? layer.fills : [];
  return fills.some((fill) => fill?.type === "IMAGE" || fill?.type === "VIDEO");
}

function normalizeLegacyLineHeight(value, fontSize) {
  if (isObject(value) && value !== "mixed") return value;
  const number = readNumber(value);
  return { unit: "PIXELS", value: number ?? Math.round(fontSize * 1.2) };
}

function normalizeLegacyLetterSpacing(value) {
  if (isObject(value) && value !== "mixed") return value;
  return { unit: "PIXELS", value: readNumber(value) ?? 0 };
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function resolveBuildTarget(payload, options) {
  const selectedFrame = getSelectedFrameLike();
  if (options.targetMode !== "new" && selectedFrame) return selectedFrame;
  if (options.targetMode === "selected") {
    throw new Error("Select exactly one frame or component, or switch Destination to Auto/New frame.");
  }

  const frame = figma.createFrame();
  const width = options.newFrameWidth === "375"
    ? 375
    : options.newFrameWidth === "393"
      ? 393
      : payload.frame.width;
  frame.resizeWithoutConstraints(Math.max(1, width), Math.max(1, payload.frame.height));
  frame.name = payload.root.name || "Build UI Screen";
  frame.x = Math.round(figma.viewport.center.x - frame.width / 2);
  frame.y = Math.round(figma.viewport.center.y - Math.min(frame.height, 900) / 2);
  frame.clipsContent = true;
  figma.currentPage.appendChild(frame);
  return frame;
}

function getSelectedFrameLike() {
  if (figma.currentPage.selection.length !== 1) return null;
  const node = figma.currentPage.selection[0];
  return node.type === "FRAME" || node.type === "COMPONENT" ? node : null;
}

function removeAllChildren(parent) {
  for (const child of [...parent.children]) {
    child.remove();
  }
}

function removeGeneratedChildren(parent) {
  for (const child of [...parent.children]) {
    if (child.getPluginData(PLUGIN_DATA_KEY) === PLUGIN_DATA_VALUE) {
      child.remove();
    }
  }
}

function applyRootFrameStyles(targetFrame, payload, context) {
  const rootLayer = {
    ...payload.root,
    styles: {
      ...(payload.root.styles || {}),
      fills: Array.isArray(payload.root.styles?.fills) && payload.root.styles.fills.length > 0
        ? payload.root.styles.fills
        : [{ type: "SOLID", color: { hex: payload.frame.background } }],
    },
  };

  applyStyles(targetFrame, rootLayer, context, { skipVisibility: true });
}

async function loadFonts(root) {
  const fontKeys = new Map();
  collectFonts(root, fontKeys);
  if (fontKeys.size === 0) fontKeys.set(fontKey(DEFAULT_FONT), DEFAULT_FONT);
  for (const fontName of fontKeys.values()) {
    await loadFont(fontName);
  }
}

function collectFonts(layer, fontKeys) {
  if (layer.type === "text" && layer.text?.fontName && layer.text.fontName !== "mixed") {
    fontKeys.set(fontKey(layer.text.fontName), layer.text.fontName);
  }

  for (const segment of layer.text?.segments || []) {
    if (segment.fontName && segment.fontName !== "mixed") {
      fontKeys.set(fontKey(segment.fontName), segment.fontName);
    }
  }

  for (const child of layer.children || []) {
    collectFonts(child, fontKeys);
  }
}

async function loadFont(fontName) {
  const safeFont = normalizeFontName(fontName);
  const key = fontKey(safeFont);
  if (!FONT_CACHE.has(key)) {
    FONT_CACHE.set(
      key,
      figma.loadFontAsync(safeFont)
        .then(() => safeFont)
        .catch(async () => {
          await figma.loadFontAsync(DEFAULT_FONT);
          return DEFAULT_FONT;
        }),
    );
  }

  return FONT_CACHE.get(key);
}

function fontKey(fontName) {
  return `${fontName.family}/${fontName.style}`;
}

function normalizeFontName(fontName) {
  if (!fontName || fontName === "mixed" || typeof fontName.family !== "string" || typeof fontName.style !== "string") {
    return DEFAULT_FONT;
  }
  return fontName;
}

async function createNodeFromLayer(layer, parentBounds, context) {
  let node;
  switch (layer.type) {
    case "container":
      node = await createFrameNode(layer, parentBounds, context);
      break;
    case "text":
      node = await createTextNode(layer, parentBounds, context);
      break;
    case "ellipse":
      node = createEllipseNode(layer, parentBounds, context);
      break;
    case "line":
      node = createLineNode(layer, parentBounds, context);
      break;
    case "vector":
      node = createVectorNode(layer, parentBounds, context);
      break;
    case "image":
      node = createImageNode(layer, parentBounds, context);
      break;
    case "shape":
    default:
      node = createRectangleNode(layer, parentBounds, context);
      break;
  }

  node.name = layer.name || defaultLayerName(layer);
  node.setPluginData(PLUGIN_DATA_KEY, PLUGIN_DATA_VALUE);
  node.setPluginData("buildUiLayerType", layer.type || "shape");
  if (typeof layer.locked === "boolean") {
    node.locked = layer.locked;
  } else if (typeof layer.figma?.locked === "boolean") {
    node.locked = layer.figma.locked;
  }
  return node;
}

async function createFrameNode(layer, parentBounds, context) {
  const frame = figma.createFrame();
  applyGeometry(frame, layer, parentBounds, context);
  frame.clipsContent = layer.clipsContent !== false;
  applyStyles(frame, layer, context);

  const renderedChildren = [];
  for (const childLayer of layer.children || []) {
    const childNode = await createNodeFromLayer(childLayer, layer.bounds, context);
    frame.appendChild(childNode);
    applyAutoLayoutChild(childNode, childLayer.autoLayoutChild, context);
    renderedChildren.push({ node: childNode, layer: childLayer });
    context.createdNodes.push(childNode);
  }

  applyLayoutIfSafe(frame, layer, renderedChildren, context);
  return frame;
}

function createRectangleNode(layer, parentBounds, context) {
  const rectangle = figma.createRectangle();
  applyGeometry(rectangle, layer, parentBounds, context);
  applyStyles(rectangle, layer, context);
  return rectangle;
}

function createEllipseNode(layer, parentBounds, context) {
  const ellipse = figma.createEllipse();
  applyGeometry(ellipse, layer, parentBounds, context);
  applyStyles(ellipse, layer, context);
  return ellipse;
}

function createLineNode(layer, parentBounds, context) {
  const line = figma.createRectangle();
  applyGeometry(line, layer, parentBounds, context);
  applyStyles(line, layer, context);
  return line;
}

async function createTextNode(layer, parentBounds, context) {
  const text = figma.createText();
  const textSpec = layer.text || {};
  const fontName = await loadFont(textSpec.fontName || DEFAULT_FONT);
  text.fontName = fontName;
  text.characters = textSpec.characters || "";
  text.fontSize = scaledNumber(textSpec.fontSize, context.scale, 14);
  text.lineHeight = toLineHeight(textSpec.lineHeight, context.scale) || {
    unit: "PIXELS",
    value: Math.round(text.fontSize * 1.2),
  };
  text.letterSpacing = toLetterSpacing(textSpec.letterSpacing, context.scale) || { unit: "PIXELS", value: 0 };
  text.textAlignHorizontal = isTextAlignHorizontal(textSpec.textAlignHorizontal) ? textSpec.textAlignHorizontal : "LEFT";
  text.textAlignVertical = isTextAlignVertical(textSpec.textAlignVertical) ? textSpec.textAlignVertical : "TOP";
  text.textAutoResize = "NONE";
  applyGeometry(text, layer, parentBounds, context);
  applyStyles(text, layer, context);
  await applyTextSegments(text, textSpec, context);
  return text;
}

async function applyTextSegments(text, textSpec, context) {
  if (!Array.isArray(textSpec.segments) || textSpec.segments.length === 0) return;

  for (const segment of textSpec.segments) {
    const start = Math.max(0, Math.min(text.characters.length, Math.floor(readNumber(segment.start) || 0)));
    const end = Math.max(start, Math.min(text.characters.length, Math.floor(readNumber(segment.end) || text.characters.length)));
    if (start === end) continue;

    const fontName = await loadFont(segment.fontName || textSpec.fontName || DEFAULT_FONT);
    text.setRangeFontName(start, end, fontName);

    if (readNumber(segment.fontSize) !== undefined) {
      text.setRangeFontSize(start, end, scaledNumber(segment.fontSize, context.scale, text.fontSize));
    }

    const lineHeight = toLineHeight(segment.lineHeight, context.scale);
    if (lineHeight) text.setRangeLineHeight(start, end, lineHeight);

    const letterSpacing = toLetterSpacing(segment.letterSpacing, context.scale);
    if (letterSpacing) text.setRangeLetterSpacing(start, end, letterSpacing);

    if (Array.isArray(segment.fills) && segment.fills.length > 0) {
      const fills = toFigmaPaints(segment.fills);
      if (fills.length > 0) text.setRangeFills(start, end, fills);
    }

    if (isTextDecoration(segment.textDecoration)) {
      text.setRangeTextDecoration(start, end, segment.textDecoration);
    }

    if (isTextCase(segment.textCase)) {
      text.setRangeTextCase(start, end, segment.textCase);
    }
  }
}

function createVectorNode(layer, parentBounds, context) {
  const asset = getAsset(layer, context.assetMap);
  const assetKind = String(asset?.kind || "").toLowerCase();
  const assetMime = String(asset?.mimeType || "").toLowerCase();
  const isSvgAsset = asset && (
    assetKind === "svg" ||
    assetMime.includes("svg") ||
    String(asset.content || "").trim().startsWith("<svg")
  );
  if (!isSvgAsset) {
    context.warnings.push(`Missing SVG asset for "${layer.name || "Vector"}"; created a placeholder.`);
    return createRectangleNode({ ...layer, type: "shape" }, parentBounds, context);
  }

  const node = figma.createNodeFromSvg(asset.content);
  applyGeometry(node, layer, parentBounds, context);
  applyStyles(node, layer, context);
  return node;
}

function createImageNode(layer, parentBounds, context) {
  const asset = getAsset(layer, context.assetMap);
  const assetKind = String(asset?.kind || "").toLowerCase();
  const assetMime = String(asset?.mimeType || "").toLowerCase();
  if (!asset || (assetKind !== "image" && !assetKind.includes("png") && !assetMime.includes("png"))) {
    context.warnings.push(`Missing image asset for "${layer.name || "Image"}"; created a placeholder.`);
    return createRectangleNode({ ...layer, type: "shape" }, parentBounds, context);
  }

  const rectangle = figma.createRectangle();
  applyGeometry(rectangle, layer, parentBounds, context);
  const image = figma.createImage(base64ToBytes(asset.content));
  rectangle.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: image.hash }];
  applyStyles(rectangle, layer, context, { keepImageFill: true });
  return rectangle;
}

function getAsset(layer, assetMap) {
  return layer.assetRef ? assetMap.get(layer.assetRef) : null;
}

function applyGeometry(node, layer, parentBounds, context) {
  const bounds = getLayerBounds(layer);
  node.x = round((bounds.x - parentBounds.x) * context.scale);
  node.y = round((bounds.y - parentBounds.y) * context.scale);
  resizeNode(node, Math.max(bounds.width * context.scale, 0.01), Math.max(bounds.height * context.scale, 0.01));

  const rotation = readNumber(layer.rotation) ?? readNumber(layer.figma?.layer?.rotation);
  if ("rotation" in node && rotation !== undefined) {
    node.rotation = rotation;
  }
}

function resizeNode(node, width, height) {
  if ("resizeWithoutConstraints" in node) {
    node.resizeWithoutConstraints(width, height);
  } else if ("resize" in node) {
    node.resize(width, height);
  }
}

function applyStyles(node, layer, context, options = {}) {
  const styles = layer.styles || {};

  if (!options.keepImageFill && "fills" in node) {
    node.fills = Array.isArray(styles.fills) ? toFigmaPaints(styles.fills) : [];
  }

  if ("strokes" in node && Array.isArray(styles.strokes)) {
    node.strokes = toFigmaPaints(styles.strokes);
  }

  if ("strokeWeight" in node && readNumber(styles.strokeWeight) !== undefined) {
    node.strokeWeight = Math.max(0, styles.strokeWeight * context.scale);
  }

  if ("strokeAlign" in node && isStrokeAlign(styles.strokeAlign)) {
    node.strokeAlign = styles.strokeAlign;
  }

  if ("dashPattern" in node && Array.isArray(styles.dashPattern)) {
    node.dashPattern = styles.dashPattern.filter((item) => typeof item === "number");
  }

  applyCornerStyles(node, styles, context.scale);

  if ("effects" in node && Array.isArray(styles.effects)) {
    node.effects = styles.effects.map((effect) => toFigmaEffect(effect, context.scale)).filter(Boolean);
  }

  if (readNumber(styles.opacity) !== undefined) {
    node.opacity = clamp(styles.opacity, 0, 1);
  }

  if (options.skipVisibility) {
    return;
  }

  if (typeof layer.visible === "boolean") {
    node.visible = layer.visible;
  } else if (typeof layer.figma?.visible === "boolean") {
    node.visible = layer.figma.visible;
  }
}

function applyCornerStyles(node, styles, scale) {
  if ("cornerRadius" in node && readNumber(styles.cornerRadius) !== undefined) {
    node.cornerRadius = Math.max(0, styles.cornerRadius * scale);
  }

  const radii = styles.cornerRadii;
  if (radii && "topLeftRadius" in node) {
    node.topLeftRadius = scaledNumber(radii.topLeft, scale, node.topLeftRadius || 0);
    node.topRightRadius = scaledNumber(radii.topRight, scale, node.topRightRadius || 0);
    node.bottomRightRadius = scaledNumber(radii.bottomRight, scale, node.bottomRightRadius || 0);
    node.bottomLeftRadius = scaledNumber(radii.bottomLeft, scale, node.bottomLeftRadius || 0);
  }
}

function applyLayoutIfSafe(node, layer, renderedChildren, context) {
  if (context.layoutMode === "pixel" || !layer.layout || !("layoutMode" in node)) return;
  if (context.layoutMode === "smart" && !shouldApplyLayout(layer, renderedChildren)) return;
  applyLayout(node, layer.layout, context.scale);
}

function applyLayout(node, layout, scale) {
  if (!isAutoLayoutDirection(layout.mode)) return;
  node.layoutMode = layout.mode;
  const padding = layout.padding || {};
  node.paddingTop = scaledNumber(padding.top, scale, 0);
  node.paddingRight = scaledNumber(padding.right, scale, 0);
  node.paddingBottom = scaledNumber(padding.bottom, scale, 0);
  node.paddingLeft = scaledNumber(padding.left, scale, 0);
  node.itemSpacing = scaledNumber(layout.gap, scale, 0);
  node.primaryAxisSizingMode = layout.primaryAxisSizingMode === "AUTO" ? "AUTO" : "FIXED";
  node.counterAxisSizingMode = layout.counterAxisSizingMode === "AUTO" ? "AUTO" : "FIXED";
  if (isPrimaryAxisAlign(layout.primaryAxisAlignItems)) node.primaryAxisAlignItems = layout.primaryAxisAlignItems;
  if (isCounterAxisAlign(layout.counterAxisAlignItems)) node.counterAxisAlignItems = layout.counterAxisAlignItems;
}

function shouldApplyLayout(parentLayer, renderedChildren) {
  const layout = parentLayer.layout || {};
  const mode = layout.mode;
  if (!isAutoLayoutDirection(mode)) return false;

  const autoChildren = renderedChildren.filter(({ layer }) => layer.autoLayoutChild?.layoutPositioning !== "ABSOLUTE");
  if (autoChildren.length === 0) return false;
  if (autoChildren.length === 1) return true;

  const boundsList = autoChildren.map(({ layer }) => getLayerBounds(layer));
  if (hasMeaningfulOverlap(boundsList)) return false;

  const sorted = [...boundsList].sort((a, b) => (mode === "VERTICAL" ? a.y - b.y : a.x - b.x));
  const gaps = [];
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    const gap = mode === "VERTICAL"
      ? current.y - (previous.y + previous.height)
      : current.x - (previous.x + previous.width);
    gaps.push(gap);
  }

  const expectedGap = readNumber(layout.gap) || 0;
  if (gaps.some((gap) => Math.abs(gap - expectedGap) > 3)) return false;

  const parentBounds = getLayerBounds(parentLayer);
  const padding = layout.padding || {};
  const expectedLeading = mode === "VERTICAL" ? readNumber(padding.left) || 0 : readNumber(padding.top) || 0;
  const leadingOffsets = sorted.map((bounds) => (mode === "VERTICAL" ? bounds.x - parentBounds.x : bounds.y - parentBounds.y));
  return Math.max(...leadingOffsets) - Math.min(...leadingOffsets) <= 3 ||
    leadingOffsets.every((offset) => Math.abs(offset - expectedLeading) <= 3);
}

function applyAutoLayoutChild(node, autoLayoutChild, context) {
  if (context.layoutMode === "pixel" || !autoLayoutChild) return;

  if ("layoutPositioning" in node && (autoLayoutChild.layoutPositioning === "AUTO" || autoLayoutChild.layoutPositioning === "ABSOLUTE")) {
    node.layoutPositioning = autoLayoutChild.layoutPositioning;
  }

  if ("layoutGrow" in node && readNumber(autoLayoutChild.layoutGrow) !== undefined) {
    node.layoutGrow = autoLayoutChild.layoutGrow;
  }

  if ("layoutAlign" in node && isLayoutAlign(autoLayoutChild.layoutAlign)) {
    node.layoutAlign = autoLayoutChild.layoutAlign;
  }
}

async function extractSelection(message) {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    throw new Error("Select a frame, component, group, or layer before extracting.");
  }

  const options = normalizeExtractOptions(message);
  const rootBounds = getCombinedBounds(selection) || createFallbackBounds();
  const context = {
    options,
    rootBounds,
    assets: [],
    warnings: [],
    exportedAssetCount: 0,
    assetLimitWarningShown: false,
  };

  figma.ui.postMessage({ type: "status", message: "Extracting selected Figma layers..." });

  const visibleSelection = selection.filter((node) => options.includeHidden || node.visible);
  if (visibleSelection.length === 0) {
    throw new Error("The selection only contains hidden layers. Enable Include hidden layers to export them.");
  }

  let root;
  if (visibleSelection.length === 1) {
    const selectedRoot = await serializeNode(visibleSelection[0], context, 0);
    if (!selectedRoot) {
      throw new Error("The selected layer could not be serialized.");
    }
    root = shouldUseLayerAsRoot(selectedRoot) ? selectedRoot : createScreenRoot(rootBounds, [selectedRoot]);
  } else {
    root = createScreenRoot(rootBounds, [], "Selection");

    for (const node of visibleSelection) {
      const child = await serializeNode(node, context, 0);
      if (!child) continue;
      child.autoLayoutChild = { layoutPositioning: "ABSOLUTE" };
      root.children.push(child);
    }
  }

  root.bounds = {
    x: 0,
    y: 0,
    width: round(rootBounds.width),
    height: round(rootBounds.height),
  };
  root.type = "container";
  root.name = root.name || "Screen";
  root.layout = root.layout || createFixedRootLayout();
  root.children = root.children || [];

  const background = getExportFrameBackground(root);
  if (!root.styles) root.styles = {};
  if (!Array.isArray(root.styles.fills) || root.styles.fills.length === 0) {
    root.styles.fills = [{ type: "SOLID", color: { hex: background } }];
  }

  for (const child of root.children) {
    child.autoLayoutChild = child.autoLayoutChild || { layoutPositioning: "ABSOLUTE" };
  }

  const payload = {
    schema: SCHEMA,
    generatedAt: new Date().toISOString(),
    source: {
      pluginName: "Component-E Build UI Bridge",
      pageName: figma.currentPage.name,
      selectionCount: selection.length,
      extractionMode: selection.length === 1 ? "single-selection" : "multi-selection",
    },
    frame: {
      width: round(rootBounds.width),
      height: round(rootBounds.height),
      background,
    },
    root,
    components: createComponentCompanions(root),
    variantSets: collectVariantSetCompanions(root),
    exports: await exportSelectionSnapshots(visibleSelection, context),
    assets: context.assets,
    warnings: context.warnings,
  };

  const json = JSON.stringify(payload, null, 2);
  figma.ui.postMessage({
    type: "extract-result",
    json,
    summary: {
      nodes: countNodes(root),
      assets: context.assets.length,
      bytes: json.length,
      warnings: context.warnings.length,
      name: root.name,
    },
  });
  figma.notify(`Extracted ${countNodes(root)} nodes and ${context.assets.length} assets.`);
}

function shouldUseLayerAsRoot(layer) {
  return layer.type === "container" && Array.isArray(layer.children) && layer.children.length > 0;
}

function createScreenRoot(rootBounds, children = [], name = "Screen") {
  return {
    type: "container",
    name,
    bounds: { x: 0, y: 0, width: round(rootBounds.width), height: round(rootBounds.height) },
    layout: createFixedRootLayout(),
    styles: { fills: [] },
    children,
  };
}

function createComponentCompanions(root) {
  const componentRoots = shouldUseLayerAsRoot(root) && root.name !== "Selection"
    ? [root]
    : (root.children || []).filter((child) => child.type === "container" || child.figma?.component);

  return componentRoots.map((componentRoot) => ({
    componentName: toPascalCase(componentRoot.name || "Component"),
    frame: {
      width: round(componentRoot.bounds?.width || root.bounds.width),
      height: round(componentRoot.bounds?.height || root.bounds.height),
      background: componentRoot.styles?.fills?.[0]?.color?.hex || root.styles?.fills?.[0]?.color?.hex || DEFAULT_FRAME.background,
    },
    root: componentRoot,
    implementationHint: "Use this entry when mapping the selected Figma layer as an editable component; root remains build-ui.screen.v1-compatible.",
  }));
}

function collectVariantSetCompanions(root) {
  const variantSets = [];

  function visit(layer) {
    const component = layer.figma?.component;
    const variantChildren = (layer.children || []).filter((child) => child.figma?.component?.variantProperties);

    if ((component?.kind === "componentSet" || variantChildren.length > 1) && variantChildren.length > 0) {
      const variantPropertyNames = Array.from(new Set(
        variantChildren.flatMap((child) => Object.keys(child.figma?.component?.variantProperties || {})),
      ));
      variantSets.push({
        id: layer.figma?.id,
        key: component?.key,
        name: layer.name,
        variantPropertyNames,
        variants: variantChildren.map((child) => ({
          id: child.figma?.id,
          key: child.figma?.component?.key,
          name: child.name,
          variantProperties: child.figma?.component?.variantProperties || {},
          bounds: child.bounds,
          node: child,
        })),
      });
    }

    for (const child of layer.children || []) visit(child);
  }

  visit(root);
  return variantSets;
}

function normalizeExtractOptions(message) {
  const raw = message.options || message;
  return {
    includeSvgAssets: raw.includeSvgAssets !== false,
    includeImageAssets: raw.includeImageAssets !== false,
    includePngSnapshot: raw.includePngSnapshot === true,
    includeHidden: raw.includeHidden === true,
    maxDepth: clamp(readNumber(raw.maxDepth) || 24, 1, 80),
    assetLimit: clamp(readNumber(raw.assetLimit) || 120, 0, 300),
  };
}

async function serializeNode(node, context, depth) {
  if (!context.options.includeHidden && !node.visible) return null;
  const bounds = serializeBounds(node.absoluteBoundingBox, context.rootBounds);
  const type = await inferExportLayerType(node, context);
  const layer = {
    type,
    name: cleanLayerName(node.name, type),
    bounds,
  };

  if (node.visible === false) layer.visible = false;

  const layout = serializeLayout(node);
  if (layout) layer.layout = layout;

  const autoLayoutChild = serializeAutoLayoutChild(node);
  if (autoLayoutChild) layer.autoLayoutChild = autoLayoutChild;

  const styles = serializeStyles(node, type);
  if (Object.keys(styles).length > 0) layer.styles = styles;

  if (node.type === "TEXT") {
    layer.text = serializeText(node);
  }

  const figmaMeta = serializeFigmaMetadata(node);
  if (Object.keys(figmaMeta).length > 0) layer.figma = figmaMeta;

  const assetRef = await maybeExportLayerAsset(node, type, context);
  if (assetRef) layer.assetRef = assetRef;

  if (hasChildren(node) && depth < context.options.maxDepth) {
    const children = [];
    for (const child of node.children) {
      const childLayer = await serializeNode(child, context, depth + 1);
      if (childLayer) children.push(childLayer);
    }
    if (children.length > 0) layer.children = children;
  } else if (hasChildren(node) && depth >= context.options.maxDepth) {
    context.warnings.push(`Max depth reached at "${node.name}".`);
    layer.childrenTruncated = true;
  }

  return layer;
}

async function inferExportLayerType(node, context) {
  if (node.type === "TEXT") return "text";
  if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "COMPONENT_SET" || node.type === "INSTANCE" || node.type === "GROUP" || node.type === "SECTION") {
    return "container";
  }
  if (node.type === "ELLIPSE") return "ellipse";
  if (node.type === "LINE") return "line";
  if (node.type === "RECTANGLE" && getImagePaint(node) && context.options.includeImageAssets) return "image";
  if (node.type === "VECTOR" || node.type === "BOOLEAN_OPERATION" || node.type === "POLYGON" || node.type === "STAR") return "vector";
  return "shape";
}

function serializeBounds(bounds, rootBounds) {
  if (!bounds) return { x: 0, y: 0, width: 1, height: 1 };
  return {
    x: round(bounds.x - rootBounds.x),
    y: round(bounds.y - rootBounds.y),
    width: round(bounds.width),
    height: round(bounds.height),
  };
}

function serializeLayout(node) {
  if (!("layoutMode" in node) || !isAutoLayoutDirection(node.layoutMode)) return null;
  return {
    mode: node.layoutMode,
    padding: {
      top: round(node.paddingTop || 0),
      right: round(node.paddingRight || 0),
      bottom: round(node.paddingBottom || 0),
      left: round(node.paddingLeft || 0),
    },
    gap: round(node.itemSpacing || 0),
    primaryAxisSizingMode: node.primaryAxisSizingMode === "AUTO" ? "AUTO" : "FIXED",
    counterAxisSizingMode: node.counterAxisSizingMode === "AUTO" ? "AUTO" : "FIXED",
    primaryAxisAlignItems: node.primaryAxisAlignItems || "MIN",
    counterAxisAlignItems: node.counterAxisAlignItems || "MIN",
    clipsContent: "clipsContent" in node ? node.clipsContent : undefined,
  };
}

function serializeAutoLayoutChild(node) {
  if (!("layoutPositioning" in node)) return null;
  return {
    layoutPositioning: node.layoutPositioning,
    layoutGrow: "layoutGrow" in node ? node.layoutGrow : 0,
    layoutAlign: "layoutAlign" in node ? node.layoutAlign : "INHERIT",
  };
}

function serializeStyles(node, layerType) {
  const styles = {};

  if ("fills" in node && node.fills !== figma.mixed && layerType !== "image") {
    const fills = node.fills.map(serializePaint).filter(Boolean);
    if (fills.length > 0) styles.fills = fills;
  }

  if ("strokes" in node && node.strokes !== figma.mixed) {
    const strokes = node.strokes.map(serializePaint).filter(Boolean);
    if (strokes.length > 0) styles.strokes = strokes;
  }

  if ("strokeWeight" in node && node.strokeWeight !== figma.mixed) styles.strokeWeight = round(node.strokeWeight || 0);
  if ("strokeAlign" in node) styles.strokeAlign = node.strokeAlign;
  if ("dashPattern" in node && node.dashPattern.length > 0) styles.dashPattern = [...node.dashPattern];

  if ("cornerRadius" in node && node.cornerRadius !== figma.mixed) styles.cornerRadius = round(node.cornerRadius || 0);
  if ("topLeftRadius" in node) {
    styles.cornerRadii = {
      topLeft: round(node.topLeftRadius || 0),
      topRight: round(node.topRightRadius || 0),
      bottomRight: round(node.bottomRightRadius || 0),
      bottomLeft: round(node.bottomLeftRadius || 0),
    };
  }

  if ("effects" in node && node.effects.length > 0) {
    styles.effects = node.effects.map(serializeEffect).filter(Boolean);
  }

  if ("opacity" in node && node.opacity !== 1) styles.opacity = round(node.opacity);
  const styleRefs = serializeStyleRefs(node);
  if (Object.keys(styleRefs).length > 0) styles.styleRefs = styleRefs;
  return styles;
}

function serializeStyleRefs(node) {
  const refs = {};
  if ("fillStyleId" in node && node.fillStyleId !== figma.mixed && node.fillStyleId) refs.fillStyleId = node.fillStyleId;
  if ("strokeStyleId" in node && node.strokeStyleId !== figma.mixed && node.strokeStyleId) refs.strokeStyleId = node.strokeStyleId;
  if ("effectStyleId" in node && node.effectStyleId !== figma.mixed && node.effectStyleId) refs.effectStyleId = node.effectStyleId;
  if (node.type === "TEXT" && node.textStyleId !== figma.mixed && node.textStyleId) refs.textStyleId = node.textStyleId;
  return refs;
}

function serializeText(node) {
  const fontName = node.fontName === figma.mixed ? DEFAULT_FONT : node.fontName;
  const fontSize = node.fontSize === figma.mixed ? 14 : node.fontSize;
  const text = {
    characters: node.characters,
    fontName,
    fontSize: round(fontSize),
    lineHeight: serializeLineHeight(node.lineHeight),
    letterSpacing: serializeLetterSpacing(node.letterSpacing),
    textAlignHorizontal: node.textAlignHorizontal,
    textAlignVertical: node.textAlignVertical,
    textAutoResize: node.textAutoResize,
  };

  if (node.textAutoResize !== "WIDTH_AND_HEIGHT" && node.textAutoResize !== "WIDTH_ONLY") {
    text.allowWrap = true;
  }

  try {
    const segments = node.getStyledTextSegments([
      "fontName",
      "fontSize",
      "fontWeight",
      "fills",
      "lineHeight",
      "letterSpacing",
      "textDecoration",
      "textCase",
    ]);
    if (segments.length > 1) {
      text.segments = segments.map((segment) => ({
        start: segment.start,
        end: segment.end,
        characters: segment.characters,
        fontName: segment.fontName,
        fontSize: round(segment.fontSize),
        fontWeight: segment.fontWeight,
        fills: segment.fills.map(serializePaint).filter(Boolean),
        lineHeight: serializeLineHeight(segment.lineHeight),
        letterSpacing: serializeLetterSpacing(segment.letterSpacing),
        textDecoration: segment.textDecoration,
        textCase: segment.textCase,
      }));
    }
  } catch (_error) {
    // Styled segments are optional; mixed fonts should not block export.
  }

  return text;
}

function serializeFigmaMetadata(node) {
  const meta = {
    id: node.id,
    type: node.type,
    visible: node.visible,
    locked: node.locked,
  };

  if ("constraints" in node) meta.constraints = node.constraints;
  if ("layoutSizingHorizontal" in node) {
    meta.layer = {
      x: round(node.x || 0),
      y: round(node.y || 0),
      width: round(node.width || 0),
      height: round(node.height || 0),
      rotation: round(node.rotation || 0),
      layoutSizingHorizontal: node.layoutSizingHorizontal,
      layoutSizingVertical: node.layoutSizingVertical,
    };
  }
  if ("boundVariables" in node && node.boundVariables) meta.boundVariables = node.boundVariables;
  if (node.type === "COMPONENT") {
    meta.component = {
      kind: "component",
      key: node.key,
      variantProperties: node.variantProperties,
      componentPropertyDefinitions: node.componentPropertyDefinitions,
    };
  }
  if (node.type === "COMPONENT_SET") {
    meta.component = {
      kind: "componentSet",
      key: node.key,
      componentPropertyDefinitions: node.componentPropertyDefinitions,
    };
  }
  if (node.type === "INSTANCE") {
    meta.component = {
      kind: "instance",
      scaleFactor: node.scaleFactor,
      variantProperties: node.variantProperties,
      componentProperties: node.componentProperties,
    };
  }
  return meta;
}

async function maybeExportLayerAsset(node, layerType, context) {
  if (context.exportedAssetCount >= context.options.assetLimit) {
    if (!context.assetLimitWarningShown) {
      context.warnings.push(`Asset export limit reached (${context.options.assetLimit}). Increase the limit to include more assets.`);
      context.assetLimitWarningShown = true;
    }
    return null;
  }

  if (layerType === "image") {
    return await exportImageAsset(node, context);
  }

  if (layerType === "vector" && context.options.includeSvgAssets) {
    return await exportSvgAsset(node, context);
  }

  return null;
}

async function exportSelectionSnapshots(selection, context) {
  const exports = {
    rootPng2xAssetRefs: [],
  };

  if (!context.options.includePngSnapshot) return exports;

  for (const node of selection) {
    if (!context.options.includeHidden && !node.visible) continue;
    if (context.exportedAssetCount >= context.options.assetLimit) {
      if (!context.assetLimitWarningShown) {
        context.warnings.push(`Asset export limit reached (${context.options.assetLimit}). Increase the limit to include more assets.`);
        context.assetLimitWarningShown = true;
      }
      break;
    }

    const ref = await exportPngSnapshotAsset(node, context);
    if (ref) exports.rootPng2xAssetRefs.push(ref);
  }

  return exports;
}

async function exportSvgAsset(node, context) {
  try {
    const svg = await node.exportAsync({
      format: "SVG_STRING",
      svgOutlineText: false,
      svgIdAttribute: true,
      svgSimplifyStroke: true,
    });
    const id = createAssetId(node, "svg", context.assets.length);
    context.assets.push({
      id,
      kind: "svg",
      mimeType: "image/svg+xml",
      encoding: "plain",
      content: svg,
      nodeId: node.id,
      nodeName: node.name,
      byteLength: svg.length,
    });
    context.exportedAssetCount += 1;
    return id;
  } catch (error) {
    context.warnings.push(`Could not export SVG for "${node.name}": ${getErrorMessage(error)}`);
    return null;
  }
}

async function exportPngSnapshotAsset(node, context) {
  try {
    const bytes = await node.exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: 2 },
      useAbsoluteBounds: true,
    });
    const id = createAssetId(node, "png2x", context.assets.length);
    context.assets.push({
      id,
      kind: "png2x",
      mimeType: "image/png",
      encoding: "base64",
      content: bytesToBase64(bytes),
      nodeId: node.id,
      nodeName: node.name,
      byteLength: bytes.length,
    });
    context.exportedAssetCount += 1;
    return id;
  } catch (error) {
    context.warnings.push(`Could not export PNG snapshot for "${node.name}": ${getErrorMessage(error)}`);
    return null;
  }
}

async function exportImageAsset(node, context) {
  const paint = getImagePaint(node);
  if (!paint || !paint.imageHash) return null;

  try {
    const image = figma.getImageByHash(paint.imageHash);
    if (!image) return null;
    const bytes = await image.getBytesAsync();
    const id = createAssetId(node, "image", context.assets.length);
    context.assets.push({
      id,
      kind: "image",
      mimeType: "image/png",
      encoding: "base64",
      content: bytesToBase64(bytes),
      nodeId: node.id,
      nodeName: node.name,
      byteLength: bytes.length,
    });
    context.exportedAssetCount += 1;
    return id;
  } catch (error) {
    context.warnings.push(`Could not export image for "${node.name}": ${getErrorMessage(error)}`);
    return null;
  }
}

function getImagePaint(node) {
  if (!("fills" in node) || node.fills === figma.mixed) return null;
  return node.fills.find((paint) => paint.type === "IMAGE") || null;
}

function getExportFrameBackground(root) {
  const fill = root.styles?.fills?.[0]?.color?.hex;
  if (fill && !DARK_SHELL_HEXES.has(fill)) return fill;

  const dominant = findDominantFill(root);
  return dominant || fill || DEFAULT_FRAME.background;
}

function findDominantFill(root) {
  const rootArea = Math.max(1, root.bounds.width * root.bounds.height);
  const candidates = [];
  function visit(layer) {
    const fill = layer.styles?.fills?.[0]?.color?.hex;
    if (fill && !DARK_SHELL_HEXES.has(fill)) {
      const area = layer.bounds.width * layer.bounds.height;
      if (area / rootArea > 0.25) candidates.push({ fill, area });
    }
    for (const child of layer.children || []) visit(child);
  }
  visit(root);
  candidates.sort((a, b) => b.area - a.area);
  return candidates[0]?.fill || null;
}

function toFigmaPaints(paints) {
  return paints.map(toFigmaPaint).filter(Boolean);
}

function toFigmaPaint(paint) {
  if (!paint) return null;
  if (!paint.type || paint.type === "SOLID") {
    return {
      type: "SOLID",
      color: paintColorToRgb(paint.color || paint),
      opacity: paint.opacity ?? paint.color?.rgba?.a ?? 1,
      visible: paint.visible !== false,
      blendMode: isBlendMode(paint.blendMode) ? paint.blendMode : "NORMAL",
    };
  }

  if (String(paint.type).startsWith("GRADIENT_") && Array.isArray(paint.gradientStops)) {
    return {
      type: paint.type,
      gradientStops: paint.gradientStops.map((stop) => ({
        position: readNumber(stop.position) || 0,
        color: colorToRgba(stop.color),
      })),
      gradientTransform: Array.isArray(paint.gradientTransform)
        ? paint.gradientTransform
        : [
          [1, 0, 0],
          [0, 1, 0],
        ],
      opacity: paint.opacity ?? 1,
      visible: paint.visible !== false,
      blendMode: isBlendMode(paint.blendMode) ? paint.blendMode : "NORMAL",
    };
  }

  return null;
}

function serializePaint(paint) {
  if (!paint || paint.visible === false) return null;
  const base = {
    type: paint.type,
    visible: paint.visible !== false,
    opacity: paint.opacity ?? 1,
    blendMode: paint.blendMode || "NORMAL",
  };

  if (paint.type === "SOLID") {
    return { ...base, color: serializeColor(paint.color, paint.opacity) };
  }

  if (String(paint.type).startsWith("GRADIENT_")) {
    return {
      ...base,
      gradientStops: paint.gradientStops.map((stop) => ({
        position: round(stop.position),
        color: serializeColor(stop.color),
      })),
      gradientTransform: paint.gradientTransform.map((row) => row.map(round)),
    };
  }

  return null;
}

function toFigmaEffect(effect, scale) {
  if (!effect || !effect.type) return null;
  if (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") {
    const rgba = colorToRgba(effect.color);
    return {
      type: effect.type,
      color: rgba,
      offset: {
        x: scaledNumber(effect.offset?.x, scale, 0),
        y: scaledNumber(effect.offset?.y, scale, 0),
      },
      radius: scaledNumber(effect.radius, scale, 0),
      spread: scaledNumber(effect.spread, scale, 0),
      visible: effect.visible !== false,
      blendMode: isBlendMode(effect.blendMode) ? effect.blendMode : "NORMAL",
    };
  }

  if (effect.type === "LAYER_BLUR" || effect.type === "BACKGROUND_BLUR") {
    return {
      type: effect.type,
      radius: scaledNumber(effect.radius, scale, 0),
      visible: effect.visible !== false,
      blurType: "NORMAL",
    };
  }

  return null;
}

function serializeEffect(effect) {
  if (!effect || effect.visible === false) return null;
  if (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") {
    return {
      type: effect.type,
      color: { rgba: effect.color },
      offset: { x: round(effect.offset.x), y: round(effect.offset.y) },
      radius: round(effect.radius),
      spread: round(effect.spread || 0),
      visible: effect.visible,
      blendMode: effect.blendMode || "NORMAL",
    };
  }
  if (effect.type === "LAYER_BLUR" || effect.type === "BACKGROUND_BLUR") {
    return { type: effect.type, radius: round(effect.radius), visible: effect.visible };
  }
  return null;
}

function paintColorToRgb(color) {
  const rgba = colorToRgba(color);
  return { r: rgba.r, g: rgba.g, b: rgba.b };
}

function colorToRgba(value) {
  if (!value) return { r: 0, g: 0, b: 0, a: 1 };
  if (typeof value === "string") return parseColorString(value) || { r: 0, g: 0, b: 0, a: 1 };
  if (value.hex) return parseColorString(value.hex) || { r: 0, g: 0, b: 0, a: 1 };
  if (value.rgba) return normalizeRgba(value.rgba);
  if (value.color) return colorToRgba(value.color);
  return normalizeRgba(value);
}

function normalizeRgba(value) {
  const r = readNumber(value.r) || 0;
  const g = readNumber(value.g) || 0;
  const b = readNumber(value.b) || 0;
  const a = readNumber(value.a) ?? 1;
  const needsNormalize = r > 1 || g > 1 || b > 1;
  return {
    r: clamp(needsNormalize ? r / 255 : r, 0, 1),
    g: clamp(needsNormalize ? g / 255 : g, 0, 1),
    b: clamp(needsNormalize ? b / 255 : b, 0, 1),
    a: clamp(a, 0, 1),
  };
}

function parseColorString(value) {
  const input = value.trim();
  const hex = input.match(/^#?([a-f0-9]{3}|[a-f0-9]{6}|[a-f0-9]{8})$/i);
  if (hex) {
    const raw = hex[1].length === 3
      ? hex[1].split("").map((char) => `${char}${char}`).join("")
      : hex[1];
    return {
      r: parseInt(raw.slice(0, 2), 16) / 255,
      g: parseInt(raw.slice(2, 4), 16) / 255,
      b: parseInt(raw.slice(4, 6), 16) / 255,
      a: raw.length === 8 ? parseInt(raw.slice(6, 8), 16) / 255 : 1,
    };
  }
  return null;
}

function serializeColor(color, opacity) {
  const alpha = "a" in color ? color.a : opacity ?? 1;
  return {
    hex: rgbToHex(color),
    rgba: { r: round(color.r), g: round(color.g), b: round(color.b), a: round(alpha) },
  };
}

function rgbToHex(color) {
  return `#${[color.r, color.g, color.b].map((channel) => (
    Math.round(clamp(channel, 0, 1) * 255).toString(16).padStart(2, "0")
  )).join("")}`.toUpperCase();
}

function getLayerBounds(layer) {
  const bounds = layer.bounds || {};
  return {
    x: readNumber(bounds.x) || 0,
    y: readNumber(bounds.y) || 0,
    width: Math.max(0.01, readNumber(bounds.width) || 1),
    height: Math.max(0.01, readNumber(bounds.height) || 1),
  };
}

function getCombinedBounds(nodes) {
  const bounds = nodes.map((node) => node.absoluteBoundingBox).filter(Boolean);
  if (bounds.length === 0) return null;
  const minX = Math.min(...bounds.map((bound) => bound.x));
  const minY = Math.min(...bounds.map((bound) => bound.y));
  const maxX = Math.max(...bounds.map((bound) => bound.x + bound.width));
  const maxY = Math.max(...bounds.map((bound) => bound.y + bound.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function createFallbackBounds() {
  return { x: figma.viewport.center.x, y: figma.viewport.center.y, width: DEFAULT_FRAME.width, height: DEFAULT_FRAME.height };
}

function createFixedRootLayout() {
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

function hasMeaningfulOverlap(boundsList) {
  for (let first = 0; first < boundsList.length; first += 1) {
    for (let second = first + 1; second < boundsList.length; second += 1) {
      const a = boundsList[first];
      const b = boundsList[second];
      const overlapWidth = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
      const overlapHeight = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
      const overlapArea = overlapWidth * overlapHeight;
      const smallerArea = Math.min(a.width * a.height, b.width * b.height);
      if (smallerArea > 0 && overlapArea / smallerArea > 0.12) return true;
    }
  }
  return false;
}

function serializeLineHeight(lineHeight) {
  if (!lineHeight || lineHeight === figma.mixed) return { unit: "AUTO" };
  if (lineHeight.unit === "AUTO") return { unit: "AUTO" };
  return { unit: lineHeight.unit, value: round(lineHeight.value) };
}

function serializeLetterSpacing(letterSpacing) {
  if (!letterSpacing || letterSpacing === figma.mixed) return { unit: "PIXELS", value: 0 };
  return { unit: letterSpacing.unit, value: round(letterSpacing.value) };
}

function toLineHeight(value, scale) {
  if (!value || typeof value !== "object") return null;
  if (value.unit === "AUTO") return { unit: "AUTO" };
  if (readNumber(value.value) === undefined) return null;
  if (value.unit === "PERCENT") return { unit: "PERCENT", value: value.value };
  return { unit: "PIXELS", value: Math.max(1, round(value.value * scale)) };
}

function toLetterSpacing(value, scale) {
  if (!value || typeof value !== "object" || readNumber(value.value) === undefined) return null;
  if (value.unit === "PERCENT") return { unit: "PERCENT", value: value.value };
  return { unit: "PIXELS", value: round(value.value * scale) };
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 8192;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(base64) {
  const normalized = base64.replace(/^data:[^,]+,/, "").replace(/\s/g, "");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function countNodes(root) {
  let count = 0;
  function visit(layer) {
    if (!layer) return;
    count += 1;
    for (const child of layer.children || []) visit(child);
  }
  visit(root);
  return count;
}

function createAssetId(node, kind, index) {
  return `${kind}-${sanitizeName(node.name)}-${index + 1}`;
}

function sanitizeName(value) {
  return String(value || "layer").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "layer";
}

function toPascalCase(value) {
  const words = String(value || "Component").match(/[a-z0-9]+/gi) || ["Component"];
  return words.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join("");
}

function cleanLayerName(name, type) {
  const cleaned = String(name || "").trim();
  if (cleaned && !/^(group|shape|text|image|vector):[a-z0-9-]+$/i.test(cleaned)) return cleaned.slice(0, 80);
  return defaultLayerName({ type });
}

function defaultLayerName(layer) {
  const type = layer.type || "shape";
  if (type === "container") return "Frame";
  if (type === "text") return "Text";
  if (type === "ellipse") return "Ellipse";
  if (type === "line") return "Line";
  if (type === "vector") return "Vector";
  if (type === "image") return "Image";
  return "Shape";
}

function hasChildren(node) {
  return "children" in node;
}

function readNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function scaledNumber(value, scale, fallback) {
  const number = readNumber(value);
  return typeof number === "number" ? Math.max(0, round(number * scale)) : fallback;
}

function isAutoLayoutDirection(value) {
  return value === "VERTICAL" || value === "HORIZONTAL";
}

function isPrimaryAxisAlign(value) {
  return value === "MIN" || value === "CENTER" || value === "MAX" || value === "SPACE_BETWEEN";
}

function isCounterAxisAlign(value) {
  return value === "MIN" || value === "CENTER" || value === "MAX" || value === "BASELINE";
}

function isLayoutAlign(value) {
  return value === "MIN" || value === "CENTER" || value === "MAX" || value === "STRETCH" || value === "INHERIT";
}

function isStrokeAlign(value) {
  return value === "CENTER" || value === "INSIDE" || value === "OUTSIDE";
}

function isTextAlignHorizontal(value) {
  return value === "LEFT" || value === "CENTER" || value === "RIGHT" || value === "JUSTIFIED";
}

function isTextAlignVertical(value) {
  return value === "TOP" || value === "CENTER" || value === "BOTTOM";
}

function isTextDecoration(value) {
  return value === "NONE" || value === "UNDERLINE" || value === "STRIKETHROUGH";
}

function isTextCase(value) {
  return value === "ORIGINAL" || value === "UPPER" || value === "LOWER" || value === "TITLE" || value === "SMALL_CAPS" || value === "SMALL_CAPS_FORCED";
}

function isBlendMode(value) {
  return typeof value === "string";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
