/**
 * Colour, typography, and icon inventory surfaces, plus the inventory tab bar.
 *
 * Extracted verbatim from DesignSystemPage.tsx.
 */
import { useRef, useState } from "react";
import { AppIcon, ICON_INVENTORY, type IconInventoryItem } from "@/app/components/icons";
import PfmCategoryIcon from "@/app/components/pfm/PfmCategoryIcon";
import { PFM_CATEGORIES, PFM_ICON_SOURCE, type PfmCategoryDefinition } from "@/data/pfmCategories";
import { TYPOGRAPHY_TOKENS, type TypographyToken } from "@/app/registry/typographyRegistry";
import { APP_COLOR_AUDIT, COLOR_PALETTES, DESIGN_SYSTEM_COLORS, type ColorPaletteId, type DesignSystemColor } from "@/app/registry/colorRegistry";
import { InventorySearchField, InventoryStatGrid, Section } from "./specimenShell";
import { inventoryTabCounts, inventoryTabLabels, type InventoryTab } from "./inventoryNav";

export function InventoryTabs({ activeTab, activeSection, sectionLinks, onChange, placement = "inline" }: {
  activeTab: InventoryTab;
  activeSection: string;
  sectionLinks: readonly (readonly [string, string])[];
  onChange: (tab: InventoryTab) => void;
  placement?: "inline" | "sidebar";
}) {
  const isSidebar = placement === "sidebar";

  return (
    <div
      className={
        isSidebar
          ? "grid gap-2"
          : "mt-6 inline-flex rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-app-bg)] p-1"
      }
      role={isSidebar ? "navigation" : "tablist"}
      aria-label="Design system inventory tabs"
    >
      {(["components", "templates", "icons", "colors", "typography"] as const).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <div
            key={tab}
            className={`overflow-hidden rounded-[8px] transition-colors ${
              isSidebar
                ? isActive
                  ? "bg-[var(--uc-surface-muted)]"
                  : "bg-transparent"
                : ""
            }`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab)}
              className={
                isSidebar
                  ? `flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 text-left transition-colors ${
                      isActive ? "text-[var(--uc-text)]" : "text-[var(--uc-text-muted)] hover:bg-[var(--uc-surface-muted)] hover:text-[var(--uc-text)]"
                    }`
                  : `rounded-[6px] px-3 py-2 font-['UniCredit:Bold',sans-serif] text-[14px] capitalize transition-colors ${
                      isActive ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm" : "text-[var(--uc-text-muted)] hover:text-[var(--uc-text)]"
                    }`
              }
            >
              <span className="min-w-0">
                <span className={`block ${isSidebar ? "uc-type-n4-strong" : "font-['UniCredit:Bold',sans-serif] text-[14px]"}`}>
                  {inventoryTabLabels[tab]}
                </span>
              </span>
              {isSidebar ? (
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none ${
                    isActive
                      ? "bg-[var(--uc-text)] text-[var(--uc-surface)]"
                      : "bg-[var(--uc-surface-muted)] text-[var(--uc-text-subtle)]"
                  }`}
                >
                  {inventoryTabCounts[tab]}
                </span>
              ) : null}
            </button>

            {isSidebar && isActive ? (
              <div className="px-2 pb-2">
                <div className="grid gap-1">
                  {sectionLinks.map(([id, label]) => {
                    const isSectionActive = activeSection === id;
                    return (
                      <a
                        key={id}
                        href={`#${id}`}
                        className={`flex items-center rounded-[6px] px-3 py-2 transition-colors ${
                          isSectionActive
                            ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
                            : "text-[var(--uc-text-muted)] hover:bg-[var(--uc-surface)] hover:text-[var(--uc-text)]"
                        }`}
                      >
                        <span className="uc-type-n5">{label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function CopyHexButton({
  value,
  copiedValue,
  onCopy,
  label,
}: {
  value: string;
  copiedValue: string | null;
  onCopy: (value: string) => void;
  label: string;
}) {
  const copied = copiedValue === value;

  return (
    <button
      type="button"
      onClick={() => onCopy(value)}
      className={`rounded-[4px] border px-2 py-1 font-mono text-[12px] transition-colors ${
        copied
          ? "border-[var(--uc-action)] bg-[var(--uc-action-soft)] text-[var(--uc-action-hover)]"
          : "border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)] hover:border-[var(--uc-action)]"
      }`}
      title={`Copy ${label} ${value}`}
    >
      {copied ? "Copied" : value}
    </button>
  );
}

export function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="block h-[40px] w-full rounded-[6px] border border-[var(--uc-border)]"
      style={{ backgroundColor: color }}
      aria-label={label}
    />
  );
}

export function TypographyTokenCard({ token }: { token: TypographyToken }) {
  return (
    <article className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="uc-type-n4-strong text-[var(--uc-text)]">{token.label}</h3>
          <p className="uc-type-n5 mt-1 text-[var(--uc-text-muted)]">{token.usage}</p>
        </div>
        <div className="text-right">
          <p className="uc-type-n5-strong text-[var(--uc-text)]">{token.weight}</p>
          <p className="uc-type-n5 text-[var(--uc-text-muted)]">{token.fontSize}px</p>
        </div>
      </div>

      <div className="mt-4 rounded-[8px] bg-[var(--uc-app-bg)] px-4 py-5">
        <p className={`${token.className} text-[var(--uc-text)]`}>{token.sample}</p>
      </div>

      <div className="mt-4 grid gap-2">
        <code className="block break-all rounded bg-[var(--uc-app-bg)] px-2 py-1 text-[12px] text-[var(--uc-text-muted)]">
          .{token.className}
        </code>
        <p className="uc-type-n5 text-[var(--uc-text-muted)]">
          {token.family} / {token.weight} / {token.fontSize} px
        </p>
      </div>
    </article>
  );
}

export function ColorCard({
  color,
  copiedValue,
  onCopy,
}: {
  color: DesignSystemColor;
  copiedValue: string | null;
  onCopy: (value: string) => void;
}) {
  return (
    <article className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-3">
      <div className="grid grid-cols-2 gap-2">
        <ColorSwatch color={color.lightHex} label={`${color.name} light ${color.lightHex}`} />
        <ColorSwatch color={color.darkHex} label={`${color.name} dark ${color.darkHex}`} />
      </div>
      <div className="mt-3">
        <h3 className="font-['UniCredit:Bold',sans-serif] text-[16px] text-[var(--uc-text)]">{color.name}</h3>
        <code className="mt-1 block break-all rounded bg-[var(--uc-app-bg)] px-2 py-1 text-[11px] text-[var(--uc-text-muted)]">
          {color.cssVariable}
        </code>
      </div>
      <div className="mt-2 grid gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Light</span>
          <CopyHexButton value={color.lightHex} label="light" copiedValue={copiedValue} onCopy={onCopy} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Dark</span>
          <CopyHexButton value={color.darkHex} label="dark" copiedValue={copiedValue} onCopy={onCopy} />
        </div>
      </div>
      <p className="mt-2 text-[12px] leading-5 text-[var(--uc-text-muted)]">{color.usage}</p>
    </article>
  );
}

export function ColorAuditRow({ item }: { item: (typeof APP_COLOR_AUDIT)[number] }) {
  return (
    <article className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-3">
      <div className="flex items-center gap-3">
        <span
          className="size-[40px] shrink-0 rounded-[6px] border border-[var(--uc-border)]"
          style={{
            background:
              item.sourceColor.startsWith("#") && !item.sourceColor.includes("/")
                ? item.sourceColor
                : "linear-gradient(135deg, var(--uc-brand), var(--uc-orange-bright), var(--uc-yellow-gold))",
          }}
        />
        <div className="min-w-0">
          <code className="block break-all font-mono text-[12px] text-[var(--uc-text)]">{item.sourceColor}</code>
          <p className="mt-1 break-all font-['UniCredit:Bold',sans-serif] text-[13px] text-[var(--uc-text)]">{item.targetToken}</p>
        </div>
      </div>
      <p className="mt-3 text-[12px] leading-5 text-[var(--uc-text-muted)]">{item.usage}</p>
      {item.note && <p className="mt-1 text-[12px] leading-5 text-[var(--uc-text-subtle)]">{item.note}</p>}
    </article>
  );
}

export function ColorInventory() {
  const [selectedPaletteMeta, setSelectedPaletteMeta] = useState<(typeof COLOR_PALETTES)[number]>(COLOR_PALETTES[0]);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [colorSearchQuery, setColorSearchQuery] = useState("");
  const selectedPalette: ColorPaletteId = selectedPaletteMeta.id;
  const normalizedColorQuery = colorSearchQuery.trim().toLowerCase();
  const matchesColorQuery = (values: string[]) =>
    normalizedColorQuery.length === 0 || values.join(" ").toLowerCase().includes(normalizedColorQuery);
  const selectedColors = DESIGN_SYSTEM_COLORS.filter((color) =>
    color.paletteId === selectedPalette &&
    matchesColorQuery([
      color.id,
      color.name,
      color.lightHex,
      color.darkHex,
      color.paletteId,
      color.cssVariable,
      color.usage,
    ])
  );
  const visibleAuditRows = APP_COLOR_AUDIT.filter((item) =>
    matchesColorQuery([item.sourceColor, item.targetToken, item.usage, item.note ?? ""])
  );
  const handleCopy = (value: string) => {
    setCopiedValue(value);
    void navigator.clipboard?.writeText(value).catch(() => undefined);
    window.setTimeout(() => setCopiedValue((current) => (current === value ? null : current)), 1200);
  };

  return (
    <>
      <Section
        id="colors"
        title="Color palettes"
        description="Colors extracted from screenshots/Colors.svg, normalized into the canonical light-mode registry and proposed dark-mode mapping. The list is filtered by palette to keep the page compact and easy to scan."
      >
        <InventorySearchField
          value={colorSearchQuery}
          onChange={setColorSearchQuery}
          placeholder="Search colors"
          label="Search colors"
        />

        <div className="mb-6 rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-4">
          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Color palettes">
            {COLOR_PALETTES.map((palette) => {
              const count = DESIGN_SYSTEM_COLORS.filter((color) => color.paletteId === palette.id).length;
              const isActive = selectedPalette === palette.id;
              return (
                <button
                  key={palette.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedPaletteMeta(palette)}
                  className={`rounded-full border px-4 py-2 text-left text-[13px] transition-colors ${
                    isActive
                      ? "border-[var(--uc-action)] bg-[var(--uc-action)] text-[var(--uc-static-white)]"
                      : "border-[var(--uc-border)] bg-[var(--uc-app-bg)] text-[var(--uc-text-muted)] hover:border-[var(--uc-action)]"
                  }`}
                >
                  <span className="font-['UniCredit:Bold',sans-serif]">{palette.label}</span>
                  <span className="ml-2 opacity-75">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="rounded-[8px] bg-[var(--uc-app-bg)] p-4">
            <p className="font-['UniCredit:Bold',sans-serif] text-[18px] text-[var(--uc-text)]">
              {selectedPaletteMeta.label}
            </p>
            <p className="mt-1 max-w-[860px] text-[14px] leading-6 text-[var(--uc-text-muted)]">
              {selectedPaletteMeta.description}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {selectedColors.length > 0 ? (
            selectedColors.map((color) => (
              <ColorCard key={color.id} color={color} copiedValue={copiedValue} onCopy={handleCopy} />
            ))
          ) : (
            <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-6 text-[14px] text-[var(--uc-text-muted)] sm:col-span-2">
              No colors match this search.
            </div>
          )}
        </div>
      </Section>

      <Section
        id="color-audit"
        title="App color map"
        description="App color usage mapped back to design-system tokens. Remaining exceptions are treated as decorative or brand-like assets, not reusable UI colors."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleAuditRows.length > 0 ? (
            visibleAuditRows.map((item) => (
              <ColorAuditRow key={`${item.sourceColor}-${item.targetToken}`} item={item} />
            ))
          ) : (
            <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-6 text-[14px] text-[var(--uc-text-muted)] sm:col-span-2">
              No app color rows match this search.
            </div>
          )}
        </div>
      </Section>
    </>
  );
}

export function TypographyInventory() {
  const [typographySearchQuery, setTypographySearchQuery] = useState("");
  const normalizedTypographyQuery = typographySearchQuery.trim().toLowerCase();
  const visibleTypographyTokens = TYPOGRAPHY_TOKENS.filter((token) => {
    if (!normalizedTypographyQuery) return true;
    return [
      token.id,
      token.label,
      token.className,
      token.family,
      token.weight,
      String(token.fontSize),
      token.usage,
      token.sample,
    ].join(" ").toLowerCase().includes(normalizedTypographyQuery);
  });

  return (
    <Section
      id="typography"
      title="Typography"
      description="Canonical typography tokens derived from the supplied Figma taxonomy. Active PI surfaces should call these named tokens instead of hardcoding font sizes, so a future token change propagates globally."
    >
      <InventoryStatGrid
        items={[
          ["Named tokens", TYPOGRAPHY_TOKENS.length],
          ["Visible", visibleTypographyTokens.length],
        ]}
      />

      <InventorySearchField
        value={typographySearchQuery}
        onChange={setTypographySearchQuery}
        placeholder="Search typography"
        label="Search typography"
      />

      {visibleTypographyTokens.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleTypographyTokens.map((token) => (
            <TypographyTokenCard key={token.id} token={token} />
          ))}
        </div>
      ) : (
        <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-6 text-[14px] text-[var(--uc-text-muted)]">
          No typography tokens match this search.
        </div>
      )}
    </Section>
  );
}

export function getIconPreviewSize(icon: IconInventoryItem) {
  const width = icon.previewWidth > 0 ? icon.previewWidth : 20;
  const height = icon.previewHeight > 0 ? icon.previewHeight : 20;
  const maxSide = 32;

  if (width >= height) {
    const displayWidth = Math.min(width, maxSide);
    return {
      width: displayWidth,
      height: Math.max(1, Math.round((displayWidth / width) * height)),
    };
  }

  const displayHeight = Math.min(height, maxSide);
  return {
    width: Math.max(1, Math.round((displayHeight / height) * width)),
    height: displayHeight,
  };
}

export function IconInventoryCard({ icon }: { icon: IconInventoryItem }) {
  const previewSize = getIconPreviewSize(icon);
  const cardRef = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const getSerializedSvg = () => {
    const svg = cardRef.current?.querySelector("svg");
    if (!svg) return null;

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("color", "#262626");
    clone.removeAttribute("class");

    return new XMLSerializer().serializeToString(clone);
  };

  const handleCopySvg = async () => {
    const serializedSvg = getSerializedSvg();
    if (!serializedSvg) return;

    await navigator.clipboard.writeText(serializedSvg);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const downloadSvg = () => {
    const serializedSvg = getSerializedSvg();
    if (!serializedSvg) return;

    const blob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${icon.name}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadOpen(false);
  };

  const downloadPng = () => {
    const serializedSvg = getSerializedSvg();
    if (!serializedSvg) return;

    const image = new Image();
    const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    image.onload = () => {
      const scale = 4;
      const canvas = document.createElement("canvas");
      canvas.width = previewSize.width * scale;
      canvas.height = previewSize.height * scale;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `${icon.name}.png`;
        link.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
    };

    image.src = url;
    setDownloadOpen(false);
  };

  return (
    <article ref={cardRef} className="group rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-3">
      <div className="flex items-center gap-3">
        <div className="grid size-[32px] shrink-0 place-items-center rounded-[6px] border border-[var(--uc-border-muted)] bg-[var(--uc-app-bg)]">
          <AppIcon name={icon.name} color="var(--uc-text)" width={previewSize.width} height={previewSize.height} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-h-[22px] items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate font-['UniCredit:Bold',sans-serif] text-[14px] leading-5 text-[var(--uc-text)]" title={icon.label}>
              {icon.label}
            </h3>
            <div
              className={`ml-auto flex shrink-0 items-center gap-0.5 transition-opacity ${
                copied || downloadOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
              }`}
            >
              {copied ? <span className="text-[10px] text-[var(--uc-text-muted)]">Copied</span> : null}
              <button
                type="button"
                onClick={handleCopySvg}
                className="grid size-[20px] place-items-center rounded-[4px] text-[var(--uc-text-muted)] hover:bg-[var(--uc-app-bg)] hover:text-[var(--uc-text)] focus-visible:bg-[var(--uc-app-bg)] focus-visible:text-[var(--uc-text)] focus-visible:outline-none"
                aria-label={`Copy ${icon.label} SVG`}
                title={copied ? "Copied" : "Copy SVG"}
              >
                <AppIcon name="copy-documents" color="currentColor" width={15} height={15} />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDownloadOpen((value) => !value)}
                  className="grid size-[20px] place-items-center rounded-[4px] text-[var(--uc-text-muted)] hover:bg-[var(--uc-app-bg)] hover:text-[var(--uc-text)] focus-visible:bg-[var(--uc-app-bg)] focus-visible:text-[var(--uc-text)] focus-visible:outline-none"
                  aria-label={`Download ${icon.label}`}
                  aria-expanded={downloadOpen}
                  title="Download"
                >
                  <AppIcon name="download" color="currentColor" width={15} height={15} />
                </button>
                {downloadOpen ? (
                  <div className="absolute right-0 top-[24px] z-20 grid min-w-[86px] rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] py-1 shadow-lg">
                    <button type="button" onClick={downloadPng} className="px-3 py-1.5 text-left text-[12px] text-[var(--uc-text)] hover:bg-[var(--uc-app-bg)]">
                      PNG
                    </button>
                    <button type="button" onClick={downloadSvg} className="px-3 py-1.5 text-left text-[12px] text-[var(--uc-text)] hover:bg-[var(--uc-app-bg)]">
                      SVG
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function getInventoryFileName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function escapeSvgText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function PfmIconInventoryCard({ category }: { category: PfmCategoryDefinition }) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const fileName = `pfm-${getInventoryFileName(category.name)}`;

  const getCategoryColor = () =>
    getComputedStyle(document.documentElement).getPropertyValue(category.colorVar).trim() || "#262626";

  const getSerializedSvg = () => {
    const categoryColor = getCategoryColor();
    const svg = cardRef.current?.querySelector("svg");

    if (svg) {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.removeAttribute("class");
      clone.querySelectorAll("path").forEach((path) => {
        path.setAttribute("fill", categoryColor);
      });

      return new XMLSerializer().serializeToString(clone);
    }

    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">',
      `<circle cx="10" cy="10" r="10" fill="${categoryColor}"/>`,
      `<text x="10" y="14" text-anchor="middle" font-family="UniCredit, Arial, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">${escapeSvgText(category.fallbackInitial)}</text>`,
      "</svg>",
    ].join("");
  };

  const handleCopySvg = async () => {
    const serializedSvg = getSerializedSvg();
    await navigator.clipboard.writeText(serializedSvg);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const downloadSvg = () => {
    const serializedSvg = getSerializedSvg();
    const blob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadOpen(false);
  };

  const downloadPng = () => {
    const serializedSvg = getSerializedSvg();
    const image = new Image();
    const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 4;
      canvas.width = 20 * scale;
      canvas.height = 20 * scale;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `${fileName}.png`;
        link.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
    };

    image.src = url;
    setDownloadOpen(false);
  };

  return (
    <article
      ref={cardRef}
      className="group rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-3"
      data-pfm-icon-inventory={category.name}
    >
      <div className="flex items-center gap-3">
        <div className="grid size-[32px] shrink-0 place-items-center rounded-[6px] border border-[var(--uc-border-muted)] bg-[var(--uc-app-bg)]">
          <PfmCategoryIcon category={category.name} size={32} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-h-[22px] items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate font-['UniCredit:Bold',sans-serif] text-[14px] leading-5 text-[var(--uc-text)]" title={category.name}>
              {category.name}
            </h3>
            <div
              className={`ml-auto flex shrink-0 items-center gap-0.5 transition-opacity ${
                copied || downloadOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
              }`}
            >
              {copied ? <span className="text-[10px] text-[var(--uc-text-muted)]">Copied</span> : null}
              <button
                type="button"
                onClick={handleCopySvg}
                className="grid size-[20px] place-items-center rounded-[4px] text-[var(--uc-text-muted)] hover:bg-[var(--uc-app-bg)] hover:text-[var(--uc-text)] focus-visible:bg-[var(--uc-app-bg)] focus-visible:text-[var(--uc-text)] focus-visible:outline-none"
                aria-label={`Copy ${category.name} PFM SVG`}
                title={copied ? "Copied" : "Copy SVG"}
              >
                <AppIcon name="copy-documents" color="currentColor" width={15} height={15} />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDownloadOpen((value) => !value)}
                  className="grid size-[20px] place-items-center rounded-[4px] text-[var(--uc-text-muted)] hover:bg-[var(--uc-app-bg)] hover:text-[var(--uc-text)] focus-visible:bg-[var(--uc-app-bg)] focus-visible:text-[var(--uc-text)] focus-visible:outline-none"
                  aria-label={`Download ${category.name} PFM icon`}
                  aria-expanded={downloadOpen}
                  title="Download"
                >
                  <AppIcon name="download" color="currentColor" width={15} height={15} />
                </button>
                {downloadOpen ? (
                  <div className="absolute right-0 top-[24px] z-20 grid min-w-[86px] rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] py-1 shadow-lg">
                    <button type="button" onClick={downloadPng} className="px-3 py-1.5 text-left text-[12px] text-[var(--uc-text)] hover:bg-[var(--uc-app-bg)]">
                      PNG
                    </button>
                    <button type="button" onClick={downloadSvg} className="px-3 py-1.5 text-left text-[12px] text-[var(--uc-text)] hover:bg-[var(--uc-app-bg)]">
                      SVG
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function matchesIconSearch(icon: IconInventoryItem, query: string) {
  if (!query.trim()) return true;

  const normalizedQuery = query.trim().toLowerCase();
  const searchableText = [
    icon.label,
    icon.name,
    icon.defaultSize,
    icon.viewBox,
    icon.category,
    icon.source,
    ...icon.usage,
  ].join(" ").toLowerCase();

  return searchableText.includes(normalizedQuery);
}

export function matchesPfmIconSearch(category: PfmCategoryDefinition, query: string) {
  if (!query.trim()) return true;

  const normalizedQuery = query.trim().toLowerCase();
  const searchableText = [
    category.name,
    category.colorVar,
    category.fallbackInitial,
    "PFM category",
    PFM_ICON_SOURCE,
  ].join(" ").toLowerCase();

  return searchableText.includes(normalizedQuery);
}

export function IconInventory() {
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const visibleIcons = ICON_INVENTORY.filter((icon) => matchesIconSearch(icon, iconSearchQuery));
  const visiblePfmIcons = PFM_CATEGORIES.filter((category) => matchesPfmIconSearch(category, iconSearchQuery));
  const customCount = ICON_INVENTORY.filter((icon) => icon.source === "custom").length;
  const lucideCount = ICON_INVENTORY.filter((icon) => icon.source === "lucide").length;
  const hasVisibleResults = visibleIcons.length > 0 || visiblePfmIcons.length > 0;

  return (
    <Section
      id="icons"
      title="Icon registry"
      description="Single source of truth for reusable product icons, plus the PFM category icon map used by spending surfaces."
    >
      <InventoryStatGrid
        items={[
          ["App icons", ICON_INVENTORY.length],
          ["PFM icons", PFM_CATEGORIES.length],
          ["Visible", visibleIcons.length + visiblePfmIcons.length],
          ["Custom SVG", customCount],
          ["Lucide wrappers", lucideCount],
        ]}
      />

      <InventorySearchField
        value={iconSearchQuery}
        onChange={setIconSearchQuery}
        placeholder="Search icons"
        label="Search icons"
      />

      {visibleIcons.length > 0 ? (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] xl:grid-cols-4">
          {visibleIcons.map((icon) => (
            <IconInventoryCard key={icon.name} icon={icon} />
          ))}
        </div>
      ) : null}

      {visiblePfmIcons.length > 0 ? (
        <div id="pfm-icons" className={`${visibleIcons.length > 0 ? "mt-8" : ""} scroll-mt-28`}>
          <div className="mb-4 flex items-end gap-4 border-t border-[var(--uc-border-muted)] pt-6">
            <div>
              <h3 className="font-['UniCredit:Bold',sans-serif] text-[22px] leading-7 text-[var(--uc-text)]">PFM icons</h3>
              <p className="mt-1 text-[13px] text-[var(--uc-text-muted)]">
                Category glyphs from {PFM_ICON_SOURCE}, rendered through PfmCategoryIcon.
              </p>
            </div>
            <span className="ml-auto font-['UniCredit:Bold',sans-serif] text-[18px] text-[var(--uc-text)]">{visiblePfmIcons.length}</span>
          </div>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] xl:grid-cols-4">
            {visiblePfmIcons.map((category) => (
              <PfmIconInventoryCard key={category.name} category={category} />
            ))}
          </div>
        </div>
      ) : null}

      {!hasVisibleResults ? (
        <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-6 text-[14px] text-[var(--uc-text-muted)]">
          No icons match this search.
        </div>
      ) : null}
    </Section>
  );
}
