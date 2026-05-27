/**
 * Demo Control Panel
 * Slide-in panel with context, release/baseline metadata, and feature coverage controls.
 */

import { X } from "lucide-react";
import { useDemo } from "@/app/state/demoStore";
import { isFeatureActive } from "@/app/state/featureResolver";
import {
  BASELINES,
  DESIGN_SYSTEM_ORDER,
  DESIGN_SYSTEMS,
  PRODUCT_ORDER,
  PRODUCTS,
} from "@/app/registry/projectModel";
import { FEATURE_META } from "@/app/registry/demoConfig";
import { getReleaseBundle } from "@/app/registry/releaseRegistry";
import type { CountryId, DesignSystemId, FeatureId, FeatureMeta, ProductId } from "@/app/state/demoTypes";

function getScopeLabel(meta: FeatureMeta): string {
  if (meta.scope === "global") {
    return "all countries";
  }

  if (meta.scope === "countries" && meta.countries) {
    return `${meta.countries.join(", ")} only`;
  }

  return "unknown scope";
}

function isFeatureAvailableForCountry(meta: FeatureMeta, currentCountry: CountryId): boolean {
  if (meta.scope === "global") {
    return true;
  }

  if (meta.scope === "countries") {
    return meta.countries?.includes(currentCountry) ?? false;
  }

  return false;
}

function statusLabel(status: string | undefined): string {
  return status ? status.replaceAll("_", " ") : "not mapped";
}

function statusStyles(status: string | undefined): string {
  switch (status) {
    case "implemented":
    case "released":
    case "baseline":
    case "uat_ready":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "configured":
    case "partial":
    case "in_design":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "blocked":
    case "missing":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

interface DemoFeatureSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoFeatureSidePanel({ isOpen, onClose }: DemoFeatureSidePanelProps) {
  const demoState = useDemo();
  const {
    product,
    scenario,
    designSystem,
    setProduct,
    setDesignSystem,
    setFlag,
    release,
  } = demoState;
  const releaseBundle = getReleaseBundle(release);

  const allFeatureIds = Object.keys(FEATURE_META) as FeatureId[];
  const releaseFeatures = allFeatureIds.filter((id) => FEATURE_META[id].kind === "release");
  const unplannedFeatures = allFeatureIds.filter((id) => FEATURE_META[id].kind === "unplanned");
  const isInactive = scenario === "inactive";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-[9998] transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-96 bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">Control Panel</h3>
            <p className="text-xs text-gray-500 mt-1">
              Context, release preview, and feature coverage
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Close panel"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section className="border border-gray-200 rounded-md p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Current Context
            </h4>
            <div className="space-y-2 text-sm">
              <ContextRow label="Selected product" value={PRODUCTS[product].label} />
              <ContextRow label="Selected design system" value={DESIGN_SYSTEMS[designSystem].label} />
              <ContextRow label="Baseline" value={BASELINES[releaseBundle.baseline].label} />
              <ContextRow label="Release preview" value={releaseBundle.label} />
              <ContextRow label="Scenario" value={scenario} />
            </div>
          </section>

          <section className="border border-gray-200 rounded-md p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Product
            </h4>
            <SegmentedOptions
              value={product}
              options={PRODUCT_ORDER.map((productId) => ({
                id: productId,
                label: PRODUCTS[productId].label,
                note: PRODUCTS[productId].status === "planned" ? "planned" : undefined,
              }))}
              onChange={(value) => setProduct(value as ProductId)}
            />
          </section>

          <section className="border border-gray-200 rounded-md p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Design System
            </h4>
            <SegmentedOptions
              value={designSystem}
              options={DESIGN_SYSTEM_ORDER.map((designSystemId) => ({
                id: designSystemId,
                label: DESIGN_SYSTEMS[designSystemId].label,
                note: DESIGN_SYSTEMS[designSystemId].status === "planned" ? "planned" : undefined,
              }))}
              onChange={(value) => setDesignSystem(value as DesignSystemId)}
            />
          </section>

          <FeatureGroup
            title="Release Features"
            featureIds={releaseFeatures}
            demoState={demoState}
            readOnly
            onChange={() => undefined}
          />

          <FeatureGroup
            title="Unplanned Features"
            featureIds={unplannedFeatures}
            demoState={demoState}
            disabledMessage={isInactive ? "Disabled when scenario is inactive" : undefined}
            onChange={(featureId, checked) => setFlag(featureId, checked)}
          />
        </div>
      </div>
    </>
  );
}

interface SegmentedOptionsProps {
  value: string;
  options: Array<{ id: string; label: string; note?: string }>;
  onChange: (value: string) => void;
}

function SegmentedOptions({ value, options, onChange }: SegmentedOptionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          aria-label={`${option.label}${option.note ? ` ${option.note}` : ""}`}
          onClick={() => onChange(option.id)}
          className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
            value === option.id
              ? "border-red-200 bg-red-50 text-[#E2001A]"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          }`}
        >
          <span className="font-medium">{option.label}</span>
          {option.note && <span className="ml-2 text-xs text-gray-400">{option.note}</span>}
        </button>
      ))}
    </div>
  );
}

interface ContextRowProps {
  label: string;
  value: string;
}

function ContextRow({ label, value }: ContextRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

interface FeatureGroupProps {
  title: string;
  featureIds: FeatureId[];
  demoState: ReturnType<typeof useDemo>;
  readOnly?: boolean;
  disabledMessage?: string;
  onChange: (featureId: FeatureId, checked: boolean) => void;
}

function FeatureGroup({
  title,
  featureIds,
  demoState,
  readOnly = false,
  disabledMessage,
  onChange,
}: FeatureGroupProps) {
  if (featureIds.length === 0) {
    return null;
  }

  return (
    <section>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {title}
      </h4>
      {disabledMessage && (
        <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          {disabledMessage}
        </div>
      )}
      <div className="space-y-3">
        {featureIds.map((featureId) => {
          const meta = FEATURE_META[featureId];
          const isActive = isFeatureActive(demoState, featureId);
          const isAvailable = isFeatureAvailableForCountry(meta, demoState.country);
          const disabled = readOnly || demoState.scenario === "inactive" || !isAvailable;

          return (
            <FeatureControl
              key={featureId}
              featureId={featureId}
              meta={meta}
              checked={isActive}
              disabled={disabled}
              readOnly={readOnly}
              isAvailableForCountry={isAvailable}
              onChange={(checked) => onChange(featureId, checked)}
            />
          );
        })}
      </div>
    </section>
  );
}

interface FeatureControlProps {
  featureId: FeatureId;
  meta: FeatureMeta;
  checked: boolean;
  disabled: boolean;
  readOnly: boolean;
  isAvailableForCountry: boolean;
  onChange: (checked: boolean) => void;
}

function FeatureControl({
  featureId,
  meta,
  checked,
  disabled,
  readOnly,
  isAvailableForCountry,
  onChange,
}: FeatureControlProps) {
  const checkboxId = `feature-${featureId}`;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
        disabled ? "bg-gray-50 border-gray-200 opacity-75" : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <input
        type="checkbox"
        id={checkboxId}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className={`mt-0.5 w-4 h-4 rounded border-gray-300 transition-colors ${
          disabled ? "cursor-not-allowed" : "cursor-pointer focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
        } ${checked ? "text-red-600" : "text-gray-400"}`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <label
            htmlFor={checkboxId}
            className={`text-sm font-medium ${
              disabled ? "cursor-not-allowed text-gray-500" : "cursor-pointer text-gray-900"
            }`}
          >
            {meta.label}
          </label>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded border ${
              meta.kind === "release"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-purple-50 text-purple-700 border-purple-200"
            }`}
          >
            {meta.kind}
          </span>
          {readOnly && (
            <span className="text-xs text-gray-400 italic">controlled by release</span>
          )}
        </div>

        {meta.description && (
          <p className="text-xs text-gray-500 mt-1">{meta.description}</p>
        )}

        <p className="text-xs text-gray-400 font-mono mt-1">{featureId}</p>

        <div className="flex flex-wrap gap-2 mt-2">
          <StatusBadge label={`lifecycle: ${statusLabel(meta.lifecycleStatus)}`} status={meta.lifecycleStatus} />
          <StatusBadge label={`coverage: ${statusLabel(meta.coverageStatus)}`} status={meta.coverageStatus} />
        </div>

        <div className="text-xs text-gray-500 mt-2 space-y-1">
          <p>Scope: {getScopeLabel(meta)}</p>
          {meta.introducedIn && <p>Introduced in: {meta.introducedIn}</p>}
          {meta.affectedScreens && meta.affectedScreens.length > 0 && (
            <p>Affects: {meta.affectedScreens.join(", ")}</p>
          )}
          {!isAvailableForCountry && (
            <p className="text-amber-600 font-medium">Not available for selected country</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  label: string;
  status: string | undefined;
}

function StatusBadge({ label, status }: StatusBadgeProps) {
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${statusStyles(status)}`}>
      {label}
    </span>
  );
}
