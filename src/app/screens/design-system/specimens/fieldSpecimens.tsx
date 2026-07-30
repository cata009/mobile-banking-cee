/**
 * Design System specimens for fields, rows, and account surfaces.
 *
 * Extracted verbatim from DesignSystemPage.tsx.
 */
import { useState } from "react";
import { COUNTRIES, COUNTRY_META } from "@/app/registry/demoConfig";
import { getProductsForCountry } from "@/app/config/productConfig";
import { type MoreCardType } from "@/app/config/moreCardsConfig";
import { getDocumentsCountForCountry } from "@/app/config/documentsConfig";
import { AppIcon } from "@/app/components/icons";
import SectionHeadingDivider, { type SectionHeadingDividerVariant } from "@/app/components/SectionHeadingDivider";
import NavigationRow from "@/app/components/NavigationRow";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import ToggleButton from "@/app/components/ToggleButton";
import Pill, { type PillVariant } from "@/app/components/ui/Pill";
import ToastMessage, { type ToastMessageVariant } from "@/app/components/ui/ToastMessage";
import TextField from "@/app/components/TextField";
import AmountField from "@/app/components/AmountField";
import CodeField from "@/app/components/CodeField";
import ProductAccordion from "@/app/components/ProductAccordion";
import ProductAccordionAnimated from "@/app/components/ProductAccordionAnimated";
import ProductCard from "@/app/components/ProductCard";
import { buildFutureCzAccountCardActions } from "@/app/components/productCardFixtures";
import NavigationCardArt from "@/app/components/cards/NavigationCardArt";
import ProductsList from "@/app/components/ProductsList";
import AccountBalanceCard from "@/app/components/accounts/AccountBalanceCard";
import AccountActionBar, { type AccountActionBarItem } from "@/app/components/accounts/AccountActionBar";
import AccountCarouselIndicator from "@/app/components/accounts/AccountCarouselIndicator";
import AccountDetailsInfoField from "@/app/components/accounts/AccountDetailsInfoField";
import AccountTransactionRow from "@/app/components/accounts/AccountTransactionRow";
import AccountTransactionMonthDivider from "@/app/components/accounts/AccountTransactionMonthDivider";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import MessagesMailboxTabs from "@/app/components/messages/MessagesMailboxTabs";
import { ContactsCard } from "@/app/screens/more/cards/ContactsCard";
import { DocumentsCard } from "@/app/screens/more/cards/DocumentsCard";
import { SettingsCard } from "@/app/screens/more/cards/SettingsCard";
import { GdprConsentCard } from "@/app/screens/more/cards/GdprConsentCard";
import { ThirdPartyConsentCard } from "@/app/screens/more/cards/ThirdPartyConsentCard";
import { DigitalActivitiesCard } from "@/app/screens/more/cards/DigitalActivitiesCard";
import { MyRequestsCard } from "@/app/screens/more/cards/MyRequestsCard";
import { TutorialCard } from "@/app/screens/more/cards/TutorialCard";
import { ContactsNavigationCard } from "@/app/screens/contacts/ContactsNavigationCard";
import avatarPhotoSample from "@/assets/kids/woman-profile.png";
import { getAccountIdentity } from "@/data/accountDetails";
import { noop } from "../inspect/MeasurementSurface";
import { VariantSelector, type SelectorOption, type ProductCardEvolutionVariant } from "../specimenShell";
import { accountCardSamples, moreCardLabels } from "../inventoryNav";

function MiniProductIcon() {
  return (
    <div className="flex size-[32px] items-center justify-center rounded-full bg-[var(--uc-action-soft)]">
      <AppIcon name="accounts-coins" size={20} color="var(--uc-action)" />
    </div>
  );
}

export function ProductCardListTotalRowEvolutionSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState<ProductCardEvolutionVariant>("pi-default");
  const productStyle = selectedVariant.startsWith("sme") ? "sme" : "pi";
  const type = selectedVariant.replace(`${productStyle}-`, "");
  const isOpen = type === "open";
  const isAccordion = type === "accordion";
  const surfaceClass = productStyle === "sme" ? "bg-[var(--uc-neutral-200)]" : "bg-[var(--uc-surface)]";
  const accountLabel = productStyle === "sme" ? "Company current account" : "Primary Account";
  const accountNumber = productStyle === "sme" ? "HU72 BACX 0000 8832" : "RO49 BACX 0000 0000";

  const cardA = (
    <ProductCard
      icon={<MiniProductIcon />}
      title={accountLabel}
      accountNumber={accountNumber}
      amount={productStyle === "sme" ? "1,234,567" : "25,678"}
      decimals=",00"
      currency={productStyle === "sme" ? "HUF" : "RON"}
      variant="evolution"
      productStyle={productStyle}
      stackRole={isOpen ? "first" : "single"}
    />
  );
  const cardB = (
    <ProductCard
      icon={<MiniProductIcon />}
      title={productStyle === "sme" ? "VAT account" : "Saving account"}
      accountNumber={productStyle === "sme" ? "HU22 BACX 1111 9910" : "RO22 BACX 1111 1111"}
      thirdLine={productStyle === "sme" ? "Available balance" : undefined}
      amount={productStyle === "sme" ? "765,433" : "20,000"}
      decimals=",00"
      currency={productStyle === "sme" ? "HUF" : "RON"}
      variant="evolution"
      productStyle={productStyle}
      stackRole={isOpen ? "middle" : "single"}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="product-card-list-row-variant-select"
        value={selectedVariant}
        onChange={(value) => setSelectedVariant(value as ProductCardEvolutionVariant)}
        options={[
          { id: "pi-default", label: "PI app / Default" },
          { id: "pi-account-actions", label: "PI app / Account quick actions" },
          { id: "pi-accordion", label: "PI app / Accordion" },
          { id: "pi-open", label: "PI app / Open" },
          { id: "sme-default", label: "SME app / Default" },
          { id: "sme-accordion", label: "SME app / Accordion" },
          { id: "sme-open", label: "SME app / Open" },
        ]}
      />
      <div className={`w-[375px] py-[16px] ${surfaceClass}`}>
        {type === "account-actions" ? (
          <div className="flex flex-col gap-[20px] px-[24px]">
            <div>
              <p className="mb-[8px] text-[12px] font-bold leading-[16px] text-[var(--uc-text-muted)]">
                WITH QUICK ACTIONS
              </p>
              <ProductCard
                icon={<MiniProductIcon />}
                title="Primary Account"
                accountNumber="CZ43 BACX 1234 5678 9012 3401"
                amount="22 850"
                decimals=".50"
                currency="CZK"
                variant="evolution"
                productStyle="pi"
                stackRole="single"
                actions={buildFutureCzAccountCardActions()}
              />
            </div>
            <div>
              <p className="mb-[8px] text-[12px] font-bold leading-[16px] text-[var(--uc-text-muted)]">
                WITHOUT QUICK ACTIONS
              </p>
              <ProductCard
                icon={<MiniProductIcon />}
                title="Primary Account"
                accountNumber="CZ43 BACX 1234 5678 9012 3401"
                amount="22 850"
                decimals=".50"
                currency="CZK"
                variant="evolution"
                productStyle="pi"
                stackRole="single"
              />
            </div>
          </div>
        ) : type === "default" ? (
          <div className="px-[24px]">{cardA}</div>
        ) : (
          <ProductsList
            isOpen={isOpen}
            showTotal={isOpen}
            variant="evolution"
            productStyle={productStyle}
            totalData={{
              integer: productStyle === "sme" ? "2,000,000" : "45,678",
              decimals: ",00",
              currency: productStyle === "sme" ? "HUF" : "RON",
            }}
          >
            {cardA}
            {cardB}
          </ProductsList>
        )}
      </div>
      {isAccordion ? (
        <p className="max-w-[327px] text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
          Closed accordion state shows the first card plus the stacked product shadow.
        </p>
      ) : null}
    </div>
  );
}

function MoreCardPreview({ type }: { type: MoreCardType }) {
  switch (type) {
    case "contacts":
      return <ContactsCard onClick={noop} />;
    case "documents":
      return <DocumentsCard onClick={noop} badgeCount={getDocumentsCountForCountry("RO")} />;
    case "settings":
      return <SettingsCard onClick={noop} />;
    case "gdpr-consent":
      return <GdprConsentCard onClick={noop} />;
    case "third-party-consent":
      return <ThirdPartyConsentCard onClick={noop} />;
    case "digital-activities":
      return <DigitalActivitiesCard onClick={noop} />;
    case "my-requests":
      return <MyRequestsCard onClick={noop} />;
    case "tutorial":
      return <TutorialCard onClick={noop} />;
    default:
      return null;
  }
}

export function TextFieldSpecimens({ withChevron }: { withChevron: boolean }) {
  const [activeValue, setActiveValue] = useState("Textfield");
  const [filledValue, setFilledValue] = useState("Textfield");
  const [selectedVariant, setSelectedVariant] = useState("empty");

  const variants = [
    { id: "empty", label: "Empty" },
    { id: "on-focus", label: "On focus" },
    { id: "filled", label: "Filled" },
    { id: "error-filled", label: "Error (filled)" },
    { id: "error-empty", label: "Error (empty)" },
    { id: "disabled-empty", label: "Disabled (empty)" },
    { id: "disabled-filled", label: "Disabled (filled)" },
    { id: "multiple-filled", label: "Multiple filled" },
  ] satisfies readonly SelectorOption[];

  const baseProps = {
    helperText: "Message",
    helperText2: "Message line 2",
    ...(withChevron ? { trailingIconName: "chevron-down-wide" as const } : {}),
  };

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="text-field-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={variants}
      />
      <div className="w-[327px]">
        {selectedVariant === "empty" ? <TextField label="Title" value="" onChange={noop} visualState="empty" {...baseProps} /> : null}
        {selectedVariant === "on-focus" ? (
          <TextField label="Title" value={activeValue} onChange={setActiveValue} visualState="on-focus" {...baseProps} />
        ) : null}
        {selectedVariant === "filled" ? (
          <TextField label="Title" value={filledValue} onChange={setFilledValue} visualState="filled" {...baseProps} />
        ) : null}
        {selectedVariant === "error-filled" ? (
          <TextField
            label="Title"
            value="Textfield"
            onChange={noop}
            visualState="error-filled"
            errorText="Message"
            errorText2="Message line 2"
            {...(withChevron ? { trailingIconName: "chevron-down-wide" as const } : {})}
          />
        ) : null}
        {selectedVariant === "error-empty" ? (
          <TextField
            label="Title"
            value=""
            onChange={noop}
            visualState="error-empty"
            errorText="Message"
            errorText2="Message line 2"
            {...(withChevron ? { trailingIconName: "chevron-down-wide" as const } : {})}
          />
        ) : null}
        {selectedVariant === "disabled-empty" ? (
          <TextField label="Title" value="" onChange={noop} visualState="disabled-empty" {...baseProps} />
        ) : null}
        {selectedVariant === "disabled-filled" ? (
          <TextField label="Title" value="Textfield" onChange={noop} visualState="disabled-filled" {...baseProps} />
        ) : null}
        {selectedVariant === "multiple-filled" ? (
          <TextField
            label="Title"
            value=""
            onChange={noop}
            visualState="multiple-filled"
            multipleValues={["Textfield", "textfield", "textfield", "textfield"]}
            multipleCount={4}
            {...baseProps}
          />
        ) : null}
      </div>
    </div>
  );
}

export function AmountFieldSpecimens() {
  const [activeValue, setActiveValue] = useState("Insert amount");
  const [filledValue, setFilledValue] = useState("1.250,00");
  const [selectedVariant, setSelectedVariant] = useState("empty");

  const variants = [
    { id: "empty", label: "Empty" },
    { id: "on-focus", label: "On focus" },
    { id: "filled", label: "Filled" },
    { id: "error-filled", label: "Error (filled)" },
    { id: "error-empty", label: "Error (empty)" },
    { id: "disabled-empty", label: "Disabled (empty)" },
    { id: "disabled-filled", label: "Disabled (filled)" },
    { id: "multiple-filled", label: "Multiple filled" },
  ] satisfies readonly SelectorOption[];

  const baseProps = {
    helperText: "Message",
    helperText2: "Message line 2",
    currency: "RSD",
  };

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="amount-field-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={variants}
      />
      <div className="w-[327px]">
        {selectedVariant === "empty" ? <AmountField label="Amount" value="" onChange={noop} visualState="empty" {...baseProps} /> : null}
        {selectedVariant === "on-focus" ? (
          <AmountField label="Amount" value={activeValue} onChange={setActiveValue} visualState="on-focus" {...baseProps} />
        ) : null}
        {selectedVariant === "filled" ? (
          <AmountField label="Amount" value={filledValue} onChange={setFilledValue} visualState="filled" {...baseProps} />
        ) : null}
        {selectedVariant === "error-filled" ? (
          <AmountField
            label="Amount"
            value="1.250,00"
            onChange={noop}
            visualState="error-filled"
            errorText="Message"
            errorText2="Message line 2"
            currency="RSD"
          />
        ) : null}
        {selectedVariant === "error-empty" ? (
          <AmountField
            label="Amount"
            value=""
            onChange={noop}
            visualState="error-empty"
            errorText="Message"
            errorText2="Message line 2"
            currency="RSD"
          />
        ) : null}
        {selectedVariant === "disabled-empty" ? (
          <AmountField label="Amount" value="" onChange={noop} visualState="disabled-empty" {...baseProps} />
        ) : null}
        {selectedVariant === "disabled-filled" ? (
          <AmountField label="Amount" value="1.250,00" onChange={noop} visualState="disabled-filled" {...baseProps} />
        ) : null}
        {selectedVariant === "multiple-filled" ? (
          <AmountField
            label="Amount"
            value=""
            onChange={noop}
            visualState="multiple-filled"
            multipleValues={["1.250,00", "350,00", "2.100,00", "90,00"]}
            multipleCount={4}
            {...baseProps}
          />
        ) : null}
      </div>
    </div>
  );
}

export function CodeFieldSpecimens() {
  const [filledValue, setFilledValue] = useState("1111");
  const [errorValue, setErrorValue] = useState("1111");
  const [selectedVariant, setSelectedVariant] = useState("filled");

  const variants = [
    { id: "filled", label: "Filled" },
    { id: "error", label: "Error" },
    { id: "empty", label: "Empty" },
    { id: "disabled", label: "Disabled" },
  ] satisfies readonly SelectorOption[];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="code-field-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={variants}
      />
      <div className="flex min-h-[128px] w-[327px] items-start justify-center">
        {selectedVariant === "filled" ? (
          <CodeField value={filledValue} onChange={setFilledValue} visualState="filled" ariaLabel="Filled code field specimen" />
        ) : null}
        {selectedVariant === "error" ? (
          <CodeField
            value={errorValue}
            onChange={setErrorValue}
            visualState="error"
            errorText="Message"
            errorText2="Message line 2"
            ariaLabel="Error code field specimen"
          />
        ) : null}
        {selectedVariant === "empty" ? (
          <CodeField value="" onChange={noop} visualState="empty" ariaLabel="Empty code field specimen" />
        ) : null}
        {selectedVariant === "disabled" ? (
          <CodeField value="1111" disabled visualState="disabled" ariaLabel="Disabled code field specimen" />
        ) : null}
      </div>
    </div>
  );
}

export function PillVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState<PillVariant>("primary");
  const variants = [
    { id: "primary", label: "Primary" },
    { id: "secondary", label: "Secondary" },
    { id: "active-counter", label: "Active counter" },
    { id: "loading-counter", label: "Loading counter" },
    { id: "activated", label: "Activated" },
  ] satisfies readonly SelectorOption[];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="pill-variant-select"
        value={selectedVariant}
        onChange={(value) => setSelectedVariant(value as PillVariant)}
        options={variants}
      />
      <div className="flex min-h-[72px] items-center justify-center p-[16px]">
        <Pill variant={selectedVariant} onClick={noop} />
      </div>
    </div>
  );
}

export function ToastMessageVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState<ToastMessageVariant>("action-required");
  const variants = [
    { id: "action-required", label: "Action required / light" },
    { id: "aware", label: "Aware / dark" },
    { id: "google-pay", label: "Google Pay / dark" },
  ] satisfies readonly SelectorOption[];
  const isDarkSurface = selectedVariant !== "action-required";

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="toast-message-variant-select"
        value={selectedVariant}
        onChange={(value) => setSelectedVariant(value as ToastMessageVariant)}
        options={variants}
      />
      <div
        className={`flex min-h-[96px] w-[375px] items-center justify-center rounded-[8px] p-[24px] ${
          isDarkSurface ? "bg-[var(--uc-static-black)]" : "bg-[var(--uc-surface)]"
        }`}
      >
        <ToastMessage variant={selectedVariant} />
      </div>
    </div>
  );
}

export function ToggleButtonVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("checked");
  const checked = selectedVariant === "checked";

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="toggle-button-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "checked", label: "Checked" },
          { id: "unchecked", label: "Unchecked" },
        ]}
      />
      <div className="flex min-h-[60px] items-center">
        <ToggleButton
          ariaLabel="Toggle button specimen"
          checked={checked}
          onToggle={(nextChecked) => setSelectedVariant(nextChecked ? "checked" : "unchecked")}
        />
      </div>
    </div>
  );
}

function NavigationPlaceholderIcon() {
  return <span className="block size-[32px] bg-[var(--uc-neutral-700)]" aria-hidden="true" />;
}

function NavigationFaqIcon() {
  return (
    <span className="flex size-[32px] items-center justify-center" aria-hidden="true">
      <AppIcon name="help-circle" size={16} color="var(--uc-text)" />
    </span>
  );
}

export function NavigationRowVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("icon-title");
  const [toggleChecked, setToggleChecked] = useState(false);

  const cases = [
    { id: "icon-title", label: "Icon / Title" },
    { id: "icon-description", label: "Icon / Description" },
    { id: "icon-cta", label: "Icon / CTA" },
    { id: "icon-readed", label: "Icon / Readed" },
    { id: "icon-prelogin", label: "Icon / Prelogin" },
    { id: "no-icon-title", label: "No icon / Title" },
    { id: "no-icon-description", label: "No icon / Description" },
    { id: "no-icon-cta", label: "No icon / CTA" },
    { id: "toggle-title", label: "Toggle / Title" },
    { id: "toggle-description", label: "Toggle / Description" },
    { id: "toggle-cta", label: "Toggle / CTA" },
    { id: "toggle-title-light", label: "Toggle / Title / Light restyle" },
    { id: "toggle-description-light", label: "Toggle / Description / Light restyle" },
    { id: "toggle-icon-light", label: "Toggle / Icon / Light restyle" },
    { id: "special-card", label: "Special / Card" },
    { id: "special-text-message", label: "Special / Text message" },
    { id: "special-cta", label: "Special / CTA" },
    { id: "special-payment-type", label: "Special / Payment type" },
  ] satisfies readonly SelectorOption[];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="navigation-row-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={cases}
      />
      <div className="w-[375px] bg-[var(--uc-neutral-200)]">
        {selectedVariant === "icon-title" ? (
          <NavigationRow
            title="TITLE LOREM IPSUM TITLE LOREM IPSUM"
            leadingVisual={<NavigationPlaceholderIcon />}
            trailingAccessory="chevron"
            onClick={noop}
          />
        ) : selectedVariant === "icon-description" ? (
          <NavigationRow
            title="TITLE LOREM IPSUM TITLE LOREM IPSUM"
            description="Description Short"
            leadingVisual={<NavigationPlaceholderIcon />}
            trailingAccessory="chevron"
            onClick={noop}
          />
        ) : selectedVariant === "icon-cta" ? (
          <NavigationRow
            title="TITLE LOREM IPSUM"
            linkLabel="CTA"
            leadingVisual={<NavigationPlaceholderIcon />}
            trailingAccessory="chevron"
            onClick={noop}
          />
        ) : selectedVariant === "icon-readed" ? (
          <NavigationRow
            title="TITLE LOREM IPSUM TITLE LOREM IPSUM"
            description="Description Short"
            leadingVisual={<NavigationPlaceholderIcon />}
            trailingAccessory="chevron"
            onClick={noop}
          />
        ) : selectedVariant === "icon-prelogin" ? (
          <NavigationRow
            title="TITLE LOREM IPSUM"
            leadingVisual={<NavigationPlaceholderIcon />}
          />
        ) : selectedVariant === "no-icon-title" ? (
          <NavigationRow
            title="TITLE LOREM IPSUM TITLE LOREM IPSUM"
            trailingAccessory="chevron"
            onClick={noop}
          />
        ) : selectedVariant === "no-icon-description" ? (
          <NavigationRow
            title="TITLE LOREM IPSUM TITLE LOREM IPSUM"
            description="Description Short"
            trailingAccessory="chevron"
            onClick={noop}
          />
        ) : selectedVariant === "no-icon-cta" ? (
          <NavigationRow
            title="TITLE LOREM IPSUM"
            linkLabel="CTA"
            trailingAccessory="chevron"
            onClick={noop}
          />
        ) : selectedVariant === "toggle-title" ? (
          <NavigationRow
            title="TITLE LOREM IPSUM TITLE LOREM IPSUM"
            trailingAccessory="toggle"
            toggleChecked={toggleChecked}
            onToggle={setToggleChecked}
          />
        ) : selectedVariant === "toggle-description" ? (
          <NavigationRow
            title="TITLE LOREM IPSUM TITLE LOREM IPSUM"
            description="Description Short"
            trailingAccessory="toggle"
            toggleChecked={toggleChecked}
            onToggle={setToggleChecked}
          />
        ) : selectedVariant === "toggle-cta" ? (
          <NavigationRow
            title="TITLE LOREM IPSUM"
            linkLabel="CTA"
            trailingAccessory="toggle"
            toggleChecked={toggleChecked}
            onToggle={setToggleChecked}
          />
        ) : selectedVariant === "toggle-title-light" ? (
          <NavigationRow
            title="LOREM IPSUM"
            leadingVisual={<NavigationFaqIcon />}
            trailingAccessory="toggle"
            toggleChecked={toggleChecked}
            onToggle={setToggleChecked}
          />
        ) : selectedVariant === "toggle-description-light" ? (
          <NavigationRow
            title="LOREM IPSUM"
            description="Lorem ipsum"
            leadingVisual={<NavigationFaqIcon />}
            trailingAccessory="toggle"
            toggleChecked={toggleChecked}
            onToggle={setToggleChecked}
          />
        ) : selectedVariant === "toggle-icon-light" ? (
          <NavigationRow
            title="LOREM IPSUM"
            leadingVisual={<NavigationPlaceholderIcon />}
            trailingAccessory="toggle"
            toggleChecked={toggleChecked}
            onToggle={setToggleChecked}
          />
        ) : selectedVariant === "special-card" ? (
          <NavigationRow
            title="TITLE LOREM IPSUM"
            description="Description Short"
            leadingVisual={<NavigationCardArt />}
            trailingAccessory="chevron"
            onClick={noop}
          />
        ) : selectedVariant === "special-text-message" ? (
          <NavigationRow
            title="NO TRANSACTION YET 🧐"
            rowHeight={64}
            centerContent
            titleClassName="uc-type-n5-strong"
          />
        ) : selectedVariant === "special-cta" ? (
          <NavigationRow
            title="SHOW MORE"
            rowHeight={64}
            centerContent
            titleTone="action"
            titleClassName="uc-type-n5-strong"
            onClick={noop}
          />
        ) : (
          <NavigationRow
            title="PAYMENT TYPE"
            rowHeight={64}
            leadingIconName="transaction-transfer"
            trailingAccessory="toggle"
            toggleChecked={toggleChecked}
            onToggle={setToggleChecked}
          />
        )}
      </div>
    </div>
  );
}

export function ProfileAvatarVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("photo-full");

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="profile-avatar-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "photo-full", label: "Photo full" },
          { id: "photo-profile", label: "Photo + dot" },
          { id: "initials", label: "Initials" },
          { id: "ai", label: "AI avatar" },
        ]}
      />
      <div className="flex min-h-[72px] items-center rounded-[8px] bg-[var(--uc-app-bg)] px-[16px]">
        {selectedVariant === "photo-full" ? (
          <ProfileAvatar
            ariaLabel="Profile avatar photo full specimen"
            imageAlt="Profile avatar sample"
            imageSrc={avatarPhotoSample}
            variant="photo"
          />
        ) : selectedVariant === "photo-profile" ? (
          <ProfileAvatar
            ariaLabel="Profile avatar profile specimen"
            imageAlt="Profile avatar sample"
            imageSrc={avatarPhotoSample}
            photoStyle="profile"
            showNotification
            variant="photo"
          />
        ) : selectedVariant === "initials" ? (
          <ProfileAvatar ariaLabel="Profile avatar initials specimen" initials="MR" variant="initials" />
        ) : (
          <ProfileAvatar ariaLabel="Profile avatar AI specimen" variant="ai" />
        )}
      </div>
    </div>
  );
}

export function AccountBalanceCardCountrySpecimen() {
  const [selectedCountry, setSelectedCountry] = useState<(typeof COUNTRIES)[number]>(COUNTRIES[0]);
  const sample = accountCardSamples[selectedCountry];
  const countryMeta = COUNTRY_META[selectedCountry];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="account-balance-country-select"
        label="Country"
        value={selectedCountry}
        onChange={setSelectedCountry}
        options={COUNTRIES.map((country) => ({ id: country, label: `${COUNTRY_META[country].nameEN} / ${COUNTRY_META[country].currency}` }))}
      />
      <div className="flex flex-col gap-2">
        <p className="font-['UniCredit',sans-serif] text-[13px] font-bold text-[var(--uc-text-muted)]">
          {countryMeta.nameEN} / {countryMeta.currency}
        </p>
        <AccountBalanceCard
          account={getAccountIdentity(selectedCountry, 0)}
          availableInteger={sample.integer}
          availableDecimals={sample.decimals}
          currency={countryMeta.currency}
          currentBalance={sample.current}
          showSubAccount={false}
        />
      </div>
    </div>
  );
}

export function AccountActionBarVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("4-elements");
  const actions: AccountActionBarItem[] = [
    { id: "details", iconName: "account-details", label: "Details" },
    { id: "options", iconName: "account-options", label: "Options" },
    { id: "add-money", iconName: "add-money", label: "Add money" },
    { id: "mcash", iconName: "mcash", label: "mCash" },
  ];
  const variantItems: Record<string, AccountActionBarItem[]> = {
    "4-elements": actions,
    "3-elements": actions.map((item) => item.id === "add-money" ? { ...item, hidden: true } : item),
    "2-elements": actions.map((item) => item.id === "options" || item.id === "add-money" ? { ...item, hidden: true } : item),
    "1-element": actions.map((item) => item.id === "mcash" ? item : { ...item, hidden: true }),
  };

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="account-action-bar-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "4-elements", label: "4 elements" },
          { id: "3-elements", label: "3 elements" },
          { id: "2-elements", label: "2 elements" },
          { id: "1-element", label: "1 element" },
        ]}
      />
      <div className="flex w-[375px] flex-col gap-[16px] bg-[var(--uc-app-bg)]">
        <AccountActionBar items={variantItems[selectedVariant]} />
      </div>
    </div>
  );
}

export function AccountCarouselIndicatorVariantSpecimen() {
  const variants = [
    { id: "4-first", label: "4 items / first", count: 4, activeIndex: 0 },
    { id: "4-next", label: "4 items / next", count: 4, activeIndex: 1 },
    { id: "4-more", label: "4 items / further", count: 4, activeIndex: 2 },
    { id: "4-last", label: "4 items / last", count: 4, activeIndex: 3 },
    { id: "7-first", label: "7 items / first", count: 7, activeIndex: 0 },
    { id: "7-next", label: "7 items / next", count: 7, activeIndex: 1 },
    { id: "7-more", label: "7 items / further", count: 7, activeIndex: 3 },
    { id: "7-last", label: "7 items / last", count: 7, activeIndex: 6 },
  ] as const satisfies readonly [SelectorOption & { count: number; activeIndex: number }, ...(SelectorOption & { count: number; activeIndex: number })[]];
  type AccountCarouselVariant = (typeof variants)[number]["id"];
  const variantsById = {
    "4-first": variants[0],
    "4-next": variants[1],
    "4-more": variants[2],
    "4-last": variants[3],
    "7-first": variants[4],
    "7-next": variants[5],
    "7-more": variants[6],
    "7-last": variants[7],
  } satisfies Record<AccountCarouselVariant, (typeof variants)[number]>;
  const [selectedVariant, setSelectedVariant] = useState<AccountCarouselVariant>("4-first");
  const activeVariant = variantsById[selectedVariant];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="account-carousel-indicator-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={variants}
      />
      <div className="flex w-[375px] flex-col gap-3 py-4">
        <AccountCarouselIndicator
          count={activeVariant.count}
          activeIndex={activeVariant.activeIndex}
          onSelect={noop}
        />
      </div>
    </div>
  );
}

export function AccountDetailsInfoFieldVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("with-icon");

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="account-details-info-field-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "with-icon", label: "Trailing icon" },
          { id: "default", label: "Default row" },
        ]}
      />
      <div className="flex w-[327px] flex-col bg-[var(--uc-surface)]">
        {selectedVariant === "with-icon" ? (
          <AccountDetailsInfoField
            title="Account number"
            subtitle="1234567890123456"
            trailingIcon={<AppIcon name="copy-documents" color="var(--uc-text)" />}
          />
        ) : (
          <AccountDetailsInfoField title="Available funds" subtitle="614,83 RON" />
        )}
      </div>
    </div>
  );
}

export function AccountSearchBarVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("default");

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="account-search-bar-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "default", label: "Default" },
          { id: "filled", label: "Filled / clear state" },
          { id: "filters-active", label: "Active / remove filters" },
        ]}
      />
      <div className="flex w-[375px] flex-col gap-[12px] bg-[var(--uc-surface)]">
        {selectedVariant === "default" ? (
          <AccountSearchBar />
        ) : selectedVariant === "filled" ? (
          <AccountSearchBar value="Carrefour" onValueChange={noop} />
        ) : (
          <AccountSearchBar filtersActive onFilterClick={noop} onRemoveFilters={noop} />
        )}
      </div>
    </div>
  );
}

export function MessagesMailboxTabsVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("inbox-new");
  const activeTabId = selectedVariant === "outbox" ? "outbox" : "inbox";
  const inboxHasNewItems = selectedVariant === "inbox-new";

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="messages-mailbox-tabs-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "inbox-new", label: "Inbox active / new" },
          { id: "inbox", label: "Inbox active / no new" },
          { id: "outbox", label: "Outbox active" },
        ]}
      />
      <div className="w-[375px] bg-[var(--uc-surface)]">
        <MessagesMailboxTabs
          tabs={[
            { id: "inbox", label: "Inbox", hasNewItems: inboxHasNewItems },
            { id: "outbox", label: "Outbox" },
          ]}
          activeTabId={activeTabId}
          onChange={(tabId) => setSelectedVariant(tabId)}
        />
      </div>
    </div>
  );
}

export function AccountTransactionRowVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("credit");
  const isCredit = selectedVariant === "credit";

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="account-transaction-row-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "credit", label: "Credit" },
          { id: "debit", label: "Debit" },
        ]}
      />
      <div className="w-[375px] bg-[var(--uc-surface)]">
        <AccountTransactionMonthDivider title="APRIL 2026" total="-24.318,15" currency="RON" />
        <div className="pt-[16px]">
          <AccountTransactionRow
            transaction={{
              id: isCredit ? "sample-credit" : "sample-debit",
              day: isCredit ? "11" : "09",
              month: "APR",
              monthKey: "2026-04",
              monthTitle: "APRIL 2026",
              label: "Transfer",
              amount: isCredit ? 25902.92 : -900,
              type: isCredit ? "credit" : "debit",
              category: "Transfers",
              pfmCategory: "Transfers",
              pfmSubcategory: isCredit ? "Incoming transfer" : "Outgoing transfer",
              status: "Booked",
            }}
            formattedAmount={isCredit ? "25.902,92" : "900,00"}
            currency="RON"
          />
        </div>
      </div>
    </div>
  );
}

export function MoreCardVariantSpecimen() {
  const options = Object.keys(moreCardLabels).map((type) => ({
    id: type,
    label: moreCardLabels[type as MoreCardType],
  })) satisfies readonly SelectorOption[];
  const [selectedType, setSelectedType] = useState(options[0]?.id ?? "contacts");

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="more-card-variant-select"
        value={selectedType}
        onChange={setSelectedType}
        options={options}
      />
      <div className="w-[164px]">
        <MoreCardPreview type={selectedType as MoreCardType} />
      </div>
    </div>
  );
}

export function ContactsNavigationCardVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("prime");
  const icon = selectedVariant as "prime" | "location" | "time" | "phone" | "block" | "email" | "website" | "youtube" | "x";

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="contacts-navigation-card-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "prime", label: "Prime / chevron" },
          { id: "location", label: "Location" },
          { id: "time", label: "Time / subtitle" },
          { id: "phone", label: "Phone / value" },
          { id: "block", label: "Block card" },
          { id: "email", label: "Email" },
          { id: "website", label: "Website" },
          { id: "youtube", label: "YouTube" },
          { id: "x", label: "X" },
        ]}
      />
      <div className="w-[375px]">
        <SectionHeadingDivider title="BANK CONTACTS" />
        <ContactsNavigationCard
          icon={icon}
          title={icon.toUpperCase()}
          value={icon === "phone" ? "+420 221 210 031" : undefined}
          subtitle={icon === "time" ? "Mon - Sun | 07:00 - 22:00" : undefined}
          hasChevron={icon === "prime"}
          onClick={noop}
        />
      </div>
    </div>
  );
}

const sectionHeadingDividerVariants = [
  { id: "small-title-data", label: "Small title + data", title: "UPCOMING PAYMENTS", secondaryText: "30,000.00 RSD" },
  { id: "small-two-line-title-data", label: "Small 2 lines + data", title: "UPCOMING PAYMENTS\nON TWO LINES", secondaryText: "30,000.00 RSD" },
  { id: "medium-title", label: "Medium title", title: "TITLE" },
  { id: "with-counter", label: "With counter", title: "TITLE", count: 18 },
  { id: "medium-two-line-title", label: "Medium 2 lines title", title: "TITLE HERE IS SO LONG THAT\nCAN BE USED ON TWO LINES" },
  { id: "large-title", label: "Large title", title: "November" },
  { id: "large-two-line-title", label: "Large 2 lines title", title: "Your monthly Report", secondaryText: "for October 2018" },
  { id: "action-date", label: "Action + date", title: "SELECT ALL", secondaryText: "DD/MM/YY - DD/MM/YY" },
  { id: "name-action", label: "Name + Action", title: "PAYMENT DETAILS 2", secondaryText: "REMOVE" },
  { id: "action-date-checkbox", label: "Action + date v2", title: "SELECT ALL", secondaryText: "DD/MM/YY - DD/MM/YY" },
  { id: "light-title", label: "Light Restyle / Title", title: "ALL PRODUCTS", secondaryText: "N" },
  { id: "light-date", label: "Light Restyle / Date", title: "15 JULY 2022" },
  { id: "light-small-title-data", label: "Light Restyle / Small + data", title: "TRANSACTION FEE", secondaryText: "500,00 CZK" },
] as const satisfies readonly [SelectorOption<Exclude<SectionHeadingDividerVariant, "section">> & {
  title: string;
  secondaryText?: string;
  count?: number;
}, ...(SelectorOption<Exclude<SectionHeadingDividerVariant, "section">> & {
  title: string;
  secondaryText?: string;
  count?: number;
})[]];

type SectionHeadingDividerSpecimen = SelectorOption<Exclude<SectionHeadingDividerVariant, "section">> & {
  title: string;
  secondaryText?: string;
  count?: number;
};

type SectionHeadingDividerSpecimenId = (typeof sectionHeadingDividerVariants)[number]["id"];

const sectionHeadingDividerVariantsById = {
  "small-title-data": sectionHeadingDividerVariants[0],
  "small-two-line-title-data": sectionHeadingDividerVariants[1],
  "medium-title": sectionHeadingDividerVariants[2],
  "with-counter": sectionHeadingDividerVariants[3],
  "medium-two-line-title": sectionHeadingDividerVariants[4],
  "large-title": sectionHeadingDividerVariants[5],
  "large-two-line-title": sectionHeadingDividerVariants[6],
  "action-date": sectionHeadingDividerVariants[7],
  "name-action": sectionHeadingDividerVariants[8],
  "action-date-checkbox": sectionHeadingDividerVariants[9],
  "light-title": sectionHeadingDividerVariants[10],
  "light-date": sectionHeadingDividerVariants[11],
  "light-small-title-data": sectionHeadingDividerVariants[12],
} satisfies Record<SectionHeadingDividerSpecimenId, SectionHeadingDividerSpecimen>;

export function SectionHeadingDividerVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState<SectionHeadingDividerSpecimenId>(sectionHeadingDividerVariants[0].id);
  const activeVariant: SectionHeadingDividerSpecimen = sectionHeadingDividerVariantsById[selectedVariant];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="section-heading-divider-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={sectionHeadingDividerVariants}
      />
      <div className="flex min-h-[96px] w-[375px] items-start bg-[var(--uc-app-bg)] py-[16px]">
        <SectionHeadingDivider
          variant={activeVariant.id}
          title={activeVariant.title}
          secondaryText={activeVariant.secondaryText}
          count={activeVariant.count}
        />
      </div>
    </div>
  );
}

export function ProductAccordionCountrySpecimen({
  animated = false,
}: {
  animated?: boolean;
}) {
  const [selectedCountry, setSelectedCountry] = useState<(typeof COUNTRIES)[number]>(COUNTRIES[0]);

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id={animated ? "product-accordion-animated-country-select" : "product-accordion-country-select"}
        label="Country"
        value={selectedCountry}
        onChange={setSelectedCountry}
        options={COUNTRIES.map((country) => ({ id: country, label: COUNTRY_META[country].nameEN }))}
      />
      <div className="w-[375px] rounded-[8px] border border-[color-mix(in_srgb,var(--uc-static-white)_20%,transparent)] p-6">
        <p className="mb-5 font-['UniCredit:Bold',sans-serif] text-[var(--uc-static-white)]">{COUNTRY_META[selectedCountry].nameEN}</p>
        {animated ? (
          <ProductAccordionAnimated
            welcomeText={COUNTRY_META[selectedCountry].nameEN}
            products={getProductsForCountry(selectedCountry)}
            findOutMoreText="FIND OUT MORE"
          />
        ) : (
          <ProductAccordion products={getProductsForCountry(selectedCountry)} />
        )}
      </div>
    </div>
  );
}
