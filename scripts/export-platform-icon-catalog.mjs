import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const OUTPUT_PATH = path.resolve("docs/design-system/platform-icons-svg-catalog.md");

function formatSvg(svg) {
  return svg
    .replace(/></g, ">\n<")
    .replace(/\n<\/svg>$/, "\n</svg>")
    .trim();
}

function extractSvg(markup) {
  return markup.match(/<svg[\s\S]*<\/svg>/)?.[0] ?? markup;
}

function markdownTableRow(cells) {
  return `| ${cells.map((cell) => String(cell).replace(/\|/g, "\\|")).join(" | ")} |`;
}

function renderAppIconRows(AppIcon, iconInventory) {
  return iconInventory.map((icon) => ({
    ...icon,
    svg: formatSvg(renderToStaticMarkup(React.createElement(AppIcon, { name: icon.name }))),
  }));
}

function renderPfmIconRows(PfmCategoryIcon, pfmCategories) {
  return pfmCategories.map((category) => {
    const markup = renderToStaticMarkup(React.createElement(PfmCategoryIcon, { category: category.name }));
    const svg = extractSvg(markup);

    return {
      ...category,
      source: "pfm",
      defaultSize: "32x32 slot / 20x20 glyph",
      viewBox: svg.match(/viewBox="([^"]+)"/)?.[1] ?? "unknown",
      svg: formatSvg(svg),
    };
  });
}

function buildAppIconSection(icon) {
  const notes = icon.notes ? `\n- Notes: ${icon.notes}` : "";

  return `### ${icon.name}

- Label: ${icon.label}
- Category: ${icon.category}
- Source: ${icon.source}
- Default size: ${icon.defaultSize}
- ViewBox: ${icon.viewBox}
- Usage: ${icon.usage.join(", ")}${notes}

\`\`\`svg
${icon.svg}
\`\`\``;
}

function buildPfmIconSection(icon) {
  return `### ${icon.name}

- Source: PfmCategoryIcon
- Color var: ${icon.colorVar}
- Default size: ${icon.defaultSize}
- ViewBox: ${icon.viewBox}
- Fallback initial: ${icon.fallbackInitial}

\`\`\`svg
${icon.svg}
\`\`\``;
}

function buildMarkdown(appIcons, pfmIcons) {
  const generatedAt = new Date().toISOString();
  const groupedAppIcons = Map.groupBy(appIcons, (icon) => icon.category);

  const appIndexRows = [
    markdownTableRow(["Name", "Label", "Category", "Source", "Default size", "ViewBox"]),
    markdownTableRow(["---", "---", "---", "---", "---", "---"]),
    ...appIcons.map((icon) =>
      markdownTableRow([icon.name, icon.label, icon.category, icon.source, icon.defaultSize, icon.viewBox]),
    ),
  ];

  const pfmIndexRows = [
    markdownTableRow(["Name", "Color var", "Default size", "ViewBox", "Fallback"]),
    markdownTableRow(["---", "---", "---", "---", "---"]),
    ...pfmIcons.map((icon) =>
      markdownTableRow([icon.name, icon.colorVar, icon.defaultSize, icon.viewBox, icon.fallbackInitial]),
    ),
  ];

  const appSections = [...groupedAppIcons.entries()]
    .map(([category, icons]) => [`## AppIcon / ${category}`, icons.map(buildAppIconSection).join("\n\n")].join("\n\n"))
    .join("\n\n");

  const pfmSections = pfmIcons.map(buildPfmIconSection).join("\n\n");

  return `# Platform Icons SVG Catalog

Generated from the platform icon registries on ${generatedAt}.

Sources:
- \`src/app/components/icons/AppIcon.tsx\`
- \`src/app/components/pfm/PfmCategoryIcon.tsx\`
- \`src/data/pfmCategories.ts\`

Scope:
- AppIcon registry: ${appIcons.length} icons.
- PFM category registry: ${pfmIcons.length} icons.
- Excluded by design: generated Figma imports, brand wordmarks, phone chrome, decorative textures, and shadcn internal lucide slots that are not owned by the platform icon registry.

To regenerate:

\`\`\`bash
node scripts/export-platform-icon-catalog.mjs
\`\`\`

## AppIcon Index

${appIndexRows.join("\n")}

## PFM Icon Index

${pfmIndexRows.join("\n")}

${appSections}

## PFM Category Icons

${pfmSections}
`;
}

const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });

try {
  const { AppIcon, ICON_INVENTORY } = await server.ssrLoadModule("/src/app/components/icons/AppIcon.tsx");
  const { default: PfmCategoryIcon } = await server.ssrLoadModule("/src/app/components/pfm/PfmCategoryIcon.tsx");
  const { PFM_CATEGORIES } = await server.ssrLoadModule("/src/data/pfmCategories.ts");

  const appIcons = renderAppIconRows(AppIcon, ICON_INVENTORY);
  const pfmIcons = renderPfmIconRows(PfmCategoryIcon, PFM_CATEGORIES);
  const markdown = buildMarkdown(appIcons, pfmIcons);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, markdown, "utf8");

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`AppIcon: ${appIcons.length}`);
  console.log(`PFM: ${pfmIcons.length}`);
} finally {
  await server.close();
}
