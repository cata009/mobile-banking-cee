import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

const templateRegistry = read("src/app/registry/templateRegistry.ts");
const templatePreviews = read("src/app/components/templates/TemplateCodePreviews.tsx");
const demoTypes = read("src/app/state/demoTypes.ts");
const componentRegistry = read("src/app/registry/componentRegistry.ts");
const screenRegistry = read("src/app/registry/screenRegistry.ts");
const flowRegistry = read("src/app/registry/flowRegistry.ts");

function collectUnion(typeName, source) {
  const match = source.match(new RegExp(`export type ${typeName} =([\\s\\S]*?);`));
  if (!match) {
    throw new Error(`Could not find ${typeName} union`);
  }

  return new Set([...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]));
}

function collectObjectKeys(source) {
  return new Set([...source.matchAll(/\n {2}"([^"]+)": \{/g)].map((entry) => entry[1]));
}

function collectTemplateBlocks(source) {
  const blocks = [];
  const token = "defineTemplate({";
  let cursor = 0;

  while (true) {
    const start = source.indexOf(token, cursor);
    if (start === -1) break;

    let pos = start + token.length;
    let depth = 1;

    while (pos < source.length && depth > 0) {
      const char = source[pos];
      if (char === "{") depth += 1;
      if (char === "}") depth -= 1;
      pos += 1;
    }

    blocks.push(source.slice(start, pos));
    cursor = pos;
  }

  return blocks;
}

function stringValue(block, key) {
  return block.match(new RegExp(`${key}: "([^"]+)"`))?.[1] ?? null;
}

function arrayValues(block, key) {
  const match = block.match(new RegExp(`${key}: \\[([^\\]]*)\\]`));
  if (!match) return null;
  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

function assertKnown(values, known, label, id) {
  for (const value of values ?? []) {
    if (!known.has(value)) {
      throw new Error(`${id}: unknown ${label} "${value}"`);
    }
  }
}

const componentIds = collectUnion("ComponentId", demoTypes);
const componentRegistryIds = collectObjectKeys(componentRegistry);
const screenIds = collectUnion("ScreenId", demoTypes);
const screenRegistryIds = collectObjectKeys(screenRegistry);
const flowIds = collectUnion("FlowId", demoTypes);
const flowRegistryIds = collectObjectKeys(flowRegistry);
const previewIds = collectUnion("TemplateCodePreviewId", templatePreviews);
const previewCases = new Set([...templatePreviews.matchAll(/case "([^"]+)":/g)].map((entry) => entry[1]));
const blocks = collectTemplateBlocks(templateRegistry);

const componentUnionMissing = [...componentRegistryIds].filter((id) => !componentIds.has(id));
const componentRegistryMissing = [...componentIds].filter((id) => !componentRegistryIds.has(id));
const screenRegistryMissing = [...screenIds].filter((id) => !screenRegistryIds.has(id));
const flowRegistryMissing = [...flowIds].filter((id) => !flowRegistryIds.has(id));

if (componentUnionMissing.length > 0) {
  throw new Error(`Component registry has ids missing from ComponentId union: ${componentUnionMissing.join(", ")}`);
}

if (componentRegistryMissing.length > 0) {
  throw new Error(`ComponentId union has ids missing from component registry: ${componentRegistryMissing.join(", ")}`);
}

if (screenRegistryMissing.length > 0) {
  throw new Error(`ScreenId union has ids missing from screen registry: ${screenRegistryMissing.join(", ")}`);
}

if (flowRegistryMissing.length > 0) {
  throw new Error(`FlowId union has ids missing from flow registry: ${flowRegistryMissing.join(", ")}`);
}

const ids = new Set();
const codePreviewIds = [];

for (const block of blocks) {
  const id = stringValue(block, "id");
  if (!id) throw new Error("Template block missing id");
  if (ids.has(id)) throw new Error(`Duplicate template id: ${id}`);
  ids.add(id);

  const screenFamily = stringValue(block, "screenFamily");
  const relatedScreens = arrayValues(block, "relatedScreens");
  const relatedComponents = arrayValues(block, "relatedComponents");
  const templateFlowIds = arrayValues(block, "flowIds");
  const runtimeScreenId = stringValue(block, "runtimeScreenId");
  const codePreviewId = stringValue(block, "codePreviewId");
  const implementationStatus = stringValue(block, "implementationStatus");

  if (!screenFamily) throw new Error(`${id}: missing screenFamily`);
  if (!relatedScreens || relatedScreens.length === 0) throw new Error(`${id}: missing relatedScreens`);
  if (!templateFlowIds) throw new Error(`${id}: missing flowIds array`);
  if (!relatedComponents || relatedComponents.length === 0) throw new Error(`${id}: missing relatedComponents`);
  if (implementationStatus === "reconstructed-code" && !codePreviewId) {
    throw new Error(`${id}: reconstructed-code template must define codePreviewId`);
  }

  if (runtimeScreenId && !screenIds.has(runtimeScreenId)) {
    throw new Error(`${id}: unknown runtimeScreenId "${runtimeScreenId}"`);
  }

  if (codePreviewId) {
    codePreviewIds.push(codePreviewId);
    if (!previewIds.has(codePreviewId)) {
      throw new Error(`${id}: unknown codePreviewId "${codePreviewId}"`);
    }
    if (!previewCases.has(codePreviewId)) {
      throw new Error(`${id}: codePreviewId has no TemplateCodePreview switch case "${codePreviewId}"`);
    }
  }

  assertKnown(relatedScreens, screenIds, "related screen", id);
  assertKnown(templateFlowIds, flowIds, "flow id", id);
  assertKnown(relatedComponents, componentIds, "component id", id);
}

const unusedPreviewIds = [...previewIds].filter((previewId) => !codePreviewIds.includes(previewId));
if (unusedPreviewIds.length > 0) {
  throw new Error(`TemplateCodePreviewId values unused by registry: ${unusedPreviewIds.join(", ")}`);
}

console.log(
  `template-contract ok: templates=${blocks.length} codePreviews=${codePreviewIds.length} components=${componentIds.size} screens=${screenIds.size} flows=${flowIds.size}`,
);
