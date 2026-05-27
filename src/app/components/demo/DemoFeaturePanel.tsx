/**
 * DemoFeaturePanel Component
 * Feature flags control panel with checkboxes for all features
 * Now supports scope labels and country-based availability
 */

import { useDemo } from "@/app/state/demoStore";
import { isFeatureActive } from "@/app/state/featureResolver";
import { FEATURE_META } from "@/app/registry/demoConfig";
import type { FeatureId, FeatureMeta } from "@/app/state/demoTypes";

/**
 * Get scope label for display
 * - "global" → "🌍 global"
 * - "countries" → "🇷🇴,🇨🇿 RO,CZ only"
 */
function getScopeLabel(meta: FeatureMeta): string {
  if (meta.scope === "global") {
    return "🌍 global";
  }
  
  if (meta.scope === "countries" && meta.countries) {
    const countriesList = meta.countries.join(",");
    return `${countriesList} only`;
  }
  
  return "unknown scope";
}

/**
 * Check if feature is available for current country
 */
function isFeatureAvailableForCountry(
  meta: FeatureMeta,
  currentCountry: string
): boolean {
  if (meta.scope === "global") {
    return true;
  }
  
  if (meta.scope === "countries") {
    return meta.countries?.includes(currentCountry as any) ?? false;
  }
  
  return false;
}

/**
 * Feature flags panel component
 * - Release features: read-only checkboxes (controlled by release)
 * - Unplanned features: editable checkboxes (manual toggle)
 * - Inactive scenario: disables all unplanned checkboxes
 */
export function DemoFeaturePanel() {
  const demoState = useDemo();
  const { scenario, setFlag } = demoState;

  const allFeatureIds = Object.keys(FEATURE_META) as FeatureId[];

  // Group features by kind for better organization
  const releaseFeatures = allFeatureIds.filter(
    (id) => FEATURE_META[id].kind === "release"
  );
  const unplannedFeatures = allFeatureIds.filter(
    (id) => FEATURE_META[id].kind === "unplanned"
  );

  const isInactive = scenario === "inactive";

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* ─── HEADER ───────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Feature Flags</h3>
        <p className="text-xs text-gray-500 mt-1">
          Control experimental features and releases
        </p>
      </div>

      {/* ─── CONTENT ──────────────────────────────────────────── */}
      <div className="p-4 space-y-4">
        {/* ─── RELEASE FEATURES ─────────────────────────────── */}
        {releaseFeatures.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Release Features
            </h4>
            <div className="space-y-2">
              {releaseFeatures.map((featureId) => {
                const meta = FEATURE_META[featureId];
                const isActive = isFeatureActive(demoState, featureId);
                const isAvailable = isFeatureAvailableForCountry(meta, demoState.country);

                return (
                  <FeatureCheckbox
                    key={featureId}
                    featureId={featureId}
                    label={meta.label}
                    description={meta.description}
                    scopeLabel={getScopeLabel(meta)}
                    kind="release"
                    checked={isActive}
                    disabled={true} // Always read-only for release features
                    isAvailableForCountry={isAvailable}
                    onChange={() => {
                      // No-op: release features are controlled by release
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ─── DIVIDER ──────────────────────────────────────── */}
        {releaseFeatures.length > 0 && unplannedFeatures.length > 0 && (
          <div className="border-t border-gray-200 pt-4" />
        )}

        {/* ─── UNPLANNED FEATURES ───────────────────────────── */}
        {unplannedFeatures.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Unplanned Features
            </h4>
            {isInactive && (
              <div className="mb-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                ⚠️ Disabled when scenario is inactive
              </div>
            )}
            <div className="space-y-2">
              {unplannedFeatures.map((featureId) => {
                const meta = FEATURE_META[featureId];
                const isActive = isFeatureActive(demoState, featureId);
                const isAvailable = isFeatureAvailableForCountry(meta, demoState.country);

                return (
                  <FeatureCheckbox
                    key={featureId}
                    featureId={featureId}
                    label={meta.label}
                    description={meta.description}
                    scopeLabel={getScopeLabel(meta)}
                    kind="unplanned"
                    checked={isActive}
                    disabled={isInactive || !isAvailable} // Disabled when scenario is inactive OR not available for country
                    isAvailableForCountry={isAvailable}
                    onChange={(checked) => {
                      setFlag(featureId, checked);
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ─── EMPTY STATE ──────────────────────────────────── */}
        {allFeatureIds.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No feature flags configured
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual feature checkbox component
 */
interface FeatureCheckboxProps {
  featureId: FeatureId;
  label: string;
  description?: string;
  scopeLabel?: string;
  kind: "release" | "unplanned";
  checked: boolean;
  disabled: boolean;
  isAvailableForCountry?: boolean;
  onChange: (checked: boolean) => void;
}

function FeatureCheckbox({
  featureId,
  label,
  description,
  scopeLabel,
  kind,
  checked,
  disabled,
  isAvailableForCountry,
  onChange,
}: FeatureCheckboxProps) {
  const checkboxId = `feature-${featureId}`;

  // Tag styling based on kind
  const tagStyles =
    kind === "release"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-purple-100 text-purple-700 border-purple-200";

  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-md border transition-colors
        ${
          disabled
            ? "bg-gray-50 border-gray-200 opacity-60"
            : "bg-white border-gray-200 hover:border-gray-300"
        }
      `}
    >
      {/* ─── CHECKBOX ─────────────────────────────────────────── */}
      <input
        type="checkbox"
        id={checkboxId}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={`
          mt-0.5 w-4 h-4 rounded border-gray-300 transition-colors
          ${
            disabled
              ? "cursor-not-allowed"
              : "cursor-pointer focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          }
          ${checked ? "text-red-600" : "text-gray-400"}
        `}
      />

      {/* ─── CONTENT ──────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <label
            htmlFor={checkboxId}
            className={`
              text-sm font-medium
              ${disabled ? "cursor-not-allowed text-gray-500" : "cursor-pointer text-gray-900"}
            `}
          >
            {label}
          </label>

          {/* ─── KIND TAG ─────────────────────────────────────── */}
          <span
            className={`
              px-2 py-0.5 text-xs font-medium rounded border
              ${tagStyles}
            `}
          >
            {kind}
          </span>

          {/* ─── READ-ONLY INDICATOR ──────────────────────────── */}
          {kind === "release" && (
            <span className="text-xs text-gray-400 italic">
              (controlled by release)
            </span>
          )}
        </div>

        {/* ─── DESCRIPTION ──────────────────────────────────── */}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}

        {/* ─── FEATURE ID ──────────────────────────────────── */}
        <p className="text-xs text-gray-400 font-mono mt-1">{featureId}</p>

        {/* ─── SCOPE LABEL & AVAILABILITY ──────────────────── */}
        {scopeLabel && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{scopeLabel}</span>
            {isAvailableForCountry === false && (
              <span className="text-xs text-amber-600 font-medium">
                ❌ Not available for selected country
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
