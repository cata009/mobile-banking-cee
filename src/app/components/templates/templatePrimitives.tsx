/**
 * Shared chrome for the template previews: phone surface, headers, navigation
 * bars, form rows, and the small controls the screens compose from.
 *
 * Extracted verbatim from TemplateCodePreviews.tsx.
 */
import type { ReactNode } from "react";
import AmountField from "@/app/components/AmountField";
import DynamicIsland from "@/app/components/DynamicIsland";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import StatusBar from "@/app/components/StatusBar";
import TextField from "@/app/components/TextField";
import ToggleButton from "@/app/components/ToggleButton";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import { AppIcon, type IconName } from "@/app/components/icons";
import MessagesMailboxTabs from "@/app/components/messages/MessagesMailboxTabs";
import PaymentHeroCard from "@/app/components/payments/PaymentHeroCard";
import type { MoreCardType } from "@/app/config/moreCardsConfig";
import type { PaymentHeroItem } from "@/app/config/paymentsMenuConfig";
import { moreCardMeta, type FieldLine, type RadioOption, type TemplateTab } from "./templateData";

const TEMPLATE_SYSTEM_HEADER_HEIGHT = 54;

export function TemplateSystemHeaderSpacer() {
  return null;
}

export function TemplatePhoneSurface({
  children,
  showSystemHeader = true,
  statusBarVariant = "light",
  reserveSystemHeader = true,
}: {
  children: ReactNode;
  showSystemHeader?: boolean;
  statusBarVariant?: "light" | "dark";
  reserveSystemHeader?: boolean;
}) {
  const contentTopOffset = showSystemHeader && reserveSystemHeader ? TEMPLATE_SYSTEM_HEADER_HEIGHT : 0;

  return (
    <div
      className="relative h-[814px] w-[377px] overflow-hidden border border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)]"
      data-ds-label="Template code screen 377x814"
      data-template-phone-surface="true"
    >
      {showSystemHeader ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-50"
          style={{ height: TEMPLATE_SYSTEM_HEADER_HEIGHT }}
          data-template-system-header="true"
        >
          <StatusBar variant={statusBarVariant} />
          <DynamicIsland variant={statusBarVariant} />
        </div>
      ) : null}
      <div
        className="relative h-full min-h-0 w-full"
        style={{
          height: contentTopOffset ? `calc(100% - ${contentTopOffset}px)` : "100%",
          marginTop: contentTopOffset,
        }}
        data-template-phone-content="true"
      >
        {children}
      </div>
    </div>
  );
}

export function TemplateHomeIndicator() {
  return (
    <div className="absolute inset-x-0 bottom-0 flex h-[21px] items-start justify-center pt-[8px]" aria-hidden="true">
      <span className="h-[5px] w-[134px] rounded-full bg-[var(--uc-static-black)]" />
    </div>
  );
}

export function TemplateAction({
  ariaLabel,
  children,
  className,
  interactive,
  pressed,
}: {
  ariaLabel: string;
  children: ReactNode;
  className: string;
  interactive: boolean;
  pressed?: boolean;
}) {
  if (!interactive) {
    return (
      <span aria-hidden="true" className={className}>
        {children}
      </span>
    );
  }

  return (
    <button className={className} type="button" aria-label={ariaLabel} aria-pressed={pressed}>
      {children}
    </button>
  );
}

export function TemplateBottomButton({
  label,
  interactive,
  disabled = false,
  bottom = 32,
}: {
  label: string;
  interactive: boolean;
  disabled?: boolean;
  bottom?: number;
}) {
  const style = { bottom };

  return (
    <div className="absolute left-[24px] right-[24px]" style={style}>
      {interactive && !disabled ? (
        <PrimaryButton className="w-full">{label}</PrimaryButton>
      ) : (
        <div
          className={`flex h-[48px] w-full items-center justify-center rounded font-['UniCredit',sans-serif] text-base font-bold ${
            disabled
              ? "bg-[var(--uc-action-soft-strong)] text-[var(--uc-static-white)]"
              : "bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
          }`}
          aria-disabled={disabled}
        >
          {label}
        </div>
      )}
    </div>
  );
}

function TemplateRadioMark({ selected }: { selected?: boolean }) {
  return (
    <span className="grid size-[32px] place-items-center">
      <AppIcon
        name={selected ? "radio-selected" : "radio-unselected"}
        color={selected ? "var(--uc-action)" : "var(--uc-text)"}
      />
    </span>
  );
}

export function TemplateRadioRow({ option, interactive }: { option: RadioOption; interactive: boolean }) {
  return (
    <TemplateAction
      ariaLabel={option.title}
      pressed={Boolean(option.selected)}
      interactive={interactive}
      className="grid min-h-[72px] w-full grid-cols-[32px_1fr] items-center gap-[16px] text-left"
    >
      <TemplateRadioMark selected={option.selected} />
      <span className="min-w-0">
        <span className="block font-['UniCredit',sans-serif] text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">
          {option.title}
        </span>
        {option.subtitle ? (
          <span className="mt-[3px] block truncate font-['UniCredit',sans-serif] text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
            {option.subtitle}
          </span>
        ) : null}
      </span>
    </TemplateAction>
  );
}

export function TemplateFormLine({ field }: { field: FieldLine }) {
  const fieldValue = field.value ?? field.placeholder ?? "";

  if (field.label.toLowerCase().includes("amount")) {
    const [amount = "", currency = "RON"] = fieldValue.split(" ");
    return (
      <div className="pt-[22px]">
        <AmountField
          label={field.label}
          value={amount}
          onChange={() => undefined}
          currency={currency}
        />
      </div>
    );
  }

  return (
    <div className="pt-[22px]">
      <TextField
        label={field.label}
        value={fieldValue}
        onChange={() => undefined}
        trailingIconName={field.action ? "chevron-down-wide" : undefined}
      />
    </div>
  );
}

export function TemplateFlowField({
  label,
  value,
  helper,
  right,
}: {
  label: string;
  value: string;
  helper?: string;
  right?: IconName;
}) {
  return (
    <div className="pt-[22px]">
      <TextField
        label={label}
        value={value}
        onChange={() => undefined}
        helperText={helper?.split("\n")[0]}
        helperText2={helper?.split("\n")[1]}
        trailingIconName={right === "chevron-down" ? "chevron-down-wide" : right}
      />
    </div>
  );
}

export function TemplateReadOnlyRow({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-start gap-[12px] py-[17px] font-['UniCredit',sans-serif]">
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-normal leading-normal text-[var(--uc-text-muted)]">{label}</p>
        <p className="mt-[3px] whitespace-pre-line break-words text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">
          {value}
        </p>
      </div>
      {copy ? (
        <span className="mt-[8px] grid size-[32px] place-items-center">
          <AppIcon name="copy-documents" color="var(--uc-text)" />
        </span>
      ) : null}
    </div>
  );
}

export function TemplateToggle({ checked = true }: { checked?: boolean }) {
  return <ToggleButton checked={checked} />;
}

export function TemplateSimpleSectionTitle({ children }: { children: string }) {
  return <SectionHeadingDivider title={children} className="pt-[30px]" />;
}

export function TemplateMiniBottomNavigation({ active }: { active: "Home" | "Payments" | "Products" | "More" }) {
  const items: Array<{ label: "Home" | "Payments" | "Products" | "More"; icon: IconName }> = [
    { label: "Home", icon: "nav-home" },
    { label: "Payments", icon: "nav-payments" },
    { label: "Products", icon: "nav-products" },
    { label: "More", icon: "nav-more" },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[74px] border-t border-[var(--uc-border-muted)] bg-[var(--uc-bottom-bar-bg)]">
      <div className="grid h-[53px] grid-cols-4">
        {items.map((item) => {
          const selected = item.label === active;
          return (
            <div key={item.label} className="relative flex flex-col items-center justify-center gap-[2px]">
              {selected ? (
                <span className="absolute top-0 h-[2px] w-[24px] rounded-b-full bg-[var(--uc-action)]" />
              ) : null}
              <span className="grid size-[32px] place-items-center">
                <AppIcon name={item.icon} color={selected ? "var(--uc-action)" : "var(--uc-text-muted)"} />
              </span>
              <span className={`font-['UniCredit',sans-serif] text-[12px] leading-[14px] ${selected ? "text-[var(--uc-action)]" : "text-[var(--uc-text-muted)]"}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
      <TemplateHomeIndicator />
    </div>
  );
}

export function TemplateFiveBottomNavigation({ active, productLabel = "Products" }: { active: "Home" | "Spending" | "Payments" | "Products" | "More"; productLabel?: "Products" | "Offers" }) {
  const items: Array<{ label: "Home" | "Spending" | "Payments" | "Products" | "More"; icon: IconName; display: string }> = [
    { label: "Home", icon: "nav-home", display: "Home" },
    { label: "Spending", icon: "nav-analytics", display: "Spending" },
    { label: "Payments", icon: "nav-payments", display: "Payments" },
    { label: "Products", icon: "nav-products", display: productLabel },
    { label: "More", icon: "nav-more", display: "More" },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[74px] border-t border-[var(--uc-border-muted)] bg-[var(--uc-bottom-bar-bg)]">
      <div className="grid h-[53px] grid-cols-5">
        {items.map((item) => {
          const selected = item.label === active;
          return (
            <div key={item.label} className="relative flex flex-col items-center justify-center gap-[2px]">
              {selected ? <span className="absolute top-0 h-[2px] w-[24px] rounded-b-full bg-[var(--uc-action)]" /> : null}
              <span className="grid size-[32px] place-items-center">
                <AppIcon name={item.icon} color={selected ? "var(--uc-action)" : "var(--uc-text-muted)"} />
              </span>
              <span className={`font-['UniCredit',sans-serif] text-[12px] leading-[14px] ${selected ? "text-[var(--uc-action)]" : "text-[var(--uc-text-muted)]"}`}>
                {item.display}
              </span>
            </div>
          );
        })}
      </div>
      <TemplateHomeIndicator />
    </div>
  );
}

export function TemplateTopLevelHeader({
  title,
  subtitle,
  actions,
  interactive,
}: {
  title: string;
  subtitle?: string;
  actions: Array<{ icon: IconName; label: string }>;
  interactive: boolean;
}) {
  return (
    <>
      <TemplateSystemHeaderSpacer />
      <header className="px-[24px] pt-[34px] font-['UniCredit',sans-serif]">
        <div className="flex min-h-[40px] items-start gap-[12px]">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[28px] font-bold leading-normal text-[var(--uc-text)]">{title}</h1>
            {subtitle ? (
              <p className="mt-[2px] text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
                {subtitle}
              </p>
            ) : null}
          </div>
          <div className="flex h-[32px] shrink-0 items-center gap-[8px]">
            {actions.map((action) => (
              <TemplateAction
                key={action.label}
                ariaLabel={action.label}
                interactive={interactive}
                className="grid size-[32px] place-items-center"
              >
                <AppIcon name={action.icon} color="var(--uc-text)" />
              </TemplateAction>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}

export function TemplatePaymentHeroCard({ item, interactive }: { item: PaymentHeroItem; interactive: boolean }) {
  return (
    <div className={interactive ? "" : "pointer-events-none"}>
      <PaymentHeroCard item={item} />
    </div>
  );
}

export function MoreTemplateCard({ type, interactive }: { type: MoreCardType; interactive: boolean }) {
  const meta = moreCardMeta[type];

  return (
    <TemplateAction
      ariaLabel={meta.title}
      interactive={interactive}
      className="grid min-h-[92px] w-full grid-cols-[44px_1fr_24px] items-center gap-[12px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[14px] text-left"
    >
      <span className="grid size-[40px] place-items-center rounded-full bg-[var(--uc-action-soft)] text-[var(--uc-action)]">
        <AppIcon name={meta.icon} color="currentColor" />
      </span>
      <span className="min-w-0 font-['UniCredit',sans-serif]">
        <span className="block text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{meta.title}</span>
        <span className="mt-[3px] block text-[13px] font-normal leading-[16px] text-[var(--uc-text-muted)]">
          {meta.description}
        </span>
      </span>
      <span className="grid size-[32px] place-items-center">
        <AppIcon name="chevron-link" color="var(--uc-text)" />
      </span>
    </TemplateAction>
  );
}

export function TemplateTopChrome({
  title,
  showHelp = true,
  interactive,
}: {
  title: string;
  showHelp?: boolean;
  interactive: boolean;
}) {
  return (
    <PageHeader
      title={title}
      onBack={() => undefined}
      onHelpClick={() => undefined}
      showHelp={showHelp}
      variant="transparent"
      includeSafeArea={false}
      compact={false}
      onRightActionClick={interactive ? () => undefined : undefined}
    />
  );
}

export function TemplateHelpOnlyChrome({ title, interactive }: { title: string; interactive: boolean }) {
  void interactive;

  return (
    <PageHeader
      title={title}
      onBack={() => undefined}
      onHelpClick={() => undefined}
      showHelp
      showBack={false}
      variant="transparent"
      includeSafeArea={false}
      compact={false}
    />
  );
}

export function TemplateTabs({ tabs, interactive }: { tabs: TemplateTab[]; interactive: boolean }) {
  void interactive;

  return (
    <MessagesMailboxTabs
      tabs={tabs.map((tab) => ({ id: tab.label, label: tab.label }))}
      activeTabId={tabs.find((tab) => tab.active)?.label ?? tabs[0]?.label ?? ""}
      onChange={() => {}}
    />
  );
}

export function TemplateSearchStrip({ interactive }: { interactive: boolean }) {
  return (
    <div className="px-[16px] py-[26px]">
      {interactive ? (
        <AccountSearchBar />
      ) : (
        <div className="flex h-[36px] items-center justify-between rounded-[10px] bg-[var(--uc-app-bg)] py-[2px] pl-0 pr-0" aria-hidden="true">
          <span className="flex min-w-0 flex-1 items-center gap-[8px]">
            <span className="grid size-[32px] place-items-center">
              <AppIcon name="search" color="var(--uc-text)" />
            </span>
            <span className="font-['UniCredit',sans-serif] text-[14px] font-bold text-[var(--uc-text-muted)]">
              Search
            </span>
          </span>
          <span className="grid size-[32px] place-items-center">
            <AppIcon name="filters" color="var(--uc-text)" />
          </span>
        </div>
      )}
    </div>
  );
}

export function TemplateSectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mx-[24px] border-b border-[var(--uc-border-muted)] pb-[5px]">
      <h2 className="font-['UniCredit',sans-serif] text-[18px] font-bold leading-normal text-[var(--uc-text)]">
        {children}
      </h2>
    </div>
  );
}

export function DotMenu({ interactive }: { interactive: boolean }) {
  return (
    <TemplateAction
      className="flex size-[32px] flex-col items-center justify-center gap-[3px]"
      ariaLabel="More actions"
      interactive={interactive}
    >
      <span className="size-[4px] rounded-full bg-[var(--uc-text)]" />
      <span className="size-[4px] rounded-full bg-[var(--uc-text)]" />
      <span className="size-[4px] rounded-full bg-[var(--uc-text)]" />
    </TemplateAction>
  );
}

export function TemplateAccountOptionIcon({ id }: { id: string }) {
  const iconMap: Record<string, IconName> = {
    "share-account-info": "account-option-share-info",
    "push-notifications": "account-option-push-notifications",
    "account-statement": "account-option-statement",
    "create-paycode": "account-option-create-paycode",
    "change-account-name": "account-option-change-name",
  };

  return <AppIcon name={iconMap[id] ?? "wallet-cards"} color="var(--uc-text)" />;
}
