/**
 * Demo Control Panel
 * Slide-in panel with context, release/baseline metadata, and feature coverage controls.
 */

import { AppIcon } from "@/app/components/icons";
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
import { BANKING_SCENARIOS } from "@/app/platform/banking/bankingScenarioRegistry";
import { resolveEffectiveAppContext } from "@/app/platform/effectiveAppContext";
import { getReleaseBundle } from "@/app/registry/releaseRegistry";
import type {
  BankingScenarioId,
  CountryId,
  DesignSystemId,
  FeatureId,
  FeatureMeta,
  ProductId,
} from "@/app/state/demoTypes";

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
      return "bg-[color-mix(in_srgb,var(--uc-green-success)_12%,var(--uc-surface))] text-[var(--uc-green-olive)] border-[var(--uc-green-success)]";
    case "configured":
    case "partial":
    case "in_design":
      return "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_12%,var(--uc-surface))] text-[var(--uc-gold-brown)] border-[var(--uc-yellow-gold)]";
    case "blocked":
    case "missing":
      return "bg-[color-mix(in_srgb,var(--uc-brand)_10%,var(--uc-surface))] text-[var(--uc-brand)] border-[var(--uc-brand)]";
    default:
      return "bg-[var(--uc-surface-muted)] text-[var(--uc-text-muted)] border-[var(--uc-border-muted)]";
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
    themeMode,
    bankingScenario,
    setProduct,
    setDesignSystem,
    setThemeMode,
    setBankingScenario,
    setFlag,
    release,
  } = demoState;
  const releaseBundle = getReleaseBundle(release);
  const effectiveContext = resolveEffectiveAppContext(demoState);

  const allFeatureIds = Object.keys(FEATURE_META) as FeatureId[];
  const releaseFeatures = allFeatureIds.filter((id) => FEATURE_META[id].kind === "release");
  const unplannedFeatures = allFeatureIds.filter((id) => FEATURE_META[id].kind === "unplanned");
  const isInactive = scenario === "inactive";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[rgb(var(--uc-static-black-rgb)_/_0.3)] z-[9998] transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-96 bg-[var(--uc-surface)] shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="sticky top-0 bg-[var(--uc-surface)] border-b border-[var(--uc-border-muted)] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-semibold text-[var(--uc-text)] text-lg">Control Panel</h3>
            <p className="text-xs text-[var(--uc-text-muted)] mt-1">
              Context, release preview, and feature coverage
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-[32px] w-[32px] place-items-center hover:bg-[var(--uc-app-bg)] rounded-md transition-colors"
            title="Close panel"
          >
            <AppIcon name="close-x" className="text-[var(--uc-text-muted)]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section className="border border-[var(--uc-border-muted)] rounded-md p-4">
            <h4 className="text-xs font-semibold text-[var(--uc-text-muted)] uppercase tracking-wide mb-3">
              Current Context
            </h4>
            <div className="space-y-2 text-sm">
              <ContextRow label="Selected product" value={PRODUCTS[product].label} />
              <ContextRow label="Selected design system" value={DESIGN_SYSTEMS[designSystem].label} />
              <ContextRow label="Baseline" value={BASELINES[releaseBundle.baseline].label} />
              <ContextRow label="Release preview" value={releaseBundle.label} />
              <ContextRow label="Scenario" value={scenario} />
              <ContextRow label="Banking profile" value={effectiveContext.userScenario.label} />
              <ContextRow label="Project pack" value={effectiveContext.projectPack.id} />
            </div>
          </section>

          <section className="border border-[var(--uc-border-muted)] rounded-md p-4">
            <h4 className="text-xs font-semibold text-[var(--uc-text-muted)] uppercase tracking-wide mb-3">
              Release
            </h4>
            <div className="space-y-3">
              <ContextRow label="Baseline ledger" value={effectiveContext.baseline.label} />
              <ContextRow
                label="Promotion target"
                value={effectiveContext.promotionReadiness.targetBaseline ?? "none"}
              />
              <ContextRow
                label="Added features"
                value={effectiveContext.releaseDiff.addedFeatures.length.toString()}
              />
              <ContextRow
                label="Retire flags"
                value={effectiveContext.releaseDiff.flagRetirementCandidates.length.toString()}
              />
              <ReadinessChecks checks={effectiveContext.promotionReadiness.checks} />
            </div>
          </section>

          <section className="border border-[var(--uc-border-muted)] rounded-md p-4">
            <h4 className="text-xs font-semibold text-[var(--uc-text-muted)] uppercase tracking-wide mb-3">
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

          <section className="border border-[var(--uc-border-muted)] rounded-md p-4">
            <h4 className="text-xs font-semibold text-[var(--uc-text-muted)] uppercase tracking-wide mb-3">
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

          <section className="border border-[var(--uc-border-muted)] rounded-md p-4">
            <h4 className="text-xs font-semibold text-[var(--uc-text-muted)] uppercase tracking-wide mb-3">
              Appearance
            </h4>
            <SegmentedOptions
              value={themeMode}
              options={[
                { id: "light", label: "Light" },
                { id: "dark", label: "Dark" },
              ]}
              onChange={(value) => setThemeMode(value as "light" | "dark")}
            />
          </section>

          <section className="border border-[var(--uc-border-muted)] rounded-md p-4">
            <h4 className="text-xs font-semibold text-[var(--uc-text-muted)] uppercase tracking-wide mb-3">
              Banking Scenario
            </h4>
            <SegmentedOptions
              value={bankingScenario}
              options={(Object.keys(BANKING_SCENARIOS) as BankingScenarioId[]).map((scenarioId) => ({
                id: scenarioId,
                label: BANKING_SCENARIOS[scenarioId].label,
                note: BANKING_SCENARIOS[scenarioId].readiness,
              }))}
              onChange={(value) => setBankingScenario(value as BankingScenarioId)}
            />
            <div className="mt-4 space-y-2 text-sm">
              <ContextRow label="Segment" value={effectiveContext.userScenario.segment} />
              <ContextRow label="Authority" value={effectiveContext.userScenario.authority} />
              <ContextRow label="Limit" value={`${effectiveContext.limits.perTransaction.toLocaleString()} ${effectiveContext.limits.currency}`} />
              <ContextRow label="Daily" value={`${effectiveContext.limits.daily.toLocaleString()} ${effectiveContext.limits.currency}`} />
            </div>
          </section>

          <section className="border border-[var(--uc-border-muted)] rounded-md p-4">
            <h4 className="text-xs font-semibold text-[var(--uc-text-muted)] uppercase tracking-wide mb-3">
              Data Snapshot
            </h4>
            <MetricGrid
              items={[
                ["Accounts", effectiveContext.dataSnapshot.accounts],
                ["Cards", effectiveContext.dataSnapshot.cards],
                ["Deposits", effectiveContext.dataSnapshot.deposits],
                ["Investments", effectiveContext.dataSnapshot.investments],
                ["Loans", effectiveContext.dataSnapshot.loans],
                ["Goals", effectiveContext.dataSnapshot.savingsGoals],
              ]}
            />
            <MiniList
              title="Holdings"
              items={effectiveContext.holdings.map(
                (holding) => `${holding.label} - ${holding.currency} - ${holding.status}`
              )}
              empty="No holdings for this profile"
            />
          </section>

          <section className="border border-[var(--uc-border-muted)] rounded-md p-4">
            <h4 className="text-xs font-semibold text-[var(--uc-text-muted)] uppercase tracking-wide mb-3">
              Rights
            </h4>
            <ContextRow label="Enabled actions" value={effectiveContext.enabledActions.length.toString()} />
            <ContextRow label="Disabled actions" value={effectiveContext.disabledActions.length.toString()} />
            <MiniList
              title="Disabled reasons"
              items={effectiveContext.disabledActions.slice(0, 8).map(
                (disabledAction) => `${disabledAction.label}: ${disabledAction.reason}`
              )}
              empty="No disabled actions"
            />
          </section>

          <section className="border border-[var(--uc-border-muted)] rounded-md p-4">
            <h4 className="text-xs font-semibold text-[var(--uc-text-muted)] uppercase tracking-wide mb-3">
              Project Pack
            </h4>
            <div className="space-y-2 text-sm">
              <ContextRow label="Runtime coverage" value={effectiveContext.projectPack.runtimeCoverage} />
              <ContextRow label="Integration" value={effectiveContext.projectPack.integrationReadiness} />
              <ContextRow label="Default scenario" value={effectiveContext.projectPack.defaultScenario} />
              <ContextRow label="Demo entries" value={effectiveContext.projectPack.demoEntries.length.toString()} />
            </div>
            <MiniList
              title="Knowledge sources"
              items={effectiveContext.projectPack.knowledgeSources.map(
                (source) => `${source.id} - ${source.authority}`
              )}
              empty="No sources"
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
    <div className="grid grid-cols-1 gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          aria-label={`${option.label}${option.note ? ` ${option.note}` : ""}`}
          onClick={() => onChange(option.id)}
          className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
            value === option.id
              ? "border-[var(--uc-brand)] bg-[color-mix(in_srgb,var(--uc-brand)_10%,var(--uc-surface))] text-[var(--uc-brand)]"
              : "border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[var(--uc-text-muted)] hover:border-[var(--uc-border)]"
          }`}
        >
          <span className="font-medium">{option.label}</span>
          {option.note && <span className="ml-2 text-xs text-[var(--uc-text-subtle)]">{option.note}</span>}
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
      <span className="text-[var(--uc-text-muted)]">{label}</span>
      <span className="font-medium text-[var(--uc-text)] text-right">{value}</span>
    </div>
  );
}

interface ReadinessChecksProps {
  checks: readonly { id: string; label: string; passed: boolean; detail: string }[];
}

function ReadinessChecks({ checks }: ReadinessChecksProps) {
  return (
    <div className="space-y-2">
      {checks.map((check) => (
        <div
          key={check.id}
          className={`rounded-md border px-3 py-2 text-xs ${
            check.passed
              ? "border-[var(--uc-green-success)] bg-[color-mix(in_srgb,var(--uc-green-success)_10%,var(--uc-surface))]"
              : "border-[var(--uc-yellow-gold)] bg-[color-mix(in_srgb,var(--uc-yellow-gold)_12%,var(--uc-surface))]"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-[var(--uc-text)]">{check.label}</span>
            <span className={check.passed ? "text-[var(--uc-green-olive)]" : "text-[var(--uc-gold-brown)]"}>
              {check.passed ? "ready" : "needs work"}
            </span>
          </div>
          <p className="mt-1 text-[var(--uc-text-muted)]">{check.detail}</p>
        </div>
      ))}
    </div>
  );
}

interface MetricGridProps {
  items: readonly [string, number][];
}

function MetricGrid({ items }: MetricGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-md border border-[var(--uc-border-muted)] px-2 py-2 text-center">
          <div className="text-base font-semibold text-[var(--uc-text)]">{value}</div>
          <div className="text-[10px] uppercase text-[var(--uc-text-muted)]">{label}</div>
        </div>
      ))}
    </div>
  );
}

interface MiniListProps {
  title: string;
  items: readonly string[];
  empty: string;
}

function MiniList({ title, items, empty }: MiniListProps) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase text-[var(--uc-text-muted)]">{title}</p>
      <div className="mt-2 space-y-1">
        {(items.length > 0 ? items : [empty]).map((item) => (
          <p key={item} className="rounded-sm bg-[var(--uc-surface-muted)] px-2 py-1 text-xs text-[var(--uc-text-muted)]">
            {item}
          </p>
        ))}
      </div>
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
      <h4 className="text-xs font-semibold text-[var(--uc-text-muted)] uppercase tracking-wide mb-3">
        {title}
      </h4>
      {disabledMessage && (
        <div className="mb-3 px-3 py-2 bg-[color-mix(in_srgb,var(--uc-yellow-gold)_12%,var(--uc-surface))] border border-[var(--uc-yellow-gold)] rounded text-xs text-[var(--uc-gold-brown)]">
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
        disabled ? "bg-[var(--uc-surface-muted)] border-[var(--uc-border-muted)] opacity-75" : "bg-[var(--uc-surface)] border-[var(--uc-border-muted)] hover:border-[var(--uc-border)]"
      }`}
    >
      <input
        type="checkbox"
        id={checkboxId}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className={`mt-0.5 w-4 h-4 rounded border-[var(--uc-border)] transition-colors ${
          disabled ? "cursor-not-allowed" : "cursor-pointer focus:ring-2 focus:ring-[var(--uc-brand)] focus:ring-offset-1"
        } ${checked ? "text-[var(--uc-brand)]" : "text-[var(--uc-text-subtle)]"}`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <label
            htmlFor={checkboxId}
            className={`text-sm font-medium ${
              disabled ? "cursor-not-allowed text-[var(--uc-text-muted)]" : "cursor-pointer text-[var(--uc-text)]"
            }`}
          >
            {meta.label}
          </label>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded border ${
              meta.kind === "release"
                ? "bg-[var(--uc-action-soft)] text-[var(--uc-action-hover)] border-[var(--uc-action-soft-strong)]"
                : "bg-[color-mix(in_srgb,var(--uc-product-mauve)_12%,var(--uc-surface))] text-[var(--uc-product-mauve)] border-[var(--uc-product-mauve)]"
            }`}
          >
            {meta.kind}
          </span>
          {readOnly && (
            <span className="text-xs text-[var(--uc-text-subtle)] italic">controlled by release</span>
          )}
        </div>

        {meta.description && (
          <p className="text-xs text-[var(--uc-text-muted)] mt-1">{meta.description}</p>
        )}

        <p className="text-xs text-[var(--uc-text-subtle)] font-mono mt-1">{featureId}</p>

        <div className="flex flex-wrap gap-2 mt-2">
          <StatusBadge label={`lifecycle: ${statusLabel(meta.lifecycleStatus)}`} status={meta.lifecycleStatus} />
          <StatusBadge label={`coverage: ${statusLabel(meta.coverageStatus)}`} status={meta.coverageStatus} />
        </div>

        <div className="text-xs text-[var(--uc-text-muted)] mt-2 space-y-1">
          <p>Scope: {getScopeLabel(meta)}</p>
          {meta.introducedIn && <p>Introduced in: {meta.introducedIn}</p>}
          {meta.affectedScreens && meta.affectedScreens.length > 0 && (
            <p>Affects: {meta.affectedScreens.join(", ")}</p>
          )}
          {!isAvailableForCountry && (
            <p className="text-[var(--uc-gold-brown)] font-medium">Not available for selected country</p>
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
