/**
 * UnsupportedContextScreen
 * Honest placeholder for product/design-system combinations that are modeled but not implemented yet.
 */

import { DESIGN_SYSTEMS, PRODUCTS } from "@/app/registry/projectModel";
import type { DesignSystemId, ProductId } from "@/app/state/demoTypes";

interface UnsupportedContextScreenProps {
  product: ProductId;
  designSystem: DesignSystemId;
}

export default function UnsupportedContextScreen({
  product,
  designSystem,
}: UnsupportedContextScreenProps) {
  const productMeta = PRODUCTS[product];
  const designSystemMeta = DESIGN_SYSTEMS[designSystem];

  return (
    <div className="w-full h-full bg-[var(--uc-app-bg)] flex flex-col">
      <div className="h-[54px] flex-shrink-0" />
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full rounded-[8px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--uc-text-muted)]">
            Planned context
          </p>
          <h1 className="mt-2 text-[22px] font-bold leading-tight text-[var(--uc-text)]">
            {productMeta.label}
          </h1>
          <p className="mt-2 text-sm leading-5 text-[var(--uc-text-muted)]">
            This product/design-system combination is registered in the platform model,
            but it is not implemented as an interactive mobile flow yet.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--uc-text-muted)]">Product status</span>
              <span className="font-medium text-[var(--uc-text)]">{productMeta.status}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--uc-text-muted)]">Design system</span>
              <span className="font-medium text-[var(--uc-text)] text-right">{designSystemMeta.label}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--uc-text-muted)]">Design status</span>
              <span className="font-medium text-[var(--uc-text)]">{designSystemMeta.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
