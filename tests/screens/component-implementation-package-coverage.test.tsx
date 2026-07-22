// @vitest-environment node

/**
 * Fail-closed coverage gate for the Design System "Components" tab.
 *
 * Rather than trusting a hand-maintained id list (which silently goes stale),
 * this test parses the actual specimen source files for every rendered
 * `<Specimen>` card and its `detailsHref`, then asserts each referenced
 * component has a complete, vendor-neutral Implementation package, React/
 * Swift/Kotlin code samples, and a wired live preview. A newly added specimen
 * without a `detailsHref`, or a `detailsHref` pointing at an incomplete
 * component, makes this test fail.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COMPONENT_REGISTRY } from "@/app/registry/componentRegistry";
import {
  COMPONENT_CODE_SAMPLES,
  resolveComponentCodeSample,
} from "@/app/registry/componentCodeSamples";
import { getComponentImplementationPackage } from "@/app/registry/componentImplementationPackages";
import { getComponentLivePreview } from "@/app/screens/design-system/componentLivePreviews";

const SPECIMEN_SOURCE_FILES = [
  "src/app/screens/design-system/DesignSystemPage.tsx",
  "src/app/screens/design-system/specimens/cardSpecimens.tsx",
  "src/app/screens/design-system/specimens/fieldSpecimens.tsx",
];

const FORBIDDEN_VENDOR_TERMS: RegExp[] = [/asseco/i, /\basee\b/i, /adaptive elements/i, /\breply\b/i];

interface SpecimenReference {
  name: string;
  detailsHref: string | null;
  file: string;
}

function extractSpecimens(relativePath: string): SpecimenReference[] {
  const filePath = path.resolve(process.cwd(), relativePath);
  const source = fs.readFileSync(filePath, "utf8");
  const specimens: SpecimenReference[] = [];

  // Split on every "<Specimen" occurrence: chunk[i] (i >= 1) holds everything from
  // right after that opening tag up to (but not including) the next "<Specimen" (or
  // EOF). We only need name=/detailsHref= from the opening tag's attributes, so we
  // search a bounded prefix of the chunk rather than trying to locate the tag's own
  // closing ">" — some specimens embed a literal ">" inside a `specs={[...]}` string
  // (e.g. "mini 4x4 when count > 4"), which would otherwise terminate the match early.
  const chunks = source.split(/<Specimen\b/);
  for (let i = 1; i < chunks.length; i++) {
    const attrsWindow = (chunks[i] ?? "").slice(0, 800);
    const nameMatch = attrsWindow.match(/name="([^"]*)"/);
    const hrefMatch = attrsWindow.match(/detailsHref="([^"]*)"/);
    specimens.push({
      name: nameMatch?.[1] ?? "(unnamed specimen)",
      detailsHref: hrefMatch?.[1] ?? null,
      file: relativePath,
    });
  }

  return specimens;
}

function componentIdFromHref(href: string): string {
  return href.replace(/^#component\//, "").split("?")[0] ?? "";
}

const allSpecimens = SPECIMEN_SOURCE_FILES.flatMap(extractSpecimens);
const componentIds = Array.from(
  new Set(
    allSpecimens
      .map((specimen) => specimen.detailsHref)
      .filter((href): href is string => Boolean(href))
      .map(componentIdFromHref),
  ),
);

function collectPackageText(componentId: string): string {
  const pkg = getComponentImplementationPackage(componentId);
  const sample = COMPONENT_CODE_SAMPLES[componentId];
  if (!pkg) return "";

  return [
    pkg.summary,
    ...pkg.visualSpecifications.flatMap((item) => [item.label, item.value, item.detail ?? ""]),
    ...pkg.states.flatMap((state) => [state.label, state.description]),
    ...pkg.motionSpecifications.flatMap((item) => [item.label, item.value, item.detail ?? ""]),
    ...pkg.accessibilitySpecifications,
    pkg.assets.summary,
    sample?.react ?? "",
    sample?.swift ?? "",
    sample?.kotlin ?? "",
  ].join(" \n ");
}

describe("Design System Components tab: fail-closed implementation-package coverage", () => {
  it("finds at least one specimen and every specimen declares a detailsHref", () => {
    expect(allSpecimens.length).toBeGreaterThan(0);

    const missingHref = allSpecimens.filter((specimen) => !specimen.detailsHref);
    expect(
      missingHref,
      `Every Components-tab specimen must link to a component detail page. Missing detailsHref on: ${missingHref
        .map((s) => `"${s.name}" (${s.file})`)
        .join(", ")}`,
    ).toEqual([]);
  });

  it("resolves every detailsHref to a registered ComponentId", () => {
    const unknown = componentIds.filter((id) => !(id in COMPONENT_REGISTRY));
    expect(unknown, `Unknown component id(s) referenced by a specimen detailsHref: ${unknown.join(", ")}`).toEqual([]);
  });

  it.each(componentIds)("%s has a complete Implementation package", (componentId) => {
    const pkg = getComponentImplementationPackage(componentId);
    expect(pkg, `Missing COMPONENT_IMPLEMENTATION_PACKAGES entry for "${componentId}"`).toBeDefined();
    if (!pkg) return;

    expect(pkg.summary.length, `${componentId}: summary must not be empty`).toBeGreaterThan(0);
    expect(pkg.visualSpecifications.length, `${componentId}: needs at least one visual specification`).toBeGreaterThan(0);
    expect(pkg.states.length, `${componentId}: needs at least one documented state`).toBeGreaterThan(0);
    for (const state of pkg.states) {
      expect(state.label.length, `${componentId}: state "${state.id}" needs a label`).toBeGreaterThan(0);
      expect(state.description.length, `${componentId}: state "${state.id}" needs a description`).toBeGreaterThan(0);
    }
    expect(pkg.motionSpecifications.length, `${componentId}: needs at least one motion entry (use "None" when there is no motion)`).toBeGreaterThan(0);
    expect(pkg.accessibilitySpecifications.length, `${componentId}: needs at least one accessibility statement`).toBeGreaterThan(0);
    expect(pkg.assets.summary.length, `${componentId}: assets summary must not be empty`).toBeGreaterThan(0);
  });

  it.each(componentIds)("%s ships React, Swift, and Kotlin code samples", (componentId) => {
    const sample = COMPONENT_CODE_SAMPLES[componentId];
    expect(sample, `Missing COMPONENT_CODE_SAMPLES entry for "${componentId}"`).toBeDefined();
    if (!sample) return;

    expect(sample.react.length, `${componentId}: React sample must not be empty`).toBeGreaterThan(0);
    expect(sample.swift.length, `${componentId}: Swift sample must not be empty`).toBeGreaterThan(0);
    expect(sample.kotlin.length, `${componentId}: Kotlin sample must not be empty`).toBeGreaterThan(0);

    if (sample.variants) {
      for (const variantId of Object.keys(sample.variants)) {
        const resolved = resolveComponentCodeSample(sample, variantId);
        expect(resolved, `${componentId}: variant "${variantId}" failed to resolve`).not.toBeNull();
        if (!resolved) continue;
        expect(resolved.react.length, `${componentId}: variant "${variantId}" React sample must not be empty`).toBeGreaterThan(0);
        expect(resolved.swift.length, `${componentId}: variant "${variantId}" Swift sample must not be empty`).toBeGreaterThan(0);
        expect(resolved.kotlin.length, `${componentId}: variant "${variantId}" Kotlin sample must not be empty`).toBeGreaterThan(0);
      }
    }
  });

  it.each(componentIds)("%s has a wired live preview", (componentId) => {
    const preview = getComponentLivePreview(componentId, "light");
    expect(preview, `Missing a live "View" preview for "${componentId}" — wire it in componentLivePreviews.tsx`).not.toBeNull();

    const darkPreview = getComponentLivePreview(componentId, "dark");
    expect(darkPreview, `"${componentId}" live preview must also resolve in dark mode`).not.toBeNull();
  });

  it.each(componentIds)("%s package text is supplier-neutral", (componentId) => {
    const text = collectPackageText(componentId);
    for (const term of FORBIDDEN_VENDOR_TERMS) {
      expect(term.test(text), `${componentId}: package/code-sample text must not mention a forbidden vendor term (matched ${term})`).toBe(false);
    }
  });
});
