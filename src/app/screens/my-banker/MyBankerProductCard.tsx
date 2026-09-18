import { useEffect, useId, useMemo, useRef, useState } from "react";

import { AppIcon } from "@/app/components/icons";
import PrimaryButton from "@/app/components/PrimaryButton";
import TextField from "@/app/components/TextField";
import { Slider } from "@/app/components/ui/slider";
import MyBankerPeerStrip from "@/app/screens/my-banker/MyBankerPeerStrip";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatAmount } from "@/data/products";
import type { MyBankerCurrency } from "@/data/myBankerCore";
import {
  clampToRange,
  getAmountRange,
  getProductCurrencies,
  getRateAnchor,
  simulateProduct,
  type MyBankerRecommendation,
} from "@/app/screens/my-banker/myBankerState";

export interface MyBankerRequestContext {
  productKey: MyBankerRecommendation["product"]["key"];
  productName: string;
  amount: number;
  currency: MyBankerCurrency;
  /** Null for revolving products, which have no maturity. */
  termMonths: number | null;
  ratePercent: number | null;
  /** True once the client moved an input away from the group's typical one. */
  simulated: boolean;
}

/**
 * `lead` is the one product the screen argues for: opened, with the reason and
 * the group's figure in full. `row` is everything else — a compact line that
 * expands into the same detail on demand.
 */
type MyBankerCardVariant = "lead" | "row";

interface MyBankerProductCardProps {
  recommendation: MyBankerRecommendation;
  variant?: MyBankerCardVariant;
  expanded: boolean;
  /** Size of the comparison group, so the peer strip can draw all of it. */
  peerGroupSize: number;
  /** A request already left for this product in this session. */
  requestSent?: boolean;
  advisorName: string;
  onToggle: () => void;
  /** Fires when an input settles on a new value, not on every keystroke. */
  onSimulationRun: (context: MyBankerRequestContext) => void;
  onSendRequest: (context: MyBankerRequestContext) => void;
}

function formatMoney(amount: number, currency: string, withDecimals: boolean) {
  const parts = formatAmount(amount, currency as never);
  return withDecimals
    ? `${parts.integer}${parts.decimals} ${currency}`
    : `${parts.integer} ${currency}`;
}

function formatRate(ratePercent: number) {
  return `${ratePercent.toFixed(2).replace(/0$/, "").replace(/\.$/, "")}%`;
}

/** Digits only — the amount field accepts what a numeric keypad produces. */
function parseAmountInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits.length > 0 ? Number(digits) : 0;
}

/** Grouped digits, matching how every other amount in the app is written. */
function formatAmountDraft(amount: number) {
  return formatAmount(amount, "RSD").integer;
}

/**
 * One product in the comparison. Whatever the variant, the simulation opens on
 * what the peer group typically takes — the client starts from a real
 * reference point instead of an arbitrary default, and the slider keeps that
 * reference marked while they move away from it.
 */
export default function MyBankerProductCard({
  recommendation,
  variant = "row",
  expanded,
  peerGroupSize,
  requestSent = false,
  advisorName,
  onToggle,
  onSimulationRun,
  onSendRequest,
}: MyBankerProductCardProps) {
  const { t } = useLanguage();
  const { product, status, adoptionPercent, peersUsing } = recommendation;
  const panelId = useId();
  const cardRef = useRef<HTMLElement>(null);
  const isLead = variant === "lead";

  const typical = product.peerTypical;
  const currencies = useMemo(() => getProductCurrencies(product), [product]);
  const [currency, setCurrency] = useState<MyBankerCurrency>(typical.currency);
  const amountRange = getAmountRange(product, currency);
  const [amount, setAmount] = useState(() => clampToRange(typical.amount, amountRange));
  const [amountDraft, setAmountDraft] = useState(() =>
    formatAmountDraft(clampToRange(typical.amount, amountRange)),
  );
  const [termMonths, setTermMonths] = useState(typical.termMonths ?? product.termMonths?.suggested ?? 0);
  const [simulated, setSimulated] = useState(false);

  // Switching currency re-seeds from the group's figure where it applies, and
  // from the catalogue's mid-range where it does not.
  useEffect(() => {
    const range = getAmountRange(product, currency);
    const seed = clampToRange(currency === typical.currency ? typical.amount : range.suggested, range);
    setAmount(seed);
    setAmountDraft(formatAmountDraft(seed));
  }, [currency, product, typical.amount, typical.currency]);

  // An expanded card is useless off-screen: bring it into view with its figures.
  useEffect(() => {
    if (!expanded || isLead) return;
    const timer = window.setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [expanded, isLead]);

  const productName = t(`runtime.myBanker.products.${product.key}.name`, product.key);
  const description = t(`runtime.myBanker.products.${product.key}.description`, "");
  const purpose = t(`runtime.myBanker.products.${product.key}.purpose`, "");

  const simulation = simulateProduct(product, { currency, amount, termMonths });
  const rateAnchor = getRateAnchor(product);
  const onGroupFigure = !simulated && currency === typical.currency;

  const context: MyBankerRequestContext = {
    productKey: product.key,
    productName,
    amount,
    currency,
    termMonths: product.termMonths ? termMonths : null,
    ratePercent: simulation?.ratePercent ?? null,
    simulated,
  };

  const commitSimulation = (next: Partial<{ amount: number; currency: MyBankerCurrency; termMonths: number }>) => {
    setSimulated(true);
    onSimulationRun({
      ...context,
      ...next,
      ratePercent:
        simulateProduct(product, {
          currency: next.currency ?? currency,
          amount: next.amount ?? amount,
          termMonths: next.termMonths ?? termMonths,
        })?.ratePercent ?? null,
    });
  };

  /**
   * The field keeps a draft while typing so a partial number never snaps to the
   * minimum mid-entry; the clamp happens once the client leaves the field.
   */
  const commitAmountDraft = () => {
    const parsed = clampToRange(parseAmountInput(amountDraft), amountRange);
    const formatted = formatAmountDraft(parsed);
    if (parsed === amount && formatted === amountDraft) return;
    setAmount(parsed);
    setAmountDraft(formatted);
    commitSimulation({ amount: parsed });
  };

  const adoptionLine =
    adoptionPercent === null
      ? t("runtime.myBanker.adoption.noInfo", "No info on similar clients")
      : t("runtime.myBanker.adoption.percent", "{percent}% of similar clients").replace(
          "{percent}",
          String(adoptionPercent),
        );

  /**
   * The client's own figures, not a fact about other people: what this product
   * would do with their money, at the amount similar clients typically take.
   * The peer percentage is reassurance under it, never the argument itself.
   */
  const rationale = simulation
    ? t(`runtime.myBanker.products.${product.key}.rationale`, purpose)
        .replace("{amount}", formatMoney(amount, currency, false))
        .replace("{figure}", formatMoney(simulation.value, currency, false))
        .replace("{months}", String(termMonths))
        .replace(
          "{total}",
          simulation.totalAtMaturity !== null ? formatMoney(simulation.totalAtMaturity, currency, false) : "",
        )
    : purpose;

  const peersLine =
    peersUsing !== null && peerGroupSize > 0
      ? t("runtime.myBanker.card.peersHave", "{used} of {total} have it")
          .replace("{used}", String(peersUsing))
          .replace("{total}", String(peerGroupSize))
      : adoptionLine;

  const rateLine = rateAnchor
    ? t(
        rateAnchor.kind === "from" ? "runtime.myBanker.card.rateFrom" : "runtime.myBanker.card.rateUpTo",
        "{rate} p.a.",
      ).replace("{rate}", formatRate(rateAnchor.ratePercent))
    : null;

  const resultLabel =
    simulation?.kind === "installment"
      ? t("runtime.myBanker.simulation.monthlyInstallment", "Monthly installment")
      : simulation?.kind === "return"
        ? t("runtime.myBanker.simulation.estimatedReturn", "Estimated return")
        : t("runtime.myBanker.simulation.monthlyInterest", "Monthly interest at full use");

  const resultCaption = [
    formatMoney(amount, currency, false),
    simulation ? `${formatRate(simulation.ratePercent)} ${t("runtime.myBanker.card.perYear", "p.a.")}` : null,
    product.termMonths ? `${termMonths} ${t("runtime.myBanker.simulation.months", "months")}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  /** Where the group's typical term sits on the slider, as a percentage. */
  const typicalTermOffset =
    product.termMonths && typical.termMonths !== null
      ? ((typical.termMonths - product.termMonths.min) / (product.termMonths.max - product.termMonths.min)) * 100
      : null;

  const detail = (
    <div id={panelId} className={isLead ? "" : "px-[16px] pb-[16px]"}>
      {!isLead && <p className="uc-type-n5 text-[var(--uc-text)]">{description}</p>}

      {!isLead && (
        <p className="mt-[8px] uc-type-n5 text-[var(--uc-text-muted)]">
          <span className="uc-type-n5-strong text-[var(--uc-text)]">
            {t("runtime.myBanker.card.purpose", "What it is for")}:{" "}
          </span>
          {purpose}
        </p>
      )}

      <div className={`${isLead ? "" : "mt-[16px]"} rounded-[8px] bg-[var(--uc-surface-muted)] p-[16px]`}>
        {/* The figure the client came for, labelled with where it comes from —
            the group's own contract, until they move an input. */}
        {simulation ? (
          <>
            <p className="uc-type-n5 text-[var(--uc-text-muted)]">
              {onGroupFigure
                ? t("runtime.myBanker.typical.label", "At the group's typical amount")
                : resultLabel}
            </p>
            <p className="mt-[2px] uc-type-n1 leading-[1.1] text-[var(--uc-text)]">
              {formatMoney(simulation.value, currency, false)}
              <span className="uc-type-n5-strong text-[var(--uc-text-muted)]">
                {" "}
                {simulation.kind === "return"
                  ? t("runtime.myBanker.typical.total", "total")
                  : t("runtime.myBanker.typical.perMonth", "/ month")}
              </span>
            </p>
            <p className="mt-[4px] uc-type-n5 text-[var(--uc-text-muted)]">
              {onGroupFigure ? `${resultLabel} · ${resultCaption}` : resultCaption}
            </p>
            {simulation.totalAtMaturity !== null && (
              <p className="mt-[6px] uc-type-n5 text-[var(--uc-text-muted)]">
                {t("runtime.myBanker.simulation.totalAtMaturity", "Total at maturity")}:{" "}
                <span className="uc-type-n5-strong text-[var(--uc-text)]">
                  {formatMoney(simulation.totalAtMaturity, currency, true)}
                </span>
              </p>
            )}
          </>
        ) : (
          <p className="uc-type-n5-strong text-[var(--uc-status-red)]">
            {t(
              "runtime.myBanker.simulation.noRate",
              "No rate is defined for this combination. Adjust the amount or the duration.",
            )}
          </p>
        )}

        <div className="my-[14px] h-px bg-[var(--uc-border-muted)]" />

        <div className="flex items-end gap-[12px]">
          <div className="min-w-0 flex-1">
            <TextField
              label={t("runtime.myBanker.simulation.amount", "Amount")}
              value={amountDraft}
              inputMode="numeric"
              onChange={(next) => setAmountDraft(next)}
              onBlur={commitAmountDraft}
              helperText={
                currency === typical.currency
                  ? t("runtime.myBanker.typical.amountHint", "Group average: {amount}").replace(
                      "{amount}",
                      formatMoney(typical.amount, currency, false),
                    )
                  : `${formatMoney(amountRange.min, currency, false)} – ${formatMoney(amountRange.max, currency, false)}`
              }
            />
          </div>

          {currencies.length > 1 && (
            <div className="flex shrink-0 gap-[6px] pb-[22px]">
              {currencies.map((option) => {
                const selected = option === currency;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setCurrency(option);
                      commitSimulation({ currency: option, amount: getAmountRange(product, option).suggested });
                    }}
                    className={`inline-flex h-[28px] min-w-[44px] items-center justify-center rounded-[3.5px] px-[8px] text-[14px] font-bold leading-[15px] ${
                      selected
                        ? "border border-transparent bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
                        : "border border-[var(--uc-text)] bg-transparent text-[var(--uc-text)]"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {product.termMonths && (
          <div className="mt-[16px]">
            <div className="flex items-baseline justify-between">
              <span className="uc-type-n5 text-[var(--uc-text-muted)]">
                {t("runtime.myBanker.simulation.duration", "Duration")}
              </span>
              <span className="uc-type-n5-strong text-[var(--uc-text)]">
                {termMonths} {t("runtime.myBanker.simulation.months", "months")}
              </span>
            </div>

            <div className="relative mt-[10px]">
              <Slider
                min={product.termMonths.min}
                max={product.termMonths.max}
                step={product.termMonths.step}
                value={[termMonths]}
                onValueChange={(values) => setTermMonths(values[0] ?? termMonths)}
                onValueCommit={(values) => commitSimulation({ termMonths: values[0] ?? termMonths })}
                aria-label={t("runtime.myBanker.simulation.duration", "Duration")}
              />
              {/* The group's typical term stays marked, so moving the slider is
                  always a move relative to what similar clients chose. */}
              {typicalTermOffset !== null && (
                <span
                  className="pointer-events-none absolute top-[-3px] h-[14px] w-[2px] rounded-full bg-[var(--uc-text-muted)]"
                  style={{ left: `calc(${typicalTermOffset}% - 1px)` }}
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="mt-[6px] flex items-center justify-between uc-type-n5 text-[var(--uc-text-subtle)]">
              <span>{product.termMonths.min}</span>
              {typical.termMonths !== null && (
                <span className="text-[var(--uc-text-muted)]">
                  {t("runtime.myBanker.typical.marker", "Group average")}: {typical.termMonths}
                </span>
              )}
              <span>{product.termMonths.max}</span>
            </div>
          </div>
        )}

        <p className="mt-[14px] uc-type-n5 text-[var(--uc-text-muted)]">
          {t("runtime.myBanker.simulation.disclaimer", "Indicative calculation.")}
        </p>
      </div>

      {requestSent ? (
        <div className="mt-[16px] flex items-start gap-[8px] rounded-[8px] bg-[color-mix(in_srgb,var(--uc-green-success)_10%,var(--uc-surface))] p-[12px]">
          <span className="mt-[1px] flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[var(--uc-green-success)]">
            <AppIcon name="check" size={10} color="var(--uc-static-white)" />
          </span>
          <p className="uc-type-n5 text-[var(--uc-text)]">
            {t("runtime.myBanker.request.sentNote", "Request sent to {name}.").replace("{name}", advisorName)}
          </p>
        </div>
      ) : (
        <div className="mt-[16px]">
          <PrimaryButton onClick={() => onSendRequest(context)}>
            {t("runtime.myBanker.request.cta", "Send request")}
          </PrimaryButton>
          <p className="mt-[8px] text-center uc-type-n5 text-[var(--uc-text-muted)]">
            {t("runtime.myBanker.request.routedTo", "Goes straight to {name}, your banker.").replace(
              "{name}",
              advisorName,
            )}
          </p>
        </div>
      )}
    </div>
  );

  if (isLead) {
    return (
      <article
        ref={cardRef}
        className="rounded-[8px] border border-[var(--uc-action)] bg-[var(--uc-surface)] p-[16px] shadow-[0_2px_8px_rgb(var(--uc-shadow-rgb)_/_0.10)]"
        data-ds-label="My Banker lead card"
        data-product-key={product.key}
        data-my-banker-lead="true"
      >
        <p className="uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-action)]">
          {t("runtime.myBanker.lead.eyebrow", "Most often missing for you")}
        </p>

        <div className="mt-[6px] flex items-start gap-[12px]">
          <span className="mt-[2px] flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--uc-action)_12%,var(--uc-surface))]">
            <AppIcon name={product.iconName} size={20} color="var(--uc-action)" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="uc-type-n5-strong text-[var(--uc-text-muted)]">{productName}</p>
            <p className="mt-[2px] uc-type-h2 text-[var(--uc-text)]">{rationale}</p>
          </div>
        </div>

        {peersUsing !== null && peerGroupSize > 0 && (
          <div className="mt-[14px] flex items-center gap-[10px]">
            <MyBankerPeerStrip used={peersUsing} total={peerGroupSize} label={peersLine} />
            <span className="uc-type-n5 text-[var(--uc-text-muted)]">
              {peersLine}
              {rateLine ? ` · ${rateLine}` : ""}
            </span>
          </div>
        )}

        <div className="mt-[16px]">{detail}</div>
      </article>
    );
  }

  return (
    <article
      ref={cardRef}
      className={`overflow-hidden rounded-[8px] bg-[var(--uc-surface)] transition-shadow ${
        expanded
          ? "shadow-[0_4px_16px_rgb(var(--uc-shadow-rgb)_/_0.12)]"
          : "shadow-[0_1px_2px_rgb(var(--uc-shadow-rgb)_/_0.08)]"
      }`}
      data-ds-label="My Banker product card"
      data-product-key={product.key}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-center gap-[12px] px-[16px] py-[14px] text-left"
      >
        <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[var(--uc-surface-muted)]">
          <AppIcon name={product.iconName} size={16} color="var(--uc-text)" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-[6px]">
            <span className="min-w-0 flex-1 truncate uc-type-n5-strong text-[var(--uc-text)]">{productName}</span>
            <span
              className={`shrink-0 rounded-[3.5px] px-[6px] py-[2px] text-[11px] font-bold leading-[16px] ${
                status === "in-use"
                  ? "bg-[var(--uc-surface-muted)] text-[var(--uc-text-muted)]"
                  : "border border-[var(--uc-text-subtle)] text-[var(--uc-text)]"
              }`}
            >
              {status === "in-use"
                ? t("runtime.myBanker.status.inUse", "In use")
                : t("runtime.myBanker.status.recommended", "Recommended")}
            </span>
          </span>

          <span className="mt-[3px] flex flex-wrap items-baseline gap-x-[6px] uc-type-n5 text-[var(--uc-text-muted)]">
            <span>{adoptionLine}</span>
            {rateLine && (
              <>
                <span className="text-[var(--uc-text-subtle)]" aria-hidden="true">
                  ·
                </span>
                <span>{rateLine}</span>
              </>
            )}
            {requestSent && (
              <span className="flex items-center gap-[4px] text-[var(--uc-green-success)]">
                <span className="flex h-[12px] w-[12px] items-center justify-center rounded-full bg-[var(--uc-green-success)]">
                  <AppIcon name="check" size={8} color="var(--uc-static-white)" />
                </span>
                {t("runtime.myBanker.request.sentTag", "Request sent")}
              </span>
            )}
          </span>
        </span>

        <span
          className={`shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <AppIcon name="chevron-down-wide" size={16} color="var(--uc-text)" />
        </span>
      </button>

      {expanded && detail}
    </article>
  );
}
