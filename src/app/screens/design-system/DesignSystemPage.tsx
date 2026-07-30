import { useEffect, useRef, useState } from "react";
import { SECTION_HEADING_DIVIDER_SOURCE } from "@/app/components/SectionHeadingDivider";
import { NAVIGATION_ROW_SOURCE } from "@/app/components/NavigationRow";
import { PROFILE_AVATAR_SOURCE } from "@/app/components/ProfileAvatar";
import { TOGGLE_BUTTON_SOURCE } from "@/app/components/ToggleButton";
import LanguageSelectorButton from "@/app/components/ui/LanguageSelectorButton";
import LinkButton from "@/app/components/ui/LinkButton";
import { BAR_SOURCE } from "@/app/components/ui/Bar";
import { DATE_FILTER_SOURCE } from "@/app/components/ui/DateFilter";
import NavigationLink from "@/app/components/ui/NavigationLink";
import { PILL_SORTING_SOURCE } from "@/app/components/ui/PillSorting";
import PreLoginHeading from "@/app/components/ui/PreLoginHeading";
import { TOAST_MESSAGE_SOURCE } from "@/app/components/ui/ToastMessage";
import { WALLET_BUTTON_SOURCE } from "@/app/components/ui/WalletButton";
import { PRODUCT_CARD_EVOLUTION_SOURCE } from "@/app/components/ProductCard";
import { CARD_SOURCE } from "@/app/components/cards/Card";
import { GHOST_BANNER_SOURCE } from "@/app/components/cards/GhostBanner";
import { INFO_BANNER_SOURCE } from "@/app/components/cards/InfoBanner";
import { USER_EVENT_CARD_SOURCE } from "@/app/components/cards/UserEventCard";
import { HELPER_CARD_SOURCE } from "@/app/components/cards/HelperCard";
import { PENDING_ACTION_CARD_SOURCE } from "@/app/components/cards/PendingActionCard";
import CardComponent, { CARD_COMPONENT_SOURCE } from "@/app/components/cards/CardComponent";
import { SHOPSMART_OFFER_CARD_SOURCE } from "@/app/components/shopsmart/ShopsmartOfferCard";
import { ACCOUNT_SEARCH_BAR_SOURCE } from "@/app/components/accounts/AccountSearchBar";
import FloatingCoAppingButton from "@/app/components/FloatingCoAppingButton";
import { LogoutConfirmDialog } from "@/app/components/LogoutConfirmDialog";
import PanelWithTranslations from "@/app/components/PanelWithTranslations";
import PanelWithoutCoAppingTranslations from "@/app/components/PanelWithoutCoAppingTranslations";
import { Button } from "@/app/components/ui/button";
import { noop } from "./inspect/MeasurementSurface";
import { InventorySearchField, Section, Specimen } from "./specimenShell";
import { getDefaultSectionForInventoryTab, getInventoryTabForHash, getSectionForHash, inventorySectionLinks, inventoryTabLabels, parseComponentDetailHash, type InventoryTab } from "./inventoryNav";
import { ShadcnSpecimens } from "./shadcnSpecimens";
import { ColorInventory, IconInventory, TypographyInventory } from "./inventories";
import ComponentDetailScreen from "./ComponentDetailScreen";
import { TemplateInventory } from "./templateInventory";
import { BarVariantSpecimen, BottomNavigationVariantSpecimen, ButtonRegistryVariantSpecimen, CardVariantSpecimen, DateFilterVariantSpecimen, GhostBannerVariantSpecimen, HelperCardVariantSpecimen, HomeHeaderSpecimen, InfoBannerVariantSpecimen, InvestmentsFundBannerVariantSpecimen, MoreHeaderSpecimen, PageHeaderSpecimen, PaymentHeroCardVariantSpecimen, PendingActionCardVariantSpecimen, PillSortingVariantSpecimen, PrimaryButtonVariantSpecimen, ProductMenuCardVariantSpecimen, ProductOfferCardVariantSpecimen, RadioButtonVariantSpecimen, ShopsmartOfferCardVariantSpecimen, StatusBarVariantSpecimen, UserEventCardVariantSpecimen, WalletButtonVariantSpecimen } from "./specimens/cardSpecimens";
import { AccountActionBarVariantSpecimen, AccountBalanceCardCountrySpecimen, AccountCarouselIndicatorVariantSpecimen, AccountDetailsInfoFieldVariantSpecimen, AccountSearchBarVariantSpecimen, AccountTransactionRowVariantSpecimen, AmountFieldSpecimens, CodeFieldSpecimens, ContactsNavigationCardVariantSpecimen, MessagesMailboxTabsVariantSpecimen, MoreCardVariantSpecimen, NavigationRowVariantSpecimen, PillVariantSpecimen, ProductAccordionCountrySpecimen, ProductCardListTotalRowEvolutionSpecimen, ProfileAvatarVariantSpecimen, SectionHeadingDividerVariantSpecimen, TextFieldSpecimens, ToastMessageVariantSpecimen, ToggleButtonVariantSpecimen } from "./specimens/fieldSpecimens";

export default function DesignSystemPage() {
  const [showLogout, setShowLogout] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const componentsContentRef = useRef<HTMLDivElement | null>(null);
  const [componentSearchQuery, setComponentSearchQuery] = useState("");
  const [inventoryTab, setInventoryTab] = useState<InventoryTab>(() => {
    if (typeof window === "undefined") return "components";
    return getInventoryTabForHash(window.location.hash);
  });
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window === "undefined") return getDefaultSectionForInventoryTab("components");
    return getSectionForHash(window.location.hash);
  });
  const [detailComponentId, setDetailComponentId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return parseComponentDetailHash(window.location.hash);
  });
  const sectionLinks = inventorySectionLinks[inventoryTab];
  const handleInventoryTabChange = (nextTab: InventoryTab) => {
    const nextSectionId = getDefaultSectionForInventoryTab(nextTab);
    setInventoryTab(nextTab);
    setActiveSection(nextSectionId);
    window.history.replaceState(null, "", `#${nextSectionId}`);
    window.requestAnimationFrame(() => {
      document.getElementById(nextSectionId)?.scrollIntoView({ block: "start" });
    });
  };

  useEffect(() => {
    const syncInventoryTabFromHash = () => {
      setDetailComponentId(parseComponentDetailHash(window.location.hash));
      setInventoryTab(getInventoryTabForHash(window.location.hash));
      setActiveSection(getSectionForHash(window.location.hash));
    };

    syncInventoryTabFromHash();
    window.addEventListener("hashchange", syncInventoryTabFromHash);
    return () => window.removeEventListener("hashchange", syncInventoryTabFromHash);
  }, []);

  const closeComponentDetail = () => {
    const restoreSection = activeSection ?? "headers";
    setDetailComponentId(null);
    window.history.replaceState(null, "", `#${restoreSection}`);
    window.requestAnimationFrame(() => {
      document.getElementById(restoreSection)?.scrollIntoView({ block: "start" });
    });
  };

  // Reset the scroll position to the top whenever a component detail page opens,
  // so the user lands on the header instead of inheriting the scroll offset they
  // had on the specimen grid (where they clicked "Details").
  useEffect(() => {
    if (!detailComponentId) return;
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    scrollContainer.scrollTo({ top: 0 });
  }, [detailComponentId]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const sections = sectionLinks
      .map(([id]) => document.getElementById(id))
      .filter((section): section is HTMLElement => section instanceof HTMLElement);

    const firstSection = sections[0];
    if (!firstSection) return;
    const lastSection = sections[sections.length - 1];
    if (!lastSection) return;

    let frameId = 0;

    const updateActiveSectionFromScroll = () => {
      frameId = 0;

      const containerRect = scrollContainer.getBoundingClientRect();
      const activationLine = containerRect.top + 148;
      const nearBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 24;

      let nextActiveSection = firstSection.id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= activationLine) {
          nextActiveSection = section.id;
          continue;
        }
        break;
      }

      if (nearBottom) {
        nextActiveSection = lastSection.id;
      }

      setActiveSection((current) => {
        if (current === nextActiveSection) return current;
        if (window.location.hash !== `#${nextActiveSection}`) {
          window.history.replaceState(null, "", `#${nextActiveSection}`);
        }
        return nextActiveSection;
      });
    };

    const requestActiveSectionSync = () => {
      if (frameId !== 0) return;
      frameId = window.requestAnimationFrame(updateActiveSectionFromScroll);
    };

    requestActiveSectionSync();
    scrollContainer.addEventListener("scroll", requestActiveSectionSync, { passive: true });
    window.addEventListener("resize", requestActiveSectionSync);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      scrollContainer.removeEventListener("scroll", requestActiveSectionSync);
      window.removeEventListener("resize", requestActiveSectionSync);
    };
  }, [sectionLinks]);

  // Filter component specimens by name. Hides non-matching specimen cards and
  // hides any section whose specimens are all hidden. Operates on the rendered
  // DOM via data-ds-specimen so the static JSX sections stay untouched.
  useEffect(() => {
    const root = componentsContentRef.current;
    if (!root) return;
    const normalizedQuery = componentSearchQuery.trim().toLowerCase();
    const sections = Array.from(root.querySelectorAll<HTMLElement>("section[id]"));
    for (const section of sections) {
      const specimens = Array.from(section.querySelectorAll<HTMLElement>("[data-ds-specimen]"));
      let visibleCount = 0;
      for (const specimen of specimens) {
        const name = (specimen.getAttribute("data-ds-specimen") ?? "").toLowerCase();
        const matches = normalizedQuery === "" || name.includes(normalizedQuery);
        specimen.style.display = matches ? "" : "none";
        if (matches) visibleCount += 1;
      }
      section.style.display = normalizedQuery === "" || visibleCount > 0 ? "" : "none";
    }
  }, [componentSearchQuery, inventoryTab, detailComponentId]);

  return (
    <div ref={scrollContainerRef} className="h-full w-full self-stretch overflow-y-auto bg-[var(--uc-surface-muted)] text-[var(--uc-text)]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[24px] px-6 py-8 xl:px-8">
        {/* Horizontal tabs (Flows-style) */}
        <div className="flex flex-wrap gap-[8px] border-b border-[var(--uc-border)]" role="tablist" aria-label="Design system inventory tabs">
          {(["components", "templates", "icons", "colors", "typography"] as const).map((tab) => {
            const isActive = inventoryTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleInventoryTabChange(tab)}
                className={`relative min-h-[44px] px-[18px] text-[14px] font-bold leading-[18px] transition-colors ${
                  isActive ? "text-[var(--uc-text)]" : "text-[var(--uc-text-muted)] hover:text-[var(--uc-action)]"
                }`}
              >
                {inventoryTabLabels[tab]}
                {isActive ? <span className="absolute inset-x-[10px] bottom-0 h-[3px] rounded-t-[3px] bg-[var(--uc-action)]" /> : null}
              </button>
            );
          })}
        </div>

        <main className="min-w-0 flex-1">
          {detailComponentId ? (
            <ComponentDetailScreen
              componentId={detailComponentId}
              onBack={closeComponentDetail}
            />
          ) : inventoryTab === "templates" ? (
            <TemplateInventory />
          ) : inventoryTab === "icons" ? (
            <IconInventory />
          ) : inventoryTab === "colors" ? (
            <ColorInventory />
          ) : inventoryTab === "typography" ? (
            <TypographyInventory />
          ) : (
            <div ref={componentsContentRef}>
            <div className="sticky top-0 z-20 -mx-6 mb-2 bg-[var(--uc-surface-muted)] px-6 py-3 xl:-mx-8 xl:px-8">
            <InventorySearchField
              value={componentSearchQuery}
              onChange={setComponentSearchQuery}
              placeholder="Search components"
              label="Search components"
            />
            <div className="flex flex-wrap gap-2 pt-3" role="tablist" aria-label="Component sections">
              {sectionLinks.map(([id, label]) => {
                const isActive = activeSection === id;
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`rounded-full border px-4 py-2 text-left text-[13px] transition-colors ${
                      isActive
                        ? "border-[var(--uc-action)] bg-[var(--uc-action)] text-[var(--uc-static-white)]"
                        : "border-[var(--uc-border)] bg-[var(--uc-app-bg)] text-[var(--uc-text-muted)] hover:border-[var(--uc-action)]"
                    }`}
                  >
                    <span className="font-['UniCredit:Bold',sans-serif]">{label}</span>
                  </a>
                );
              })}
            </div>
            </div>
          <Section id="headers" title="Headers" description="Active header components and their variants, isolated from the current app screens.">
            <div className="grid gap-5 lg:grid-cols-2">
              <PageHeaderSpecimen />
              <HomeHeaderSpecimen />
              <MoreHeaderSpecimen />
              <StatusBarVariantSpecimen />
            </div>
          </Section>

          <Section id="navigation" title="Navigation" description="Navigation menus and links, including bottom navigation across every active tab.">
            <div className="grid gap-5 lg:grid-cols-2">
              <Specimen name="BottomNavigation / all active states" source="components/BottomNavigation.tsx" specs={["container 375x54", "icons 32px", "labels 14px / 15px line", "active bar 24x2", "0 gap bar/icon/label"]} detailsHref="#component/shell.bottom-navigation">
                <BottomNavigationVariantSpecimen />
              </Specimen>
              <Specimen
                name="Divider"
                source="components/SectionHeadingDivider.tsx"
                note={`${SECTION_HEADING_DIVIDER_SOURCE.schema} / ${SECTION_HEADING_DIVIDER_SOURCE.sourceNodeIds.menigaDivider}`}
                specs={["13 mapped Meniga states", "375px standard width", "343px Light Restyle width", "14px N5 strong labels", "20px N2 large titles", "1px divider line", "action/counter/data variants"]}
                detailsHref="#component/ui.section-heading-divider"
              >
                <SectionHeadingDividerVariantSpecimen />
              </Specimen>
              <Specimen
                name="Bar"
                source="components/ui/Bar.tsx"
                note={`${BAR_SOURCE.schema} / ${BAR_SOURCE.sourceNodeId}`}
                specs={["6 mapped statuses", "375x8 standard states", "24px left inset", "teal active fill", "279x1 thin state"]}
                detailsHref="#component/ui.bar"
              >
                <BarVariantSpecimen />
              </Specimen>
              <div className="grid gap-5 lg:grid-cols-2">
                <Specimen name="LanguageSelectorButton" source="components/ui/LanguageSelectorButton.tsx" tone="dark" detailsHref="#component/ui.language-selector-button">
                  <LanguageSelectorButton onClick={noop} language="en" />
                </Specimen>
                <Specimen name="NavigationLink" source="components/ui/NavigationLink.tsx" tone="dark" detailsHref="#component/ui.navigation-link">
                  <NavigationLink text="FIND OUT MORE" onClick={noop} />
                </Specimen>
                <Specimen name="Prelogin" source="components/ui/PreLoginHeading.tsx" tone="dark" detailsHref="#component/ui.prelogin-heading">
                  <div className="w-[327px]"><PreLoginHeading h1="New look, & more services." h2="Open an account" h3="Open an account quickly and easily from the comfort of your home." /></div>
                </Specimen>
                <Specimen name="RadioButton" source="components/common/RadioButton.tsx" detailsHref="#component/ui.radio-button">
                  <RadioButtonVariantSpecimen />
                </Specimen>
              </div>
            </div>
          </Section>

          <Section id="buttons" title="Buttons" description="Custom button components and shared UI registry variants.">
            <div className="grid gap-5 lg:grid-cols-2">
              <Specimen name="Primary button" source="components/PrimaryButton.tsx + components/ui/PrimaryButton.tsx" specs={["327x48", "radius 4px", "Primary Action / Light", "Primary Action / Dark", "16px bold label"]} detailsHref="#component/ui.primary-button">
                {() => <PrimaryButtonVariantSpecimen />}
              </Specimen>
              <Specimen name="Link button" source="components/ui/LinkButton.tsx" specs={["flex w-fit", "text-chevron gap 0", "label 13px bold uppercase / 16px line", "chevron-link 24px", "uses current action color"]} detailsHref="#component/ui.link-button">
                <div className="flex min-h-[72px] items-center justify-center rounded-[8px] bg-[var(--uc-surface)] p-[16px]">
                  <LinkButton onClick={noop}>SEE MORE TRANSACTIONS</LinkButton>
                </div>
              </Specimen>
              <Specimen
                name="Wallet buttons"
                source="components/ui/WalletButton.tsx"
                note={`${WALLET_BUTTON_SOURCE.schema} / ${WALLET_BUTTON_SOURCE.sourceNodeIds.googleWallet} · ${WALLET_BUTTON_SOURCE.sourceNodeIds.appleWallet} · ${WALLET_BUTTON_SOURCE.sourceNodeIds.clickToPay}`}
                specs={["Google wallet", "Apple wallet", "Click to Pay", "48px height", "condensed and 327px long states", "Google EN/HU/SK/CZ labels"]}
                detailsHref="#component/ui.wallet-button"
              >
                <WalletButtonVariantSpecimen />
              </Specimen>
              <Specimen name="Pill" source="components/ui/Pill.tsx" specs={["120x36", "18px radius", "8px horizontal padding", "N5 bold 14px label", "0 2 2 shadow", "16px success/loading icons", "8px icon-label gap"]} detailsHref="#component/ui.pill">
                <PillVariantSpecimen />
              </Specimen>
              <Specimen name="Button registry variants" source="components/ui/button.tsx" detailsHref="#component/ui.button-registry">
                <ButtonRegistryVariantSpecimen />
              </Specimen>
              <Specimen name="Floating Co-Apping Button" source="components/FloatingCoAppingButton.tsx" detailsHref="#component/co-apping.floating-button">
                <div className="relative h-[170px] w-[120px] rounded border bg-[var(--uc-app-bg)]">
                  <FloatingCoAppingButton onClick={noop} />
                </div>
              </Specimen>
            </div>
          </Section>

          <Section id="forms" title="Forms and controls" description="Custom inputs and reusable control primitives that can be consolidated.">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="grid gap-5 lg:grid-cols-2">
                <Specimen name="Dropdown" source="components/TextField.tsx" detailsHref="#component/ui.text-field">
                  <TextFieldSpecimens withChevron />
                </Specimen>
                <Specimen name="Text field" source="components/TextField.tsx" detailsHref="#component/ui.text-field">
                  <TextFieldSpecimens withChevron={false} />
                </Specimen>
                <Specimen
                  name="Amount field"
                  source="components/AmountField.tsx"
                  specs={["same states as Text field", "24px text-to-currency gap", "currency title 14px", "currency value 18px", "chevron 32x32 / 0 gap"]}
                  detailsHref="#component/ui.amount-field"
                >
                  <AmountFieldSpecimens />
                </Specimen>
                <Specimen
                  name="Code field"
                  source="components/CodeField.tsx"
                  specs={["327px wrapper", "224px centered slot row", "4 slots 44x64", "16px slot gap", "8px radius / 1px border", "N1 30px bold digit", "error message 224px / gap 3px"]}
                  detailsHref="#component/ui.code-field"
                >
                  <CodeFieldSpecimens />
                </Specimen>
                <Specimen
                  name="Date filter"
                  source="components/ui/DateFilter.tsx"
                  note={`${DATE_FILTER_SOURCE.schema} / ${DATE_FILTER_SOURCE.sourceNodeId}`}
                  specs={["238x24 wrapper", "4-item and 5-item states", "15px chip gap", "35x22 chips", "3.5px radius", "14px bold label", "teal selected chip"]}
                  detailsHref="#component/ui.date-filter"
                >
                  <DateFilterVariantSpecimen />
                </Specimen>
                <Specimen
                  name="Pill sorting"
                  source="components/ui/PillSorting.tsx"
                  note={`${PILL_SORTING_SOURCE.schema} / ${PILL_SORTING_SOURCE.sourceNodeId}`}
                  specs={["375x40 rail", "8px gap", "24px chip height", "14.5px radius", "14px regular idle labels", "black selected chip with bold white label"]}
                  detailsHref="#component/ui.pill-sorting"
                >
                  <PillSortingVariantSpecimen />
                </Specimen>
                <Specimen
                  name="Toggle button"
                  source="components/ToggleButton.tsx"
                  note={`${TOGGLE_BUTTON_SOURCE.schema} / ${TOGGLE_BUTTON_SOURCE.sourceNodeIds.unchecked} · ${TOGGLE_BUTTON_SOURCE.sourceNodeIds.checked}`}
                  specs={["60x30", "off/on variants", "white surface", "2px border", "22x22 knob", "role=switch"]}
                  detailsHref="#component/ui.toggle-button"
                >
                  <ToggleButtonVariantSpecimen />
                </Specimen>
                <Specimen
                  name="Navigation row"
                  source="components/NavigationRow.tsx"
                  note={`${NAVIGATION_ROW_SOURCE.schema} / ${NAVIGATION_ROW_SOURCE.sourceNodeIds.textDescriptionToggle} · ${NAVIGATION_ROW_SOURCE.sourceNodeIds.textLinkToggle} · ${NAVIGATION_ROW_SOURCE.sourceNodeIds.iconDescriptionChevron}`}
                  specs={["18 mapped Meniga cases", "375px wide", "64px or 80px row height", "16px layout gap", "optional 32px leading visual", "optional 64x40 card art", "title 16px bold / description 16px", "CTA 14px teal", "chevron or shared ToggleButton accessory"]}
                  detailsHref="#component/ui.navigation-row"
                >
                  <NavigationRowVariantSpecimen />
                </Specimen>
                <Specimen
                  name="Profile avatar"
                  source="components/ProfileAvatar.tsx"
                  note={`${PROFILE_AVATAR_SOURCE.schema} / ${PROFILE_AVATAR_SOURCE.sourceNodeIds.photoFull} · ${PROFILE_AVATAR_SOURCE.sourceNodeIds.photoWithNotification} · ${PROFILE_AVATAR_SOURCE.sourceNodeIds.initials} · ${PROFILE_AVATAR_SOURCE.sourceNodeIds.ai}`}
                  specs={["40x40 base", "full photo or inset profile photo", "optional 8px notification dot", "initials 16px bold on K1", "AI glyph 24px on neutral circle", "supports real imageSrc + controlled size"]}
                  detailsHref="#component/ui.profile-avatar"
                >
                  <ProfileAvatarVariantSpecimen />
                </Specimen>
              </div>
              <Specimen name="Generic UI controls" source="components/ui/*" detailsHref="#component/ui.generic-controls">
                <ShadcnSpecimens />
              </Specimen>
            </div>
          </Section>

          <Section id="cards" title="Cards and content blocks" description="Active cards, contact cards, banners, lists, and reusable content blocks.">
            <div className="grid gap-5 lg:grid-cols-2">
              <Specimen
                name="Card"
                source="components/cards/Card.tsx"
                note={`${CARD_SOURCE.schema} / ${Object.values(CARD_SOURCE.sourceNodeIds).join(" · ")}`}
                specs={["64x40 Figma base", "8:5 aspect ratio", "dropdown variant selector", "6 Mastercard debit/credit/virtual variants", "duplicated card structure with Figma-sampled color palettes", "controlled figma / medium / large sizing", "decorative by default / ariaLabel exposes as image"]}
                detailsHref="#component/cards.card"
              >
                <CardVariantSpecimen />
              </Specimen>
              <Specimen name="Products offer card" source="components/products/ProductOfferCard.tsx" specs={["327x157", "standard / compact size selector", "16px text-to-image gutter", "100px image column", "standard: title 22px bold / 2 lines, subtitle 18px regular / 3 lines", "compact: title 20px bold / 2 lines, subtitle 16px regular / 3 lines, + 14px 1-line caption", "family + light/normal tones"]} detailsHref="#component/products.offer-card">
                <ProductOfferCardVariantSpecimen />
              </Specimen>
              <Specimen
                name="Shopsmart"
                source="components/shopsmart/ShopsmartOfferCard.tsx"
                note={`${SHOPSMART_OFFER_CARD_SOURCE.schema} / ${SHOPSMART_OFFER_CARD_SOURCE.sourceNodeIds.offers1} + ${SHOPSMART_OFFER_CARD_SOURCE.sourceNodeIds.offers2}`}
                specs={["327px wide", "8px radius + #666 border", "image top 130/143px", "merchant 15px bold teal", "title 21px bold", "footer 11px metadata", "Offers 1 CTA pill", "Offers 2 orange tag"]}
                detailsHref="#component/products.shopsmart-offer-card"
              >
                <ShopsmartOfferCardVariantSpecimen />
              </Specimen>
              <Specimen name="Products menu card" source="components/products/ProductMenuCard.tsx" specs={["164x120 standard", "164x72 compact", "dropdown card + size selectors", "title 18px standard / 16px compact", "config-driven background", "optional imageSrc with per-card placement"]} detailsHref="#component/products.product-card">
                <ProductMenuCardVariantSpecimen />
              </Specimen>
              <Specimen name="AccountBalanceCard / all countries" source="components/accounts/AccountBalanceCard.tsx" tone="gray" specs={["311x197", "padding 16px", "radius 6px", "soft layered shadow", "title 20px", "IBAN 16px", "copy 32x32", "optional sub-account", "amount 30px + decimals 20px", "current balance gap 4px"]} detailsHref="#component/home.account-balance-card">
                <AccountBalanceCardCountrySpecimen />
              </Specimen>
              <Specimen name="AccountActionBar" source="components/accounts/AccountActionBar.tsx" tone="gray" specs={["supports 1-4 items", "align start / center / end / between", "container padding 8px 16px", "item flex 1 0 0 when between", "icon box 32x32", "label 14px regular / 15px line"]} detailsHref="#component/accounts.action-bar">
                <AccountActionBarVariantSpecimen />
              </Specimen>
              <Specimen name="Ghost Banner" source="components/cards/GhostBanner.tsx" note={`${GHOST_BANNER_SOURCE.schema} / ${GHOST_BANNER_SOURCE.sourceNodeId}`} tone="gray" specs={["327x92 Figma base", "dashed border 1px var(--uc-text)", "8px corner radius", "padding 16px", "icon-to-text gap 8px", "icon box 32x32 / add-circle teal var(--uc-action)", "title 18px bold / 20px line", "title-to-description gap 4px", "description 16px regular / preserves newlines", "renders as button when onClick is set"]} detailsHref="#component/cards.ghost-banner">
                <GhostBannerVariantSpecimen />
              </Specimen>
              <Specimen name="Info Banner" source="components/cards/InfoBanner.tsx" note={`${INFO_BANNER_SOURCE.schema} / ${INFO_BANNER_SOURCE.sourceNodeId}`} tone="gray" specs={["327x153 Figma base", "solid border 1px var(--uc-text)", "8px corner radius", "padding 16px", "icon-to-text gap 8px", "icon box 32x32 / info-circle var(--uc-text)", "title 18px bold / 20px line", "title-to-description gap 4px", "description 16px regular / preserves newlines", "text-block-to-action gap 8px", "optional action 14px bold teal var(--uc-action)"]} detailsHref="#component/cards.info-banner">
                <InfoBannerVariantSpecimen />
              </Specimen>
              <Specimen name="User Event Card" source="components/cards/UserEventCard.tsx" note={`${USER_EVENT_CARD_SOURCE.schema} / ${USER_EVENT_CARD_SOURCE.sourceNodeIds.full} · ${USER_EVENT_CARD_SOURCE.sourceNodeIds.compact}`} tone="gray" specs={["343 wide Figma base", "white var(--uc-surface)", "8px radius", "shadow 0 4px 16px rgba(0,0,0,0.08)", "padding 16px", "avatar 48x48 circle teal var(--uc-action) / white 24x24 glyph", "avatar-to-text gap 8px", "title 14px bold", "description 14px regular / preserves newlines", "optional link 14px bold teal", "optional 32x32 more-horizontal options", "items center without link / start with link"]} detailsHref="#component/cards.user-event-card">
                <UserEventCardVariantSpecimen />
              </Specimen>
              <Specimen name="Helper Card" source="components/cards/HelperCard.tsx" note={`${HELPER_CARD_SOURCE.schema} / ${HELPER_CARD_SOURCE.sourceNodeIds.plain} · ${HELPER_CARD_SOURCE.sourceNodeIds.withLink}`} tone="gray" specs={["343 wide Figma base", "solid teal var(--uc-action)", "4px radius", "padding 16px", "icon-to-text gap 8px", "icon box 32x32 / white info-circle", "title 18px bold white", "description 18px regular white / preserves newlines", "optional white link 14px bold", "optional close-x top-right", "white text via var(--uc-static-white)"]} detailsHref="#component/cards.helper-card">
                <HelperCardVariantSpecimen />
              </Specimen>
              <Specimen name="Pending Action Card" source="components/cards/PendingActionCard.tsx" note={`${PENDING_ACTION_CARD_SOURCE.schema} / ${PENDING_ACTION_CARD_SOURCE.sourceNodeId}`} tone="gray" specs={["327x157 Figma base", "teal gradient 90deg #007A91 to #44909E", "8px radius", "padding 24px", "title 24px bold white", "title-to-body gap 8px", "body 18px regular white", "optional white tag pill", "tag warning-small glyph teal", "tag label 12px bold uppercase teal", "renders as button when onClick is set"]} detailsHref="#component/cards.pending-action-card">
                <PendingActionCardVariantSpecimen />
              </Specimen>
              <Specimen name="Investments fund banner" source="components/investments/InvestmentsFundBanner.tsx" tone="gray" specs={["7 selectable variants", "327x157 discovery CTA", "343 wide / 126px minimum / content hug", "exact Figma collection imagery", "8px radius / 16px padding", "title 22px bold / 26px line", "subtitle 18px regular", "action 14px bold uppercase + arrow-right 12px", "text column max-w 223px"]} detailsHref="#component/investments.fund-banner">
                <InvestmentsFundBannerVariantSpecimen />
              </Specimen>
              <Specimen name="Card Component" source="components/cards/CardComponent.tsx" note={`${CARD_COMPONENT_SOURCE.schema} / ${CARD_COMPONENT_SOURCE.sourceNodeId}`} tone="gray" specs={["375-wide Figma base", "Primary/K7 (#F5F5F5) background", "vertical gap 12px / clips content", "Frame 46: 24px left padding / 8px gap", "card-holder 14px bold N5 / K1", "card-number 18px bold L2 / K1", "carousel 351x140 / horizontal gap 24px", "card slot 219x138 / 5.67px radius", "renders shared Card variants", "no outside border / no card image asset", "drop-shadow 0 11.265px 11.265px rgba(0,0,0,0.2)"]} detailsHref="#component/cards.card-component">
                <div className="w-[375px]">
                  <CardComponent />
                </div>
              </Specimen>
              <Specimen name="Carousel Indicator" source="components/accounts/AccountCarouselIndicator.tsx" tone="gray" specs={["height 32px", "backdrop blur 13.591px", "inline-flex", "gap 6px", "active 30x6", "inactive 6x6", "mini 4x4 when count > 4"]} detailsHref="#component/accounts.carousel-indicator">
                <AccountCarouselIndicatorVariantSpecimen />
              </Specimen>
              <Specimen name="AccountDetailsInfoField" source="components/accounts/AccountDetailsInfoField.tsx" tone="gray" specs={["height 80px", "outside gap 0", "title 16px regular / normal", "subtitle 16px bold / normal", "title-to-subtitle gap 4px", "optional trailing icon variant"]} detailsHref="#component/accounts.details-info-field">
                <AccountDetailsInfoFieldVariantSpecimen />
              </Specimen>
              <Specimen name="MessagesMailboxTabs" source="components/messages/MessagesMailboxTabs.tsx" tone="gray" specs={["height 48px", "2 columns", "optional leading new dot 12px", "inactive label muted", "bottom active indicator 2px"]} detailsHref="#component/messages.mailbox-tabs">
                <MessagesMailboxTabsVariantSpecimen />
              </Specimen>
              <Specimen
                name="AccountSearchBar"
                source="components/accounts/AccountSearchBar.tsx"
                note={`${ACCOUNT_SEARCH_BAR_SOURCE.schema} / ${ACCOUNT_SEARCH_BAR_SOURCE.sourceNodeIds.activeRemoveFilters}`}
                tone="gray"
                specs={["32px normal search row", "63px active-remove-filters state", "padding 16px x / 2px y when filters active", "gap 8px", "search/filter icon slots 32px", "input 14px bold", "remove filters 14px bold teal"]}
                detailsHref="#component/accounts.transaction-search"
              >
                <AccountSearchBarVariantSpecimen />
              </Specimen>
              <Specimen name="AccountTransactionRow" source="components/accounts/AccountTransactionRow.tsx" specs={["375x80", "padding 20px 16px", "day 18px/20px bold", "date gap 2px", "month 14px/15px bold", "date-to-icon gap 16px", "icon box 32px", "details column 247px", "label 16px/18px", "label-to-amount gap 4px", "amount line 22px", "amount 20px + decimals 14px", "divider L3 14px bold uppercase", "divider left muted / right K1", "divider-to-row gap 16px", "row-to-next-divider gap 16px"]} detailsHref="#component/accounts.transaction-row">
                <AccountTransactionRowVariantSpecimen />
              </Specimen>
              <Specimen name="Payments hero card" source="components/payments/PaymentHeroCard.tsx" specs={["327x120", "9 screenshot-backed image variants", "title 24px bold / respects newline titles", "title top gap 16px", "description 14px regular", "title-to-description gap 16px single-line / 8px multiline", "optional imageSrc override"]} detailsHref="#component/payments.hero-card">
                <PaymentHeroCardVariantSpecimen />
              </Specimen>
              <Specimen name="More cards / all concrete card components" source="screens/more/cards/*" specs={["120px height", "8px radius", "individual image positioning"]} detailsHref="#component/cards.card-component">
                <MoreCardVariantSpecimen />
              </Specimen>
              <Specimen name="Contacts navigation cards / all icons" source="components/NavigationRow.tsx + screens/contacts/ContactsNavigationCard.tsx" specs={["80px row", "32px icons", "title 16px bold", "value 14px teal", "contact wrapper maps icon variants to shared NavigationRow"]} detailsHref="#component/contacts.navigation-card">
                <ContactsNavigationCardVariantSpecimen />
              </Specimen>
            </div>
          </Section>

          <Section id="products" title="Products and country variants" description="Product accordions and product-family country variants, so regional differences can be reviewed in one place.">
            <div className="grid gap-5 lg:grid-cols-2">
              <Specimen
                name="Product card / list / total row - evolution"
                source="components/ProductCard.tsx + ProductsList.tsx + TotalRow.tsx"
                note={`${PRODUCT_CARD_EVOLUTION_SOURCE.schema} / ${PRODUCT_CARD_EVOLUTION_SOURCE.sourceNodeId} (requested ${PRODUCT_CARD_EVOLUTION_SOURCE.originalRequestedNodeId})`}
                tone="gray"
                specs={["327px Figma width", "PI + SME styles", "Future CZ with / without quick actions", "Default / Accordion / Open", "card padding 16px", "icon 32px", "amount 24px + decimals 14px", "total amount 20px + decimals 14px"]}
                detailsHref="#component/products.product-card-list-total"
              >
                <ProductCardListTotalRowEvolutionSpecimen />
              </Specimen>
              <Specimen name="ProductAccordion / all countries" source="components/ProductAccordion.tsx" tone="dark" detailsHref="#component/products.product-card-list-total">
                <ProductAccordionCountrySpecimen />
              </Specimen>
              <Specimen name="ProductAccordionAnimated / all countries" source="components/ProductAccordionAnimated.tsx" tone="dark" detailsHref="#component/products.product-card-list-total">
                <ProductAccordionCountrySpecimen animated />
              </Specimen>
            </div>
          </Section>

          <Section id="overlays" title="Overlays and dialogs" description="Components that appear above the main content. Interactive examples stay closed by default so they do not block the page.">
            <div className="grid gap-5 lg:grid-cols-2">
              <Specimen
                name="Toast message"
                source="components/ui/ToastMessage.tsx"
                note={`${TOAST_MESSAGE_SOURCE.schema} / ${TOAST_MESSAGE_SOURCE.sourceNodeId}`}
                specs={["3 mapped Meniga states", "327x32 Aware + Action required", "174x35 Google Pay hug variant", "16px radius", "32px icon slot / 8px red dot", "20px icon-to-text gap", "14px bold UniCredit message"]}
                detailsHref="#component/ui.toast-message"
              >
                <ToastMessageVariantSpecimen />
              </Specimen>
              <Specimen name="LogoutConfirmDialog" source="components/LogoutConfirmDialog.tsx" detailsHref="#component/dialogs.logout-confirmation">
                <div className="relative h-[260px] w-[375px] overflow-hidden rounded border bg-[var(--uc-app-bg)]">
                  <Button onClick={() => setShowLogout(true)} className="m-4">Open logout dialog</Button>
                  <LogoutConfirmDialog isOpen={showLogout} onClose={() => setShowLogout(false)} onConfirm={noop} />
                </div>
              </Specimen>
              <Specimen name="PanelWithTranslations" source="components/PanelWithTranslations.tsx" detailsHref="#component/prelogin.other-panel">
                <div className="relative h-[430px] w-[375px] overflow-hidden rounded border">
                  <PanelWithTranslations aboutSmartBanking="ABOUT SMART BANKING" exchangeRates="EXCHANGE RATES" findAtmBranches="FIND ATM & BRANCHES" startCoAppingSession="START CO-APPING SESSION" onClose={noop} onStartCoApping={noop} />
                </div>
              </Specimen>
              <Specimen name="PanelWithoutCoAppingTranslations" source="components/PanelWithoutCoAppingTranslations.tsx" detailsHref="#component/prelogin.other-panel-basic">
                <div className="relative h-[350px] w-[375px] overflow-hidden rounded border">
                  <PanelWithoutCoAppingTranslations aboutSmartBanking="ABOUT SMART BANKING" exchangeRates="EXCHANGE RATES" findAtmBranches="FIND ATM & BRANCHES" onClose={noop} />
                </div>
              </Specimen>
            </div>
          </Section>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
