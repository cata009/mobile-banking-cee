import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Internal verification mode: bypass ignored compiled output and audit tracked TypeScript.
const sourceOnly = process.argv.includes("--source-only");

const plugins = [
  {
    label: "UniCredit Build UI Bridge",
    base: "figma-plugins/screen-json-importer",
    expectedName: "UniCredit Build UI Bridge",
    expectedId: "unicredit-build-ui-bridge",
  },
  {
    label: "Component-E Build UI Bridge",
    base: "screenshots/FIgma plugins/Component-E",
    expectedName: "Component-E Build UI Bridge",
    expectedId: "1643718617298515557",
  },
];

const romanianUiPattern = /\b(selecteaza|extrag|eroare|copiat|gata|json-ul|ruleaza|dupa|inainte|romana|romaneste)\b/i;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readText(path) {
  return fs.readFileSync(path, "utf8");
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function readFixtureJson(plugin, fileName) {
  return readJson(`${plugin.base}/smoke-fixtures/${fileName}`);
}

function loadPluginCode(plugin) {
  const compiledPath = `${plugin.base}/code.js`;
  if (!sourceOnly && fs.existsSync(compiledPath)) {
    return { code: readText(compiledPath), codeSource: "javascript" };
  }

  const sourcePath = `${plugin.base}/code.ts`;
  if (!fs.existsSync(sourcePath)) {
    return { code: readText(compiledPath), codeSource: "javascript" };
  }

  return {
    code: ts.transpileModule(readText(sourcePath), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.None,
      },
      fileName: sourcePath,
    }).outputText,
    codeSource: "typescript",
  };
}

function auditStatic(plugin) {
  const { code, codeSource } = loadPluginCode(plugin);
  const ui = readText(`${plugin.base}/ui.html`);
  const manifest = readJson(`${plugin.base}/manifest.json`);

  const checks = [
    ["manifest name", manifest.name === plugin.expectedName],
    ["manifest id", manifest.id === plugin.expectedId],
    ["manifest no network", manifest.networkAccess?.allowedDomains?.[0] === "none"],
    ["dynamic page access", manifest.documentAccess === "dynamic-page"],
    ["build route", code.includes('message.type === "build-ui"')],
    ["legacy import route", code.includes('message.type === "import-screen-json"')],
    ["extract route", code.includes('message.type === "extract-selection"')],
    ["schema contract", code.includes("build-ui.screen.v1")],
    ["legacy normalizer", code.includes("function normalizeLegacyBuildPayload")],
    ["preflight diagnostics", code.includes("function createBuildPreflightReport") && code.includes("JSON preflight failed")],
    ["inline asset import", code.includes("function extractLegacyInlineAsset") && code.includes("asset.dataUrl")],
    ["svg fallback", code.includes('assetMime.includes("svg")') && code.includes('startsWith("<svg")')],
    ["image import", code.includes("function createImageNode") && code.includes("figma.createImage")],
    ["component companions", code.includes("function createComponentCompanions")],
    ["variant companions", code.includes("function collectVariantSetCompanions")],
    ["png snapshot export", code.includes("rootPng2xAssetRefs")],
    ["single-layer wrapper", code.includes("createScreenRoot(rootBounds, [selectedRoot])")],
    ["build tab", ui.includes("Build from JSON")],
    ["extract tab", ui.includes("Extract selection")],
    ["diagnostics panel", ui.includes('id="diagnostics"') && ui.includes("summarizeBuildDiagnostics") && ui.includes("summarizeExtractDiagnostics")],
    ["copy/download fallback", ui.includes("copyOrDownloadText") && ui.includes("unicredit-figma-selection.json")],
  ];

  const failed = checks.filter(([, ok]) => !ok);
  assert(failed.length === 0, `${plugin.label} failed static checks: ${failed.map(([name]) => name).join(", ")}`);

  for (const fileName of ["ui.html", "README.md", "manifest.json", "package.json"].filter((file) => fs.existsSync(`${plugin.base}/${file}`))) {
    const text = readText(`${plugin.base}/${fileName}`);
    assert(!romanianUiPattern.test(text), `${plugin.label} contains Romanian UI copy in ${fileName}`);
  }

  for (const fileName of ["code.js", "ui.html", "manifest.json", "README.md", "package.json", "package-lock.json", "eslint.config.js", "code.ts"].filter((file) => fs.existsSync(`${plugin.base}/${file}`))) {
    const text = readText(`${plugin.base}/${fileName}`);
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      assert(!/\s+$/.test(line), `${plugin.label} trailing whitespace in ${fileName}:${index + 1}`);
    });
  }

  return { checks: checks.length, codeSource };
}

function auditAppExporterStatic() {
  const source = readText("src/app/utils/phoneScreenshot.ts");
  const checks = [
    ["schema export", source.includes('schema: "build-ui.screen.v1"')],
    ["app preflight validator", source.includes("function validateGeneratedFigmaPayload")],
    ["app preflight error", source.includes("Generated Figma JSON failed validation")],
    ["app warnings in payload", source.includes("payload.warnings = quality.warnings")],
    ["app source metadata", source.includes('generator: "phone-screenshot"')],
    ["app forbidden key guard", source.includes("FIGMA_JSON_FORBIDDEN_KEYS") && source.includes("backgroundColor")],
    ["app missing asset guard", source.includes('assetRef "') && source.includes("does not exist in assets[]")],
  ];

  const failed = checks.filter(([, ok]) => !ok);
  assert(failed.length === 0, `App Figma JSON exporter failed static checks: ${failed.map(([name]) => name).join(", ")}`);
  return checks.length;
}

function makeNodeFactory() {
  let idCounter = 1;

  return function makeNode(type, name = type) {
    const node = {
      id: `node-${idCounter++}`,
      type,
      name,
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      absoluteBoundingBox: { x: 0, y: 0, width: 1, height: 1 },
      visible: true,
      locked: false,
      opacity: 1,
      rotation: 0,
      fills: [],
      strokes: [],
      strokeWeight: 0,
      strokeAlign: "INSIDE",
      dashPattern: [],
      effects: [],
      cornerRadius: 0,
      topLeftRadius: 0,
      topRightRadius: 0,
      bottomRightRadius: 0,
      bottomLeftRadius: 0,
      constraints: { horizontal: "MIN", vertical: "MIN" },
      layoutPositioning: "ABSOLUTE",
      layoutGrow: 0,
      layoutAlign: "INHERIT",
      layoutSizingHorizontal: "FIXED",
      layoutSizingVertical: "FIXED",
      fillStyleId: "",
      strokeStyleId: "",
      effectStyleId: "",
      children: [],
      appendChild(child) {
        this.children.push(child);
        child.parent = this;
      },
      remove() {
        this.removed = true;
      },
      resize(width, height) {
        this.width = width;
        this.height = height;
        this.absoluteBoundingBox = { x: this.x, y: this.y, width, height };
      },
      resizeWithoutConstraints(width, height) {
        this.resize(width, height);
      },
      setPluginData(key, value) {
        this.pluginData = this.pluginData || {};
        this.pluginData[key] = value;
      },
      getPluginData(key) {
        return this.pluginData?.[key] || "";
      },
      exportAsync: async (options) => {
        if (options.format === "SVG_STRING") return `<svg id="${node.id}"></svg>`;
        if (options.format === "PNG") return new Uint8Array([137, 80, 78, 71, 1, 2, 3]);
        return "";
      },
    };

    if (["FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE"].includes(type)) {
      Object.assign(node, {
        layoutMode: "NONE",
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        itemSpacing: 0,
        primaryAxisSizingMode: "FIXED",
        counterAxisSizingMode: "FIXED",
        primaryAxisAlignItems: "MIN",
        counterAxisAlignItems: "MIN",
        clipsContent: false,
      });
    }

    if (type === "TEXT") {
      Object.assign(node, {
        characters: "",
        fontName: { family: "Inter", style: "Regular" },
        fontSize: 14,
        lineHeight: { unit: "PIXELS", value: 18 },
        letterSpacing: { unit: "PIXELS", value: 0 },
        textAlignHorizontal: "LEFT",
        textAlignVertical: "TOP",
        textAutoResize: "NONE",
        textStyleId: "",
        setRangeFontName() {},
        setRangeFontSize() {},
        setRangeLineHeight() {},
        setRangeLetterSpacing() {},
        setRangeFills() {},
        setRangeTextDecoration() {},
        setRangeTextCase() {},
        getStyledTextSegments() {
          return [{
            start: 0,
            end: this.characters.length,
            characters: this.characters,
            fontName: this.fontName,
            fontSize: this.fontSize,
            fills: this.fills || [],
            lineHeight: this.lineHeight,
            letterSpacing: this.letterSpacing,
            textDecoration: "NONE",
            textCase: "ORIGINAL",
          }];
        },
      });
    }

    return node;
  };
}

function createFigmaStub() {
  const makeNode = makeNodeFactory();
  const page = makeNode("PAGE", "Page");
  const uiMessages = [];
  const createdSvg = [];
  const createdImages = [];

  page.name = "Bridge Audit Page";
  page.selection = [];
  page.appendChild = function appendChild(child) {
    this.children.push(child);
    child.parent = this;
  };

  const figma = {
    mixed: Symbol("mixed"),
    ui: {
      onmessage: null,
      postMessage: (message) => uiMessages.push(message),
    },
    currentPage: page,
    viewport: {
      center: { x: 500, y: 500 },
      scrollAndZoomIntoView() {},
    },
    showUI() {},
    closePlugin() {},
    notify() {},
    loadFontAsync: async () => {},
    createFrame: () => makeNode("FRAME", "Frame"),
    createRectangle: () => makeNode("RECTANGLE", "Rectangle"),
    createEllipse: () => makeNode("ELLIPSE", "Ellipse"),
    createLine: () => makeNode("LINE", "Line"),
    createText: () => makeNode("TEXT", "Text"),
    createNodeFromSvg: (svg) => {
      createdSvg.push(svg);
      return makeNode("VECTOR", "Vector");
    },
    createImage: (bytes) => {
      createdImages.push(bytes);
      return { hash: `hash-${createdImages.length}` };
    },
  };

  return { figma, page, uiMessages, createdSvg, createdImages, makeNode };
}

async function runMessage(figma, uiMessages, message) {
  uiMessages.length = 0;
  await figma.ui.onmessage(message);
  const error = uiMessages.find((item) => item.type === "error");
  assert(!error, error?.message || "Plugin returned an unknown error.");
  return [...uiMessages];
}

async function runMessageExpectError(figma, uiMessages, message, expectedText) {
  uiMessages.length = 0;
  await figma.ui.onmessage(message);
  const error = uiMessages.find((item) => item.type === "error");
  assert(error, "Plugin did not emit an expected error.");
  assert(String(error.message || "").includes(expectedText), `Expected error to include "${expectedText}", got "${error.message}".`);
  return error;
}

async function auditVm(plugin) {
  const { code } = loadPluginCode(plugin);
  const { figma, page, uiMessages, createdSvg, createdImages, makeNode } = createFigmaStub();
  const context = {
    figma,
    __html__: "<html></html>",
    console,
    Uint8Array,
    TextEncoder,
    TextDecoder,
    Buffer,
    setTimeout,
    clearTimeout,
    Map,
    Set,
    Symbol,
    Date,
    JSON,
    Math,
    Number,
    String,
    Array,
    Object,
    Error,
    Promise,
    RegExp,
    decodeURIComponent,
    encodeURIComponent,
    atob: (value) => Buffer.from(value, "base64").toString("binary"),
    btoa: (value) => Buffer.from(value, "binary").toString("base64"),
  };

  vm.createContext(context);
  vm.runInContext(code, context);
  assert(typeof figma.ui.onmessage === "function", `${plugin.label} did not register a UI message handler.`);

  const invalidCanonical = {
    schema: "build-ui.screen.v1",
    frame: { width: 393, height: 852, background: "#F5F5F5" },
    root: {
      type: "container",
      name: "Invalid Screen",
      bounds: { x: 0, y: 0, width: 393, height: 852 },
      children: [{
        type: "text",
        name: "Bad Text",
        bounds: { x: "24px", y: 24, width: 120, height: 24 },
        text: { characters: "Bad", fontSize: "16px" },
      }],
    },
    assets: [],
  };
  const childCountBeforeInvalid = page.children.length;
  await runMessageExpectError(figma, uiMessages, {
    type: "build-ui",
    json: JSON.stringify(invalidCanonical),
    options: { targetMode: "new", layoutMode: "pixel" },
  }, "JSON preflight failed");
  assert(page.children.length === childCountBeforeInvalid, `${plugin.label} created a frame after a preflight error.`);

  const canonicalFixture = readFixtureJson(plugin, "canonical-mobile-screen.json");
  const canonicalFixtureText = JSON.stringify(canonicalFixture);
  assert(canonicalFixture.schema === "build-ui.screen.v1", `${plugin.label} canonical smoke fixture uses the wrong schema.`);
  assert(canonicalFixture.root?.name === "Smoke Mobile Screen", `${plugin.label} canonical smoke fixture has the wrong root name.`);
  assert(!/"\d+(?:\.\d+)?px"/.test(canonicalFixtureText), `${plugin.label} canonical smoke fixture leaks CSS string measurements.`);
  assert(!/backgroundColor|boxShadow|borderRadius|className|computedStyle|cssText/.test(canonicalFixtureText), `${plugin.label} canonical smoke fixture leaks CSS-style keys.`);

  await runMessage(figma, uiMessages, {
    type: "build-ui",
    json: canonicalFixtureText,
    options: { targetMode: "new", layoutMode: "smart" },
  });

  const missingAssetPayload = {
    schema: "build-ui.screen.v1",
    frame: { width: 120, height: 120, background: "#FFFFFF" },
    root: {
      type: "container",
      name: "Missing Asset Smoke",
      bounds: { x: 0, y: 0, width: 120, height: 120 },
      styles: { fills: [{ type: "SOLID", color: { hex: "#FFFFFF" } }] },
      children: [{
        type: "vector",
        name: "Missing Vector",
        bounds: { x: 24, y: 24, width: 24, height: 24 },
        assetRef: "does-not-exist",
      }],
    },
    assets: [],
  };
  const missingAssetMessages = await runMessage(figma, uiMessages, {
    type: "build-ui",
    json: JSON.stringify(missingAssetPayload),
    options: { targetMode: "new", layoutMode: "pixel" },
  });
  const missingAssetBuilt = missingAssetMessages.find((message) => message.type === "built");
  assert(
    missingAssetBuilt?.summary?.warnings?.some((warning) => warning.includes("does-not-exist")),
    `${plugin.label} did not surface missing assetRef preflight warning.`,
  );

  const legacyFixture = readFixtureJson(plugin, "legacy-component-e-screen.json");
  await runMessage(figma, uiMessages, {
    type: "build-ui",
    json: JSON.stringify(legacyFixture),
    options: { targetMode: "new", layoutMode: "pixel" },
  });

  const canonical = {
    schema: "build-ui.screen.v1",
    frame: { width: 393, height: 852, background: "#F5F5F5" },
    root: {
      type: "container",
      name: "Screen",
      bounds: { x: 0, y: 0, width: 393, height: 852 },
      styles: { fills: [{ type: "SOLID", color: { hex: "#F5F5F5" } }] },
      children: [{
        type: "text",
        name: "Title",
        bounds: { x: 24, y: 64, width: 120, height: 28 },
        text: {
          characters: "Hello",
          fontName: { family: "Inter", style: "Bold" },
          fontSize: 20,
          lineHeight: { unit: "PIXELS", value: 24 },
          letterSpacing: { unit: "PIXELS", value: 0 },
          textAlignHorizontal: "LEFT",
          textAlignVertical: "TOP",
        },
        styles: { fills: [{ type: "SOLID", color: { hex: "#262626" } }] },
      }],
    },
    assets: [],
  };

  await runMessage(figma, uiMessages, {
    type: "build-ui",
    json: JSON.stringify(canonical),
    options: { targetMode: "new", layoutMode: "pixel" },
  });

  const svgDataUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="10" height="10"%3E%3Cpath d="M0 0h10v10H0z"/%3E%3C/svg%3E';
  const pngDataUrl = `data:image/png;base64,${Buffer.from([137, 80, 78, 71, 0, 1, 2]).toString("base64")}`;
  const jpgDataUrl = `data:image/jpeg;base64,${Buffer.from([255, 216, 255, 224, 0, 16, 74, 70, 73, 70]).toString("base64")}`;

  const legacyComponent = {
    schema: "codex-figma-component-spec/v1",
    components: [{
      root: {
        type: "frame",
        name: "Legacy Card",
        x: 0,
        y: 0,
        width: 120,
        height: 72,
        backgroundColor: "#FFFFFF",
        children: [
          { name: "Inline SVG", x: 4, y: 4, width: 10, height: 10, asset: { dataUrl: svgDataUrl } },
          { name: "Inline PNG", x: 20, y: 4, width: 10, height: 10, asset: { dataUrl: pngDataUrl } },
          { name: "Inline JPG", x: 52, y: 4, width: 10, height: 10, asset: { dataUrl: jpgDataUrl } },
          { type: "vector", name: "Mime SVG", x: 36, y: 4, width: 10, height: 10, assetRef: "svg-mime" },
        ],
      },
    }],
    assets: [{ id: "svg-mime", kind: "vector", mimeType: "image/svg+xml", encoding: "plain", content: '<svg width="10" height="10"></svg>' }],
  };

  await runMessage(figma, uiMessages, {
    type: "build-ui",
    json: JSON.stringify(legacyComponent),
    options: { targetMode: "new", layoutMode: "smart" },
  });

  const buildUiStyle = {
    screen: { width: 160, height: 96, background: "#F5F5F5" },
    children: [{
      type: "text",
      name: "Build UI Legacy Title",
      x: 16,
      y: 16,
      width: 128,
      height: 24,
      characters: "Legacy screen",
      fontSize: "16px",
      color: "#262626",
    }],
  };

  await runMessage(figma, uiMessages, {
    type: "build-ui",
    json: JSON.stringify(buildUiStyle),
    options: { targetMode: "new", layoutMode: "pixel" },
  });

  assert(createdSvg.length >= 2, `${plugin.label} did not import SVG assets in VM smoke.`);
  assert(createdImages.length >= 2, `${plugin.label} did not import PNG/JPEG image assets in VM smoke.`);

  const componentSet = makeNode("COMPONENT_SET", "Button Set");
  componentSet.absoluteBoundingBox = { x: 0, y: 0, width: 220, height: 80 };
  componentSet.resize(220, 80);
  componentSet.key = "set-key";
  componentSet.componentPropertyDefinitions = { State: { type: "VARIANT", defaultValue: "Default" } };
  componentSet.layoutMode = "HORIZONTAL";
  componentSet.itemSpacing = 8;

  const variantDefault = makeNode("COMPONENT", "State=Default");
  variantDefault.absoluteBoundingBox = { x: 0, y: 0, width: 100, height: 40 };
  variantDefault.resize(100, 40);
  variantDefault.key = "default-key";
  variantDefault.variantProperties = { State: "Default" };
  variantDefault.appendChild(makeNode("VECTOR", "Icon"));

  const variantPressed = makeNode("COMPONENT", "State=Pressed");
  variantPressed.absoluteBoundingBox = { x: 110, y: 0, width: 100, height: 40 };
  variantPressed.resize(100, 40);
  variantPressed.key = "pressed-key";
  variantPressed.variantProperties = { State: "Pressed" };

  componentSet.appendChild(variantDefault);
  componentSet.appendChild(variantPressed);
  page.selection = [componentSet];

  const extractMessages = await runMessage(figma, uiMessages, {
    type: "extract-selection",
    options: {
      includeSvgAssets: true,
      includeImageAssets: true,
      includePngSnapshot: true,
      assetLimit: 10,
      maxDepth: 10,
    },
  });
  const extractResult = extractMessages.find((message) => message.type === "extract-result");
  assert(extractResult, `${plugin.label} did not emit extract-result.`);

  const extracted = JSON.parse(extractResult.json);
  assert(extracted.schema === "build-ui.screen.v1", `${plugin.label} exported wrong schema.`);
  assert(Array.isArray(extracted.components) && extracted.components.length >= 1, `${plugin.label} missing components companion.`);
  assert(Array.isArray(extracted.variantSets) && extracted.variantSets.length >= 1, `${plugin.label} missing variantSets companion.`);
  assert(Array.isArray(extracted.assets) && extracted.assets.length >= 1, `${plugin.label} missing extracted SVG assets.`);
  assert(extracted.exports?.rootPng2xAssetRefs?.length >= 1, `${plugin.label} missing PNG 2x snapshot export.`);

  const beforeRoundTripChildren = page.children.length;
  await runMessage(figma, uiMessages, {
    type: "build-ui",
    json: JSON.stringify(extracted),
    options: { targetMode: "new", layoutMode: "pixel" },
  });
  assert(page.children.length > beforeRoundTripChildren, `${plugin.label} did not build extracted JSON back into a Figma frame.`);

  const singleText = makeNode("TEXT", "Standalone Label");
  singleText.absoluteBoundingBox = { x: 10, y: 20, width: 96, height: 24 };
  singleText.characters = "Standalone";
  page.selection = [singleText];

  const singleMessages = await runMessage(figma, uiMessages, {
    type: "extract-selection",
    options: { includePngSnapshot: false },
  });
  const singlePayload = JSON.parse(singleMessages.find((message) => message.type === "extract-result").json);
  assert(singlePayload.root?.name === "Screen", `${plugin.label} did not wrap a single layer in Screen root.`);
  assert(singlePayload.root?.children?.[0]?.type === "text", `${plugin.label} single-layer wrapper did not preserve text child.`);

  const beforeSingleRoundTripChildren = page.children.length;
  await runMessage(figma, uiMessages, {
    type: "build-ui",
    json: JSON.stringify(singlePayload),
    options: { targetMode: "new", layoutMode: "pixel" },
  });
  assert(page.children.length > beforeSingleRoundTripChildren, `${plugin.label} did not build single-layer extracted JSON back into a Figma frame.`);

  return {
    createdSvg: createdSvg.length,
    createdImages: createdImages.length,
    exportedAssets: extracted.assets.length,
    components: extracted.components.length,
    variantSets: extracted.variantSets.length,
    fixtureImports: 2,
    preflightErrors: 1,
    preflightWarnings: 1,
    roundTrips: 2,
  };
}

const appExporterStaticCount = auditAppExporterStatic();
const summaries = [];

for (const plugin of plugins) {
  const staticSummary = auditStatic(plugin);
  const vmSummary = await auditVm(plugin);
  summaries.push(`${plugin.label}: codeSource=${staticSummary.codeSource}, static=${staticSummary.checks}, vm=${JSON.stringify(vmSummary)}`);
}

console.log(`figma-bridge audit ok plugins=${plugins.length} appExporterStatic=${appExporterStaticCount} codeMode=${sourceOnly ? "source-preferred" : "compiled-preferred"}`);
for (const summary of summaries) {
  console.log(summary);
}
