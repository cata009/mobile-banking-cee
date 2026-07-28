import type { SVGProps } from "react";
import { CUSTOM_ICONS } from "./customIcons";
import type { IconCategory, IconDefinition } from "./iconTypes";
import { LUCIDE_ICONS } from "./lucideIcons";

export type { IconCategory } from "./iconTypes";

const STANDARD_UI_ICON_GLYPH_SIZE = 20;
const NON_STANDARD_ICON_NAMES = new Set([
  "user-event-badge",
  "user-event-refresh",
  "investment-history",
  "investment-to-approve",
  "warning-small",
  "hu-kids-request-money",
  "hu-kids-account-details",
  "hu-kids-more-options",
  "hu-kids-saving",
  // 32×32 container icons — rendered at native size, not the 20×20 standard glyph override
  "close-x",
  "chevron-link",
  "investment-documents",
  "investment-important-info",
  "investment-disclaimer",
  // Non-square glyph — forcing it into the 20×20 standard box would letterbox it
  "redo-payment",
  "request-chargeback",
  "investment-ex-ante",
  "trade-buy",
  "trade-sell",
  "card-options-apple-pay",
  "card-options-mastercard",
  "card-options-registrations",
  "card-options-limits",
  "card-options-change-name",
  "card-options-delivery-address",
  "card-options-reissue",
]);
const ICON_INVENTORY_EXCLUDED_NAMES = new Set(["radio-unselected", "radio-selected"]);

export const ICON_REGISTRY = {
  ...CUSTOM_ICONS,
  ...LUCIDE_ICONS,
} satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICON_REGISTRY;

export type IconInventoryItem = {
  name: IconName;
  label: string;
  category: IconCategory;
  source: IconDefinition["source"];
  defaultSize: string;
  previewWidth: number;
  previewHeight: number;
  viewBox: string;
  usage: string[];
  notes?: string;
};

function usesStandardUiGlyph(name: IconName) {
  return !NON_STANDARD_ICON_NAMES.has(name);
}

function resolveDefaultDimensions(name: IconName, definition: IconDefinition) {
  if (usesStandardUiGlyph(name)) {
    return {
      width: STANDARD_UI_ICON_GLYPH_SIZE,
      height: STANDARD_UI_ICON_GLYPH_SIZE,
    };
  }

  return {
    width: definition.width,
    height: definition.height,
  };
}

function getInventorySizeLabel(name: IconName, definition: IconDefinition) {
  if (usesStandardUiGlyph(name)) {
    return "32x32 slot / 20x20 glyph";
  }

  return `${definition.width}x${definition.height}`;
}

export const ICON_INVENTORY: IconInventoryItem[] = Object.entries(ICON_REGISTRY)
  .filter(([rawName]) => !ICON_INVENTORY_EXCLUDED_NAMES.has(rawName))
  .map(([rawName, registeredDefinition]) => {
    const name = rawName as IconName;
    const definition: IconDefinition = registeredDefinition;
    const defaultDimensions = resolveDefaultDimensions(name, definition);

    return {
      name,
      label: definition.label,
      category: definition.category,
      source: definition.source,
      defaultSize: getInventorySizeLabel(name, definition),
      previewWidth: defaultDimensions.width,
      previewHeight: defaultDimensions.height,
      viewBox: definition.source === "custom" ? definition.viewBox : "lucide-react",
      usage: definition.usage,
      notes: definition.notes,
    };
  });

export const ICON_AUDIT_EXCLUSIONS = [
  {
    scope: "src/imports/**",
    reason: "Generated Figma exports used as template/source evidence, not editable platform icon components.",
  },
  {
    scope: "src/app/components/ui/**",
    reason: "Vendored shadcn primitives keep their internal lucide slots; app/product icons route through AppIcon.",
  },
  {
    scope: "UniCreditLogo, DemoTopBar logo, Prime wordmark SVGs",
    reason: "Brand marks stay as logo assets, not reusable UI icons.",
  },
  {
    scope: "StatusBar and phone chrome SVGs",
    reason: "Device chrome is a frame artifact with dynamic battery/network drawing, not an app icon.",
  },
  {
    scope: "EdgeLoadingAnimation, ShareScreenGlow, StackedProductShadow, PrimeScreen texture SVGs, FloatingCoAppingButton background shape",
    reason: "Decorative motion, texture, shadow and panel-shape SVGs are visual effects rather than reusable icon components.",
  },
  {
    scope: "PfmCategoryIcon",
    reason: "PFM category glyphs are a domain-specific icon map sourced from screenshots/PFM-icons.svg and already centralized in that category registry.",
  },
  {
    scope: "ProductOfferCard chevron background SVG",
    reason: "Decorative banner background geometry, not a tappable/reusable UI icon.",
  },
] as const;

type AppIconProps = Omit<SVGProps<SVGSVGElement>, "name" | "color" | "width" | "height"> & {
  name: IconName;
  size?: number;
  width?: number;
  height?: number;
  color?: string;
  title?: string;
  strokeWidth?: number;
};

function resolveSize(name: IconName, definition: IconDefinition, size?: number, width?: number, height?: number) {
  if (width || height) {
    return {
      width: width ?? size ?? definition.width,
      height: height ?? size ?? definition.height,
    };
  }

  if (size) {
    return {
      width: size,
      height: size,
    };
  }

  return resolveDefaultDimensions(name, definition);
}

function normalizeSvgDisplayClassName(className?: string) {
  if (!className) return undefined;

  return className
    .replace(/\bw-6\b/g, "w-5")
    .replace(/\bh-6\b/g, "h-5")
    .replace(/\bsize-6\b/g, "size-5");
}

export function AppIcon({
  name,
  size,
  width,
  height,
  color = "currentColor",
  title,
  strokeWidth,
  className,
  ...svgProps
}: AppIconProps) {
  const resolvedName = name in ICON_REGISTRY ? name : "help-circle";
  const definition: IconDefinition = ICON_REGISTRY[resolvedName];
  const dimensions = resolveSize(resolvedName, definition, size, width, height);
  const normalizedClassName = normalizeSvgDisplayClassName(className);

  if (definition.source === "lucide") {
    const LucideComponent = definition.component;
    return (
      <LucideComponent
        aria-hidden={title ? undefined : true}
        className={normalizedClassName}
        color={color}
        height={dimensions.height}
        role={title ? "img" : undefined}
        strokeWidth={strokeWidth ?? definition.strokeWidth}
        width={dimensions.width}
        {...svgProps}
      >
        {title ? <title>{title}</title> : null}
      </LucideComponent>
    );
  }

  return (
    <svg
      aria-hidden={title ? undefined : true}
      className={normalizedClassName}
      color={color}
      fill="none"
      height={dimensions.height}
      role={title ? "img" : undefined}
      viewBox={definition.viewBox}
      width={dimensions.width}
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      {title ? <title>{title}</title> : null}
      {definition.render()}
    </svg>
  );
}
