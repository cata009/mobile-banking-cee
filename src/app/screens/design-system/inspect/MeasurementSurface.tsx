/**
 * Inspect mode: the overlay that measures a rendered specimen and draws spacing,
 * padding, and sibling-distance guides over it.
 *
 * Extracted verbatim from DesignSystemPage.tsx, which had grown to 4,371 lines.
 */
import {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export const noop = () => {};

export const InspectModeContext = createContext(false);

type MeasuredElement = {
  id: string;
  label: string;
  tag: string;
  width: number;
  height: number;
  x: number;
  y: number;
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  fontFamily: string;
  padding: string;
  margin: string;
  parentDistance: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  parentDisplay: string;
  parentGap: string;
  guides: SpacingGuide[];
  spacingRows: readonly [string, string][];
};

type ElementBox = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  x: number;
  y: number;
};

type SpacingGuide = {
  id: string;
  label: string;
  kind: "parent" | "padding" | "sibling" | "gap";
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: "horizontal" | "vertical";
};

function roundPx(value: number) {
  return Math.round(value * 10) / 10;
}

export function px(value: number) {
  return `${roundPx(value)} px`;
}

function parsePx(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function compactText(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim().slice(0, 42);
}

function getElementLabel(element: Element) {
  const explicit = element.getAttribute("data-ds-label") || element.getAttribute("aria-label");
  if (explicit) return explicit;

  const text = compactText(element.textContent);
  if (text && !["svg", "path", "g"].includes(element.tagName.toLowerCase())) {
    return text;
  }

  const tag = element.tagName.toLowerCase();
  if (tag === "svg") return "icon / svg";
  if (tag === "img") return "image";
  if (tag === "button") return "button";
  return tag;
}

function getSpacing(style: CSSStyleDeclaration, prefix: "padding" | "margin") {
  return `${style.getPropertyValue(`${prefix}-top`)} ${style.getPropertyValue(`${prefix}-right`)} ${style.getPropertyValue(`${prefix}-bottom`)} ${style.getPropertyValue(`${prefix}-left`)}`;
}

function getSpacingValues(style: CSSStyleDeclaration, prefix: "padding" | "margin") {
  return {
    top: parsePx(style.getPropertyValue(`${prefix}-top`)),
    right: parsePx(style.getPropertyValue(`${prefix}-right`)),
    bottom: parsePx(style.getPropertyValue(`${prefix}-bottom`)),
    left: parsePx(style.getPropertyValue(`${prefix}-left`)),
  };
}

function readBox(rect: DOMRect, rootRect: DOMRect): ElementBox {
  return {
    left: roundPx(rect.left - rootRect.left),
    top: roundPx(rect.top - rootRect.top),
    right: roundPx(rect.right - rootRect.left),
    bottom: roundPx(rect.bottom - rootRect.top),
    width: roundPx(rect.width),
    height: roundPx(rect.height),
    x: roundPx(rect.left - rootRect.left),
    y: roundPx(rect.top - rootRect.top),
  };
}

function addSpacingGuide(
  guides: SpacingGuide[],
  id: string,
  label: string,
  kind: SpacingGuide["kind"],
  x: number,
  y: number,
  width: number,
  height: number,
  orientation: SpacingGuide["orientation"]
) {
  if (width < 0.5 || height < 0.5) return;
  guides.push({
    id,
    label,
    kind,
    x: roundPx(x),
    y: roundPx(y),
    width: roundPx(width),
    height: roundPx(height),
    orientation,
  });
}

function addParentDistanceGuides(guides: SpacingGuide[], box: ElementBox, parentBox: ElementBox) {
  const rail = Math.min(28, Math.max(10, box.height));
  const verticalRail = Math.min(28, Math.max(10, box.width));

  addSpacingGuide(guides, "parent-left", px(box.left - parentBox.left), "parent", parentBox.left, box.top + box.height / 2 - rail / 2, box.left - parentBox.left, rail, "horizontal");
  addSpacingGuide(guides, "parent-right", px(parentBox.right - box.right), "parent", box.right, box.top + box.height / 2 - rail / 2, parentBox.right - box.right, rail, "horizontal");
  addSpacingGuide(guides, "parent-top", px(box.top - parentBox.top), "parent", box.left + box.width / 2 - verticalRail / 2, parentBox.top, verticalRail, box.top - parentBox.top, "vertical");
  addSpacingGuide(guides, "parent-bottom", px(parentBox.bottom - box.bottom), "parent", box.left + box.width / 2 - verticalRail / 2, box.bottom, verticalRail, parentBox.bottom - box.bottom, "vertical");
}

function addPaddingGuides(guides: SpacingGuide[], box: ElementBox, padding: ReturnType<typeof getSpacingValues>) {
  addSpacingGuide(guides, "padding-top", px(padding.top), "padding", box.left, box.top, box.width, padding.top, "vertical");
  addSpacingGuide(guides, "padding-right", px(padding.right), "padding", box.right - padding.right, box.top, padding.right, box.height, "horizontal");
  addSpacingGuide(guides, "padding-bottom", px(padding.bottom), "padding", box.left, box.bottom - padding.bottom, box.width, padding.bottom, "vertical");
  addSpacingGuide(guides, "padding-left", px(padding.left), "padding", box.left, box.top, padding.left, box.height, "horizontal");
}

function getVisibleSiblingBox(element: Element, rootRect: DOMRect, direction: "previous" | "next") {
  let sibling = direction === "previous" ? element.previousElementSibling : element.nextElementSibling;

  while (sibling) {
    if (!sibling.closest("[data-inspector-ui='true']")) {
      const rect = sibling.getBoundingClientRect();
      if (rect.width >= 4 && rect.height >= 4) return readBox(rect, rootRect);
    }
    sibling = direction === "previous" ? sibling.previousElementSibling : sibling.nextElementSibling;
  }

  return null;
}

function addSiblingGuides(guides: SpacingGuide[], box: ElementBox, previousBox: ElementBox | null, nextBox: ElementBox | null) {
  const rail = Math.min(24, Math.max(10, box.height));
  const verticalRail = Math.min(24, Math.max(10, box.width));

  if (previousBox) {
    if (previousBox.right <= box.left) {
      addSpacingGuide(guides, "sibling-previous-x", px(box.left - previousBox.right), "sibling", previousBox.right, box.top + box.height / 2 - rail / 2, box.left - previousBox.right, rail, "horizontal");
    } else if (previousBox.bottom <= box.top) {
      addSpacingGuide(guides, "sibling-previous-y", px(box.top - previousBox.bottom), "sibling", box.left + box.width / 2 - verticalRail / 2, previousBox.bottom, verticalRail, box.top - previousBox.bottom, "vertical");
    }
  }

  if (nextBox) {
    if (box.right <= nextBox.left) {
      addSpacingGuide(guides, "sibling-next-x", px(nextBox.left - box.right), "sibling", box.right, box.top + box.height / 2 - rail / 2, nextBox.left - box.right, rail, "horizontal");
    } else if (box.bottom <= nextBox.top) {
      addSpacingGuide(guides, "sibling-next-y", px(nextBox.top - box.bottom), "sibling", box.left + box.width / 2 - verticalRail / 2, box.bottom, verticalRail, nextBox.top - box.bottom, "vertical");
    }
  }
}

function readElementMeasurement(element: Element, root: HTMLElement, index: number): MeasuredElement | null {
  const rect = element.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const parentElement = element.parentElement || root;
  const parentRect = parentElement.getBoundingClientRect();

  if (rect.width < 4 || rect.height < 4) return null;

  const style = window.getComputedStyle(element);
  const parentStyle = window.getComputedStyle(parentElement);
  const box = readBox(rect, rootRect);
  const parentBox = readBox(parentRect, rootRect);
  const paddingValues = getSpacingValues(style, "padding");
  const marginValues = getSpacingValues(style, "margin");
  const previousBox = getVisibleSiblingBox(element, rootRect, "previous");
  const nextBox = getVisibleSiblingBox(element, rootRect, "next");
  const guides: SpacingGuide[] = [];
  const rowGap = parentStyle.getPropertyValue("row-gap");
  const columnGap = parentStyle.getPropertyValue("column-gap");
  const parentGap = `${rowGap} / ${columnGap}`;
  const parentDistance = {
    left: roundPx(rect.left - parentRect.left),
    top: roundPx(rect.top - parentRect.top),
    right: roundPx(parentRect.right - rect.right),
    bottom: roundPx(parentRect.bottom - rect.bottom),
  };

  addParentDistanceGuides(guides, box, parentBox);
  addPaddingGuides(guides, box, paddingValues);
  addSiblingGuides(guides, box, previousBox, nextBox);

  if (parsePx(rowGap) > 0 || parsePx(columnGap) > 0) {
    addSpacingGuide(guides, "parent-gap-chip", `gap ${parentGap}`, "gap", box.left, box.bottom + 4, Math.min(box.width, 140), 18, "horizontal");
  }

  return {
    id: `${element.tagName.toLowerCase()}-${index}`,
    label: getElementLabel(element),
    tag: element.tagName.toLowerCase(),
    width: box.width,
    height: box.height,
    x: box.x,
    y: box.y,
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    fontWeight: style.fontWeight,
    fontFamily: style.fontFamily,
    padding: getSpacing(style, "padding"),
    margin: getSpacing(style, "margin"),
    parentDistance,
    parentDisplay: parentStyle.display,
    parentGap,
    guides,
    spacingRows: [
      ["parent", `L ${px(parentDistance.left)} · T ${px(parentDistance.top)} · R ${px(parentDistance.right)} · B ${px(parentDistance.bottom)}`],
      ["padding", `T ${px(paddingValues.top)} · R ${px(paddingValues.right)} · B ${px(paddingValues.bottom)} · L ${px(paddingValues.left)}`],
      ["margin", `T ${px(marginValues.top)} · R ${px(marginValues.right)} · B ${px(marginValues.bottom)} · L ${px(marginValues.left)}`],
      ["parent gap", parentGap],
      ["previous", previousBox ? `${px(Math.max(box.left - previousBox.right, box.top - previousBox.bottom, 0))}` : "none"],
      ["next", nextBox ? `${px(Math.max(nextBox.left - box.right, nextBox.top - box.bottom, 0))}` : "none"],
    ],
  };
}

export function MeasurementSurface({ children }: { children: React.ReactNode }) {
  const inspectMode = useContext(InspectModeContext);
  const rootRef = useRef<HTMLDivElement>(null);
  const [measurements, setMeasurements] = useState<MeasuredElement[]>([]);
  const [active, setActive] = useState<MeasuredElement | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const measure = () => {
    const root = rootRef.current;
    if (!root || !inspectMode) {
      setMeasurements([]);
      return;
    }

    const selector = [
      "[data-ds-label]",
      "button",
      "h1",
      "h2",
      "h3",
      "h4",
      "p",
      "span",
      "svg",
      "img",
      "input",
      "textarea",
      "select",
    ].join(",");

    const elements = Array.from(root.querySelectorAll(selector))
      .filter((element) => !element.closest("[data-inspector-ui='true']"));

    setMeasurements(
      elements
        .map((element, index) => readElementMeasurement(element, root, index))
        .filter((item): item is MeasuredElement => Boolean(item))
    );
  };

  useLayoutEffect(() => {
    measure();
  }, [inspectMode, children]);

  useEffect(() => {
    if (!inspectMode || !rootRef.current) return;

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(rootRef.current);
    window.addEventListener("resize", measure);

    const timeout = window.setTimeout(measure, 250);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(timeout);
    };
  }, [inspectMode]);

  const findMeasurementFromEvent = (target: EventTarget | null) => {
    const root = rootRef.current;
    if (!root || !(target instanceof Element)) return null;
    const measuredTarget = target.closest("[data-ds-label], button, h1, h2, h3, h4, p, span, svg, img, input, textarea, select");
    if (!measuredTarget || !root.contains(measuredTarget)) return null;

    const rect = measuredTarget.getBoundingClientRect();
    return measurements.find((item) => item.width === roundPx(rect.width) && item.height === roundPx(rect.height) && item.label === getElementLabel(measuredTarget)) || null;
  };

  const focusedMeasurement = active || measurements.find((item) => item.id === hoveredId) || null;

  return (
    <div
      ref={rootRef}
      className={inspectMode ? "relative min-h-[32px] cursor-crosshair" : "relative"}
      onMouseMoveCapture={(event) => {
        if (!inspectMode) return;
        const item = findMeasurementFromEvent(event.target);
        setHoveredId(item?.id || null);
      }}
      onMouseLeave={() => setHoveredId(null)}
      onClickCapture={(event) => {
        if (!inspectMode) return;
        const item = findMeasurementFromEvent(event.target);
        if (!item) return;
        event.preventDefault();
        event.stopPropagation();
        setActive(item);
      }}
    >
      {children}

      {inspectMode && (
        <div className="pointer-events-none absolute inset-0 z-[60]" data-inspector-ui="true">
          {focusedMeasurement?.guides.map((guide) => (
            <div
              key={guide.id}
              className="absolute"
              style={{
                left: guide.x,
                top: guide.y,
                width: guide.width,
                height: guide.height,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor:
                    guide.kind === "padding"
                      ? "color-mix(in srgb, var(--uc-action) 10%, transparent)"
                      : "color-mix(in srgb, var(--uc-brand) 14%, transparent)",
                  border: "1px dashed color-mix(in srgb, var(--uc-text) 64%, transparent)",
                }}
              />
              <div
                className="absolute z-[2] whitespace-nowrap rounded-[4px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-1.5 py-0.5 font-['UniCredit:Bold',sans-serif] text-[11px] text-[var(--uc-text)] shadow-sm"
                style={{
                  left: guide.orientation === "horizontal" ? "50%" : "100%",
                  top: "50%",
                  transform: guide.orientation === "horizontal" ? "translate(-50%, -50%)" : "translate(4px, -50%)",
                }}
              >
                {guide.label}
              </div>
            </div>
          ))}
          {measurements.map((item) => {
            const isActive = active?.id === item.id;
            const isHovered = hoveredId === item.id;
            const showLabel = isActive || isHovered || item.tag === "h1" || item.tag === "button" || item.tag === "svg";
            return (
              <div
                key={item.id}
                className={`absolute border ${isActive ? "border-[var(--uc-action)]" : isHovered ? "border-[var(--uc-brand)]" : "border-[var(--uc-action-soft-strong)]/60"} ${isActive || isHovered ? "border-solid" : "border-dashed"}`}
                style={{ left: item.x, top: item.y, width: item.width, height: item.height }}
              >
                {showLabel && (
                  <div className={`absolute left-0 top-0 -translate-y-full whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] text-[var(--uc-static-white)] ${isActive ? "bg-[var(--uc-action-strong)]" : "bg-[var(--uc-text)]"}`}>
                    {item.label} · {item.width}x{item.height}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {inspectMode && active && (
        <div className="absolute bottom-3 right-3 z-[70] w-[360px] rounded-[8px] border border-[var(--uc-action)] bg-[var(--uc-surface)] p-3 shadow-xl" data-inspector-ui="true">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="font-['UniCredit:Bold',sans-serif] text-[13px] text-[var(--uc-action)]">{active.label}</p>
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--uc-text-subtle)]">{active.tag}</p>
            </div>
            <button className="pointer-events-auto rounded px-2 text-[12px] text-[var(--uc-text-muted)] hover:bg-[var(--uc-surface-muted)]" onClick={() => setActive(null)}>
              close
            </button>
          </div>
          <dl className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-1 text-[12px]">
            <dt className="text-[var(--uc-text-subtle)]">size</dt><dd>{active.width}px x {active.height}px</dd>
            <dt className="text-[var(--uc-text-subtle)]">position</dt><dd>x {active.x}px / y {active.y}px</dd>
            <dt className="text-[var(--uc-text-subtle)]">font</dt><dd>{active.fontSize} / {active.lineHeight} / {active.fontWeight}</dd>
            <dt className="text-[var(--uc-text-subtle)]">family</dt><dd className="truncate">{active.fontFamily}</dd>
            <dt className="text-[var(--uc-text-subtle)]">padding</dt><dd>{active.padding}</dd>
            <dt className="text-[var(--uc-text-subtle)]">margin</dt><dd>{active.margin}</dd>
            <dt className="text-[var(--uc-text-subtle)]">parent layout</dt><dd>{active.parentDisplay} · gap {active.parentGap}</dd>
            <dt className="text-[var(--uc-text-subtle)]">to parent</dt>
            <dd>L {active.parentDistance.left}px · T {active.parentDistance.top}px · R {active.parentDistance.right}px · B {active.parentDistance.bottom}px</dd>
          </dl>
          <div className="mt-3 border-t border-[var(--uc-border-muted)] pt-2">
            <p className="mb-1 font-['UniCredit:Bold',sans-serif] text-[12px] text-[var(--uc-text)]">Spacing audit</p>
            <dl className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-1 text-[12px]">
              {active.spacingRows.map(([label, value]) => (
                <Fragment key={label}>
                  <dt className="text-[var(--uc-text-subtle)]">{label}</dt>
                  <dd>{value}</dd>
                </Fragment>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
