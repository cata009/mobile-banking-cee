import { useState } from "react";
import CodeBlock, { type CodeLanguage } from "@/app/components/CodeBlock";
import type { ComponentCodeSample } from "@/app/registry/componentCodeSamples";
import type { ComponentImplementationPackage as ImplementationPackageData } from "@/app/registry/componentImplementationPackages";
import { getComponentStatePreview } from "./componentStatePreviews";

type CodeSegment = "react" | "swift" | "kotlin";

interface ComponentImplementationPackageProps {
  componentId: string;
  componentPath: string;
  code: Pick<ComponentCodeSample, "react" | "swift" | "kotlin">;
  data: ImplementationPackageData;
}

const FILE_NAME_BY_SEGMENT: Record<CodeSegment, (path: string) => string> = {
  react: (path) => path.split("/").pop() ?? "Component.tsx",
  swift: () => "Component.swift",
  kotlin: () => "Component.kt",
};

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--uc-action)]">{eyebrow}</p>
      <h2 className="mt-1 text-[20px] font-bold leading-[26px] text-[var(--uc-text)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ComponentStates({ componentId, data }: { componentId: string; data: ImplementationPackageData }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {data.states.map((state) => {
        const preview = getComponentStatePreview(componentId, state.id);
        return (
          <article
            key={state.id}
            className="flex min-h-[148px] flex-col rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-app-bg)] p-4"
          >
            <div>
              <h3 className="text-[14px] font-bold text-[var(--uc-text)]">{state.label}</h3>
              <p className="mt-1 min-h-[36px] text-[12px] leading-[18px] text-[var(--uc-text-muted)]">{state.description}</p>
            </div>
            <div className="mt-auto pt-4">
              {preview ?? (
                <div className="flex h-[48px] items-center justify-center rounded-[4px] border border-dashed border-[var(--uc-border)] px-4 text-center text-[12px] text-[var(--uc-text-muted)]">
                  Not part of the current public component contract.
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function ComponentImplementationPackage({
  componentId,
  componentPath,
  code,
  data,
}: ComponentImplementationPackageProps) {
  const [segment, setSegment] = useState<CodeSegment>("react");
  const language: CodeLanguage = segment === "react" ? "tsx" : segment;

  return (
    <div className="space-y-5" data-component-implementation-package="true">
      <div className="rounded-[12px] bg-[var(--uc-surface-muted)] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--uc-action)]">Portable handoff</p>
        <p className="mt-2 max-w-[780px] text-[14px] leading-[21px] text-[var(--uc-text-muted)]">{data.summary}</p>
      </div>

      <Section eyebrow="01 / Source" title="Implementation code">
        <div className="mb-3 inline-flex rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-[2px]">
          {(["react", "swift", "kotlin"] as const).map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setSegment(entry)}
              aria-pressed={segment === entry}
              className={`rounded-[8px] px-[16px] py-[6px] text-[13px] font-bold uppercase tracking-wide transition-colors ${
                segment === entry
                  ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
                  : "text-[var(--uc-text-muted)] hover:text-[var(--uc-text)]"
              }`}
            >
              {entry === "react" ? "React" : entry === "swift" ? "Swift" : "Kotlin"}
            </button>
          ))}
        </div>
        {segment !== "react" ? (
          <p className="mb-3 text-[12px] leading-[18px] text-[var(--uc-text-muted)]">
            Native reference implementation. Adapt naming, tokens, and lifecycle to the receiving application.
          </p>
        ) : (
          <p className="mb-3 text-[12px] leading-[18px] text-[var(--uc-text-muted)]">
            Curated from the component that renders in this demo.
          </p>
        )}
        <CodeBlock
          code={code[segment]}
          language={language}
          fileName={FILE_NAME_BY_SEGMENT[segment](componentPath)}
        />
      </Section>

      <Section eyebrow="02 / Geometry & tokens" title="Visual specifications">
        <dl className="grid gap-px overflow-hidden rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-border)] sm:grid-cols-2">
          {data.visualSpecifications.map((item) => (
            <div key={item.label} className="bg-[var(--uc-surface)] p-4">
              <dt className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">{item.label}</dt>
              <dd className="mt-1 font-mono text-[14px] font-bold text-[var(--uc-text)]">{item.value}</dd>
              {item.detail ? <p className="mt-1 text-[12px] leading-[18px] text-[var(--uc-text-muted)]">{item.detail}</p> : null}
            </div>
          ))}
        </dl>
      </Section>

      <Section eyebrow="03 / Behavior" title="States">
        <ComponentStates componentId={componentId} data={data} />
      </Section>

      <Section eyebrow="04 / Interaction" title="Motion">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.motionSpecifications.map((item) => (
            <div key={item.label} className="rounded-[8px] bg-[var(--uc-surface-muted)] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">{item.label}</p>
              <p className="mt-2 font-mono text-[15px] font-bold text-[var(--uc-text)]">{item.value}</p>
              {item.detail ? <p className="mt-1 text-[12px] leading-[18px] text-[var(--uc-text-muted)]">{item.detail}</p> : null}
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="05 / Inclusive use" title="Accessibility">
        <ul className="grid gap-3 md:grid-cols-2">
          {data.accessibilitySpecifications.map((item) => (
            <li key={item} className="flex gap-3 rounded-[8px] bg-[var(--uc-surface-muted)] p-4 text-[13px] leading-[19px] text-[var(--uc-text)]">
              <span aria-hidden="true" className="mt-[2px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-[var(--uc-action)] text-[11px] font-bold text-[var(--uc-text-inverse)]">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="06 / Dependencies" title="Assets">
        <div className="flex items-start gap-4 rounded-[8px] bg-[var(--uc-surface-muted)] p-4">
          <div className="grid h-[40px] w-[40px] shrink-0 place-items-center rounded-full bg-[var(--uc-surface)] text-[18px]" aria-hidden="true">∅</div>
          <div>
            <p className="text-[14px] font-bold text-[var(--uc-text)]">{data.assets.required ? "Assets required" : "No external assets"}</p>
            <p className="mt-1 text-[13px] leading-[19px] text-[var(--uc-text-muted)]">{data.assets.summary}</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
