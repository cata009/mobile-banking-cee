import { useState } from "react";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import ActionIconBubble from "@/app/components/ActionIconBubble";
import BankBadge from "@/app/components/payments/BankBadge";
import { BottomSheet } from "@/app/components/BottomSheet";
import PrimaryButton from "@/app/components/PrimaryButton";
import ToggleButton from "@/app/components/ToggleButton";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCountry } from "@/app/state/demoStore";
import { formatEvo2027Amount } from "@/app/utils/evo2027Formatting";
import { getPartyInitials, partyTint } from "@/app/components/transactions/TransactionPartyAvatar";
import { AppIcon, type IconName } from "@/app/components/icons";
import { getFrequentBeneficiaries, type FrequentBeneficiary } from "@/data/paymentsHub";

/** Everything the hub can start. The first eight are on the grid; the rest live behind More. */
export type PaymentsHubActionId =
  | "new-payment"
  | "between-accounts"
  | "scan-pay"
  | "recurrent-payments"
  | "templates"
  | "card-repayment"
  | "exchange-rates"
  | "create-qr-code"
  | "foreign-payment"
  | "manage-ebills";

interface HubAction {
  id: PaymentsHubActionId;
  label: string;
  icon: IconName;
}

/**
 * Eight is the grid: two rows of four, which is as much as fits above the fold
 * without pushing the people you pay off the screen. Anything beyond it is one
 * tap away under More rather than a third row nobody reaches.
 */
const GRID_LIMIT = 8;

/*
 * Labels break where the shortcuts on Payments break: two short lines under the
 * roundel, so eight tiles keep one baseline instead of some sitting a line
 * higher than their neighbours.
 */
const HUB_ACTIONS: readonly HubAction[] = [
  { id: "new-payment", label: "Domestic\npayment", icon: "new-payment-domestic" },
  { id: "between-accounts", label: "Move\nmoney", icon: "transaction-transfer" },
  { id: "scan-pay", label: "Scan &\npay", icon: "payment-scan-qr" },
  { id: "recurrent-payments", label: "Recurrent\npayments", icon: "payment-templates" },
  { id: "templates", label: "Templates", icon: "payment-templates" },
  { id: "card-repayment", label: "Card\nrepayment", icon: "payment-card-repayment" },
  { id: "exchange-rates", label: "Exchange\nrates", icon: "payment-exchange-rates" },
  { id: "create-qr-code", label: "Create QR\ncode", icon: "payment-create-qr" },
  { id: "foreign-payment", label: "Foreign\npayment", icon: "new-payment-foreign" },
  { id: "manage-ebills", label: "Manage\ne-bills", icon: "payment-new" },
];

const MORE_ACTION_DESCRIPTIONS: Partial<Record<PaymentsHubActionId, string>> = {
  "create-qr-code": "Let someone pay you by scanning a code",
  "foreign-payment": "Send foreign or SEPA payment",
  "manage-ebills": "Contract e-bills and pay them in one tap",
};

/** Grid slots the customer can fill; the eighth is always More. */
const CUSTOMISABLE_SLOTS = GRID_LIMIT - 1;

const HUB_LAYOUT_STORAGE_KEY = "uc.evo2027.payments.hubLayout";

const DEFAULT_HUB_LAYOUT: readonly PaymentsHubActionId[] = HUB_ACTIONS.slice(0, CUSTOMISABLE_SLOTS).map(
  (action) => action.id,
);

function isHubActionId(value: unknown): value is PaymentsHubActionId {
  return typeof value === "string" && HUB_ACTIONS.some((action) => action.id === value);
}

/** Reads the saved grid, dropping anything the app no longer offers. */
export function getStoredHubLayout(): PaymentsHubActionId[] {
  if (typeof window === "undefined") return [...DEFAULT_HUB_LAYOUT];

  try {
    const raw = window.localStorage.getItem(HUB_LAYOUT_STORAGE_KEY);
    if (!raw) return [...DEFAULT_HUB_LAYOUT];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_HUB_LAYOUT];

    const layout = parsed.filter(isHubActionId).slice(0, CUSTOMISABLE_SLOTS);
    return layout.length > 0 ? layout : [...DEFAULT_HUB_LAYOUT];
  } catch {
    return [...DEFAULT_HUB_LAYOUT];
  }
}

function storeHubLayout(layout: readonly PaymentsHubActionId[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HUB_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
  } catch {
    /* A demo that cannot persist still works for the session. */
  }
}

export interface Evo2027PaymentsHubProps {
  /** Names the page; the header above the hub already prints it. */
  onAction: (id: PaymentsHubActionId) => void;
  /** Tapping a person starts a payment to them. */
  onBeneficiarySelect: (beneficiary: FrequentBeneficiary) => void;
  /** Actions the current banking scenario cannot start, with the reason to show. */
  disabledReasons?: Map<PaymentsHubActionId, string>;
  /** The header pencil owns the editor; the hub owns what it edits. */
  editOpen?: boolean;
  onEditClose?: () => void;
}

/**
 * Evo 2027 Payments landing.
 *
 * The four illustrated hero cards said very little per screenful: a customer
 * scrolled past pictures to reach the one action they came for, and the people
 * they pay every month were nowhere on the page. The hub leads with search,
 * puts every action on one grid, and gives the rest of the page to the
 * beneficiaries that actually get paid.
 */
export default function Evo2027PaymentsHub({
  onAction,
  onBeneficiarySelect,
  disabledReasons,
  editOpen = false,
  onEditClose,
}: Evo2027PaymentsHubProps) {
  const country = useCountry();
  const { t } = useLanguage();
  const [searchValue, setSearchValue] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [layout, setLayout] = useState<PaymentsHubActionId[]>(getStoredHubLayout);

  const byId = new Map(HUB_ACTIONS.map((action) => [action.id, action]));
  const gridActions = layout
    .map((id) => byId.get(id))
    .filter((action): action is HubAction => Boolean(action));
  // Everything the grid does not show is still reachable, in the catalogue order.
  const moreActions = HUB_ACTIONS.filter((action) => !layout.includes(action.id));

  const applyLayout = (next: PaymentsHubActionId[]) => {
    setLayout(next);
    storeHubLayout(next);
  };

  const normalizedSearch = searchValue.trim().toLocaleLowerCase();
  const beneficiaries = getFrequentBeneficiaries(country).filter((person) => (
    !normalizedSearch
    || person.name.toLocaleLowerCase().includes(normalizedSearch)
    || person.accountNumber.toLocaleLowerCase().includes(normalizedSearch)
  ));

  const labelFor = (action: HubAction) => t(`runtime.payments.hub.actions.${action.id}`, action.label);

  return (
    <div className="flex flex-col gap-[24px] pt-[4px]">
      {/* Search stays reachable while the beneficiaries scroll, the way Account
          details keeps its own field pinned. */}
      <div className="sticky top-0 z-[9] bg-[var(--uc-app-bg)] px-[20px] pb-[10px] pt-[2px]">
        <AccountSearchBar
          value={searchValue}
          onValueChange={setSearchValue}
          placeholder={t("runtime.payments.hub.searchPlaceholder", "Name, account, IBAN")}
          fieldSurface="raised"
          fieldSize="comfortable"
          fieldPadding="8"
          trailingIcon="payment-scan-qr"
          trailingLabel={t("runtime.payments.hub.scanQr", "Scan a QR code")}
          onFilterClick={() => onAction("scan-pay")}
        />
      </div>

      <section aria-label={t("runtime.payments.hub.actionsLabel", "Payment actions")} className="px-[20px]">
        <div className="grid grid-cols-4 gap-x-[8px] gap-y-[20px]">
          {gridActions.map((action) => (
            <HubTile
              key={action.id}
              icon={action.icon}
              label={labelFor(action)}
              disabledReason={disabledReasons?.get(action.id)}
              onClick={() => onAction(action.id)}
            />
          ))}
          <HubTile
            icon="more-horizontal"
            label={t("runtime.payments.hub.more", "More\npayments")}
            onClick={() => setMoreOpen(true)}
          />
        </div>
      </section>

      <section aria-label={t("runtime.payments.hub.recent", "Recent payments")} className="px-[20px]">
        <h2 className="uc-type-l1 text-[var(--uc-text)]">
          {t("runtime.payments.hub.recent", "Recent payments")}
        </h2>

        {beneficiaries.length === 0 ? (
          <p className="uc-type-n4 py-[32px] text-center text-[var(--uc-text-muted)]">
            {t("runtime.payments.hub.noBeneficiaries", "Nobody matches this search")}
          </p>
        ) : (
          <div className="mt-[12px] overflow-hidden rounded-[8px] bg-[var(--uc-surface)] shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)]">
            {beneficiaries.map((person, index) => (
              <BeneficiaryRow
                key={person.id}
                person={person}
                withDivider={index > 0}
                onSelect={() => onBeneficiarySelect(person)}
              />
            ))}
          </div>
        )}
      </section>

      {editOpen ? (
        <HubLayoutEditor
          layout={layout}
          labelFor={labelFor}
          onApply={applyLayout}
          onClose={() => onEditClose?.()}
        />
      ) : null}

      {moreOpen ? (
        <BottomSheet title={t("runtime.payments.hub.moreTitle", "More payments")} onClose={() => setMoreOpen(false)}>
          <div className="flex flex-col">
            {moreActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  onAction(action.id);
                }}
                className="grid h-[80px] w-full grid-cols-[32px_1fr_32px] items-center gap-[16px] text-left"
              >
                <span className="flex size-[32px] shrink-0 items-center justify-center">
                  <AppIcon name={action.icon} color="var(--uc-icon)" />
                </span>
                <span className="min-w-0">
                  <span className="uc-type-h2 block text-[var(--uc-text)]">{labelFor(action)}</span>
                  <span className="uc-type-n5 mt-[2px] block text-[var(--uc-text)]">
                    {t(
                      `runtime.payments.hub.descriptions.${action.id}`,
                      MORE_ACTION_DESCRIPTIONS[action.id] ?? "",
                    )}
                  </span>
                </span>
                <span className="flex size-[32px] shrink-0 items-center justify-center">
                  <AppIcon name="chevron-link" color="var(--uc-icon)" />
                </span>
              </button>
            ))}
          </div>
        </BottomSheet>
      ) : null}
    </div>
  );
}

/**
 * Which payments sit on the grid, and in what order.
 *
 * The bank cannot know whether a customer's week is standing orders or QR codes
 * at the till, so the grid is theirs to arrange: switch a journey on until the
 * seven slots are full, and move the ones that matter to the front. Anything
 * switched off is still one tap away under More payments.
 */
function HubLayoutEditor({
  layout,
  labelFor,
  onApply,
  onClose,
}: {
  layout: readonly PaymentsHubActionId[];
  labelFor: (action: HubAction) => string;
  onApply: (next: PaymentsHubActionId[]) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState<PaymentsHubActionId[]>([...layout]);

  // Selected first, in their grid order; the rest keep the catalogue order.
  const rows = [
    ...draft.map((id) => HUB_ACTIONS.find((action) => action.id === id)).filter((a): a is HubAction => Boolean(a)),
    ...HUB_ACTIONS.filter((action) => !draft.includes(action.id)),
  ];

  const full = draft.length >= CUSTOMISABLE_SLOTS;

  const toggle = (id: PaymentsHubActionId) => {
    setDraft((current) => {
      if (current.includes(id)) return current.filter((entry) => entry !== id);
      if (current.length >= CUSTOMISABLE_SLOTS) return current;
      return [...current, id];
    });
  };

  const move = (id: PaymentsHubActionId, direction: -1 | 1) => {
    setDraft((current) => {
      const index = current.indexOf(id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.length) return current;

      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved!);
      return next;
    });
  };

  return (
    <BottomSheet title={t("runtime.payments.hub.customise", "Customise payments")} onClose={onClose}>
      <p className="uc-type-n5 text-[var(--uc-text-muted)]">
        {t(
          "runtime.payments.hub.customiseHint",
          `Pick up to ${CUSTOMISABLE_SLOTS} payments for the grid and put them in the order you use them.`,
        )}
      </p>

      <div className="mt-[16px] flex flex-col">
        {rows.map((action) => {
          const position = draft.indexOf(action.id);
          const selected = position !== -1;
          const label = labelFor(action).replace(/\n/g, " ");

          return (
            <div
              key={action.id}
              className="flex items-center gap-[12px] border-b border-[var(--uc-border-muted)] py-[12px] last:border-b-0"
            >
              <span className="grid size-[32px] shrink-0 place-items-center" aria-hidden="true">
                <AppIcon name={action.icon} color="var(--uc-icon)" />
              </span>
              <span className="uc-type-n4-strong min-w-0 flex-1 truncate text-[var(--uc-text)]">{label}</span>

              {selected ? (
                <span className="flex shrink-0 items-center gap-[2px]">
                  <ReorderButton
                    label={t("runtime.payments.hub.moveUp", "Move up")}
                    icon="chevron-up"
                    disabled={position === 0}
                    onClick={() => move(action.id, -1)}
                  />
                  <ReorderButton
                    label={t("runtime.payments.hub.moveDown", "Move down")}
                    icon="chevron-down"
                    disabled={position === draft.length - 1}
                    onClick={() => move(action.id, 1)}
                  />
                </span>
              ) : null}

              <ToggleButton
                ariaLabel={label}
                checked={selected}
                disabled={!selected && full}
                onToggle={() => toggle(action.id)}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-[20px] flex flex-col gap-[8px]">
        <PrimaryButton
          onClick={() => {
            onApply(draft);
            onClose();
          }}
          disabled={draft.length === 0}
        >
          {t("runtime.actions.save", "Save")}
        </PrimaryButton>
        <button
          type="button"
          onClick={() => setDraft([...DEFAULT_HUB_LAYOUT])}
          className="uc-type-n5-strong min-h-[40px] text-[var(--uc-action)] underline-offset-[3px] hover:underline"
        >
          {t("runtime.payments.hub.reset", "Reset to default")}
        </button>
      </div>
    </BottomSheet>
  );
}

function ReorderButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: IconName;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-[32px] place-items-center rounded-[6px] text-[var(--uc-text)] disabled:opacity-30"
    >
      <AppIcon name={icon} size={18} color="currentColor" />
    </button>
  );
}

function HubTile({
  icon,
  label,
  disabledReason,
  onClick,
}: {
  icon: IconName;
  label: string;
  disabledReason?: string;
  onClick: () => void;
}) {
  const disabled = Boolean(disabledReason);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabledReason}
      aria-label={label.replace(/\n/g, " ")}
      className={`flex cursor-pointer flex-col items-center gap-[6px] rounded-[8px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)] ${
        disabled ? "cursor-not-allowed opacity-40" : ""
      }`}
    >
      <ActionIconBubble iconName={icon} />
      <span className="block w-full whitespace-pre-line text-center text-[14px] font-normal leading-[16px] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]">
        {label}
      </span>
    </button>
  );
}

function BeneficiaryRow({
  person,
  withDivider,
  onSelect,
}: {
  person: FrequentBeneficiary;
  withDivider: boolean;
  onSelect: () => void;
}) {
  const { t } = useLanguage();
  const amount = formatEvo2027Amount(person.lastAmount, person.currency);
  const initials = getPartyInitials(person.name);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-[12px] px-[16px] py-[14px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)] ${
        withDivider ? "border-t border-[var(--uc-border-muted)]" : ""
      }`}
    >
      {/* Same anatomy as a transaction avatar: the roundel identifies the party,
          the badge on its corner says where the money lands. */}
      <span aria-hidden="true" className="relative inline-flex size-[40px] shrink-0 items-center justify-center">
        <span
          aria-hidden="true"
          className="grid size-full place-items-center rounded-full text-[14px] font-bold leading-none tracking-[0.01em] text-[var(--uc-static-white)]"
          style={{ backgroundColor: partyTint(person.name) }}
        >
          {initials}
        </span>
        <span className="absolute" style={{ right: -1, bottom: -1 }}>
          <BankBadge bank={person.bank} />
        </span>
      </span>

      {/* What was paid belongs under the name, the way a chat thread reads; the
          account number is detail for the payment screen, not for this list. */}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{person.name}</span>
        <span className="mt-[2px] block truncate text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
          {t("runtime.payments.hub.youSent", "You sent")} {amount.integer}
          {amount.decimals} {amount.currency}
        </span>
      </span>

      <span className="shrink-0 whitespace-nowrap text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
        {person.lastPaidLabel}
      </span>
    </button>
  );
}
