/**
 * Read a screen component out of its module text.
 *
 * The Implementation tab and the reference package show each screen's own
 * function — not the whole preview module — together with the design-system
 * components it composes. Both come from the module source, so nothing here is
 * hand-maintained: rename a component and the tab follows.
 *
 * Dependency-free and DOM-free on purpose, like the rest of `handoff/`.
 */

export interface SourceSlice {
  name: string;
  code: string;
  /** 1-based line range in the module, for the copy header. */
  startLine: number;
  endLine: number;
}

/** Skip a string, template or comment starting at `index`; return the index after it, or `index` if none. */
function skipLiteral(source: string, index: number): number {
  const char = source[index];
  const next = source[index + 1];
  if (char === "/" && next === "/") {
    const end = source.indexOf("\n", index);
    return end === -1 ? source.length : end;
  }
  if (char === "/" && next === "*") {
    const end = source.indexOf("*/", index + 2);
    return end === -1 ? source.length : end + 2;
  }
  if (char === '"' || char === "'" || char === "`") {
    let cursor = index + 1;
    while (cursor < source.length) {
      if (source[cursor] === "\\") cursor += 2;
      else if (source[cursor] === char) return cursor + 1;
      // A template literal is left as-is: its `${}` braces are balanced, so
      // treating it like a plain string is enough for the matching below.
      else cursor += 1;
    }
    return source.length;
  }
  return index;
}

/** Index of the bracket closing the one at `open`, honouring strings and comments. */
function matchBracket(source: string, open: number): number {
  const opener = source[open];
  const closer = opener === "(" ? ")" : opener === "[" ? "]" : "}";
  let depth = 0;
  let cursor = open;
  while (cursor < source.length) {
    const skipped = skipLiteral(source, cursor);
    if (skipped !== cursor) {
      cursor = skipped;
      continue;
    }
    const char = source[cursor];
    if (char === opener) depth += 1;
    else if (char === closer) {
      depth -= 1;
      if (depth === 0) return cursor;
    }
    cursor += 1;
  }
  return -1;
}

function lineOf(source: string, index: number): number {
  let line = 1;
  for (let cursor = 0; cursor < index; cursor += 1) if (source[cursor] === "\n") line += 1;
  return line;
}

/**
 * The full text of `function <name>(…) { … }`, including a leading doc comment
 * when one sits directly above it. Undefined when the module has no such function.
 */
export function sliceFunction(source: string, name: string): SourceSlice | undefined {
  const match = new RegExp(`(^|\\n)(export\\s+)?function\\s+${name}\\s*\\(`).exec(source);
  if (!match) return undefined;
  const start = match.index + (match[1] ?? "").length;
  const paramsOpen = source.indexOf("(", start);
  const paramsClose = matchBracket(source, paramsOpen);
  if (paramsClose === -1) return undefined;
  const bodyOpen = source.indexOf("{", paramsClose);
  if (bodyOpen === -1) return undefined;
  const bodyClose = matchBracket(source, bodyOpen);
  if (bodyClose === -1) return undefined;

  // Pull in a JSDoc block that ends on the line just above the function.
  let from = start;
  const before = source.slice(0, start);
  const doc = /\/\*\*[\s\S]*?\*\/\s*$/.exec(before);
  if (doc) from = doc.index;

  const code = source.slice(from, bodyClose + 1);
  return { name, code, startLine: lineOf(source, from), endLine: lineOf(source, bodyClose) };
}

export interface ImportBinding {
  identifier: string;
  module: string;
}

/** Every default/named import binding in the module, so a JSX tag can be traced to its file. */
export function parseImports(source: string): ImportBinding[] {
  const bindings: ImportBinding[] = [];
  const pattern = /import\s+([\s\S]*?)\s+from\s+["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source))) {
    const clause = match[1]!;
    const module = match[2]!;
    const named = /\{([\s\S]*?)\}/.exec(clause);
    if (named) {
      for (const part of named[1]!.split(",")) {
        const cleaned = part.replace(/^\s*type\s+/, "").trim();
        if (!cleaned) continue;
        const alias = cleaned.split(/\s+as\s+/);
        bindings.push({ identifier: (alias[1] ?? alias[0])!.trim(), module });
      }
    }
    const defaultName = clause.replace(/\{[\s\S]*?\}/, "").replace(/,/g, "").replace(/^\s*type\s+/, "").trim();
    if (defaultName && /^[A-Za-z_$][\w$]*$/.test(defaultName)) bindings.push({ identifier: defaultName, module });
  }
  return bindings;
}

export interface ComposedComponent {
  name: string;
  /** Module specifier for an imported component; undefined for one defined in the same file. */
  module?: string;
}

/** The capitalised JSX tags a slice renders, deduplicated in first-use order. */
export function composedComponents(slice: string, imports: readonly ImportBinding[]): ComposedComponent[] {
  const seen = new Set<string>();
  const result: ComposedComponent[] = [];
  const pattern = /<([A-Z][\w$.]*)[\s/>]/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(slice))) {
    const name = match[1]!;
    if (seen.has(name)) continue;
    seen.add(name);
    const binding = imports.find((entry) => entry.identifier === name.split(".")[0]);
    result.push(binding ? { name, module: binding.module } : { name });
  }
  return result;
}

/** `@/app/components/PageHeader` → `src/app/components/PageHeader.tsx`, the registry's `componentPath` form. */
export function moduleToRepoPath(module: string): string {
  const base = module.startsWith("@/") ? `src/${module.slice(2)}` : module;
  return /\.\w+$/.test(base) ? base : `${base}.tsx`;
}

/** The design tokens a slice references, deduplicated in first-use order. */
export function tokensUsed(slice: string): string[] {
  const seen = new Set<string>();
  const pattern = /--uc-[a-z0-9-]+|\buc-type-[a-z0-9-]+/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(slice))) seen.add(match[0]);
  return [...seen];
}
