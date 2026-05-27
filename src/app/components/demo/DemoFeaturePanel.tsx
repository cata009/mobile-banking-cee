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
    <div className="bg-[var(--uc-surface)] border border-[var(--uc-border-muted)] rounded-lg shadow-sm">
      {/* ─── HEADER ───────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-[var(--uc-border-muted)]">
        <h3 className="font-semibold text-[var(--uc-text)]">Feature Flags</h3>
        <p className="text-xs text-[var(--uc-text-muted)] mt-1">
          Control experimental features and releases
        </p>
      </div>

      {/* ─── CONTENT ──────────────────────────────────────────── */}
      <div className="p-4 space-y-4">
        {/* ─── RELEASE FEATURES ─────────────────────────────── */}
        {releaseFeatures.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[var(--uc-text-muted)] uppercase tracking-wide mb-2">
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
          <div className="border-t border-[var(--uc-border-muted)] pt-4" />
        )}

        {/* ─── UNPLANNED FEATURES ───────────────────────────── */}
        {unplannedFeatures.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[var(--uc-text-muted)] uppercase tracking-wide mb-2">
              Unplanned Features
            </h4>
            {isInactive && (
              <div className="mb-2 px-3 py-2 bg-[color-mix(in_srgb,var(--uc-yellow-gold)_12%,var(--uc-surface))] border border-[var(--uc-yellow-gold)] rounded text-xs text-[var(--uc-gold-brown)]">
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
          <div className="text-center py-8 text-[var(--uc-text-subtle)] text-sm">
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
      ? "bg-[var(--uc-action-soft)] text-[var(--uc-action-hover)] border-[var(--uc-action-soft-strong)]"
      : "bg-[color-mix(in_srgb,var(--uc-product-mauve)_18%,var(--uc-surface))] text-[var(--uc-product-mauve)] border-[var(--uc-product-mauve)]";

  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-md border transition-colors
        ${
          disabled
            ? "bg-[var(--uc-surface-muted)] border-[var(--uc-border-muted)] opacity-60"
            : "bg-[var(--uc-surface)] border-[var(--uc-border-muted)] hover:border-[var(--uc-border)]"
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
          mt-0.5 w-4 h-4 rounded border-[var(--uc-border)] transition-colors
          ${
            disabled
              ? "cursor-not-allowed"
              : "cursor-pointer focus:ring-2 focus:ring-[var(--uc-brand)] focus:ring-offset-1"
          }
          ${checked ? "text-[var(--uc-brand)]" : "text-[var(--uc-text-subtle)]"}
        `}
      />

      {/* ─── CONTENT ──────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <label
            htmlFor={checkboxId}
            className={`
              text-sm font-medium
              ${disabled ? "cursor-not-allowed text-[var(--uc-text-muted)]" : "cursor-pointer text-[var(--uc-text)]"}
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
            <span className="text-xs text-[var(--uc-text-subtle)] italic">
              (controlled by release)
            </span>
          )}
        </div>

        {/* ─── DESCRIPTION ──────────────────────────────────── */}
        {description && (
          <p className="text-xs text-[var(--uc-text-muted)] mt-1">{description}</p>
        )}

        {/* ─── FEATURE ID ──────────────────────────────────── */}
        <p className="text-xs text-[var(--uc-text-subtle)] font-mono mt-1">{featureId}</p>

        {/* ─── SCOPE LABEL & AVAILABILITY ──────────────────── */}
        {scopeLabel && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-[var(--uc-text-muted)]">{scopeLabel}</span>
            {isAvailableForCountry === false && (
              <span className="text-xs text-[var(--uc-gold-brown)] font-medium">
                ❌ Not available for selected country
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
