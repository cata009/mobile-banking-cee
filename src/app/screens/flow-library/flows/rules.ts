/**
 * Rule ids — the thread that runs through every Flow Library tab.
 *
 * A rule is authored once, as a short statement under a group heading, and gets
 * a stable id (R1, R2, …). Every other surface only cites the id: a screen
 * contract says which rules govern it, a prototype control wears the id as a
 * chip, an implementation guard names the rules it enforces and the test that
 * proves them. The statement text lives in exactly one place, so it cannot
 * drift between the business reading and the build reading.
 *
 * Kept free of React/DOM imports, like `types.ts`, so data modules, the export
 * layer and tests can all use it.
 */

import type { FlowDefinition, FlowRule, FlowScreenKind } from "./types";

export interface FlowRuleGroupInput {
  group: string;
  rules: readonly string[];
}

/**
 * Number grouped statements R1..Rn in reading order and derive the legacy
 * one-paragraph-per-group summary that the older surfaces (and every flow
 * without ids) still render as `businessRules`.
 */
export function defineRules(groups: readonly FlowRuleGroupInput[]): {
  rules: FlowRule[];
  businessRules: string[];
} {
  const rules: FlowRule[] = [];
  const businessRules: string[] = [];
  let count = 0;
  for (const group of groups) {
    for (const statement of group.rules) {
      count += 1;
      rules.push({ id: `R${count}`, group: group.group, statement });
    }
    businessRules.push(`${group.group}: ${group.rules.join(" ")}`);
  }
  return { rules, businessRules };
}

export function ruleById(flow: FlowDefinition, id: string): FlowRule | undefined {
  return flow.overview.rules?.find((rule) => rule.id === id);
}

/** The rules a screen contract declares as governing it, in rule order. */
export function rulesForScreen(flow: FlowDefinition, screen: FlowScreenKind): FlowRule[] {
  const ids = flow.screenSpecs[screen]?.rules ?? [];
  return (flow.overview.rules ?? []).filter((rule) => ids.includes(rule.id));
}

/** Every screen whose contract cites the rule — derived, never authored twice. */
export function screensForRule(flow: FlowDefinition, ruleId: string): FlowScreenKind[] {
  return (Object.keys(flow.screenSpecs) as FlowScreenKind[]).filter((screen) =>
    flow.screenSpecs[screen]?.rules?.includes(ruleId),
  );
}

/** Group rules for display while preserving authored order. */
export function groupRules(rules: readonly FlowRule[]): Array<{ group: string; rules: FlowRule[] }> {
  const groups: Array<{ group: string; rules: FlowRule[] }> = [];
  for (const rule of rules) {
    const existing = groups.find((entry) => entry.group === rule.group);
    if (existing) existing.rules.push(rule);
    else groups.push({ group: rule.group, rules: [rule] });
  }
  return groups;
}

/**
 * The canonical human name of a screen, the same on every tab: the contract's
 * own title, else the first journey step that shows it, else the kind slug.
 */
export function screenTitle(flow: FlowDefinition, screen: FlowScreenKind): string {
  const own = flow.screenSpecs[screen]?.title;
  if (own) return own;
  for (const scenario of flow.scenarios) {
    const step = scenario.steps.find((candidate) => candidate.screen === screen);
    if (step) return step.title;
  }
  return screen
    .replace(/^rs-pi-/, "")
    .replace(/-/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}
