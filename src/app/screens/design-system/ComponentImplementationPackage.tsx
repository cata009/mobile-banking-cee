import ImplementationCodeBrowser from './ImplementationCodeBrowser';
import type { ComponentCodeSample } from "@/app/registry/componentCodeSamples";
import type { ComponentImplementationPackage as ImplementationPackageData } from "@/app/registry/componentImplementationPackages";

interface ComponentImplementationPackageProps {
  componentId: string;
  componentPath: string;
  code: Pick<ComponentCodeSample, "react" | "swift" | "kotlin">;
  data: ImplementationPackageData;
}

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="ds-doc-section">
      <p className="ds-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ComponentImplementationPackage({
  componentId,
  componentPath,
  code,
  data,
}: ComponentImplementationPackageProps) {
  return (
    <div className="ds-code-shell space-y-6" data-component-implementation-package="true">
      <div className="px-1 py-2">
        <p className="ds-eyebrow">Developer handoff</p>
        <p className="mt-2 max-w-[780px] text-[14px] leading-[21px] text-[var(--uc-text-muted)]">{data.summary}</p>
      </div>

      <Section eyebrow="01 / Source" title="Implementation code">
        <ImplementationCodeBrowser componentId={componentId} componentPath={componentPath} code={code} />
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
    </div>
  );
}
