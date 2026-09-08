/**
 * The developer reference package, built from the flow definition alone.
 *
 * Nothing in the archive is hand-written per flow. The rules, the state
 * machine, the data model, the guard and acceptance test skeletons and the
 * screen manifest are all projections of `FlowDefinition`; the screens come in
 * as the module source that rendered them in the library. Change the flow and
 * the package follows — which is the point: the package cannot say something
 * the Specification does not.
 *
 * Reference material only: scaffolding to adapt, not production code, a backend
 * contract or an approved design-system extraction.
 */

import { groupRules, screenTitle, screensForRule } from "../flows/rules";
import type { FlowDefinition, FlowPrototypeNode, FlowScreenKind } from "../flows/types";
import { composedComponents, moduleToRepoPath, parseImports, sliceFunction, tokensUsed } from "./sourceSlices";
import { createZip, type ZipEntry } from "./zip";

export interface ScreenSourceInput {
  /** Repo-relative path of the preview module. */
  file: string;
  source: string;
}

const DISCLAIMER =
  "Reference material only: scaffolding to adapt, not production code, a backend contract or an approved design-system extraction.";

/** `Summary - ready to sign` → `SummaryReadyToSign`. */
export function pascalCase(value: string): string {
  return value
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/** `Selected count / Select all` → `selectedCountSelectAll`. */
export function camelCase(value: string): string {
  const pascal = pascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export interface StateTransition {
  from: FlowScreenKind;
  control: string;
  to: FlowScreenKind;
  kind: "primary" | "secondary" | "extra" | "back" | "close";
}

/** Every edge of the prototype map, in map order. Derived; never authored twice. */
export function stateTransitions(flow: FlowDefinition): StateTransition[] {
  const prototype = flow.prototype;
  if (!prototype) return [];
  const transitions: StateTransition[] = [];
  for (const from of orderedScreens(flow)) {
    const node: FlowPrototypeNode | undefined = prototype.nodes[from];
    if (!node) continue;
    if (node.primary) transitions.push({ from, control: node.primary.label, to: node.primary.to, kind: "primary" });
    if (node.secondary)
      transitions.push({ from, control: node.secondary.label, to: node.secondary.to, kind: "secondary" });
    for (const extra of node.extra ?? []) transitions.push({ from, control: extra.label, to: extra.to, kind: "extra" });
    if (node.back) transitions.push({ from, control: "Header back", to: node.back, kind: "back" });
    if (node.close) transitions.push({ from, control: "Header close", to: node.close, kind: "close" });
  }
  return transitions;
}

/** The screens a developer builds, in the order a reviewer thinks about them. */
export function orderedScreens(flow: FlowDefinition): FlowScreenKind[] {
  const seen = new Set<FlowScreenKind>();
  const ordered: FlowScreenKind[] = [];
  const push = (screen: FlowScreenKind) => {
    if (seen.has(screen)) return;
    seen.add(screen);
    ordered.push(screen);
  };
  if (flow.prototype) for (const group of flow.prototype.groups) group.screens.forEach(push);
  for (const scenario of flow.scenarios) scenario.steps.forEach((step) => push(step.screen));
  (Object.keys(flow.screenSpecs) as FlowScreenKind[]).forEach(push);
  return ordered;
}

export interface DataField {
  name: string;
  type: string;
  required: boolean;
  detail: string;
  screens: FlowScreenKind[];
}

/** Every field across every screen contract, merged by name. Derived. */
export function dataFields(flow: FlowDefinition): DataField[] {
  const fields: DataField[] = [];
  for (const screen of orderedScreens(flow)) {
    for (const field of flow.screenSpecs[screen]?.fields ?? []) {
      const existing = fields.find((entry) => entry.name === field.name);
      const detail = [field.validation, field.notes].filter(Boolean).join(" · ");
      if (existing) {
        existing.screens.push(screen);
        if (!existing.detail && detail) existing.detail = detail;
        continue;
      }
      fields.push({ name: field.name, type: field.type, required: Boolean(field.required), detail, screens: [screen] });
    }
  }
  return fields;
}

/** TypeScript interfaces, one per screen, from the screen contracts' fields. */
export function modelsSource(flow: FlowDefinition): string {
  const lines: string[] = [
    "// Generated from the screen contracts in Specification. Field types are",
    "// the contract's own wording; replace `string` with the approved data types.",
    "",
  ];
  for (const screen of orderedScreens(flow)) {
    const spec = flow.screenSpecs[screen];
    if (!spec?.fields?.length) continue;
    lines.push(`/** ${screenTitle(flow, screen)} — ${spec.purpose} */`);
    lines.push(`export interface ${pascalCase(screenTitle(flow, screen))}Screen {`);
    for (const field of spec.fields) {
      const detail = [field.type, field.validation, field.notes].filter(Boolean).join(" · ");
      lines.push(`  /** ${detail} */`);
      lines.push(`  ${camelCase(field.name)}${field.required ? "" : "?"}: string;`);
    }
    lines.push("}", "");
  }
  return lines.join("\n");
}

/** The session model and one stub per guard, each naming the rules it enforces. */
export function sessionSource(flow: FlowDefinition): string {
  const implementation = flow.implementation;
  if (!implementation) return "// This flow declares no implementation surface.\n";
  const lines: string[] = [
    "// The state the flow carries between screens, and the guards that enforce the rules.",
    `// ${implementation.sessionModel.description}`,
    "",
    `export ${implementation.sessionModel.shape}`,
    "",
  ];
  for (const guard of implementation.guards) {
    for (const id of guard.rules) {
      const rule = flow.overview.rules?.find((entry) => entry.id === id);
      if (rule) lines.push(`// ${rule.id} — ${rule.statement}`);
    }
    lines.push(`// Enforced on: ${guard.enforcedOn.map((screen) => screenTitle(flow, screen)).join(", ")}`);
    lines.push(`// Proven by: ${guard.test}`);
    lines.push(`export const ${guard.name}: ${guard.signature} = () => {`);
    lines.push(`  throw new Error("${guard.name}: implement against the approved data client")`);
    lines.push("}", "");
  }
  return lines.join("\n");
}

/** The integration boundary as one interface, unresolved points called out per operation. */
export function adapterSource(flow: FlowDefinition): string {
  const implementation = flow.implementation;
  if (!implementation) return "// This flow declares no implementation surface.\n";
  const lines: string[] = [
    "// Replace with the approved API client and signing orchestration. Every",
    "// operation names the screen that calls it and what is still undecided.",
    "",
    `export interface ${pascalCase(flow.label)}Adapter {`,
  ];
  for (const operation of implementation.operations) {
    lines.push(`  /**`);
    lines.push(`   * ${operation.purpose}`);
    lines.push(`   * Called from: ${screenTitle(flow, operation.calledFrom)}`);
    if (operation.unresolved) lines.push(`   * UNRESOLVED: ${operation.unresolved}`);
    lines.push(`   */`);
    lines.push(`  ${operation.name}: ${operation.signature};`);
  }
  lines.push("}", "");
  return lines.join("\n");
}

/** Representative data, lifted from the preview module when it declares a fixture. */
export function mockDataSource(screenSource: ScreenSourceInput | undefined): string {
  const fixture = screenSource
    ? /(type \w*Draft\w* = \{[\s\S]*?\n\};?\s*\n)?[\s\S]*?(const [A-Z_]+: readonly \w+\[\] = \[[\s\S]*?\] as const;)/.exec(
        screenSource.source,
      )
    : null;
  if (!fixture) return "// No representative fixture is declared by the preview module.\n";
  const typeBlock = fixture[1] ? `${fixture[1].trim()}\n\n` : "";
  return `// Representative data used by the screens as built. Not production data.\n\n${typeBlock}export ${fixture[2]}\n`;
}

export function guardTestsSource(flow: FlowDefinition): string {
  const guards = flow.implementation?.guards ?? [];
  const lines: string[] = [
    "import { describe, it } from 'vitest'",
    "",
    "// One test per guard, named after the rule it proves. Fill in the bodies as",
    "// the guards are implemented; the names are the acceptance contract.",
    "describe('guards', () => {",
  ];
  for (const guard of guards) {
    const title = guard.test.split("›").pop()?.trim() ?? guard.name;
    lines.push(`  it.todo('${escapeQuote(title)} (${guard.name}, ${guard.rules.join(" ")})')`);
  }
  lines.push("})", "");
  return lines.join("\n");
}

export function acceptanceTestsSource(flow: FlowDefinition): string {
  const lines: string[] = [
    "import { describe, it } from 'vitest'",
    "",
    "// Every acceptance criterion in Specification, as a test name. Generated;",
    "// keep the names and implement the bodies against the built screens.",
  ];
  for (const screen of orderedScreens(flow)) {
    const spec = flow.screenSpecs[screen];
    if (!spec?.acceptance?.length) continue;
    lines.push(`describe('${escapeQuote(screenTitle(flow, screen))}', () => {`);
    spec.acceptance.forEach((criterion, index) => {
      lines.push(`  it.todo('AC${index + 1}: ${escapeQuote(criterion)}')`);
    });
    lines.push("})", "");
  }
  return lines.join("\n");
}

function escapeQuote(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function rulesMarkdown(flow: FlowDefinition): string {
  const rules = flow.overview.rules;
  if (!rules?.length) return "";
  const lines: string[] = ["# Rules", "", "The canonical rule set. Every id below is cited by screen contracts, guards and tests.", ""];
  for (const group of groupRules(rules)) {
    lines.push(`## ${group.group}`, "");
    for (const rule of group.rules) {
      const screens = screensForRule(flow, rule.id).map((screen) => screenTitle(flow, screen));
      lines.push(`- **${rule.id}** ${rule.statement}${screens.length ? ` _(${screens.join(", ")})_` : ""}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function stateMachineMarkdown(flow: FlowDefinition): string {
  const transitions = stateTransitions(flow);
  if (!transitions.length) return "";
  const lines: string[] = [
    "# State machine",
    "",
    `Start: **${screenTitle(flow, flow.prototype!.start)}**. Derived from the prototype map — the same map business clicked through.`,
    "",
    "| From | Control | To | Kind |",
    "| --- | --- | --- | --- |",
  ];
  for (const transition of transitions) {
    lines.push(
      `| ${screenTitle(flow, transition.from)} | ${transition.control} | ${screenTitle(flow, transition.to)} | ${transition.kind} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function componentsMarkdown(flow: FlowDefinition, screenSource: ScreenSourceInput | undefined): string {
  const mapping = flow.implementation?.screenSource;
  if (!screenSource || !mapping) return "";
  const imports = parseImports(screenSource.source);
  const lines: string[] = [
    "# Screens as built",
    "",
    `Source: \`${screenSource.file}\` — the exact module that rendered the screens in the Flow Library.`,
    "Each screen names its component, the design-system components it composes and the tokens it uses.",
    "",
  ];
  if (mapping.shell) lines.push(`Flow shell: \`${mapping.shell}\` wires the screens with local state.`, "");
  for (const screen of orderedScreens(flow)) {
    const component = mapping.screens[screen];
    if (!component) continue;
    const slice = sliceFunction(screenSource.source, component);
    lines.push(`## ${screenTitle(flow, screen)}`, "");
    lines.push(`- Component: \`${component}\`${slice ? ` (lines ${slice.startLine}–${slice.endLine})` : ""}`);
    if (slice) {
      const composed = composedComponents(slice.code, imports);
      const imported = composed.filter((entry) => entry.module);
      const local = composed.filter((entry) => !entry.module);
      if (imported.length)
        lines.push(`- Design-system components: ${imported.map((entry) => `\`${entry.name}\` (${moduleToRepoPath(entry.module!)})`).join(", ")}`);
      if (local.length) lines.push(`- Local pieces: ${local.map((entry) => `\`${entry.name}\``).join(", ")}`);
      const tokens = tokensUsed(slice.code);
      if (tokens.length) lines.push(`- Tokens: ${tokens.map((token) => `\`${token}\``).join(", ")}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function readme(flow: FlowDefinition, screenSource: ScreenSourceInput | undefined): string {
  const lines: string[] = [
    `# ${flow.title} — developer reference package`,
    "",
    DISCLAIMER,
    "",
    "Specification defines what to build; this package is the technical projection of it, generated from the same definition.",
    "",
    "## What is inside",
    "",
    "- `handoff/rules.md` — the canonical rules with ids (R1…), and the screens that cite each.",
    "- `handoff/state-machine.md` — every transition, derived from the prototype map.",
    "- `handoff/frontend-handoff-manifest.json` — screens, transitions, contracts and rule ids, machine-readable.",
    "- `src/models.ts` — one interface per screen, from the contract fields.",
    "- `src/session.ts` — the cross-screen session model and one stub per guard, each naming its rules.",
    "- `src/adapter.ts` — the integration boundary, with what is still undecided per operation.",
    "- `src/mockData.ts` — the representative data the built screens use.",
  ];
  if (screenSource) {
    lines.push(
      `- \`screens/${screenSource.file.split("/").pop()}\` — the screens as built, verbatim.`,
      "- `screens/COMPONENTS.md` — per screen: component, composed design-system components, tokens.",
    );
  }
  lines.push(
    "- `tests/guards.test.ts` — a named test per guard.",
    "- `tests/acceptance.skeleton.test.ts` — every acceptance criterion as a test name.",
    "- `INTEGRATION_CHECKLIST.md` — what to replace, validate and decide before this is real.",
    "",
  );
  return lines.join("\n");
}

function checklist(flow: FlowDefinition): string {
  const lines: string[] = [
    "# Integration checklist",
    "",
    "- Replace the reference adapter with the approved data client and signing orchestration.",
    "- Keep the composed design-system components; map any local piece to its approved counterpart.",
    "- Implement every guard in `src/session.ts` and make `tests/guards.test.ts` pass.",
    "- Turn `tests/acceptance.skeleton.test.ts` into real tests against the built screens.",
  ];
  for (const operation of flow.implementation?.operations ?? []) {
    if (operation.unresolved) lines.push(`- Decide for \`${operation.name}\`: ${operation.unresolved}`);
  }
  for (const question of flow.implementation?.openTechnicalQuestions ?? []) lines.push(`- ${question}`);
  lines.push("");
  return lines.join("\n");
}

function manifest(flow: FlowDefinition): string {
  const mapping = flow.implementation?.screenSource?.screens ?? {};
  return JSON.stringify(
    {
      flow: flow.id,
      title: flow.title,
      prototypeStart: flow.prototype?.start,
      rules: flow.overview.rules ?? flow.overview.businessRules.map((statement, index) => ({ id: `B${index + 1}`, statement })),
      screens: orderedScreens(flow).map((screen) => ({
        screen,
        title: screenTitle(flow, screen),
        component: mapping[screen],
        rules: flow.screenSpecs[screen]?.rules ?? [],
        transition: flow.prototype?.nodes[screen],
        specification: flow.screenSpecs[screen],
      })),
      guards: flow.implementation?.guards ?? [],
      operations: flow.implementation?.operations ?? [],
      disclaimer: DISCLAIMER,
    },
    null,
    2,
  );
}

export function buildFlowReferencePackage(flow: FlowDefinition, screenSource?: ScreenSourceInput): Blob {
  const encoder = new TextEncoder();
  const entry = (name: string, text: string): ZipEntry | null =>
    text ? { name, data: encoder.encode(text) } : null;

  const entries = [
    entry("README.md", readme(flow, screenSource)),
    entry("handoff/rules.md", rulesMarkdown(flow)),
    entry("handoff/state-machine.md", stateMachineMarkdown(flow)),
    entry("handoff/frontend-handoff-manifest.json", manifest(flow)),
    entry("src/models.ts", modelsSource(flow)),
    entry("src/session.ts", sessionSource(flow)),
    entry("src/adapter.ts", adapterSource(flow)),
    entry("src/mockData.ts", mockDataSource(screenSource)),
    screenSource ? entry(`screens/${screenSource.file.split("/").pop()}`, screenSource.source) : null,
    entry("screens/COMPONENTS.md", componentsMarkdown(flow, screenSource)),
    entry("tests/guards.test.ts", guardTestsSource(flow)),
    entry("tests/acceptance.skeleton.test.ts", acceptanceTestsSource(flow)),
    entry("INTEGRATION_CHECKLIST.md", checklist(flow)),
  ].filter((candidate): candidate is ZipEntry => candidate !== null);

  return createZip(entries);
}
