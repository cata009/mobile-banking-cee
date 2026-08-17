/**
 * Regenerates `src/data/merchantMarks.ts` from the Simple Icons package.
 *
 * Merchant marks must be real brand artwork, never hand-drawn approximations,
 * so the path data is copied from Simple Icons (icon files are CC0; the
 * trademarks stay with their owners) and baked into a source file. Baking
 * means the app ships no runtime dependency and makes no request to a merchant
 * domain — a corporate firewall cannot blank the transaction list.
 *
 * Simple Icons is not a project dependency. To regenerate:
 *
 *   npm install --no-save simple-icons@16
 *   node scripts/generate-merchant-marks.mjs
 *
 * Add a brand by appending its Simple Icons slug to MERCHANT_SLUGS. The script
 * fails loudly when a slug is missing rather than emitting a placeholder.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ICON_DIR = path.join(ROOT, "node_modules", "simple-icons", "icons");
const OUTPUT = path.join(ROOT, "src", "data", "merchantMarks.ts");

/** Simple Icons slugs the merchant directory draws from. */
const MERCHANT_SLUGS = [
  "adidas",
  "airbnb",
  "aldisud",
  "apple",
  "auchan",
  "bookingdotcom",
  "burgerking",
  "carrefour",
  "dm",
  "epicgames",
  "foodpanda",
  "glovo",
  "googleplay",
  "handm",
  "hbo",
  "ikea",
  "kaufland",
  "kfc",
  "lidl",
  "mcdonalds",
  "mediamarkt",
  "netflix",
  "nike",
  "playstation",
  "puma",
  "roblox",
  "rossmann",
  "ryanair",
  "shell",
  "spotify",
  "starbucks",
  "steam",
  "tesco",
  "uber",
  "wizzair",
  "youtube",
  "zara",
];

function readIcon(slug) {
  const file = path.join(ICON_DIR, `${slug}.svg`);
  let markup;
  try {
    markup = readFileSync(file, "utf8");
  } catch {
    throw new Error(`Simple Icons has no "${slug}" icon. Run npm install --no-save simple-icons@16 first.`);
  }

  const title = markup.match(/<title>([^<]+)<\/title>/)?.[1];
  const pathData = markup.match(/ d="([^"]+)"/)?.[1];
  const paths = markup.match(/ d="([^"]+)"/g) ?? [];

  if (!title || !pathData) throw new Error(`Could not parse the "${slug}" icon.`);
  if (paths.length !== 1) throw new Error(`The "${slug}" icon is not a single path; the renderer expects one.`);

  return { title, path: pathData };
}

function readBrandHex(slug) {
  // simple-icons ships the brand colour in its data file, keyed by title.
  const data = JSON.parse(readFileSync(path.join(ROOT, "node_modules", "simple-icons", "data", "simple-icons.json"), "utf8"));
  const icons = Array.isArray(data) ? data : data.icons;
  const entry = icons.find((icon) => (icon.slug ?? slugify(icon.title)) === slug || slugify(icon.title) === slug);
  return entry?.hex ? `#${entry.hex}` : undefined;
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/\./g, "dot")
    .replace(/&/g, "and")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const entries = MERCHANT_SLUGS.map((slug) => {
  const { title, path: pathData } = readIcon(slug);
  const hex = readBrandHex(slug) ?? "#1A1A1A";
  return { slug, title, hex, path: pathData };
});

const body = entries
  .map(({ slug, title, hex, path: pathData }) => `  "${slug}": {
    title: ${JSON.stringify(title)},
    hex: "${hex}",
    path: ${JSON.stringify(pathData)},
  },`)
  .join("\n");

const file = `/**
 * Brand marks used by the merchant directory.
 *
 * GENERATED FILE — do not edit by hand. Run \`node scripts/generate-merchant-marks.mjs\`
 * after installing simple-icons (see that script's header). Path data comes from
 * Simple Icons, whose icon files are CC0; the trademarks belong to their owners.
 * Each mark is a single path on the 24x24 Simple Icons grid.
 */

export interface MerchantMarkArtwork {
  /** Brand name as Simple Icons records it. */
  title: string;
  /** Official brand colour. */
  hex: string;
  /** Single path on a 0 0 24 24 viewBox. */
  path: string;
}

export type MerchantMarkSlug =
${entries.map(({ slug }) => `  | "${slug}"`).join("\n")};

export const MERCHANT_MARKS: Record<MerchantMarkSlug, MerchantMarkArtwork> = {
${body}
};
`;

writeFileSync(OUTPUT, file);
console.log(`Wrote ${entries.length} merchant marks to ${path.relative(ROOT, OUTPUT)}`);
