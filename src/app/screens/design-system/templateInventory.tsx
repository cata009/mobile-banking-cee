/**
 * The Templates tab: card grid, thumbnails, and the selected-template preview.
 *
 * Extracted verbatim from DesignSystemPage.tsx.
 */
import { useEffect, useState } from "react";
import { TemplateCodePreview } from "@/app/components/templates/TemplateCodePreviews";
import { Badge } from "@/app/components/ui/badge";
import { TEMPLATE_REGISTRY, type TemplateRegistryItem } from "@/app/registry/templateRegistry";
import { InventorySearchField, InventoryStatGrid, Section } from "./specimenShell";

export function TemplateInventory() {
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATE_REGISTRY[0]?.id ?? "");
  const reconstructedTemplates = TEMPLATE_REGISTRY.filter((template) => template.codePreviewId);
  const screenshotBackedTemplates = TEMPLATE_REGISTRY.filter((template) => template.imageSrc);
  const codeOnlyTemplates = TEMPLATE_REGISTRY.filter((template) => template.codePreviewId && !template.imageSrc);
  const normalizedTemplateQuery = templateSearchQuery.trim().toLowerCase();
  const visibleTemplates = TEMPLATE_REGISTRY.filter((template) => {
    if (!normalizedTemplateQuery) return true;
    return [
      template.id,
      template.name,
      template.sourcePath,
      template.format,
      template.codePreviewId ?? "",
      ...template.relatedComponents,
    ].join(" ").toLowerCase().includes(normalizedTemplateQuery);
  });
  const selectedTemplate =
    visibleTemplates.find((template) => template.id === selectedTemplateId) ?? visibleTemplates[0] ?? TEMPLATE_REGISTRY[0];

  return (
    <Section
      id="templates"
      title="Templates"
      description="Existing screenshots and code-only templates derived from active screens, turned into selectable templates for comparison, reuse, and mapping to cataloged components."
    >
      <InventoryStatGrid
        items={[
          ["Templates", TEMPLATE_REGISTRY.length],
          ["Code previews", reconstructedTemplates.length],
          ["Screenshot sources", screenshotBackedTemplates.length],
          ["Code-only", codeOnlyTemplates.length],
        ]}
      />

      <InventorySearchField
        value={templateSearchQuery}
        onChange={setTemplateSearchQuery}
        placeholder="Search templates"
        label="Search templates"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="max-h-[calc(100vh-260px)] min-h-[420px] overflow-y-auto pr-1">
          {visibleTemplates.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {visibleTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={template.id === selectedTemplate?.id}
                  onSelect={() => setSelectedTemplateId(template.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-6 text-[14px] text-[var(--uc-text-muted)]">
              No templates match this search.
            </div>
          )}
        </div>

        {selectedTemplate && <TemplatePreview template={selectedTemplate} />}
      </div>
    </Section>
  );
}

export function TemplateCodeThumbnail({ template }: { template: TemplateRegistryItem }) {
  if (!template.codePreviewId) {
    if (!template.imageSrc) {
      return (
        <span className="flex h-full w-full items-center justify-center bg-[var(--uc-surface-muted)] px-3 text-center font-['UniCredit:Bold',sans-serif] text-[12px] uppercase text-[var(--uc-text-muted)]">
          Code-only
        </span>
      );
    }

    return (
      <img
        src={template.imageSrc}
        alt={`${template.name} template screenshot`}
        className="h-full w-full object-cover object-top transition-transform duration-200 group-hover:scale-[1.02]"
        loading="lazy"
      />
    );
  }

  return (
    <span className="relative block h-full w-full overflow-hidden bg-[var(--uc-app-bg)]">
      <span
        className="absolute top-0"
        style={{
          height: 814,
          left: "50%",
          marginLeft: -45.24,
          transform: "scale(0.24)",
          transformOrigin: "top left",
          width: 377,
        }}
      >
        <TemplateCodePreview previewId={template.codePreviewId} presentationOnly />
      </span>
    </span>
  );
}

export function TemplateCard({ template, selected, onSelect }: {
  template: TemplateRegistryItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      data-template-card="true"
      data-template-code={template.codePreviewId ? "true" : "false"}
      data-template-id={template.id}
      className={`group flex h-[168px] min-w-0 flex-col overflow-hidden rounded-[8px] border bg-[var(--uc-surface)] text-left transition ${
        selected ? "border-[var(--uc-action)] ring-2 ring-[var(--uc-action)]/25" : "border-[var(--uc-border)] hover:border-[var(--uc-action-soft-strong)]"
      }`}
    >
      <span className="block h-[104px] w-full overflow-hidden bg-[var(--uc-neutral-200)]">
        <TemplateCodeThumbnail template={template} />
      </span>
      <span className="flex min-h-0 flex-1 flex-col justify-between gap-1.5 p-2.5">
        <span className="flex min-w-0 items-center justify-between gap-2">
          <span className="truncate font-['UniCredit:Bold',sans-serif] text-[14px] text-[var(--uc-text)]">{template.name}</span>
          {template.codePreviewId ? (
            <span className="shrink-0 rounded-full bg-[var(--uc-action-soft)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--uc-action)]">
              code
            </span>
          ) : null}
        </span>
        <span className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--uc-text-muted)]">
          <span>{template.width}x{template.height}</span>
          <span className="uppercase">{template.format}</span>
        </span>
      </span>
    </div>
  );
}

export function TemplatePreview({ template }: { template: TemplateRegistryItem }) {
  const [previewMode, setPreviewMode] = useState<"code" | "source">(template.codePreviewId ? "code" : "source");
  const hasSourceImage = Boolean(template.imageSrc);

  useEffect(() => {
    setPreviewMode(template.codePreviewId ? "code" : "source");
  }, [template.codePreviewId, template.id, hasSourceImage]);

  const resolvedPreviewMode = template.codePreviewId
    ? previewMode === "source" && hasSourceImage
      ? "source"
      : "code"
    : "source";

  return (
    <aside className="sticky top-[92px] h-fit overflow-hidden rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)]">
      <div className="border-b border-[var(--uc-border-muted)] p-5">
        <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--uc-brand)]">Selected template</p>
        <h3 className="mt-2 font-['UniCredit:Bold',sans-serif] text-[24px] leading-tight text-[var(--uc-text)]">{template.name}</h3>
        <p className="mt-2 break-all text-[13px] text-[var(--uc-text-muted)]">{template.sourcePath}</p>
        {template.codePreviewId && hasSourceImage ? (
          <div className="mt-4 grid grid-cols-2 rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-1">
            {(["code", "source"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreviewMode(mode)}
                className={`rounded-[4px] px-3 py-2 font-['UniCredit:Bold',sans-serif] text-[13px] capitalize ${
                  resolvedPreviewMode === mode
                    ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
                    : "text-[var(--uc-text-muted)]"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        ) : template.codePreviewId ? (
          <div className="mt-4 rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] px-3 py-2 font-['UniCredit:Bold',sans-serif] text-[13px] text-[var(--uc-text-muted)]">
            Code-only template
          </div>
        ) : null}
      </div>

      <div className="max-h-[520px] overflow-auto bg-[var(--uc-app-bg)] p-4" data-template-preview-mode={resolvedPreviewMode}>
        {resolvedPreviewMode === "code" && template.codePreviewId ? (
          <div className="flex min-w-[377px] justify-center" data-template-selected-code-preview="true">
            <TemplateCodePreview previewId={template.codePreviewId} />
          </div>
        ) : hasSourceImage && template.imageSrc ? (
          <img
            src={template.imageSrc}
            alt={`${template.name} selected template screenshot`}
            className="mx-auto w-full max-w-[375px] rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] object-contain object-top"
          />
        ) : (
          <div className="flex min-h-[360px] items-center justify-center rounded-[6px] border border-dashed border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-6 text-center font-['UniCredit:Bold',sans-serif] text-[14px] text-[var(--uc-text-muted)]">
            No screenshot source for this code-only template.
          </div>
        )}
      </div>

      <div className="grid gap-4 border-t border-[var(--uc-border-muted)] p-5 text-[14px]">
        <div className="grid grid-cols-[116px_1fr] gap-x-3 gap-y-2">
          <span className="text-[var(--uc-text-subtle)]">Size</span>
          <span className="font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)]">{template.width} x {template.height}</span>
          <span className="text-[var(--uc-text-subtle)]">Format</span>
          <span className="font-['UniCredit:Bold',sans-serif] uppercase text-[var(--uc-text)]">{template.format}</span>
          <span className="text-[var(--uc-text-subtle)]">Registry id</span>
          <span className="break-all font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)]">{template.id}</span>
          <span className="text-[var(--uc-text-subtle)]">Implementation</span>
          <span className="font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)]">
            {template.implementationStatus === "reconstructed-code" ? "Reconstructed code" : "Source only"}
          </span>
          <span className="text-[var(--uc-text-subtle)]">Family</span>
          <span className="font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)]">{template.screenFamily}</span>
          <span className="text-[var(--uc-text-subtle)]">Runtime screen</span>
          <span className="break-all font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)]">
            {template.runtimeScreenId ?? "pattern only"}
          </span>
          {template.implementationPath ? (
            <>
              <span className="text-[var(--uc-text-subtle)]">Code path</span>
              <span className="break-all font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)]">{template.implementationPath}</span>
            </>
          ) : null}
        </div>
        <div>
          <p className="mb-2 text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Screen / flow contract</p>
          <div className="grid gap-2 text-[13px] text-[var(--uc-text-muted)]">
            <div className="flex flex-wrap gap-2">
              {template.relatedScreens.map((screenId) => (
                <Badge key={screenId} variant="outline">{screenId}</Badge>
              ))}
            </div>
            {template.flowIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {template.flowIds.map((flowId) => (
                  <Badge key={flowId} variant="secondary">{flowId}</Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {template.reuseNotes && template.reuseNotes.length > 0 ? (
          <div>
            <p className="mb-2 text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Reuse notes</p>
            <ul className="grid gap-2 text-[13px] leading-5 text-[var(--uc-text-muted)]">
              {template.reuseNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div>
          <p className="mb-2 text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">AI assembly contract</p>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{template.reuseContract.role}</Badge>
            {template.standalonePage ? <Badge variant="outline">standalone page pattern</Badge> : null}
          </div>
          {template.reuseContract.dataSources.length > 0 ? (
            <div className="mb-3">
              <p className="mb-1 font-['UniCredit:Bold',sans-serif] text-[13px] text-[var(--uc-text)]">Data sources</p>
              <ul className="grid gap-1 text-[13px] leading-5 text-[var(--uc-text-muted)]">
                {template.reuseContract.dataSources.map((source) => (
                  <li key={source}>{source}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="grid gap-3">
            <div>
              <p className="mb-1 font-['UniCredit:Bold',sans-serif] text-[13px] text-[var(--uc-text)]">Reuse rules</p>
              <ul className="grid gap-1 text-[13px] leading-5 text-[var(--uc-text-muted)]">
                {template.reuseContract.assemblyRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 font-['UniCredit:Bold',sans-serif] text-[13px] text-[var(--uc-text)]">Do not invent</p>
              <ul className="grid gap-1 text-[13px] leading-5 text-[var(--uc-text-muted)]">
                {template.reuseContract.forbiddenPatterns.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Reusable components</p>
          <div className="flex flex-wrap gap-2">
            {template.relatedComponents.map((component) => (
              <Badge key={component} variant="secondary">{component}</Badge>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
