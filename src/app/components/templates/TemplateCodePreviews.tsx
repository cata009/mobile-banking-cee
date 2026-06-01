import type { ReactNode } from "react";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import { AppIcon, type IconName } from "@/app/components/icons";
import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { getDocumentsConfigForCountry, type DocumentListItem } from "@/app/config/documentsConfig";
import { SETTINGS_SECTIONS } from "@/app/config/settingsConfig";
import { MESSAGES_CONFIG_BY_COUNTRY, type MessageListItem } from "@/app/config/messagesConfig";
import { ACCOUNT_OPTION_ITEMS, ACCOUNT_PRODUCT_OPTIONS } from "@/data/accountDetails";

export type TemplateCodePreviewId =
  | "messages-inbox"
  | "recurrent-payment"
  | "product-bottom-sheet"
  | "sign-pin"
  | "generate-token"
  | "message-detail"
  | "push-request-form"
  | "account-selection-panel"
  | "apple-pay-activation"
  | "successful-payment"
  | "tutorial-intro"
  | "product-selection"
  | "travel-insurance-detail"
  | "documents"
  | "settings"
  | "account-options"
  | "activate-mtoken"
  | "analytics-overview"
  | "cards-overview"
  | "contact-info-sheet"
  | "account-detail-homepage"
  | "domestic-payment-form"
  | "review-request"
  | "review-data"
  | "transaction-detail"
  | "informative-status"
  | "pending-status"
  | "success-status"
  | "error-status"
  | "warning-status";

type TemplateCodePreviewProps = {
  previewId: TemplateCodePreviewId;
  presentationOnly?: boolean;
};

type TemplateTab = {
  label: string;
  active?: boolean;
};

type StandingOrderRow = {
  title: string;
  date: string;
  amount: string;
  currency: string;
};

type FeedbackStatusKind = "informative" | "pending" | "success" | "error" | "warning";

type FeedbackStatusTemplateConfig = {
  title: string;
  kind: FeedbackStatusKind;
  iconColor: string;
  heading: string;
  body: string;
  buttonLabel: string;
};

type RadioOption = {
  title: string;
  subtitle?: string;
  selected?: boolean;
  icon?: IconName;
};

type FieldLine = {
  label: string;
  value?: string;
  placeholder?: string;
  action?: string;
};

const messageRows = MESSAGES_CONFIG_BY_COUNTRY.RO.inbox;

const standingOrderRows: StandingOrderRow[] = [
  { title: "Radu standing order", date: "02.05.2025", amount: "120.000.00", currency: "RSD" },
  { title: "Radu standing order", date: "02.05.2025", amount: "120.000.00", currency: "RSD" },
  { title: "Radu standing order", date: "02.05.2025", amount: "120.000.00", currency: "RSD" },
];

const feedbackBody = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const productSelectionOptions: RadioOption[] = [
  { title: "Current account", subtitle: "EUR - 59378215528495028873", selected: true },
  { title: "Debit card", subtitle: "Mastercard - 4322 **** **** 6546" },
  { title: "Account package", subtitle: "U konto" },
];

const accountSelectionOptions: RadioOption[] = [
  { title: "Click Gold", subtitle: "EUR - 59378215528495028873", selected: true },
  { title: "Click Gold", subtitle: "RON - 59378215528495028873" },
  { title: "Click Gold", subtitle: "USD - 59378215528495028873" },
];

const pushRequestSections: Array<{ title: string; fields: FieldLine[] }> = [
  {
    title: "PAYER",
    fields: [
      { label: "Payer name", value: "John Doe" },
      { label: "Payer IBAN", value: "RO49AAAA1B31007593840000" },
    ],
  },
  {
    title: "YOUR ACCOUNT",
    fields: [
      { label: "Select account", value: "RON - 59378215528495028873", action: "Change" },
      { label: "Available balance", value: "12.250,00 RON" },
    ],
  },
  {
    title: "PAYMENT INFORMATION",
    fields: [
      { label: "Amount", placeholder: "0,00 RON" },
      { label: "Message for payer", placeholder: "Add details" },
      { label: "Request expires", value: "29.05.2026" },
    ],
  },
];

const tokenOptions: RadioOption[] = [
  { title: "Log in to Online Banking", selected: true },
  { title: "Confirm transaction" },
  { title: "Cancel transaction" },
];

const domesticPaymentFields = {
  fromAccount: [
    { label: "Account number", value: "123546545476745", helper: "Primary Account\n300.020,00 CZK", right: "chevron-down-lucide" as IconName },
  ],
  beneficiary: [
    { label: "Beneficiary", value: "Kindergarten 45" },
    { label: "Prefix", value: "19" },
    { label: "Account number (mandatory)", value: "2000145399", right: "camera" as IconName },
    { label: "Bank code (mandatory)", value: "0800", helper: "Ceska sporitelna, a.s.", right: "camera" as IconName },
  ],
  payment: [
    { label: "Amount limit", value: "24700" },
    { label: "Currency", value: "CZK" },
  ],
};

const reviewRequestSections: Array<{ title: string; rows: FieldLine[] }> = [
  {
    title: "PAYER",
    rows: [
      { label: "Contact", value: "Amy Adams" },
      { label: "Payer alias", value: "Amy Adams" },
      { label: "Phone number", value: "+40 123456678" },
      { label: "Payer bank", value: "UniCredit Bank Bucharest" },
      { label: "Payer IBAN", value: "RO12RZBR5663123456" },
    ],
  },
  {
    title: "YOUR ACCOUNT",
    rows: [
      { label: "Account name", value: "Primary Account" },
      { label: "Account number", value: "1234567890123456" },
    ],
  },
  {
    title: "PAYMENT INFORMATION",
    rows: [
      { label: "Amount", value: "100 RON" },
      { label: "Payment details", value: "Robert's gift" },
      { label: "Reference number/E2E", value: "905430585" },
    ],
  },
];

const reviewDataRows: FieldLine[] = [
  { label: "Payer account", value: "Primary Account name" },
  { label: "Payer account number", value: "1208187008/2700" },
  { label: "Beneficiary name", value: "John Wilson" },
  { label: "Beneficiary account number", value: "19-2000145399/0800" },
  { label: "Amount", value: "24700,00 CZK" },
  { label: "Instant Payment", value: "Yes" },
  { label: "Due date", value: "15.02.2026" },
  { label: "Express Payment (a fee is charged)", value: "No" },
  { label: "Information for beneficiary", value: "Payment april - Martin Luka" },
];

const transactionDetailRows: FieldLine[] = [
  { label: "Account number", value: "1208187008/2700", action: "copy" },
  { label: "Account title", value: "Primary Account" },
  { label: "Account owner", value: "John Snow" },
  { label: "Booking date", value: "15.02.2026" },
  { label: "Beneficiary Name", value: "Martin Luka" },
  { label: "Beneficiary Bank Name", value: "UniCredit Bank Czech Republic and S\nZeletavska 1525/1" },
  { label: "Beneficiary account number", value: "CZ40270000000021070555322", action: "copy" },
  { label: "Amount", value: "-24.700,00 CZK" },
  { label: "Payment details", value: "Payment april - Martin Luka" },
  { label: "Reference number", value: "6041300502" },
];

const feedbackStatusTemplates: Record<
  Extract<TemplateCodePreviewId, "informative-status" | "pending-status" | "success-status" | "error-status" | "warning-status">,
  FeedbackStatusTemplateConfig
> = {
  "informative-status": {
    title: "Informative",
    kind: "informative",
    iconColor: "var(--uc-text)",
    heading: "Lorem ipsum",
    body: feedbackBody,
    buttonLabel: "Ok, got it",
  },
  "pending-status": {
    title: "Pending",
    kind: "pending",
    iconColor: "var(--uc-text)",
    heading: "Lorem ipsum",
    body: feedbackBody,
    buttonLabel: "Ok, got it",
  },
  "success-status": {
    title: "Successfully requested",
    kind: "success",
    iconColor: "var(--uc-green-olive)",
    heading: "Lorem ipsum",
    body: feedbackBody,
    buttonLabel: "Ok, got it",
  },
  "error-status": {
    title: "Something went wrong",
    kind: "error",
    iconColor: "var(--uc-status-red)",
    heading: "Lorem ipsum",
    body: feedbackBody,
    buttonLabel: "Ok, got it",
  },
  "warning-status": {
    title: "Something went wrong",
    kind: "warning",
    iconColor: "var(--uc-orange-status)",
    heading: "Lorem ipsum",
    body: feedbackBody,
    buttonLabel: "Ok, got it",
  },
};

function StaticStatusBar() {
  return (
    <div className="flex h-[24px] w-full items-center justify-between px-[6px] pt-[3px] font-['SF_Pro',sans-serif] text-[14px] font-[590] text-[var(--uc-static-black)]">
      <div className="flex w-[64px] items-center gap-[3px]" aria-hidden="true">
        <span className="h-[10px] w-[3px] self-end rounded-sm bg-[var(--uc-static-black)]" />
        <span className="h-[12px] w-[3px] self-end rounded-sm bg-[var(--uc-static-black)]" />
        <span className="h-[14px] w-[3px] self-end rounded-sm bg-[var(--uc-static-black)]" />
        <span className="h-[16px] w-[3px] self-end rounded-sm bg-[var(--uc-static-black)]" />
        <span className="ml-[4px] h-[11px] w-[16px] rounded-full border-[2px] border-[var(--uc-static-black)] border-b-transparent border-l-transparent" />
      </div>
      <span>9:41 AM</span>
      <div className="flex w-[86px] items-center justify-end gap-[5px]">
        <span className="relative h-[14px] w-[8px]" aria-hidden="true">
          <span className="absolute left-[3px] top-0 h-[14px] w-[2px] bg-[var(--uc-static-black)]" />
          <span className="absolute left-[1px] top-[2px] h-[8px] w-[2px] rotate-45 bg-[var(--uc-static-black)]" />
          <span className="absolute left-[5px] top-[4px] h-[8px] w-[2px] rotate-[-45deg] bg-[var(--uc-static-black)]" />
        </span>
        <span className="text-[14px] leading-none">100%</span>
        <span className="relative h-[11px] w-[25px] rounded-[3px] border border-[var(--uc-static-black)]">
          <span className="absolute -right-[3px] top-[3px] h-[5px] w-[2px] rounded-r-sm bg-[var(--uc-static-black)]" />
          <span className="absolute left-[2px] top-[2px] h-[5px] w-[19px] rounded-[2px] bg-[var(--uc-static-black)]" />
        </span>
      </div>
    </div>
  );
}

function TemplatePhoneSurface({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative h-[814px] w-[377px] overflow-hidden border border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)]"
      data-ds-label="Template code screen 377x814"
    >
      {children}
    </div>
  );
}

function TemplateHomeIndicator() {
  return (
    <div className="absolute inset-x-0 bottom-0 flex h-[21px] items-start justify-center pt-[8px]" aria-hidden="true">
      <span className="h-[5px] w-[134px] rounded-full bg-[var(--uc-static-black)]" />
    </div>
  );
}

function TemplateAction({
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

function TemplateBottomButton({
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
              : "bg-[var(--uc-action)] text-[var(--uc-static-white)]"
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
    <span className="grid size-[24px] place-items-center">
      <AppIcon
        name={selected ? "radio-selected" : "radio-unselected"}
        size={24}
        color={selected ? "var(--uc-action)" : "var(--uc-text)"}
      />
    </span>
  );
}

function TemplateRadioRow({ option, interactive }: { option: RadioOption; interactive: boolean }) {
  return (
    <TemplateAction
      ariaLabel={option.title}
      pressed={Boolean(option.selected)}
      interactive={interactive}
      className="grid min-h-[72px] w-full grid-cols-[24px_1fr] items-center gap-[16px] text-left"
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

function TemplateFormLine({ field }: { field: FieldLine }) {
  return (
    <div className="min-h-[64px] border-b border-[var(--uc-border-muted)] pb-[7px] pt-[9px]">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="min-w-0">
          <p className="font-['UniCredit',sans-serif] text-[12px] font-bold uppercase leading-[15px] tracking-[0.08em] text-[var(--uc-text-muted)]">
            {field.label}
          </p>
          <p className={`mt-[8px] truncate font-['UniCredit',sans-serif] text-[16px] leading-[20px] ${field.value ? "font-bold text-[var(--uc-text)]" : "font-normal text-[var(--uc-text-muted)]"}`}>
            {field.value ?? field.placeholder}
          </p>
        </div>
        {field.action ? (
          <span className="font-['UniCredit',sans-serif] text-[14px] font-bold leading-[18px] text-[var(--uc-action)]">
            {field.action}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function TemplateFlowField({
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
    <div className="pt-[22px] font-['UniCredit',sans-serif]">
      <p className="text-[12px] font-normal leading-normal text-[var(--uc-text-subtle)]">{label}</p>
      <div className="flex items-end gap-[12px] border-b border-[var(--uc-text-subtle)] pb-[3px]">
        <p className="min-w-0 flex-1 text-[18px] font-normal leading-normal text-[var(--uc-text)]">{value}</p>
        {right ? <AppIcon name={right} size={24} strokeWidth={3} color="var(--uc-text)" /> : null}
      </div>
      {helper ? (
        <p className="mt-[5px] whitespace-pre-line text-[12px] font-normal leading-normal text-[var(--uc-text-subtle)]">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function TemplateReadOnlyRow({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
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
          <AppIcon name="copy" size={24} strokeWidth={3} color="var(--uc-text)" />
        </span>
      ) : null}
    </div>
  );
}

function TemplateToggle({ checked = true }: { checked?: boolean }) {
  return (
    <span className={`relative h-[30px] w-[60px] rounded-full border-[2px] ${checked ? "border-[var(--uc-action)]" : "border-[var(--uc-text-muted)]"}`} aria-hidden="true">
      <span className={`absolute top-1/2 grid size-[24px] -translate-y-1/2 place-items-center rounded-full ${checked ? "right-[2px] bg-[var(--uc-action)]" : "left-[2px] bg-[var(--uc-text-muted)]"}`}>
        {checked ? <AppIcon name="check" size={16} strokeWidth={4} color="var(--uc-static-white)" /> : null}
      </span>
    </span>
  );
}

function TemplateSimpleSectionTitle({ children }: { children: string }) {
  return (
    <div className="pt-[30px]">
      <h2 className="font-['UniCredit',sans-serif] text-[16px] font-bold leading-normal text-[var(--uc-text)]">
        {children}
      </h2>
      <div className="mt-[8px] h-px w-full bg-[var(--uc-border)]" />
    </div>
  );
}

function TemplateMiniBottomNavigation({ active }: { active: "Home" | "Payments" | "Products" | "More" }) {
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
              <AppIcon name={item.icon} size={26} color={selected ? "var(--uc-action)" : "var(--uc-text-muted)"} />
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

function TemplateFiveBottomNavigation({ active, productLabel = "Products" }: { active: "Home" | "Spending" | "Payments" | "Products" | "More"; productLabel?: "Products" | "Offers" }) {
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
              <AppIcon name={item.icon} size={26} color={selected ? "var(--uc-action)" : "var(--uc-text-muted)"} />
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

function TemplateTopChrome({
  title,
  showHelp = true,
  interactive,
}: {
  title: string;
  showHelp?: boolean;
  interactive: boolean;
}) {
  return (
    <>
      <StaticStatusBar />
      <div className="grid h-[40px] grid-cols-[40px_1fr_40px] items-center px-[4px]">
        <TemplateAction className="grid size-[40px] place-items-center" ariaLabel="Back" interactive={interactive}>
          <AppIcon name="back-heavy" color="var(--uc-text)" />
        </TemplateAction>
        <div />
        {showHelp ? (
          <TemplateAction className="grid size-[40px] place-items-center" ariaLabel="Help" interactive={interactive}>
            <AppIcon name="help-circle" color="var(--uc-text)" />
          </TemplateAction>
        ) : (
          <div />
        )}
      </div>
      <div className="px-[24px] pt-[1px]">
        <h1 className="font-['UniCredit',sans-serif] text-[28px] font-bold leading-normal text-[var(--uc-text)]">
          {title}
        </h1>
      </div>
    </>
  );
}

function TemplateHelpOnlyChrome({ title, interactive }: { title: string; interactive: boolean }) {
  return (
    <>
      <StaticStatusBar />
      <div className="flex h-[40px] items-center justify-end px-[15px]">
        <TemplateAction
          className="grid size-[32px] place-items-center"
          ariaLabel="Help"
          interactive={interactive}
        >
          <AppIcon name="help-circle" size={20} color="var(--uc-text)" />
        </TemplateAction>
      </div>
      <div className="px-[24px] pt-[1px]">
        <h1 className="font-['UniCredit',sans-serif] text-[28px] font-bold leading-normal text-[var(--uc-text)]">
          {title}
        </h1>
      </div>
    </>
  );
}

function TemplateTabs({ tabs, interactive }: { tabs: TemplateTab[]; interactive: boolean }) {
  return (
    <div className="mt-[22px] grid h-[48px] grid-cols-2 border-b border-[var(--uc-border)]">
      {tabs.map((tab) => (
        <TemplateAction
          key={tab.label}
          ariaLabel={tab.label}
          pressed={Boolean(tab.active)}
          interactive={interactive}
          className="relative flex items-center justify-center font-['UniCredit',sans-serif] text-[16px] font-bold text-[var(--uc-text)]"
        >
          {tab.active ? (
            <span className="mr-[8px] size-[12px] rounded-full bg-[var(--uc-action)]" aria-hidden="true" />
          ) : null}
          <span className={tab.active ? "" : "text-[var(--uc-text-muted)]"}>{tab.label}</span>
          {tab.active ? (
            <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[var(--uc-text)]" aria-hidden="true" />
          ) : null}
        </TemplateAction>
      ))}
    </div>
  );
}

function TemplateSearchStrip({ interactive }: { interactive: boolean }) {
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

function TemplateSectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mx-[24px] border-b border-[var(--uc-border-muted)] pb-[5px]">
      <h2 className="font-['UniCredit',sans-serif] text-[18px] font-bold leading-normal text-[var(--uc-text)]">
        {children}
      </h2>
    </div>
  );
}

function DotMenu({ interactive }: { interactive: boolean }) {
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

function TemplateAccountOptionIcon({ id }: { id: string }) {
  const iconMap: Record<string, IconName> = {
    "share-account-info": "account-option-share-info",
    "push-notifications": "account-option-push-notifications",
    "account-statement": "account-option-statement",
    "create-paycode": "account-option-create-paycode",
    "change-account-name": "account-option-change-name",
  };

  return <AppIcon name={iconMap[id] ?? "wallet-cards"} color="var(--uc-text)" />;
}

function MessageListRow({ row, interactive }: { row: MessageListItem; interactive: boolean }) {
  return (
    <div className="grid h-[80px] grid-cols-[32px_1fr_48px_32px] items-center gap-[2px] px-[18px]">
      <div className="text-center">
        <p className="font-['UniCredit',sans-serif] text-[18px] font-bold leading-[20px] text-[var(--uc-text)]">{row.day}</p>
        <p className="font-['UniCredit',sans-serif] text-[14px] font-bold leading-[16px] text-[var(--uc-text-muted)]">{row.month}</p>
      </div>
      <div className="min-w-0 pl-[6px]">
        <p className="truncate font-['UniCredit',sans-serif] text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{row.title}</p>
        <p className="truncate font-['UniCredit',sans-serif] text-[16px] font-normal leading-[22px] text-[var(--uc-text-muted)]">{row.description}</p>
      </div>
      {row.badge ? (
        <span className="justify-self-center rounded-full bg-[var(--uc-action-soft)] px-[7px] py-[2px] font-['UniCredit',sans-serif] text-[11px] font-bold leading-[14px] text-[var(--uc-action)]">
          {row.badge}
        </span>
      ) : <span />}
      <DotMenu interactive={interactive} />
    </div>
  );
}

function DocumentListRowTemplate({
  row,
  interactive,
}: {
  row: DocumentListItem;
  interactive: boolean;
}) {
  return (
    <TemplateAction
      ariaLabel={row.title}
      interactive={interactive}
      className="grid h-[80px] w-full grid-cols-[32px_1fr_48px] items-center gap-[2px] px-[18px] text-left"
    >
      <span className="text-center">
        <span className="block font-['UniCredit',sans-serif] text-[18px] font-bold leading-[20px] text-[var(--uc-text)]">
          {row.day}
        </span>
        <span className="block font-['UniCredit',sans-serif] text-[14px] font-bold leading-[16px] text-[var(--uc-text-muted)]">
          {row.month}
        </span>
      </span>
      <span className="min-w-0 pl-[6px]">
        <span className="block truncate font-['UniCredit',sans-serif] text-[16px] font-bold uppercase leading-[20px] text-[var(--uc-text)]">
          {row.title}
        </span>
        <span className="block truncate font-['UniCredit',sans-serif] text-[16px] font-normal leading-[22px] text-[var(--uc-text-muted)]">
          {row.description}
        </span>
      </span>
      {row.badge ? (
        <span className="justify-self-center rounded-full bg-[var(--uc-action-soft)] px-[7px] py-[2px] font-['UniCredit',sans-serif] text-[11px] font-bold leading-[14px] text-[var(--uc-action)]">
          {row.badge}
        </span>
      ) : (
        <span />
      )}
    </TemplateAction>
  );
}

function StandingOrderIcon({ icon }: { icon: IconName }) {
  return (
    <span className="grid size-[32px] place-items-center text-[var(--uc-text)]">
      <AppIcon name={icon} color="currentColor" />
    </span>
  );
}

function StandingOrderListRow({ row, interactive }: { row: StandingOrderRow; interactive: boolean }) {
  return (
    <div className="grid h-[90px] grid-cols-[32px_1fr_32px] items-center gap-[8px] px-[22px]">
      <StandingOrderIcon icon="payment-templates" />
      <div className="min-w-0">
        <p className="truncate font-['UniCredit',sans-serif] text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{row.title}</p>
        <p className="font-['UniCredit',sans-serif] text-[16px] font-normal leading-[20px] text-[var(--uc-text-muted)]">{row.date}</p>
        <p className="mt-[5px] font-['UniCredit',sans-serif] text-[20px] font-bold leading-[22px] text-[var(--uc-text)]">
          {row.amount} <span className="text-[16px]">{row.currency}</span>
        </p>
      </div>
      <DotMenu interactive={interactive} />
    </div>
  );
}

function MessagesInboxTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <TemplateTopChrome title="Messages" interactive={interactive} />
      <TemplateTabs tabs={[{ label: "Inbox", active: true }, { label: "Outbox" }]} interactive={interactive} />
      <TemplateSearchStrip interactive={interactive} />
      <TemplateSectionTitle>2025</TemplateSectionTitle>
      <div className="pt-[20px]">
        {messageRows.map((row) => (
          <MessageListRow key={row.id} row={row} interactive={interactive} />
        ))}
      </div>
    </TemplatePhoneSurface>
  );
}

function DocumentsTemplate({ interactive }: { interactive: boolean }) {
  const config = getDocumentsConfigForCountry("RO");

  return (
    <TemplatePhoneSurface>
      <TemplateTopChrome title={config.title} interactive={interactive} />
      <TemplateSearchStrip interactive={interactive} />
      <div className="pb-[24px]">
        {config.groups.map((group) => (
          <section key={group.year} className="pb-[18px]">
            <TemplateSectionTitle>{group.year}</TemplateSectionTitle>
            <div className="pt-[20px]">
              {group.items.map((row) => (
                <DocumentListRowTemplate key={row.id} row={row} interactive={interactive} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </TemplatePhoneSurface>
  );
}

function RecurrentPaymentTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <TemplateTopChrome title="Recurrent payment" interactive={interactive} />
      <TemplateTabs tabs={[{ label: "Standing orders", active: true }, { label: "Top up list" }]} interactive={interactive} />
      <TemplateSearchStrip interactive={interactive} />
      <TemplateSectionTitle>SELECT A STANDING ORDER</TemplateSectionTitle>
      <div className="pt-[14px]">
        {standingOrderRows.map((row, index) => (
          <StandingOrderListRow key={`${row.title}-${index}`} row={row} interactive={interactive} />
        ))}
      </div>
    </TemplatePhoneSurface>
  );
}

function ProductBottomSheetTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="absolute inset-0 bg-[var(--uc-surface)]">
        <TemplateTopChrome title="Product" interactive={interactive} />
      </div>
      <div className="absolute inset-0 bg-[rgb(var(--uc-static-black-rgb)_/_0.45)]" />
      <section
        className="absolute inset-x-0 bottom-0 flex h-[780px] flex-col rounded-t-[10px] bg-[var(--uc-sheet-bg)] px-[24px] pb-[24px] pt-[24px]"
        aria-label="Product name sheet"
      >
        <div className="mb-[23px] flex items-start justify-between gap-[16px]">
          <h1 className="font-['UniCredit',sans-serif] text-[28px] font-bold leading-normal text-[var(--uc-text)]">
            Product name
          </h1>
          <TemplateAction className="grid size-[32px] place-items-center text-[var(--uc-text)]" ariaLabel="Close" interactive={interactive}>
            <AppIcon name="close-x" size={24} color="currentColor" />
          </TemplateAction>
        </div>

        <div className="grid h-[161px] place-items-center rounded-[8px] bg-[var(--uc-surface-muted)]">
          <p className="font-['UniCredit',sans-serif] text-[28px] font-bold italic leading-normal text-[var(--uc-border-muted)]">
            IMG/GIF
          </p>
        </div>

        <h2 className="mt-[25px] font-['UniCredit',sans-serif] text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">
          Lorem ipsum dolor sit amet
        </h2>

        <div className="mt-[24px] space-y-[22px] font-['UniCredit',sans-serif] text-[16px] font-normal leading-[20px] text-[var(--uc-text)]">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>

        <div className="mt-auto">
          {interactive ? (
            <PrimaryButton className="w-full">Button</PrimaryButton>
          ) : (
            <div className="flex h-[48px] w-full items-center justify-center rounded bg-[var(--uc-action)] font-['UniCredit',sans-serif] text-base font-bold text-[var(--uc-static-white)]">
              Button
            </div>
          )}
        </div>
      </section>
    </TemplatePhoneSurface>
  );
}

function AccountProductPromoTemplate({
  title,
  description,
  index,
  interactive,
}: {
  title: string;
  description: string;
  index: number;
  interactive: boolean;
}) {
  const backgrounds = [
    "bg-[linear-gradient(115deg,var(--uc-product-blue-deep)_0%,var(--uc-product-blue)_50%,var(--uc-action-soft)_100%)]",
    "bg-[linear-gradient(115deg,var(--uc-product-brown)_0%,var(--uc-product-mauve)_58%,var(--uc-product-pink)_100%)]",
    "bg-[linear-gradient(115deg,var(--uc-neutral-750)_0%,var(--uc-product-blue)_55%,var(--uc-green-olive)_100%)]",
  ];

  return (
    <TemplateAction
      ariaLabel={title}
      interactive={interactive}
      className={`relative h-[119px] overflow-hidden rounded-[6px] text-left shadow-[0_12px_22px_rgb(var(--uc-shadow-rgb)_/_0.18)] ${backgrounds[index % backgrounds.length]}`}
    >
      <span className="absolute inset-0 bg-[rgb(var(--uc-static-black-rgb)_/_0.34)]" />
      <span className="absolute right-[-20px] top-[-20px] size-[110px] rounded-full bg-[rgb(var(--uc-static-white-rgb)_/_0.24)]" />
      <span className="absolute bottom-[-30px] right-[42px] size-[86px] rounded-full bg-[rgb(var(--uc-static-white-rgb)_/_0.16)]" />
      <span className="relative flex h-full flex-col justify-between px-[16px] py-[18px]">
        <span className="font-['UniCredit',sans-serif] text-[26px] font-bold leading-[28px] text-[var(--uc-static-white)]">
          {title}
        </span>
        <span className="max-w-[250px] whitespace-pre-line font-['UniCredit',sans-serif] text-[14px] font-normal leading-[17px] text-[var(--uc-static-white)]">
          {description}
        </span>
      </span>
    </TemplateAction>
  );
}

function AccountOptionsTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[32px] scrollbar-hide">
        <TemplateTopChrome title="Account options" showHelp={false} interactive={interactive} />
        <main className="px-[24px] pt-[30px]">
          <div className="flex flex-col gap-[28px]">
            {ACCOUNT_OPTION_ITEMS.map((item) => (
              <TemplateAction
                key={item.id}
                ariaLabel={item.title}
                interactive={interactive}
                className="grid w-full grid-cols-[32px_1fr_32px] items-center gap-[16px] text-left"
              >
                <span className="grid size-[32px] place-items-center">
                  <TemplateAccountOptionIcon id={item.id} />
                </span>
                <span className="min-w-0">
                  <span className="block font-['UniCredit',sans-serif] text-[14px] font-bold uppercase leading-[18px] text-[var(--uc-text)]">
                    {item.title}
                  </span>
                  <span className="mt-[2px] block font-['UniCredit',sans-serif] text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
                    {item.description}
                  </span>
                </span>
                <AppIcon name="chevron-link" color="var(--uc-text)" />
              </TemplateAction>
            ))}
          </div>

          <section className="pt-[28px]">
            <h2 className="border-b border-[var(--uc-border)] pb-[8px] font-['UniCredit',sans-serif] text-[16px] font-bold uppercase leading-[20px] text-[var(--uc-text)]">
              Products
            </h2>
            <div className="flex flex-col gap-[16px] pt-[16px]">
              {ACCOUNT_PRODUCT_OPTIONS.map((product, index) => (
                <AccountProductPromoTemplate
                  key={product.id}
                  title={product.title}
                  description={product.description}
                  index={index}
                  interactive={interactive}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </TemplatePhoneSurface>
  );
}

function ActivateMtokenHero() {
  return (
    <div className="relative h-[160px] overflow-hidden rounded-[8px] bg-[linear-gradient(110deg,var(--uc-neutral-200)_0%,var(--uc-action-soft)_100%)]" aria-hidden="true">
      <div className="absolute bottom-[-26px] left-[44px] h-[124px] w-[92px] rounded-t-full bg-[var(--uc-product-blue-deep)]" />
      <div className="absolute left-[68px] top-[26px] size-[54px] rounded-full bg-[var(--uc-product-brown)]" />
      <div className="absolute bottom-[22px] left-[116px] h-[44px] w-[31px] rotate-[-10deg] rounded-[7px] bg-[var(--uc-static-black)]" />
      <div className="absolute bottom-[35px] left-[148px] h-[22px] w-[58px] rounded-full bg-[rgb(var(--uc-static-white-rgb)_/_0.72)]" />
      <div className="absolute right-[20px] top-[28px] h-[104px] w-[118px] rounded-[18px] bg-[rgb(var(--uc-static-white-rgb)_/_0.58)]" />
    </div>
  );
}

function ActivateMtokenTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <TemplateTopChrome title="Activate Mobile Token" interactive={interactive} />
      <main className="px-[24px] pt-[28px]">
        <ActivateMtokenHero />
        <section className="mt-[61px] flex flex-col gap-[58px]">
          <TemplateRadioRow
            option={{ title: "I HAVE SMS WITH ACTIVATION CODE", subtitle: "Activation code was sent to you by bank", selected: true }}
            interactive={interactive}
          />
          <TemplateRadioRow
            option={{ title: "I DON'T HAVE A VALID ACTIVATION CODE", subtitle: "I need to request a code" }}
            interactive={interactive}
          />
        </section>
      </main>
      <TemplateBottomButton label="Start" interactive={interactive} bottom={32} />
    </TemplatePhoneSurface>
  );
}

function AnalyticsChartTemplate() {
  return (
    <div className="relative mx-[24px] mt-[72px] h-[232px] font-['UniCredit',sans-serif]" aria-hidden="true">
      <div className="absolute bottom-[71px] left-0 right-0 border-t border-dashed border-[var(--uc-border-muted)]" />
      <div className="absolute bottom-[72px] left-[160px] h-[128px] w-[31px] rounded-t-full bg-[var(--uc-action)]" />
      <div className="absolute bottom-[72px] left-[224px] h-[140px] w-[31px] rounded-t-full bg-[var(--uc-surface-muted)]" />
      <div className="absolute bottom-[72px] left-[224px] h-[72px] w-[31px] bg-[var(--uc-text)]" />
      <div className="absolute bottom-[95px] left-[62px] text-right">
        <p className="text-[14px] font-bold uppercase leading-[17px] text-[var(--uc-text-muted)]">Inflow</p>
        <p className="mt-[7px] text-[16px] font-bold leading-[18px] text-[var(--uc-text)]">100,000.00<br />RSD</p>
      </div>
      <div className="absolute bottom-[108px] left-[270px] w-[160px]">
        <p className="text-[14px] font-bold uppercase leading-[17px] text-[var(--uc-text-muted)]">Credit card payments</p>
        <p className="text-[16px] font-bold leading-[18px] text-[var(--uc-text)]">20,000.00 RSD</p>
        <p className="mt-[16px] text-[14px] font-bold uppercase leading-[17px] text-[var(--uc-text-muted)]">Booked transaction</p>
        <p className="text-[16px] font-bold leading-[18px] text-[var(--uc-text)]">50,000.00 RSD</p>
      </div>
      <div className="absolute bottom-[28px] left-[122px] text-[16px] font-bold uppercase text-[var(--uc-text)]">Incomes</div>
      <div className="absolute bottom-[28px] left-[248px] text-[16px] font-bold uppercase text-[var(--uc-text)]">Spendings</div>
      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-[10px]">
        <span className="h-[8px] w-[60px] rounded-full bg-[var(--uc-action)]" />
        <span className="size-[8px] rounded-full bg-[var(--uc-text-muted)]" />
        <span className="size-[8px] rounded-full bg-[var(--uc-text-muted)]" />
        <span className="size-[8px] rounded-full bg-[var(--uc-text-muted)]" />
      </div>
    </div>
  );
}

function AnalyticsOverviewTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[90px] scrollbar-hide">
        <StaticStatusBar />
        <header className="px-[24px] pt-[37px]">
          <div className="flex items-start justify-between">
            <h1 className="font-['UniCredit',sans-serif] text-[50px] font-bold leading-none text-[var(--uc-text)]">My Spendings</h1>
            <AppIcon name="help-circle" size={40} color="var(--uc-text)" />
          </div>
          <p className="mt-[60px] font-['UniCredit',sans-serif] text-[28px] font-bold leading-normal text-[var(--uc-text-muted)]">Data For</p>
          <h2 className="mt-[10px] font-['UniCredit',sans-serif] text-[48px] font-bold leading-none text-[var(--uc-text)]">March 2025</h2>
        </header>
        <AnalyticsChartTemplate />
        <section className="mt-[35px] px-[33px]">
          <div className="ml-auto flex w-[88px] flex-col items-center gap-[5px] text-center font-['UniCredit',sans-serif]">
            <span className="grid size-[42px] place-items-center rounded-full bg-[var(--uc-text)] text-[var(--uc-static-white)]">
              <AppIcon name="plus-circle" size={30} strokeWidth={3} color="currentColor" />
            </span>
            <span className="text-[20px] font-normal leading-[22px] text-[var(--uc-text)]">Card<br />Transaction</span>
          </div>
        </section>
        <section className="mx-[33px] mt-[26px] rounded-[6px] bg-[var(--uc-action)] p-[22px] font-['UniCredit',sans-serif] text-[var(--uc-static-white)]">
          <div className="grid grid-cols-[52px_1fr_24px] gap-[12px]">
            <span className="grid size-[42px] place-items-center rounded-full bg-[var(--uc-static-white)] text-[var(--uc-action)]">
              <AppIcon name="info-circle" size={28} color="currentColor" />
            </span>
            <span>
              <span className="block text-[28px] font-bold leading-[32px]">Add cash transaction</span>
              <span className="mt-[12px] block text-[28px] font-normal leading-[32px]">Keep track of your cash transactions.</span>
            </span>
            <AppIcon name="close-x-small" size={18} color="var(--uc-static-white)" />
          </div>
        </section>
        <section className="px-[24px] pt-[23px]">
          <div className="flex items-center justify-between border-b border-[var(--uc-border-muted)] pb-[9px] font-['UniCredit',sans-serif]">
            <span className="text-[23px] font-bold uppercase text-[var(--uc-text-muted)]">Total cash withdrawal</span>
            <span className="text-[23px] font-bold text-[var(--uc-text)]">-200,000.00 RSD</span>
          </div>
          <h2 className="mt-[28px] font-['UniCredit',sans-serif] text-[40px] font-bold leading-none text-[var(--uc-text)]">Money Out</h2>
          <div className="mt-[52px] grid grid-cols-[64px_1fr] items-center gap-[24px]">
            <span className="grid size-[44px] place-items-center text-[var(--uc-product-pink)]">
              <AppIcon name="shopping-bag" size={32} strokeWidth={2.8} color="currentColor" />
            </span>
            <div className="text-right font-['UniCredit',sans-serif]">
              <p className="text-[28px] font-normal leading-normal text-[var(--uc-text)]">Transaction Details</p>
              <p className="mt-[8px] text-[32px] font-bold leading-none text-[var(--uc-text)]">- 405,000.00 RSD</p>
            </div>
          </div>
        </section>
      </div>
      <TemplateFiveBottomNavigation active="Spending" productLabel="Offers" />
    </TemplatePhoneSurface>
  );
}

function TemplateMockCard() {
  return (
    <div className="relative h-[204px] w-[326px] overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,var(--uc-red-card)_0%,var(--uc-orange-card)_58%,var(--uc-product-pink)_100%)] p-[24px] text-[var(--uc-static-white)] shadow-[0_18px_34px_rgb(var(--uc-shadow-rgb)_/_0.24)]">
      <span className="absolute right-[-44px] top-[-52px] size-[180px] rounded-full bg-[rgb(var(--uc-static-white-rgb)_/_0.18)]" />
      <span className="absolute bottom-[-64px] left-[-50px] size-[180px] rounded-full bg-[rgb(var(--uc-static-black-rgb)_/_0.18)]" />
      <div className="relative flex h-full flex-col justify-between font-['UniCredit',sans-serif]">
        <div className="flex items-center justify-between">
          <span className="text-[20px] font-bold">UniCredit</span>
          <span className="h-[26px] w-[42px] rounded-[6px] border border-[rgb(var(--uc-static-white-rgb)_/_0.72)]" />
        </div>
        <div>
          <p className="text-[13px] font-normal leading-[16px]">Peter Jagodic</p>
          <p className="mt-[8px] text-[18px] font-bold leading-[20px]">•••• 2531</p>
        </div>
      </div>
    </div>
  );
}

function TemplateShortcut({
  icon,
  label,
  interactive,
}: {
  icon: IconName;
  label: string;
  interactive: boolean;
}) {
  return (
    <TemplateAction
      ariaLabel={label}
      interactive={interactive}
      className="flex w-[72px] flex-col items-center gap-[8px] text-center font-['UniCredit',sans-serif]"
    >
      <span className="grid size-[46px] place-items-center rounded-full bg-[var(--uc-action)] text-[var(--uc-static-white)]">
        <AppIcon name={icon} size={24} strokeWidth={2.8} color="currentColor" />
      </span>
      <span className="text-[11px] font-bold uppercase leading-[14px] text-[var(--uc-text)]">{label}</span>
    </TemplateAction>
  );
}

function TemplateTransactionRow({
  title,
  category,
  amount,
  icon,
}: {
  title: string;
  category: string;
  amount: string;
  icon: IconName;
}) {
  return (
    <div className="grid min-h-[78px] grid-cols-[42px_1fr_auto] items-center gap-[12px] border-b border-[var(--uc-border-muted)] font-['UniCredit',sans-serif]">
      <span className="grid size-[34px] place-items-center text-[var(--uc-text)]">
        <AppIcon name={icon} size={25} strokeWidth={2.6} color="currentColor" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{title}</span>
        <span className="mt-[2px] block text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">{category}</span>
      </span>
      <span className="text-right text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{amount}</span>
    </div>
  );
}

function CardsOverviewTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[86px] scrollbar-hide">
        <StaticStatusBar />
        <header className="px-[24px] pt-[40px]">
          <div className="flex items-center justify-between">
            <h1 className="font-['UniCredit',sans-serif] text-[28px] font-bold leading-normal text-[var(--uc-text)]">Cards</h1>
            <TemplateAction className="grid size-[32px] place-items-center" ariaLabel="Help" interactive={interactive}>
              <AppIcon name="help-circle" size={22} color="var(--uc-text)" />
            </TemplateAction>
          </div>
        </header>

        <section className="mt-[21px] flex justify-center">
          <TemplateMockCard />
        </section>
        <div className="mt-[20px] flex justify-center gap-[8px]" aria-hidden="true">
          <span className="h-[8px] w-[38px] rounded-full bg-[var(--uc-action)]" />
          <span className="size-[8px] rounded-full bg-[var(--uc-border)]" />
          <span className="size-[8px] rounded-full bg-[var(--uc-border)]" />
        </div>

        <section className="px-[24px] pt-[22px] font-['UniCredit',sans-serif] text-[var(--uc-text)]">
          <p className="text-[14px] font-bold uppercase leading-[18px] text-[var(--uc-text-muted)]">Free To Spend</p>
          <div className="mt-[7px] flex items-end justify-between gap-[16px]">
            <p className="text-[32px] font-bold leading-none">1.200.00 <span className="text-[20px]">RSD</span></p>
            <TemplateAction className="text-[13px] font-bold uppercase leading-[16px] text-[var(--uc-action)]" ariaLabel="Show card details" interactive={interactive}>
              SHOW CARD DETAILS
            </TemplateAction>
          </div>
          <div className="mt-[20px] grid grid-cols-2 gap-[12px]">
            <TemplateAction className="flex h-[44px] items-center justify-center rounded-[5px] bg-[var(--uc-static-black)] text-[15px] font-bold text-[var(--uc-static-white)]" ariaLabel="Apple wallet" interactive={interactive}>
              Apple Wallet
            </TemplateAction>
            <TemplateAction className="flex h-[44px] items-center justify-center rounded-[5px] bg-[var(--uc-static-black)] text-[15px] font-bold text-[var(--uc-static-white)]" ariaLabel="Click to pay" interactive={interactive}>
              Click to Pay
            </TemplateAction>
          </div>
        </section>

        <section className="mt-[24px] grid grid-cols-4 gap-[4px] px-[14px]">
          <TemplateShortcut icon="credit-card" label="Card Details" interactive={interactive} />
          <TemplateShortcut icon="demo-settings" label="Options" interactive={interactive} />
          <TemplateShortcut icon="lock" label="Block Card" interactive={interactive} />
          <TemplateShortcut icon="copy" label="View PIN" interactive={interactive} />
        </section>

        <TemplateSearchStrip interactive={interactive} />
        <section className="px-[24px]">
          <TemplateTransactionRow title="Online card payment" category="Shopping" amount="-74.50 RSD" icon="shopping-bag" />
          <TemplateTransactionRow title="Card transaction" category="Booked transaction" amount="-12.00 RSD" icon="credit-card" />
        </section>
      </div>
      <TemplateFiveBottomNavigation active="Products" productLabel="Offers" />
    </TemplatePhoneSurface>
  );
}

function ContactInfoCard({
  icon,
  title,
  description,
  action,
  interactive,
}: {
  icon: IconName;
  title: string;
  description: string;
  action: string;
  interactive: boolean;
}) {
  return (
    <TemplateAction
      ariaLabel={title}
      interactive={interactive}
      className="grid min-h-[82px] w-full grid-cols-[44px_1fr_24px] items-center gap-[12px] rounded-[6px] bg-[var(--uc-surface)] p-[12px] text-left shadow-[0_8px_18px_rgb(var(--uc-shadow-rgb)_/_0.12)]"
    >
      <span className="grid size-[36px] place-items-center rounded-full bg-[var(--uc-action-soft)] text-[var(--uc-action)]">
        <AppIcon name={icon} size={22} color="currentColor" />
      </span>
      <span className="min-w-0 font-['UniCredit',sans-serif]">
        <span className="block text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{title}</span>
        <span className="mt-[2px] block text-[13px] font-normal leading-[16px] text-[var(--uc-text-muted)]">{description}</span>
        <span className="mt-[5px] block text-[12px] font-bold uppercase leading-[15px] text-[var(--uc-action)]">{action}</span>
      </span>
      <AppIcon name="contact-chevron" size={18} color="var(--uc-text)" />
    </TemplateAction>
  );
}

function ContactInfoSheetTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="absolute inset-0 bg-[var(--uc-surface)]">
        <StaticStatusBar />
        <header className="px-[24px] pt-[40px] font-['UniCredit',sans-serif]">
          <h1 className="text-[28px] font-bold leading-normal text-[var(--uc-text)]">Contact</h1>
          <div className="mt-[24px] space-y-[14px]">
            <div className="h-[82px] rounded-[6px] bg-[var(--uc-surface-muted)]" />
            <div className="h-[82px] rounded-[6px] bg-[var(--uc-surface-muted)]" />
            <div className="h-[82px] rounded-[6px] bg-[var(--uc-surface-muted)]" />
          </div>
        </header>
      </div>
      <div className="absolute inset-0 bg-[rgb(var(--uc-static-black-rgb)_/_0.58)]" />
      <section className="absolute inset-x-0 bottom-0 rounded-t-[12px] bg-[var(--uc-sheet-bg)] p-[16px] pb-[32px]" aria-label="Need more information sheet">
        <div className="flex items-start justify-between gap-[16px]">
          <h1 className="font-['UniCredit',sans-serif] text-[26px] font-bold leading-normal text-[var(--uc-text)]">
            Need more information?
          </h1>
          <TemplateAction className="grid size-[32px] place-items-center" ariaLabel="Close" interactive={interactive}>
            <AppIcon name="close-x" size={25} color="var(--uc-text)" />
          </TemplateAction>
        </div>
        <div className="mt-[18px] flex flex-col gap-[12px]">
          <ContactInfoCard icon="contact-phone" title="Call us" description="Talk to a consultant." action="CALL" interactive={interactive} />
          <ContactInfoCard icon="contact-email" title="Write us" description="Send us a secure message." action="SEND AN EMAIL" interactive={interactive} />
          <ContactInfoCard icon="contact-website" title="Discover more on the website" description="Open the UniCredit help page." action="OPEN WEBSITE" interactive={interactive} />
        </div>
      </section>
    </TemplatePhoneSurface>
  );
}

function AccountBalancePreviewCard() {
  return (
    <div className="rounded-[8px] bg-[var(--uc-surface-muted)] p-[18px] font-['UniCredit',sans-serif] shadow-[0_10px_22px_rgb(var(--uc-shadow-rgb)_/_0.12)]">
      <div className="flex items-start justify-between gap-[12px]">
        <div>
          <p className="text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">My RON Account</p>
          <p className="mt-[6px] text-[13px] font-normal leading-[16px] text-[var(--uc-text-muted)]">RO49AAAA1B31007593840000</p>
        </div>
        <AppIcon name="copy-documents" size={22} color="var(--uc-text)" />
      </div>
      <p className="mt-[28px] text-[13px] font-bold uppercase leading-[16px] text-[var(--uc-text-muted)]">Available balance</p>
      <p className="mt-[5px] text-[30px] font-bold leading-none text-[var(--uc-text)]">12.250,00 <span className="text-[18px]">RON</span></p>
    </div>
  );
}

function AccountDetailHomepageTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[88px] scrollbar-hide">
        <StaticStatusBar />
        <header className="px-[24px] pt-[40px]">
          <div className="flex items-center justify-between">
            <h1 className="font-['UniCredit',sans-serif] text-[28px] font-bold leading-normal text-[var(--uc-text)]">Accounts</h1>
            <TemplateAction className="grid size-[32px] place-items-center" ariaLabel="Help" interactive={interactive}>
              <AppIcon name="help-circle" size={22} color="var(--uc-text)" />
            </TemplateAction>
          </div>
        </header>
        <main className="pt-[18px]">
          <div className="px-[24px]">
            <AccountBalancePreviewCard />
          </div>
          <div className="mt-[20px] grid grid-cols-4 gap-[4px] px-[14px]">
            <TemplateShortcut icon="info-circle" label="Details" interactive={interactive} />
            <TemplateShortcut icon="account-options" label="Options" interactive={interactive} />
            <TemplateShortcut icon="plus-circle" label="Add money" interactive={interactive} />
            <TemplateShortcut icon="mcash" label="mCash" interactive={interactive} />
          </div>
          <TemplateSearchStrip interactive={interactive} />
          <section className="px-[24px]">
            <h2 className="border-b border-[var(--uc-border)] pb-[7px] font-['UniCredit',sans-serif] text-[18px] font-bold uppercase leading-normal text-[var(--uc-text)]">
              APRIL 2026
            </h2>
            <TemplateTransactionRow title="Kindergarten 45" category="School fees" amount="-24.700,00 RON" icon="file-text" />
            <TemplateTransactionRow title="Salary" category="Incoming payment" amount="+8.200,00 RON" icon="landmark" />
            <TemplateTransactionRow title="Online card payment" category="Shopping" amount="-74,50 RON" icon="shopping-bag" />
          </section>
        </main>
      </div>
      <TemplateFiveBottomNavigation active="Home" />
    </TemplatePhoneSurface>
  );
}

function DomesticPaymentFormTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[104px] scrollbar-hide">
        <TemplateTopChrome title="Domestic payment" interactive={interactive} />
        <main className="px-[24px] pt-[12px] font-['UniCredit',sans-serif]">
          <TemplateSimpleSectionTitle>FROM ACCOUNT</TemplateSimpleSectionTitle>
          {domesticPaymentFields.fromAccount.map((field) => (
            <TemplateFlowField key={field.label} {...field} />
          ))}
          <TemplateSimpleSectionTitle>BENEFICIARY</TemplateSimpleSectionTitle>
          {domesticPaymentFields.beneficiary.map((field) => (
            <TemplateFlowField key={field.label} {...field} />
          ))}
          <TemplateSimpleSectionTitle>PAYMENT INFORMATION</TemplateSimpleSectionTitle>
          {domesticPaymentFields.payment.map((field) => (
            <TemplateFlowField key={field.label} {...field} />
          ))}
          <div className="mt-[24px] flex items-center justify-between border-t border-[var(--uc-border-muted)] pt-[18px]">
            <div>
              <p className="text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">Instant Payment</p>
              <p className="mt-[3px] text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">Send now if available.</p>
            </div>
            <TemplateToggle checked />
          </div>
        </main>
      </div>
      <TemplateBottomButton label="Next" interactive={interactive} bottom={32} />
    </TemplatePhoneSurface>
  );
}

function ReviewRequestTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[104px] scrollbar-hide">
        <TemplateTopChrome title="Review request" interactive={interactive} />
        <main className="px-[24px] pt-[12px] font-['UniCredit',sans-serif]">
          {reviewRequestSections.map((section) => (
            <section key={section.title}>
              <TemplateSimpleSectionTitle>{section.title}</TemplateSimpleSectionTitle>
              {section.rows.map((row) => (
                <TemplateReadOnlyRow key={`${section.title}-${row.label}`} label={row.label} value={row.value ?? ""} />
              ))}
            </section>
          ))}
        </main>
      </div>
      <TemplateBottomButton label="Confirm" interactive={interactive} bottom={32} />
    </TemplatePhoneSurface>
  );
}

function ReviewDataTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[116px] scrollbar-hide">
        <TemplateTopChrome title="Review data" interactive={interactive} />
        <main className="px-[24px] pt-[12px] font-['UniCredit',sans-serif]">
          <TemplateSimpleSectionTitle>PAYMENT ORDER</TemplateSimpleSectionTitle>
          {reviewDataRows.map((row) => (
            <TemplateReadOnlyRow key={row.label} label={row.label} value={row.value ?? ""} />
          ))}
          <div className="flex items-center justify-between border-t border-[var(--uc-border-muted)] py-[18px]">
            <div>
              <p className="text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">Save as template</p>
              <p className="mt-[3px] text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">Reuse this payment later.</p>
            </div>
            <TemplateToggle checked={false} />
          </div>
        </main>
      </div>
      <TemplateBottomButton label="Sign" interactive={interactive} bottom={32} />
    </TemplatePhoneSurface>
  );
}

function SpendingInsightMiniChart() {
  return (
    <div className="relative h-[150px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[16px] font-['UniCredit',sans-serif]" aria-hidden="true">
      <p className="text-[14px] font-bold uppercase leading-[18px] text-[var(--uc-text-muted)]">Spending Insight</p>
      <div className="absolute bottom-[24px] left-[22px] right-[22px] flex h-[80px] items-end justify-between">
        <span className="h-[34px] w-[26px] rounded-t-full bg-[var(--uc-action)]" />
        <span className="h-[58px] w-[26px] rounded-t-full bg-[var(--uc-product-pink)]" />
        <span className="h-[42px] w-[26px] rounded-t-full bg-[var(--uc-product-blue)]" />
        <span className="h-[70px] w-[26px] rounded-t-full bg-[var(--uc-text)]" />
        <span className="h-[48px] w-[26px] rounded-t-full bg-[var(--uc-green-olive)]" />
      </div>
    </div>
  );
}

function TransactionDetailTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[32px] scrollbar-hide">
        <TemplateTopChrome title="Transaction detail" showHelp={false} interactive={interactive} />
        <main className="px-[24px] pt-[20px] font-['UniCredit',sans-serif]">
          <section className="text-center">
            <span className="mx-auto grid size-[54px] place-items-center rounded-full bg-[var(--uc-action-soft)] text-[var(--uc-action)]">
              <AppIcon name="file-text" size={30} color="currentColor" />
            </span>
            <h2 className="mt-[14px] text-[24px] font-bold leading-[28px] text-[var(--uc-text)]">Kindergarten 45</h2>
            <p className="mt-[4px] text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">School fees</p>
            <p className="mt-[14px] text-[28px] font-bold leading-none text-[var(--uc-text)]">-24.700,00 <span className="text-[18px]">CZK</span></p>
          </section>
          <div className="mt-[24px] grid grid-cols-3 gap-[4px]">
            <TemplateShortcut icon="repeat" label="Repeat" interactive={interactive} />
            <TemplateShortcut icon="payment-templates" label="Template" interactive={interactive} />
            <TemplateShortcut icon="copy" label="Share" interactive={interactive} />
          </div>
          <section className="pt-[26px]">
            <SpendingInsightMiniChart />
          </section>
          <section className="pt-[18px]">
            {transactionDetailRows.map((row) => (
              <TemplateReadOnlyRow key={row.label} label={row.label} value={row.value ?? ""} copy={row.action === "copy"} />
            ))}
          </section>
          <TemplateAction
            ariaLabel="Show less"
            interactive={interactive}
            className="mx-auto mt-[8px] flex h-[44px] items-center justify-center font-['UniCredit',sans-serif] text-[14px] font-bold uppercase leading-[18px] text-[var(--uc-action)]"
          >
            SHOW LESS
          </TemplateAction>
        </main>
      </div>
    </TemplatePhoneSurface>
  );
}

function SignPinTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <TemplateTopChrome title="Sign" showHelp={false} interactive={interactive} />
      <section className="px-[24px] pt-[145px] font-['UniCredit',sans-serif]">
        <label className="block text-[12px] font-bold uppercase leading-[15px] tracking-[0.08em] text-[var(--uc-text-muted)]">
          Enter pin code
        </label>
        <div className="mt-[13px] flex h-[32px] items-center border-b-[2px] border-[var(--uc-action)] text-[28px] font-bold leading-none tracking-[8px] text-[var(--uc-text)]">
          <span aria-hidden="true">******</span>
        </div>
        <p className="mt-[12px] text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
          You are signing a pending payment request.
        </p>
      </section>
      <TemplateBottomButton label="Sign" interactive={interactive} bottom={38} />
      <TemplateHomeIndicator />
    </TemplatePhoneSurface>
  );
}

function GenerateTokenTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <StaticStatusBar />
      <div className="flex h-[40px] items-center justify-end gap-[11px] px-[19px]">
        <span className="font-['UniCredit',sans-serif] text-[14px] font-bold uppercase leading-[18px] text-[var(--uc-text)]">
          Logout
        </span>
        <TemplateAction className="grid size-[32px] place-items-center" ariaLabel="Help" interactive={interactive}>
          <AppIcon name="help-circle" size={20} color="var(--uc-text)" />
        </TemplateAction>
      </div>
      <div className="px-[24px] pt-[1px]">
        <h1 className="font-['UniCredit',sans-serif] text-[28px] font-bold leading-normal text-[var(--uc-text)]">
          Generate Token
        </h1>
      </div>

      <section className="mx-[24px] mt-[27px] rounded-[8px] bg-[var(--uc-surface-muted)] px-[20px] pb-[18px] pt-[23px]">
        <p className="font-['UniCredit',sans-serif] text-[12px] font-bold uppercase leading-[15px] tracking-[0.08em] text-[var(--uc-text-muted)]">
          Token code
        </p>
        <div className="mt-[18px] flex justify-between font-['UniCredit',sans-serif] text-[46px] font-bold leading-none tracking-[5px] text-[var(--uc-text)]">
          <span>1</span>
          <span>8</span>
          <span>5</span>
          <span>6</span>
          <span>3</span>
          <span>1</span>
        </div>
      </section>

      <div className="mx-[24px] mt-[18px] border-b border-[var(--uc-border-muted)] pb-[22px]">
        <p className="font-['UniCredit',sans-serif] text-[14px] font-bold uppercase leading-[18px] text-[var(--uc-action)]">
          Find out more
        </p>
      </div>

      <section className="mx-[24px] mt-[20px]">
        {tokenOptions.map((option) => (
          <TemplateRadioRow key={option.title} option={option} interactive={interactive} />
        ))}
      </section>

      <TemplateBottomButton label="Generate" interactive={interactive} bottom={32} />
    </TemplatePhoneSurface>
  );
}

function MessageDetailTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <TemplateTopChrome title="Message title" showHelp={false} interactive={interactive} />
      <main className="px-[24px] pt-[9px] font-['UniCredit',sans-serif]">
        <p className="text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">18.04.2024</p>
        <div className="mt-[22px] grid h-[161px] place-items-center rounded-[8px] bg-[var(--uc-surface-muted)]">
          <p className="text-[28px] font-bold italic leading-normal text-[var(--uc-border)]">IMG/GIF</p>
        </div>
        <div className="mt-[25px] space-y-[20px] text-[16px] font-normal leading-[20px] text-[var(--uc-text)]">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </main>
      <TemplateBottomButton label="Find out more" interactive={interactive} bottom={86} />
      <div className="absolute bottom-[39px] left-[24px] right-[24px] text-center font-['UniCredit',sans-serif] text-[16px] font-bold leading-[20px] text-[var(--uc-action)]">
        Link button
      </div>
      <TemplateHomeIndicator />
    </TemplatePhoneSurface>
  );
}

function PushRequestFormTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <TemplateTopChrome title="New request with push" interactive={interactive} />
      <main className="px-[24px] pt-[18px] font-['UniCredit',sans-serif]">
        {pushRequestSections.map((section) => (
          <section key={section.title} className="mb-[16px]">
            <h2 className="border-b border-[var(--uc-border-muted)] pb-[5px] text-[18px] font-bold uppercase leading-normal text-[var(--uc-text)]">
              {section.title}
            </h2>
            <div>
              {section.fields.map((field) => (
                <TemplateFormLine key={`${section.title}-${field.label}`} field={field} />
              ))}
            </div>
          </section>
        ))}
      </main>
      <TemplateBottomButton label="Confirm" interactive={interactive} disabled bottom={32} />
    </TemplatePhoneSurface>
  );
}

function AccountSelectionPanelTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="absolute inset-0 bg-[var(--uc-static-black)]">
        <StaticStatusBar />
      </div>
      <section className="absolute inset-x-0 bottom-0 flex h-[674px] flex-col rounded-t-[12px] bg-[var(--uc-sheet-bg)] p-[24px]">
        <div className="flex items-start justify-between gap-[16px]">
          <h1 className="font-['UniCredit',sans-serif] text-[28px] font-bold leading-normal text-[var(--uc-text)]">
            My Accounts
          </h1>
          <TemplateAction className="grid size-[32px] place-items-center" ariaLabel="Close" interactive={interactive}>
            <AppIcon name="close-x" size={26} color="var(--uc-text)" />
          </TemplateAction>
        </div>

        <div className="mt-[34px]">
          {accountSelectionOptions.map((option) => (
            <TemplateRadioRow key={`${option.title}-${option.subtitle}`} option={option} interactive={interactive} />
          ))}
        </div>

        <div className="mt-auto pb-[8px]">
          {interactive ? (
            <PrimaryButton className="w-full">Select</PrimaryButton>
          ) : (
            <div className="flex h-[48px] w-full items-center justify-center rounded bg-[var(--uc-action)] font-['UniCredit',sans-serif] text-base font-bold text-[var(--uc-static-white)]">
              Select
            </div>
          )}
        </div>
      </section>
    </TemplatePhoneSurface>
  );
}

function ApplePayPhoneHero() {
  return (
    <div className="relative mx-auto h-[237px] w-[202px]" aria-hidden="true">
      <div className="absolute left-[53px] top-[8px] h-[214px] w-[102px] rounded-[22px] border-[8px] border-[var(--uc-static-black)] bg-[var(--uc-surface)] shadow-[0_12px_22px_rgb(var(--uc-shadow-rgb)_/_0.18)]">
        <div className="mx-auto mt-[6px] h-[16px] w-[48px] rounded-full bg-[var(--uc-static-black)]" />
        <div className="mx-[10px] mt-[18px] h-[34px] rounded-[6px] bg-[var(--uc-surface-muted)]" />
        <div className="mx-[10px] mt-[9px] h-[74px] rounded-[8px] bg-[linear-gradient(135deg,var(--uc-product-blue)_0%,var(--uc-action-soft)_100%)]" />
      </div>
      <div className="absolute left-0 top-[93px] h-[84px] w-[134px] rotate-[-8deg] rounded-[10px] bg-[linear-gradient(135deg,var(--uc-static-black)_0%,var(--uc-product-blue-deep)_100%)] shadow-[0_10px_22px_rgb(var(--uc-shadow-rgb)_/_0.22)]">
        <div className="absolute left-[14px] top-[17px] h-[16px] w-[26px] rounded-[4px] border border-[var(--uc-neutral-400)]" />
        <div className="absolute bottom-[16px] left-[14px] h-[9px] w-[76px] rounded-full bg-[rgb(var(--uc-static-white-rgb)_/_0.55)]" />
      </div>
      <div className="absolute bottom-[10px] right-[10px] rounded-[10px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[17px] py-[8px] font-['UniCredit',sans-serif] text-[18px] font-bold text-[var(--uc-text)] shadow-[0_8px_20px_rgb(var(--uc-shadow-rgb)_/_0.15)]">
        Pay
      </div>
    </div>
  );
}

function ApplePayActivationTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <StaticStatusBar />
      <div className="flex h-[40px] items-center justify-end px-[15px]">
        <TemplateAction className="grid size-[32px] place-items-center" ariaLabel="Close" interactive={interactive}>
          <AppIcon name="close-x" size={26} color="var(--uc-text)" />
        </TemplateAction>
      </div>

      <div className="mt-[58px]">
        <ApplePayPhoneHero />
      </div>

      <section className="px-[32px] pt-[38px] text-center font-['UniCredit',sans-serif] text-[var(--uc-text)]">
        <h1 className="text-[28px] font-bold leading-normal">Apple Pay</h1>
        <p className="mt-[12px] text-[16px] font-normal leading-[20px]">
          Add your card to Apple Pay and pay easily in stores, apps, and on the web.
        </p>
      </section>

      <TemplateBottomButton label="Continue" interactive={interactive} bottom={38} />
      <TemplateHomeIndicator />
    </TemplatePhoneSurface>
  );
}

function SuccessfulPaymentTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <StaticStatusBar />
      <div className="h-[40px]" />
      <div className="px-[24px] pt-[1px]">
        <h1 className="font-['UniCredit',sans-serif] text-[28px] font-bold leading-normal text-[var(--uc-text)]">
          Successful payment
        </h1>
      </div>
      <div className="mt-[83px] flex justify-center">
        <div className="grid size-[100px] place-items-center rounded-full border-[6px] border-[var(--uc-green-olive)]">
          <AppIcon name="check" size={64} strokeWidth={5} color="var(--uc-green-olive)" />
        </div>
      </div>
      <section className="px-[24px] pt-[61px] font-['UniCredit',sans-serif] text-[var(--uc-text)]">
        <h2 className="text-[16px] font-bold leading-[20px]">Payment sent</h2>
        <p className="mt-[2px] text-[16px] font-normal leading-[20px]">
          Your payment has been signed and sent for processing. You can check the status in your transaction list.
        </p>
      </section>
      <TemplateBottomButton label="Ok, got it" interactive={interactive} bottom={38} />
      <TemplateHomeIndicator />
    </TemplatePhoneSurface>
  );
}

function TutorialIntroTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="border-b border-[var(--uc-border-muted)] bg-[var(--uc-surface)]">
        <StaticStatusBar />
        <div className="grid h-[46px] grid-cols-[40px_1fr_40px] items-center px-[4px]">
          <TemplateAction className="grid size-[40px] place-items-center" ariaLabel="Close" interactive={interactive}>
            <AppIcon name="close-x" size={24} color="var(--uc-text)" />
          </TemplateAction>
          <div className="min-w-0 text-center font-['UniCredit',sans-serif]">
            <p className="text-[12px] font-bold leading-[14px] text-[var(--uc-text)]">Loading...</p>
            <p className="truncate text-[11px] font-normal leading-[13px] text-[var(--uc-text-muted)]">
              unicreditbanking.eu/tutorial
            </p>
          </div>
          <div />
        </div>
        <div className="h-[3px] w-[61%] bg-[var(--uc-action)]" />
      </div>

      <section className="relative h-[350px] overflow-hidden bg-[linear-gradient(180deg,var(--uc-action-soft)_0%,var(--uc-surface)_100%)]">
        <div className="absolute left-[111px] top-[44px] h-[224px] w-[137px] rounded-[24px] border-[8px] border-[var(--uc-static-black)] bg-[var(--uc-surface)] shadow-[0_12px_22px_rgb(var(--uc-shadow-rgb)_/_0.18)]">
          <div className="mx-auto mt-[8px] h-[15px] w-[51px] rounded-full bg-[var(--uc-static-black)]" />
          <div className="mx-[13px] mt-[20px] h-[48px] rounded-[8px] bg-[var(--uc-product-blue-deep)]" />
          <div className="mx-[13px] mt-[11px] h-[38px] rounded-[8px] bg-[var(--uc-surface-muted)]" />
          <div className="mx-[13px] mt-[11px] h-[38px] rounded-[8px] bg-[var(--uc-surface-muted)]" />
        </div>
        <div className="absolute bottom-[22px] left-[24px] flex gap-[12px]">
          <TemplateAction className="grid size-[42px] place-items-center rounded-full bg-[rgb(var(--uc-static-black-rgb)_/_0.72)]" ariaLabel="Play" interactive={interactive}>
            <span className="ml-[3px] h-0 w-0 border-y-[9px] border-l-[15px] border-y-transparent border-l-[var(--uc-static-white)]" />
          </TemplateAction>
          <TemplateAction className="grid size-[42px] place-items-center rounded-full bg-[rgb(var(--uc-static-black-rgb)_/_0.72)]" ariaLabel="Expand" interactive={interactive}>
            <AppIcon name="arrow-right" size={21} color="var(--uc-static-white)" />
          </TemplateAction>
        </div>
      </section>

      <section className="px-[24px] pt-[27px] font-['UniCredit',sans-serif] text-[var(--uc-text)]">
        <h1 className="text-[28px] font-bold leading-normal">Explore the new app</h1>
        <p className="mt-[9px] text-[16px] font-normal leading-[20px]">
          See how the main banking actions work and continue when you are ready.
        </p>
        <div className="mt-[24px] flex justify-center gap-[8px]" aria-hidden="true">
          <span className="size-[8px] rounded-full bg-[var(--uc-action)]" />
          <span className="size-[8px] rounded-full bg-[var(--uc-border)]" />
          <span className="size-[8px] rounded-full bg-[var(--uc-border)]" />
        </div>
      </section>

      <div className="absolute bottom-[23px] left-[24px] right-[24px] grid grid-cols-[1fr_48px_48px] items-center gap-[12px] font-['UniCredit',sans-serif]">
        <TemplateAction className="text-left text-[16px] font-bold leading-[20px] text-[var(--uc-action)]" ariaLabel="Skip" interactive={interactive}>
          Skip
        </TemplateAction>
        <TemplateAction className="grid size-[48px] place-items-center rounded-full border border-[var(--uc-border)]" ariaLabel="Back" interactive={interactive}>
          <AppIcon name="back-heavy" size={20} color="var(--uc-text)" />
        </TemplateAction>
        <TemplateAction className="grid size-[48px] place-items-center rounded-full bg-[var(--uc-action)]" ariaLabel="Next" interactive={interactive}>
          <AppIcon name="arrow-right" size={22} color="var(--uc-static-white)" />
        </TemplateAction>
      </div>
    </TemplatePhoneSurface>
  );
}

function ProductSelectionTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <TemplateTopChrome title="Product selection" showHelp={false} interactive={interactive} />
      <section className="mx-[24px] mt-[27px]">
        {productSelectionOptions.map((option) => (
          <TemplateRadioRow key={option.title} option={option} interactive={interactive} />
        ))}
      </section>

      <section className="absolute bottom-[106px] left-[24px] right-[24px] border-t border-[var(--uc-border-muted)] pt-[20px] font-['UniCredit',sans-serif]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold uppercase leading-[15px] tracking-[0.08em] text-[var(--uc-text-muted)]">
              Set as default
            </p>
            <p className="mt-[5px] text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
              Use this product for quick access.
            </p>
          </div>
          <div className="flex h-[31px] w-[52px] items-center rounded-full bg-[var(--uc-action)] p-[3px]" aria-hidden="true">
            <span className="ml-auto size-[25px] rounded-full bg-[var(--uc-static-white)]" />
          </div>
        </div>
        <div className="mt-[21px]">
          {interactive ? (
            <PrimaryButton className="w-full">Access</PrimaryButton>
          ) : (
            <div className="flex h-[48px] w-full items-center justify-center rounded bg-[var(--uc-action)] font-['UniCredit',sans-serif] text-base font-bold text-[var(--uc-static-white)]">
              Access
            </div>
          )}
        </div>
      </section>

      <TemplateMiniBottomNavigation active="Products" />
    </TemplatePhoneSurface>
  );
}

function SettingsRowTemplate({
  title,
  description,
  interactive,
}: {
  title: string;
  description: string;
  interactive: boolean;
}) {
  return (
    <TemplateAction
      ariaLabel={title}
      interactive={interactive}
      className="grid w-full grid-cols-[1fr_32px] items-center gap-[16px] text-left"
    >
      <span className="min-w-0">
        <span className="block font-['UniCredit',sans-serif] text-[14px] font-bold uppercase leading-[15px] text-[var(--uc-text)]">
          {title}
        </span>
        <span className="mt-[4px] block font-['UniCredit',sans-serif] text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
          {description}
        </span>
      </span>
      <span className="flex h-[32px] w-[32px] items-center justify-center justify-self-end">
        <AppIcon name="chevron-link" color="var(--uc-text)" />
      </span>
    </TemplateAction>
  );
}

function SettingsTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <TemplateTopChrome title="Settings" interactive={interactive} />
      <main className="px-[24px] pb-[32px] pt-[20px]">
        <div className="flex flex-col gap-[32px]">
          {SETTINGS_SECTIONS.map((section) => (
            <section key={section.id}>
              <SectionHeadingDivider title={section.title} />
              <div className="flex flex-col gap-[24px] pt-[16px]">
                {section.items.map((item) => (
                  <SettingsRowTemplate
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    interactive={interactive}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </TemplatePhoneSurface>
  );
}

function TravelHeroScene() {
  return (
    <div className="relative h-[209px] overflow-hidden rounded-[8px] bg-[linear-gradient(180deg,var(--uc-action-soft)_0%,var(--uc-product-blue)_100%)]" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-[86px] bg-[linear-gradient(180deg,var(--uc-product-blue)_0%,var(--uc-product-blue-deep)_100%)]" />
      <div className="absolute -left-[34px] bottom-[58px] h-[124px] w-[181px] rotate-[-8deg] rounded-[50%] bg-[var(--uc-product-slate)]" />
      <div className="absolute right-[-46px] bottom-[62px] h-[130px] w-[188px] rotate-[10deg] rounded-[50%] bg-[var(--uc-neutral-700)]" />
      <div className="absolute bottom-[48px] left-[113px] h-[11px] w-[94px] rounded-full bg-[var(--uc-orange-status)] shadow-[0_8px_16px_rgb(var(--uc-shadow-rgb)_/_0.2)]" />
      <span className="absolute bottom-[59px] left-[150px] h-[38px] w-[4px] rotate-[8deg] rounded-full bg-[var(--uc-static-black)]" />
      <span className="absolute bottom-[67px] left-[141px] size-[15px] rounded-full bg-[var(--uc-static-black)]" />
    </div>
  );
}

function TravelInsuranceDetailTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <TemplateTopChrome title="Travel Insurance" interactive={interactive} />
      <main className="px-[24px] pt-[23px] font-['UniCredit',sans-serif] text-[var(--uc-text)]">
        <TravelHeroScene />
        <h2 className="mt-[29px] text-[16px] font-bold leading-[20px]">
          Have a safe trip with travel insurance
        </h2>
        <div className="mt-[18px] space-y-[18px] text-[16px] font-normal leading-[20px]">
          <p>
            Choose protection for medical expenses, luggage, and unexpected travel events before you leave.
          </p>
          <p>
            The policy can be activated in a few steps and adjusted to your destination and travel period.
          </p>
        </div>
      </main>
      <TemplateBottomButton label="Proceed" interactive={interactive} bottom={32} />
    </TemplatePhoneSurface>
  );
}

function FeedbackStatusIcon({ kind, color }: { kind: FeedbackStatusKind; color: string }) {
  const circleClass = "relative grid size-[98px] place-items-center rounded-full border-[5px]";

  if (kind === "success") {
    return (
      <div className={circleClass} style={{ borderColor: color, color }}>
        <AppIcon name="check" size={62} strokeWidth={6} color="currentColor" />
      </div>
    );
  }

  if (kind === "warning") {
    return (
      <div className={circleClass} style={{ borderColor: color, color }}>
        <AppIcon name="bell" size={44} strokeWidth={3.8} color="currentColor" />
        <span className="absolute bottom-[23px] h-[4px] w-[38px] rounded-full bg-current" />
        <span className="absolute left-[21px] top-[29px] h-[8px] w-[4px] -rotate-[35deg] rounded-full bg-current" />
        <span className="absolute right-[21px] top-[29px] h-[8px] w-[4px] rotate-[35deg] rounded-full bg-current" />
        <span className="absolute left-1/2 top-[22px] h-[8px] w-[4px] -translate-x-1/2 rounded-full bg-current" />
      </div>
    );
  }

  if (kind === "pending") {
    return (
      <div className={circleClass} style={{ borderColor: color, color }}>
        <span className="absolute left-1/2 top-[27px] h-[16px] w-[28px] -translate-x-1/2 rounded-b-[10px] rounded-t-[4px] bg-current" />
        <span className="absolute left-1/2 bottom-[27px] h-[16px] w-[28px] -translate-x-1/2 rounded-b-[4px] rounded-t-[10px] border-[4px] border-current border-t-0" />
        <span className="absolute left-1/2 top-[41px] h-[17px] w-[4px] -translate-x-1/2 rounded-full bg-current" />
        <span className="absolute left-1/2 top-[43px] h-[15px] w-[2px] -translate-x-1/2 bg-[var(--uc-surface)]" />
        <span className="absolute left-1/2 top-[57px] h-[4px] w-[22px] -translate-x-1/2 rounded-full bg-current" />
      </div>
    );
  }

  if (kind === "error") {
    return (
      <div className={circleClass} style={{ borderColor: color, color }}>
        <span className="font-['UniCredit',sans-serif] text-[64px] font-bold leading-none">!</span>
      </div>
    );
  }

  return (
    <div className={circleClass} style={{ borderColor: color, color }}>
      <span className="absolute left-1/2 top-[24px] size-[13px] -translate-x-1/2 rounded-full bg-current" />
      <span className="font-['UniCredit',sans-serif] text-[58px] font-bold leading-none">i</span>
    </div>
  );
}

function FeedbackStatusTemplate({
  config,
  interactive,
}: {
  config: FeedbackStatusTemplateConfig;
  interactive: boolean;
}) {
  return (
    <TemplatePhoneSurface>
      <TemplateHelpOnlyChrome title={config.title} interactive={interactive} />

      <div className="mt-[55px] flex justify-center">
        <FeedbackStatusIcon kind={config.kind} color={config.iconColor} />
      </div>

      <section className="px-[24px] pt-[56px] font-['UniCredit',sans-serif] text-[var(--uc-text)]">
        <h2 className="text-[16px] font-bold leading-[20px]">{config.heading}</h2>
        <p className="mt-[2px] text-[16px] font-normal leading-[20px]">{config.body}</p>
      </section>

      <div className="absolute bottom-[32px] left-[24px] right-[24px]">
        {interactive ? (
          <PrimaryButton className="w-full">{config.buttonLabel}</PrimaryButton>
        ) : (
          <div className="flex h-[48px] w-full items-center justify-center rounded bg-[var(--uc-action)] font-['UniCredit',sans-serif] text-base font-bold text-[var(--uc-static-white)]">
            {config.buttonLabel}
          </div>
        )}
      </div>
    </TemplatePhoneSurface>
  );
}

export function TemplateCodePreview({ previewId, presentationOnly = false }: TemplateCodePreviewProps) {
  const interactive = !presentationOnly;

  switch (previewId) {
    case "messages-inbox":
      return <MessagesInboxTemplate interactive={interactive} />;
    case "documents":
      return <DocumentsTemplate interactive={interactive} />;
    case "recurrent-payment":
      return <RecurrentPaymentTemplate interactive={interactive} />;
    case "product-bottom-sheet":
      return <ProductBottomSheetTemplate interactive={interactive} />;
    case "account-options":
      return <AccountOptionsTemplate interactive={interactive} />;
    case "activate-mtoken":
      return <ActivateMtokenTemplate interactive={interactive} />;
    case "analytics-overview":
      return <AnalyticsOverviewTemplate interactive={interactive} />;
    case "cards-overview":
      return <CardsOverviewTemplate interactive={interactive} />;
    case "contact-info-sheet":
      return <ContactInfoSheetTemplate interactive={interactive} />;
    case "account-detail-homepage":
      return <AccountDetailHomepageTemplate interactive={interactive} />;
    case "domestic-payment-form":
      return <DomesticPaymentFormTemplate interactive={interactive} />;
    case "review-request":
      return <ReviewRequestTemplate interactive={interactive} />;
    case "review-data":
      return <ReviewDataTemplate interactive={interactive} />;
    case "transaction-detail":
      return <TransactionDetailTemplate interactive={interactive} />;
    case "sign-pin":
      return <SignPinTemplate interactive={interactive} />;
    case "generate-token":
      return <GenerateTokenTemplate interactive={interactive} />;
    case "message-detail":
      return <MessageDetailTemplate interactive={interactive} />;
    case "push-request-form":
      return <PushRequestFormTemplate interactive={interactive} />;
    case "account-selection-panel":
      return <AccountSelectionPanelTemplate interactive={interactive} />;
    case "apple-pay-activation":
      return <ApplePayActivationTemplate interactive={interactive} />;
    case "successful-payment":
      return <SuccessfulPaymentTemplate interactive={interactive} />;
    case "tutorial-intro":
      return <TutorialIntroTemplate interactive={interactive} />;
    case "product-selection":
      return <ProductSelectionTemplate interactive={interactive} />;
    case "settings":
      return <SettingsTemplate interactive={interactive} />;
    case "travel-insurance-detail":
      return <TravelInsuranceDetailTemplate interactive={interactive} />;
    case "informative-status":
    case "pending-status":
    case "success-status":
    case "error-status":
    case "warning-status":
      return <FeedbackStatusTemplate config={feedbackStatusTemplates[previewId]} interactive={interactive} />;
    default:
      return null;
  }
}
