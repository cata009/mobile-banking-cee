import { useState, type ReactNode } from "react";
import AccountBalanceCard from "@/app/components/accounts/AccountBalanceCard";
import Card from "@/app/components/cards/Card";
import NavigationRow from "@/app/components/NavigationRow";
import AccountDetailScreen from "@/app/screens/accounts/AccountDetailScreen";
import CardDetailScreen from "@/app/screens/cards/CardDetailScreen";
import { TransactionDetailScreen } from "@/app/screens/payments/DomesticPaymentFlowScreens";
import PfmCategoryIcon from "@/app/components/pfm/PfmCategoryIcon";
import { HuMerchantLogoMark } from "@/app/screens/kids/hu/merchantLogos";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import StandardSignScreen from "@/app/components/flow/StandardSignScreen";
import StandardSuccessScreen from "@/app/components/flow/StandardSuccessScreen";
import TextField from "@/app/components/TextField";
import { AppIcon, type IconName } from "@/app/components/icons";
import { PreviewSafeTop } from "./MiniPhone";
import { DemoProvider } from "@/app/state/demoStore";
import { FLOW_DEMO } from "../flows/demoData";
import type { FlowScreenKind } from "../flows/types";
import { getAccountTransactions, type AccountTransaction } from "@/data/accountDetails";
import { mockProducts, type CurrentAccount, type DebitCard } from "@/data/products";
import carrefourOfficialLogo from "@/assets/ethoca/carrefour-official.svg";
import emagOfficialLogo from "@/assets/ethoca/emag-official.svg";

/**
 * Flow Library previews — high-fidelity compositions of the REAL design-system
 * atoms (PageHeader, NavigationRow, TextField, PrimaryButton, AccountBalanceCard,
 * Card, SectionHeadingDivider, StandardSign/SuccessScreen) on --uc-* tokens +
 * uc-type-* classes. Layout and copy match the RO Enablers Figma (Round Up flow,
 * node 2344:10093). No hand-drawn px typography, no hex literals, no fake status bar.
 *
 * Static snapshots rendered inside MiniPhone (inert), so handlers are no-ops and
 * overlays are composed inline with var(--uc-overlay) rather than the portal-based
 * BottomSheet (which would escape a scaled frame).
 */

const noop = () => {};

// ---------------------------------------------------------------- shared bits

function Screen({ children, tone = "surface" }: { children: ReactNode; tone?: "surface" | "app" }) {
  return (
    <div className={`relative flex h-full flex-col ${tone === "app" ? "bg-[var(--uc-app-bg)]" : "bg-[var(--uc-surface)]"}`}>
      {children}
    </div>
  );
}

function Pills({ options, active }: { options: readonly string[]; active: string }) {
  return (
    <div className="mt-[12px] flex flex-wrap gap-[10px]">
      {options.map((option) => {
        const selected = option === active;
        return (
          <span
            key={option}
            className={`rounded-full px-[16px] py-[8px] uc-type-n5-strong ${
              selected
                ? "bg-[var(--uc-action)] text-[var(--uc-text-inverse)]"
                : "border border-[var(--uc-action)] bg-[var(--uc-surface)] text-[var(--uc-action)]"
            }`}
          >
            {option}
          </span>
        );
      })}
    </div>
  );
}

function Overlay({ align = "center", children }: { align?: "center" | "bottom"; children: ReactNode }) {
  return (
    <div className={`absolute inset-0 z-[60] flex bg-[var(--uc-overlay)] ${align === "bottom" ? "items-end" : "items-center justify-center"}`}>
      {children}
    </div>
  );
}

function BottomCta({ children }: { children: ReactNode }) {
  return <div className="mt-auto flex justify-center bg-[var(--uc-surface)] px-[24px] pb-[28px] pt-[12px]">{children}</div>;
}

/** Grey "Round up example" explainer box. */
function ExampleBox({ heading, children }: { heading?: string; children: ReactNode }) {
  return (
    <div className="mt-[16px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[14px]">
      {heading ? (
        <div className="mb-[8px] flex items-center gap-[8px]">
          <AppIcon name="refresh" size={18} color="var(--uc-text)" />
          <p className="uc-type-n5-strong text-[var(--uc-text)]">{heading}</p>
        </div>
      ) : null}
      <p className="uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{children}</p>
    </div>
  );
}

/** Account picker field (label + IBAN value + chevron + name/balance), built on the real TextField. */
function AccountSelectField({ label, iban, name, balance }: { label: string; iban: string; name: string; balance: string }) {
  return (
    <div className="mt-[16px]">
      <TextField
        label={label}
        value={iban}
        onChange={noop}
        readOnly
        visualState="filled"
        trailingIconName="chevron-down"
        helperText={name}
        helperText2={balance}
      />
    </div>
  );
}

/** Read-only account display (Manage screen). */
function DisplayField({ label, name, iban }: { label: string; name: string; iban: string }) {
  return (
    <div className="mt-[18px]">
      <p className="uc-type-n5 text-[var(--uc-text-muted)]">{label}</p>
      <p className="mt-[4px] uc-type-n4-strong text-[var(--uc-text)]">{name}</p>
      <p className="uc-type-n5 text-[var(--uc-text-muted)]">{iban}</p>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="mt-[12px] flex h-[40px] items-center gap-[10px] rounded-[6px] bg-[var(--uc-surface-muted)] px-[12px]">
      <AppIcon name="search" size={18} color="var(--uc-text-muted)" />
      <span className="flex-1 uc-type-n5 text-[var(--uc-text-muted)]">Search</span>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: IconName; label: string }) {
  return (
    <div className="flex min-w-[64px] flex-col items-center gap-[4px]">
      <span className="flex h-[32px] w-[32px] items-center justify-center">
        <AppIcon name={icon} color="var(--uc-text)" />
      </span>
      <span className="uc-type-p2 whitespace-pre-line text-center leading-[15px] text-[var(--uc-text)]">{label}</span>
    </div>
  );
}

function PinBoxes({ digits, visible }: { digits: readonly string[]; visible: boolean }) {
  return (
    <div className="flex justify-center gap-[14px]">
      {digits.map((digit, index) => (
        <div key={`${digit}-${index}`} className="grid size-[48px] place-items-center rounded-[6px] border border-[var(--uc-border)] uc-type-n3 text-[var(--uc-text)]">
          {visible ? digit : "•"}
        </div>
      ))}
    </div>
  );
}

function cardVariant(cardKind: "credit" | "debit") {
  return cardKind === "credit" ? "mc-credit-partner-standard" : "mc-debit-standard";
}

function SmallCardArt({ cardKind }: { cardKind: "credit" | "debit" }) {
  return <Card size="large" variant={cardVariant(cardKind)} style={{ width: 52, height: 33, borderRadius: 4 }} />;
}

function demoCard(cardKind: "credit" | "debit") {
  return cardKind === "credit" ? FLOW_DEMO.creditCard : FLOW_DEMO.debitCard;
}

// ------------------------------------------------------------- Round Up screens

function HomeEntryPreview() {
  const { currentAccount, savingsAccount, homeCard } = FLOW_DEMO;
  return (
    <Screen tone="app">
      <PreviewSafeTop background="var(--uc-app-bg)" />
      <div className="flex items-center justify-between px-[16px] pb-[10px]">
        <span className="inline-flex items-center gap-[6px] rounded-full bg-[var(--uc-static-black)] px-[12px] py-[5px] uc-type-n5-strong text-[var(--uc-static-white)]">
          Prime
        </span>
        <span className="flex gap-[14px]">
          <AppIcon name="header-profile" color="var(--uc-text)" />
          <AppIcon name="header-messages" color="var(--uc-text)" />
        </span>
      </div>
      <div className="flex-1 overflow-hidden px-[16px]">
        <h1 className="uc-type-h1 text-[var(--uc-text)]">Your Homepage</h1>

        <div className="mt-[16px] overflow-hidden rounded-[8px] bg-[linear-gradient(120deg,var(--uc-teal-main),var(--uc-teal-blue))] p-[16px]">
          <p className="max-w-[180px] uc-type-n2-strong text-[var(--uc-static-white)]">Start saving with Round Up</p>
          <p className="mt-[6px] max-w-[190px] uc-type-n5 text-[var(--uc-static-white)] opacity-90">
            Round up your card payments and save the difference.
          </p>
        </div>
        <div className="mt-[10px] flex justify-center gap-[6px]">
          <span className="h-[6px] w-[18px] rounded-full bg-[var(--uc-action)]" />
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-[6px] w-[6px] rounded-full bg-[var(--uc-border)]" />
          ))}
        </div>

        <HomeSectionHeader title="Accounts" />
        <HomeProductRow icon="account-details" name={currentAccount.name} sub={currentAccount.iban} amount={`${currentAccount.balance} ${currentAccount.currency}`} />
        <HomeSectionHeader title="Cards" />
        <HomeProductRow icon="view-pin" name={homeCard.label} sub={homeCard.pan} amount={homeCard.balance} />
        <HomeSectionHeader title="Savings and term deposit" />
        <HomeProductRow icon="add-money" name={savingsAccount.name} sub={savingsAccount.iban} amount={`${savingsAccount.available} ${savingsAccount.currency}`} />
      </div>
    </Screen>
  );
}

function HomeSectionHeader({ title }: { title: string }) {
  return (
    <div className="mt-[18px] flex items-center justify-between">
      <p className="uc-type-h2 text-[var(--uc-text)]">{title}</p>
      <AppIcon name="chevron-down" color="var(--uc-text)" />
    </div>
  );
}

function HomeProductRow({ icon, name, sub, amount }: { icon: IconName; name: string; sub: string; amount: string }) {
  return (
    <div className="mt-[10px] rounded-[8px] bg-[var(--uc-surface)] p-[14px] shadow-sm">
      <div className="flex items-start gap-[12px]">
        <span className="flex size-[28px] shrink-0 items-center justify-center"><AppIcon name={icon} color="var(--uc-action)" /></span>
        <div className="min-w-0 flex-1">
          <p className="uc-type-n5-strong text-[var(--uc-text)]">{name}</p>
          <p className="uc-type-p2 text-[var(--uc-text-muted)]">{sub}</p>
          <p className="uc-type-p2 text-[var(--uc-text-muted)]">Account under favorable conditions</p>
        </div>
      </div>
      <p className="mt-[8px] text-right uc-type-n4-strong text-[var(--uc-text)]">{amount}</p>
    </div>
  );
}

const PRODUCT_TILES: Array<{ label: string; color: string }> = [
  { label: "Accounts", color: "var(--uc-product-blue-deep)" },
  { label: "Cards", color: "var(--uc-red-card)" },
  { label: "Borrowing", color: "var(--uc-product-mauve)" },
  { label: "Saving and investing", color: "var(--uc-product-blue)" },
];

function ProductsRoundUpPreview() {
  const items = ["Term deposit", "Saving account", "Round Up", "Mutual funds"];
  return (
    <Screen tone="app">
      <PreviewSafeTop />
      <div className="px-[16px] pt-[8px]">
        <h1 className="uc-type-h1 text-[var(--uc-text)]">Products</h1>
        <div className="mt-[14px] flex gap-[24px] border-b border-[var(--uc-border)]">
          <span className="border-b-[3px] border-[var(--uc-action)] pb-[8px] uc-type-n4-strong text-[var(--uc-text)]">Banking</span>
          <span className="pb-[8px] uc-type-n4-strong text-[var(--uc-text-muted)]">ShopSmart</span>
        </div>
        <div className="mt-[16px] grid grid-cols-2 gap-[10px]">
          {PRODUCT_TILES.map((tile) => (
            <div key={tile.label} className="h-[84px] rounded-[8px] p-[12px]" style={{ backgroundColor: tile.color }}>
              <p className="uc-type-n5-strong text-[var(--uc-static-white)]">{tile.label}</p>
            </div>
          ))}
        </div>
      </div>
      <Overlay align="bottom">
        <div className="w-full rounded-t-[16px] bg-[var(--uc-surface)] px-[16px] pb-[8px] pt-[16px] shadow-[0_-8px_24px_rgb(var(--uc-shadow-rgb)_/_0.14)]">
          <div className="mb-[4px] flex items-center justify-between">
            <p className="uc-type-h2 text-[var(--uc-text)]">Saving and investing</p>
            <AppIcon name="close-x" color="var(--uc-text)" />
          </div>
          {items.map((item) => (
            <NavigationRow key={item} title={item} trailingAccessory="chevron" rowHeight={64} />
          ))}
        </div>
      </Overlay>
    </Screen>
  );
}

function RoundUpInfoPreview() {
  const { info } = FLOW_DEMO.roundUp;
  return (
    <Screen>
      <PageHeader title="Round Up" onBack={noop} includeSafeArea showHelp={false} />
      <div className="flex-1 overflow-hidden px-[16px]">
        <div className="h-[128px] rounded-[8px] bg-[linear-gradient(135deg,var(--uc-peach-200),var(--uc-teal-soft))]" />
        <h2 className="mt-[16px] uc-type-n4-strong text-[var(--uc-text)]">{info.heading}</h2>
        <p className="mt-[8px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{info.body}</p>
        <ExampleBox>{info.example}</ExampleBox>
        <SectionHeadingDivider title="How it works" className="mt-[18px]" />
        <div className="mt-[10px] flex flex-col gap-[14px]">
          {info.steps.slice(0, 3).map((step, index) => (
            <div key={step.title} className="flex gap-[12px]">
              <span className="grid size-[26px] shrink-0 place-items-center rounded-full bg-[var(--uc-static-black)] uc-type-n5-strong text-[var(--uc-static-white)]">
                {index + 1}
              </span>
              <div>
                <p className="uc-type-n5-strong text-[var(--uc-text)]">{step.title}</p>
                <p className="uc-type-n5 leading-[18px] text-[var(--uc-text-muted)]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomCta>
        <PrimaryButton onClick={noop}>Set up Round Up</PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

function OpenSavingsPreview() {
  const intro = FLOW_DEMO.savingsAccountIntro;
  return (
    <Screen>
      <PreviewSafeTop />
      <div className="flex items-center justify-between px-[16px] pt-[6px]">
        <h1 className="uc-type-h1 text-[var(--uc-text)]">{intro.title}</h1>
        <AppIcon name="close-x" size={28} color="var(--uc-text)" />
      </div>
      <div className="flex-1 overflow-hidden px-[16px] pt-[12px]">
        <div className="h-[132px] rounded-[8px] bg-[linear-gradient(135deg,var(--uc-peach-100),var(--uc-product-mauve))]" />
        <p className="mt-[14px] uc-type-n5-strong text-[var(--uc-text)]">{intro.heading}</p>
        <p className="mt-[6px] uc-type-n5 leading-[19px] text-[var(--uc-text-muted)]">{intro.body}</p>
        <p className="mt-[12px] uc-type-n5-strong text-[var(--uc-text)]">Benefits</p>
        <ul className="mt-[6px] flex flex-col gap-[6px]">
          {intro.benefits.map((benefit) => (
            <li key={benefit} className="uc-type-n5 leading-[18px] text-[var(--uc-text-muted)]">• {benefit}</li>
          ))}
        </ul>
      </div>
      <BottomCta>
        <PrimaryButton onClick={noop}>Next</PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

function SetupFormPreview() {
  const { currentAccount, savingsAccount, roundUp } = FLOW_DEMO;
  const state = roundUp.setup.filled;
  return (
    <Screen>
      <PageHeader title="Set up Round Up" onBack={noop} includeSafeArea />
      <div className="flex-1 overflow-hidden px-[16px]">
        <AccountSelectField
          label="Round up card payments from current account"
          iban={currentAccount.iban}
          name={currentAccount.name}
          balance={`${currentAccount.balance} ${currentAccount.currency}`}
        />
        <AccountSelectField
          label="Save the difference into"
          iban={savingsAccount.iban}
          name={savingsAccount.name}
          balance={`${savingsAccount.available} ${savingsAccount.currency}`}
        />
        <SectionHeadingDivider title="Saving options" className="mt-[18px]" />
        <p className="mt-[10px] uc-type-n5 leading-[19px] text-[var(--uc-text-muted)]">
          We'll round up each eligible card payment and transfer the saved amount to your savings account.
        </p>
        <p className="mt-[14px] uc-type-n4-strong text-[var(--uc-text)]">Round up to</p>
        <Pills options={roundUp.thresholdOptions} active={state.threshold} />
        <p className="mt-[16px] uc-type-n4-strong text-[var(--uc-text)]">Add an extra amount to each transfer</p>
        <Pills options={roundUp.boostOptions} active={state.boost} />
        <ExampleBox heading="Round up example">{state.example}</ExampleBox>
        <div className="mt-[14px]">
          <NavigationRow
            title="I have read and agree to the Round Up Terms and Conditions."
            trailingAccessory="toggle"
            toggleChecked={state.termsChecked}
            rowHeight={64}
          />
        </div>
      </div>
      <BottomCta>
        <PrimaryButton onClick={noop}>Activate Round Up</PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

function AccountsActivePreview() {
  const { savingsAccount, roundUp } = FLOW_DEMO;
  const [availableInteger = "0", availableDecimals = "00"] = savingsAccount.available.split(",");
  const actions: Array<{ icon: IconName; label: string }> = [
    { icon: "account-details", label: "Details" },
    { icon: "account-options", label: "Options" },
    { icon: "add-money", label: "Internal\ntransfer" },
  ];
  return (
    <Screen tone="app">
      <PageHeader title="Accounts" onBack={noop} includeSafeArea variant="gray" />
      <div className="flex-1 overflow-hidden">
        <div className="px-[16px]">
          <AccountBalanceCard
            account={{ accountName: savingsAccount.name, accountNumber: savingsAccount.iban, subAccount: "" }}
            availableInteger={`${availableInteger},`}
            availableDecimals={availableDecimals}
            currency={savingsAccount.currency}
            currentBalance=""
            productType="saving_account"
            showCopy
            showSubAccount={false}
          />
        </div>
        <div className="mt-[12px] flex items-start justify-around px-[16px]">
          {actions.map((action) => (
            <QuickAction key={action.label} icon={action.icon} label={action.label} />
          ))}
        </div>
        <div className="mt-[12px] bg-[var(--uc-surface)] px-[16px]">
          <NavigationRow
            title="Round Up"
            description="Save spare change automatically"
            leadingIconName="refresh"
            trailingAccessory="chevron"
            rowHeight={64}
          />
          <SearchBar />
          <SectionHeadingDivider title={roundUp.monthLabel} className="mt-[14px]" />
          {roundUp.transfers.map((transfer) => (
            <div key={transfer.day} className="flex min-h-[56px] items-center gap-[12px] border-b border-[var(--uc-border)]">
              <span className="w-[34px] text-center uc-type-n5-strong text-[var(--uc-text)]">
                {transfer.day}
                <span className="block uc-type-p2 text-[var(--uc-text-muted)]">{transfer.month}</span>
              </span>
              <span className="grid size-[28px] place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-green-status)_18%,var(--uc-surface))]">
                <AppIcon name="refresh" size={16} color="var(--uc-green-status)" />
              </span>
              <span className="flex-1 uc-type-n5 text-[var(--uc-text)]">Transfer</span>
              <span className="uc-type-n5-strong text-[var(--uc-action)]">{transfer.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

function ManagePreview() {
  const { currentAccount, savingsAccount, roundUp } = FLOW_DEMO;
  const state = roundUp.setup.empty;
  return (
    <Screen>
      <PageHeader title="Manage Round Up" onBack={noop} includeSafeArea />
      <div className="flex-1 overflow-hidden px-[16px]">
        <DisplayField label="Round up card payments from current account" name={currentAccount.name} iban={currentAccount.iban} />
        <DisplayField label="Save the difference into" name={savingsAccount.name} iban={savingsAccount.iban} />
        <SectionHeadingDivider title="Saving options" className="mt-[18px]" />
        <p className="mt-[10px] uc-type-n5 leading-[19px] text-[var(--uc-text-muted)]">
          We'll round up each eligible card payment and transfer the saved amount to your savings account.
        </p>
        <p className="mt-[14px] uc-type-n4-strong text-[var(--uc-text)]">Round up to</p>
        <Pills options={roundUp.thresholdOptions} active={state.threshold} />
        <p className="mt-[16px] uc-type-n4-strong text-[var(--uc-text)]">Add an extra amount to each transfer</p>
        <Pills options={roundUp.boostOptions} active={state.boost} />
        <ExampleBox heading="Round up example">{state.example}</ExampleBox>
      </div>
      <div className="flex flex-col items-center gap-[10px] bg-[var(--uc-surface)] px-[24px] pb-[24px] pt-[12px]">
        <PrimaryButton onClick={noop} disabled>
          Save Changes
        </PrimaryButton>
        <span className="uc-type-n4-strong text-[var(--uc-action)]">Deactivate Round Up</span>
      </div>
    </Screen>
  );
}

function ConfirmDeactivatePreview() {
  return (
    <Screen>
      <ManagePreview />
      <Overlay align="bottom">
        <div className="m-[16px] w-full rounded-[12px] bg-[var(--uc-surface)] p-[16px] shadow-[0_-8px_24px_rgb(var(--uc-shadow-rgb)_/_0.14)]">
          <h2 className="text-center uc-type-n4-strong text-[var(--uc-text)]">Deactivate Round Up?</h2>
          <p className="mt-[8px] text-center uc-type-n5 text-[var(--uc-text-muted)]">
            You'll stop saving automatically when you pay by card.
          </p>
          <div className="mt-[14px] flex justify-between border-t border-[var(--uc-border)] pt-[12px] uc-type-n4-strong text-[var(--uc-action)]">
            <span>Cancel</span>
            <span>Deactivate</span>
          </div>
        </div>
      </Overlay>
    </Screen>
  );
}

// -------------------------------------------------------------- Card PIN screens

function CardsPreview({ cardKind }: { cardKind: "credit" | "debit" }) {
  const card = demoCard(cardKind);
  const { cardTransactions } = FLOW_DEMO;
  const actions: Array<{ icon: IconName; label: string }> = [
    { icon: "account-details", label: "Card\nDetails" },
    { icon: "account-options", label: "Options" },
    { icon: "block-card", label: "Block\nCard" },
    { icon: "view-pin", label: "View\nPIN" },
  ];
  return (
    <Screen>
      <PageHeader title="Cards" onBack={noop} includeSafeArea variant="gray" />
      <div className="bg-[var(--uc-app-bg)] pb-[16px]">
        <div className="px-[24px]">
          <p className="uc-type-n5-strong text-[var(--uc-text)]">{FLOW_DEMO.cardholder}</p>
          <p className="mt-[3px] uc-type-n2-strong text-[var(--uc-text)]">{card.pan}</p>
        </div>
        <div className="mt-[16px] flex gap-[24px] overflow-hidden pl-[24px]">
          <div className="shrink-0 overflow-hidden rounded-[6px] shadow-[0_11px_11px_rgb(var(--uc-shadow-rgb)_/_0.20)]">
            <Card ariaLabel={`${cardKind} card`} size="large" variant={cardVariant(cardKind)} style={{ width: 219, height: 138, borderRadius: 6 }} />
          </div>
          <div className="mt-[12px] shrink-0 overflow-hidden rounded-[6px] opacity-60 shadow-[0_9px_9px_rgb(var(--uc-shadow-rgb)_/_0.16)]">
            <Card size="large" variant={cardVariant(cardKind === "credit" ? "debit" : "credit")} style={{ width: 181, height: 114, borderRadius: 6 }} />
          </div>
        </div>
        <div className="px-[24px] pt-[22px]">
          <p className="uc-type-n5-strong text-[var(--uc-text-muted)]">Free To Spend</p>
          <p className="mt-[4px] uc-type-n1 text-[var(--uc-text)]">
            {card.freeToSpend} <span className="uc-type-n3">{card.currency}</span>
          </p>
          <p className="mx-auto mt-[16px] w-fit uc-type-n5-strong uppercase tracking-[0.06em] text-[var(--uc-action)]">Show Card Details</p>
        </div>
        <div className="mt-[4px] flex items-start justify-between px-[16px]">
          {actions.map((action) => (
            <QuickAction key={action.label} icon={action.icon} label={action.label} />
          ))}
        </div>
      </div>
      <div className="flex-1 bg-[var(--uc-surface)] px-[16px] pt-[16px]">
        <SectionHeadingDivider title={cardTransactions.period} />
        {cardTransactions.rows.map((row) => (
          <div key={row.title} className="flex min-h-[56px] items-center justify-between border-b border-[var(--uc-border)]">
            <div className="w-[42px] text-center uc-type-n5-strong text-[var(--uc-text)]">
              {row.day}
              <span className="block uc-type-p2 text-[var(--uc-text-muted)]">{row.month}</span>
            </div>
            <div className="flex-1 px-[12px] uc-type-n5 text-[var(--uc-text)]">{row.title}</div>
            <div className="uc-type-n5-strong text-[var(--uc-text)]">{row.amount}</div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

interface CardOptionRow {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

const CARD_PROGRAM_ROWS: readonly CardOptionRow[] = [
  { id: "apple-pay", icon: "card-options-apple-pay", title: "APPLE PAY", description: "Active" },
  { id: "mastercard", icon: "card-options-mastercard", title: "MASTERCARD PRICELESS", description: "Discover all the advantages of the program" },
  { id: "registrations", icon: "card-options-registrations", title: "CARD REGISTRATIONS", description: "Subscriptions and saved card" },
];

const CARD_SETTINGS_COMMON: readonly CardOptionRow[] = [
  { id: "view-pin", icon: "view-pin", title: "VIEW PIN", description: "View or change your card’s PIN" },
  { id: "card-limits", icon: "card-options-limits", title: "CARD LIMITS", description: "Manage your card limits" },
  { id: "push", icon: "account-option-push-notifications", title: "PUSH NOTIFICATIONS", description: "Manage app notifications" },
];

const CARD_SETTINGS_CREDIT: readonly CardOptionRow[] = [
  { id: "statement", icon: "account-option-statement", title: "CREDIT CARD STATEMENT", description: "View your statement" },
  { id: "change-name", icon: "card-options-change-name", title: "CHANGE CARD NAME", description: "Name your card" },
];

const CARD_SETTINGS_DEBIT: readonly CardOptionRow[] = [
  { id: "delivery", icon: "card-options-delivery-address", title: "CARD DELIVERY ADDRESS", description: "Select the address to deliver the card" },
  { id: "reissue", icon: "card-options-reissue", title: "REISSUE CARD", description: "Request the reissue of this card" },
];

function CardOptionsPreview({ cardKind, overlay }: { cardKind: "credit" | "debit"; overlay?: "faceid" | "popup" }) {
  const settings = [...CARD_SETTINGS_COMMON, ...(cardKind === "credit" ? CARD_SETTINGS_CREDIT : CARD_SETTINGS_DEBIT)];
  return (
    <Screen tone="app">
      <PageHeader title="Card options" onBack={noop} includeSafeArea showHelp={false} variant="gray" />
      <div className="px-[8px]">
        {CARD_PROGRAM_ROWS.map((row) => (
          <NavigationRow key={row.id} title={row.title} description={row.description} leadingIconName={row.icon} trailingAccessory="chevron" rowHeight={80} />
        ))}
        <SectionHeadingDivider title="General settings" className="mt-[8px] px-[16px]" />
        {settings.map((row) => (
          <NavigationRow key={row.id} title={row.title} description={row.description} leadingIconName={row.icon} trailingAccessory="chevron" rowHeight={80} />
        ))}
      </div>
      {overlay === "faceid" ? (
        <Overlay>
          <div className="w-[150px] rounded-[12px] bg-[var(--uc-surface)] p-[16px] text-center shadow-[0_16px_32px_rgb(var(--uc-shadow-rgb)_/_0.20)]">
            <div className="mx-auto grid size-[62px] place-items-center rounded-full border border-[var(--uc-border)]">
              <AppIcon name="prime-check" size={40} color="var(--uc-text)" />
            </div>
            <p className="mt-[12px] uc-type-n4-strong text-[var(--uc-text)]">Face ID</p>
          </div>
        </Overlay>
      ) : null}
      {overlay === "popup" ? (
        <Overlay>
          <div className="mx-[24px] rounded-[12px] bg-[var(--uc-surface)] px-[20px] pb-[16px] pt-[18px] text-center shadow-[0_16px_32px_rgb(var(--uc-shadow-rgb)_/_0.20)]">
            <p className="uc-type-h2 text-[var(--uc-text)]">Set up your card PIN</p>
            <p className="mt-[8px] uc-type-n5 text-[var(--uc-text-muted)]">
              Currently you don't have a PIN set for this card, you need to create a new one.
            </p>
            <p className="mt-[16px] border-t border-[var(--uc-border)] pt-[10px] uc-type-n4-strong text-[var(--uc-action)]">Continue</p>
          </div>
        </Overlay>
      ) : null}
    </Screen>
  );
}

function PinRevealPreview({ cardKind, visible }: { cardKind: "credit" | "debit"; visible: boolean }) {
  const card = demoCard(cardKind);
  return (
    <Screen>
      <PreviewSafeTop />
      <div className="flex items-center justify-between px-[24px] pt-[8px]">
        <h1 className="uc-type-h1 text-[var(--uc-text)]">Your PIN number</h1>
        <AppIcon name="close-x" size={32} color="var(--uc-text)" />
      </div>
      <div className="flex-1 px-[24px] pt-[16px]">
        <p className="max-w-[318px] uc-type-n5 text-[var(--uc-text)]">
          Your PIN is personal, never show it to anyone. Be careful if someone is watching you and tap the button to see the numbers.
        </p>
        <div className="mt-[28px] flex items-center gap-[12px]">
          <SmallCardArt cardKind={cardKind} />
          <div>
            <p className="uc-type-n5-strong text-[var(--uc-text)]">{card.label}</p>
            <p className="uc-type-p2 text-[var(--uc-text-muted)]">{card.pan}</p>
          </div>
        </div>
        <div className="mt-[36px]">
          <PinBoxes digits={card.pin} visible={visible} />
        </div>
        <p className="mx-auto mt-[28px] w-fit uc-type-n5-strong uppercase text-[var(--uc-action)]">Change your PIN</p>
      </div>
      {visible ? (
        <p className="pb-[8px] text-center uc-type-p2 text-[var(--uc-text-muted)]">This page will close automatically in 7 seconds</p>
      ) : null}
      <BottomCta>
        <PrimaryButton onClick={noop}>{visible ? "I have memorized it" : "Show PIN"}</PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

function SetPinPreview({ cardKind, filled }: { cardKind: "credit" | "debit"; filled: boolean }) {
  const card = demoCard(cardKind);
  const value = filled ? FLOW_DEMO.newPin : "";
  return (
    <Screen>
      <PageHeader title="Set your PIN" onBack={noop} includeSafeArea showHelp={false} />
      <div className="flex-1 px-[24px]">
        <p className="max-w-[322px] uc-type-n5 text-[var(--uc-text)]">
          Make sure you set a safe PIN for your card. Avoid using a previous PIN, and avoid consecutive numbers (1234) or identical numbers (2222).
        </p>
        <div className="mt-[28px] flex items-center gap-[12px]">
          <SmallCardArt cardKind={cardKind} />
          <div>
            <p className="uc-type-n5-strong text-[var(--uc-text)]">{card.label}</p>
            <p className="uc-type-p2 text-[var(--uc-text-muted)]">{card.pan}</p>
          </div>
        </div>
        <div className="mt-[28px] flex flex-col gap-[24px]">
          <TextField label="Choose card PIN" value={value} onChange={noop} helperText="Numerical, maximum 4 characters" visualState={filled ? "filled" : "on-focus"} />
          <TextField label="Confirm card PIN" value={value} onChange={noop} helperText="Numerical, maximum 4 characters" visualState={filled ? "filled" : "empty"} />
        </div>
      </div>
      <BottomCta>
        <PrimaryButton onClick={noop} disabled={!filled}>Continue</PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

// -------------------------------------------------------------- shared steps

function SignStep({ title = "Sign" }: { title?: string }) {
  return (
    <StandardSignScreen
      title={title}
      pinLabel="Enter pin code"
      pinHelper="Be sure that nobody is watching you"
      actionLabel="Sign"
      onBack={noop}
      onSign={noop}
    />
  );
}

function SuccessStep({ title, body }: { title: string; body: string }) {
  return <StandardSuccessScreen title={title} body={body} actionLabel="Ok, I got it" onDone={noop} />;
}

// --------------------------------------------------------- ETHOCA merchant enrichment

const ETHOCA_DEBIT_CARD = mockProducts.find((product): product is DebitCard => product.type === "debit_card")!;
const ETHOCA_CURRENT_ACCOUNT = mockProducts.find((product): product is CurrentAccount => product.type === "current_account")!;
const ETHOCA_RO_TRANSACTIONS = getAccountTransactions("RO", 0, "RON");

function demoTransaction(label: string, status?: AccountTransaction["status"]): AccountTransaction {
  const transaction = ETHOCA_RO_TRANSACTIONS.find(
    (candidate) => candidate.label === label && candidate.source === "card" && (!status || candidate.status === status),
  );
  if (!transaction) throw new Error(`ETHOCA Flow fixture is missing the ${label} card transaction.`);
  return transaction;
}

type EthocaMerchantId = "youtube" | "carrefour" | "emag";

/** Existing merchant-logo asset reused from the current Mobile PI Kids implementation. */
function ExistingMerchantLogo({ merchant, size = 32 }: { merchant: "youtube" | "netflix"; size?: 32 | 64 }) {
  const scale = size / 34;
  return (
    <div className="grid shrink-0 place-items-center overflow-visible" data-ethoca-visual="merchant-logo" style={{ width: size, height: size }}>
      <div style={{ transform: `scale(${scale})` }}><HuMerchantLogoMark merchant={merchant} /></div>
    </div>
  );
}

/**
 * ETHOCA uses a merchant-supplied brand asset, never a letter-based stand-in.
 * The assets are bundled with the demo rather than requested from merchant CDNs
 * at runtime, so corporate firewalls cannot blank the transaction presentation.
 */
function EthocaMerchantLogo({
  merchant,
  transaction,
  size = 32,
}: {
  merchant: EthocaMerchantId;
  transaction: AccountTransaction;
  size?: 32 | 64;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  if (merchant === "youtube") return <ExistingMerchantLogo merchant="youtube" size={size} />;
  if (imageFailed) return <ExistingPfmFallback transaction={transaction} />;

  const config = merchant === "carrefour"
    ? {
        label: "Carrefour",
        source: "bundled-official-carrefour",
        src: carrefourOfficialLogo,
      }
    : {
        label: "eMAG",
        source: "bundled-official-emag",
        src: emagOfficialLogo,
      };

  return (
    <span
      aria-label={`${config.label} merchant logo`}
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--uc-static-white)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-black)_12%,transparent)]"
      data-ethoca-visual="merchant-logo"
      data-ethoca-logo-source={config.source}
      data-testid={`merchant-logo-${merchant}`}
      role="img"
      style={{ width: size, height: size }}
    >
      {!imageReady ? (
        <span className="grid h-full w-full place-items-center rounded-full bg-[#F5F5F5]" aria-hidden="true">
          <PfmCategoryIcon category={transaction.pfmCategory} size={32} variant="category-circle" />
        </span>
      ) : null}
      <img
        alt=""
        className={`absolute h-full w-full object-contain p-[12%] ${imageReady ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setImageReady(true)}
        onError={() => setImageFailed(true)}
        src={config.src}
      />
    </span>
  );
}

/**
 * Flow Library screens are fixed RO fixtures.  They must not inherit the
 * product/country selected in the host demo URL (for example Kids HU), because
 * the fixture's merchant filters and its ledger data are intentionally RO.
 */
function EthocaRoFixture({ children }: { children: ReactNode }) {
  return (
    <DemoProvider
      initialState={{
        product: "PI",
        country: "RO",
        bankingScenario: "retail-single-account",
      }}
    >
      {children}
    </DemoProvider>
  );
}

function ExistingPfmFallback({ transaction }: { transaction: AccountTransaction }) {
  return (
    <span className="grid size-[32px] shrink-0 place-items-center" aria-label="PFM category fallback" data-ethoca-visual="pfm-fallback">
      <PfmCategoryIcon category={transaction.pfmCategory} size={32} variant="category-circle" />
    </span>
  );
}

function merchantLogoFor(transaction: AccountTransaction) {
  if (transaction.label === "YouTube Premium") return <EthocaMerchantLogo merchant="youtube" transaction={transaction} />;
  if (transaction.label === "Carrefour") return <EthocaMerchantLogo merchant="carrefour" transaction={transaction} />;
  if (transaction.label === "eMAG") return <EthocaMerchantLogo merchant="emag" transaction={transaction} />;
  return undefined;
}

function EthocaListPreview({ state }: { state: "available" | "pending" | "fallback" }) {
  const transactionFilter = (transaction: AccountTransaction) => {
    if (state === "pending") return transaction.status === "Pending";
    if (state === "fallback") return transaction.status === "Booked" && transaction.label === "Piata Obor";
    return transaction.status === "Booked" && ["Carrefour", "YouTube Premium"].includes(transaction.label);
  };

  return (
    <EthocaRoFixture>
      <CardDetailScreen
        selectedCardId="card-debit-1"
        onBack={noop}
        onCardDetailsClick={noop}
        onShowCardDetailsClick={noop}
        onCardOptionsClick={noop}
        onTransactionClick={noop}
        transactionRowPresentation={{
          displayLabel: (transaction) => transaction.label,
          transactionFilter,
          leadingVisual: (transaction) => {
            if (state === "fallback") return <ExistingPfmFallback transaction={transaction} />;
            return merchantLogoFor(transaction) ?? <ExistingPfmFallback transaction={transaction} />;
          },
        }}
      />
    </EthocaRoFixture>
  );
}

function EthocaAccountListPreview({ state }: { state: "available" | "pending" }) {
  const transactionFilter = (transaction: AccountTransaction) => {
    if (state === "pending") return transaction.status === "Pending";
    return transaction.status === "Booked" && ["Carrefour", "YouTube Premium", "Enel Energie"].includes(transaction.label);
  };

  return (
    <EthocaRoFixture>
      <AccountDetailScreen
        selectedProductId={ETHOCA_CURRENT_ACCOUNT.id}
        onBack={noop}
        onDetailsClick={noop}
        onOptionsClick={noop}
        onTransactionClick={noop}
        transactionRowPresentation={{
          displayLabel: (transaction) => transaction.label,
          transactionFilter,
          leadingVisual: (transaction) => transaction.source === "card"
            ? merchantLogoFor(transaction) ?? <ExistingPfmFallback transaction={transaction} />
            : <ExistingPfmFallback transaction={transaction} />,
        }}
      />
    </EthocaRoFixture>
  );
}

function EthocaTransactionDetailPreview({ mode }: { mode: "in-store" | "online" | "pending" | "partial-data" | "no-logo" }) {
  const transaction = mode === "in-store"
    ? demoTransaction("Carrefour")
    : mode === "online"
      ? demoTransaction("YouTube Premium")
      : mode === "pending"
        ? demoTransaction("eMAG", "Pending")
      : demoTransaction("Piata Obor");
  const enrichment = mode === "in-store"
    ? {
        cleanMerchantName: "Carrefour",
        merchantLogo: <EthocaMerchantLogo merchant="carrefour" transaction={transaction} size={64} />,
        location: { label: "Merchant location", address: "Carrefour Băneasa · Șos. București-Ploiești 42D, Bucharest" },
        mcc: "5411 · Grocery stores, supermarkets",
      }
    : mode === "online"
      ? {
          cleanMerchantName: "YouTube Premium",
          merchantLogo: <EthocaMerchantLogo merchant="youtube" transaction={transaction} size={64} />,
          mcc: "4899 · Cable, satellite and other pay television",
        }
      : mode === "pending"
        ? {
            cleanMerchantName: "eMAG",
            merchantLogo: <EthocaMerchantLogo merchant="emag" transaction={transaction} size={64} />,
          }
        : mode === "partial-data"
          ? {
              cleanMerchantName: "Piata Obor",
              mcc: "5411 · Grocery stores, supermarkets",
            }
          : undefined;

  return (
    <TransactionDetailScreen
      country="RO"
      product={ETHOCA_DEBIT_CARD}
      transaction={transaction}
      merchantEnrichment={enrichment}
      onBack={noop}
      onRedoPayment={noop}
      onCategoryChange={noop}
    />
  );
}

// ----------------------------------------------------------------- dispatcher

export interface PreviewContext {
  countryName?: string;
}

export function renderFlowPreview(kind: FlowScreenKind, _context: PreviewContext = {}): ReactNode {
  switch (kind) {
    case "home-entry":
      return <HomeEntryPreview />;
    case "products-round-up":
      return <ProductsRoundUpPreview />;
    case "round-up-info":
      return <RoundUpInfoPreview />;
    case "open-savings":
      return <OpenSavingsPreview />;
    case "setup-form":
      return <SetupFormPreview />;
    case "sign":
      return <SignStep />;
    case "success-active":
      return (
        <SuccessStep
          title="Round Up is now active"
          body="You'll now save automatically every time you pay by card. The rounded-up difference will be transferred to your savings account."
        />
      );
    case "accounts-active":
      return <AccountsActivePreview />;
    case "manage":
      return <ManagePreview />;
    case "confirm-deactivate":
      return <ConfirmDeactivatePreview />;
    case "success-deactivated":
      return (
        <SuccessStep
          title="Round Up has been deactivated"
          body="Your card payments will no longer be rounded up automatically. You can set up Round Up again anytime from your account settings."
        />
      );
    case "cards-credit":
      return <CardsPreview cardKind="credit" />;
    case "cards-debit":
      return <CardsPreview cardKind="debit" />;
    case "card-options-credit":
      return <CardOptionsPreview cardKind="credit" />;
    case "card-options-debit":
      return <CardOptionsPreview cardKind="debit" />;
    case "pin-faceid-credit":
      return <CardOptionsPreview cardKind="credit" overlay="faceid" />;
    case "pin-faceid-debit":
      return <CardOptionsPreview cardKind="debit" overlay="faceid" />;
    case "pin-reveal-credit-hidden":
      return <PinRevealPreview cardKind="credit" visible={false} />;
    case "pin-reveal-credit-visible":
      return <PinRevealPreview cardKind="credit" visible />;
    case "pin-reveal-debit-hidden":
      return <PinRevealPreview cardKind="debit" visible={false} />;
    case "pin-reveal-debit-visible":
      return <PinRevealPreview cardKind="debit" visible />;
    case "set-pin-credit-empty":
      return <SetPinPreview cardKind="credit" filled={false} />;
    case "set-pin-credit-filled":
      return <SetPinPreview cardKind="credit" filled />;
    case "set-pin-debit-empty":
      return <SetPinPreview cardKind="debit" filled={false} />;
    case "set-pin-debit-filled":
      return <SetPinPreview cardKind="debit" filled />;
    case "pin-sign":
      return <SignStep />;
    case "pin-success":
      return (
        <SuccessStep
          title="Your new PIN was successfully saved"
          body="Remember the PIN you set — you'll use it for future transactions with your card."
        />
      );
    case "pin-not-eligible-credit":
      return <CardOptionsPreview cardKind="credit" overlay="popup" />;
    case "pin-not-eligible-debit":
      return <CardOptionsPreview cardKind="debit" overlay="popup" />;
    case "ethoca-list-merchant-logo":
      return <EthocaListPreview state="available" />;
    case "ethoca-account-list-merchant-logo":
      return <EthocaAccountListPreview state="available" />;
    case "ethoca-list-pending-merchant-logo":
      return <EthocaListPreview state="pending" />;
    case "ethoca-account-list-pending-merchant-logo":
      return <EthocaAccountListPreview state="pending" />;
    case "ethoca-detail-pending-merchant-logo":
      return <EthocaTransactionDetailPreview mode="pending" />;
    case "ethoca-list-pfm-fallback":
      return <EthocaListPreview state="fallback" />;
    case "ethoca-detail-partial-data":
      return <EthocaTransactionDetailPreview mode="partial-data" />;
    case "ethoca-detail-in-store":
      return <EthocaTransactionDetailPreview mode="in-store" />;
    case "ethoca-detail-online":
      return <EthocaTransactionDetailPreview mode="online" />;
    case "ethoca-detail-logo-unavailable":
      return <EthocaTransactionDetailPreview mode="no-logo" />;
    default:
      return null;
  }
}
