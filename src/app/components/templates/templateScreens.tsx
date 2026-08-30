/**
 * Template previews for list and menu surfaces: messages, documents, the home
 * dashboard, the Payments/Products/More menus, prelogin, and account options.
 *
 * Extracted verbatim from TemplateCodePreviews.tsx.
 */
import BottomNavigation from "@/app/components/BottomNavigation";
import { LogoutConfirmDialog } from "@/app/components/LogoutConfirmDialog";
import PanelWithTranslations from "@/app/components/PanelWithTranslations";
import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import TextField from "@/app/components/TextField";
import UniCreditLogo from "@/app/components/UniCreditLogo";
import { AppIcon, type IconName } from "@/app/components/icons";
import NewPaymentActionListItem from "@/app/components/payments/NewPaymentActionListItem";
import NewPaymentDiscoverBanner from "@/app/components/payments/NewPaymentDiscoverBanner";
import PaymentOtherShortcut from "@/app/components/payments/PaymentOtherShortcut";
import { getDocumentsConfigForCountry, type DocumentListItem } from "@/app/config/documentsConfig";
import type { MessageListItem } from "@/app/config/messagesConfig";
import { getMoreCardsForCountry } from "@/app/config/moreCardsConfig";
import { getPaymentsMenuForCountry } from "@/app/config/paymentsMenuConfig";
import { getProductsMenuForCountry } from "@/app/config/productsMenuConfig";
import { useLanguage } from "@/app/contexts/LanguageContext";
import ProductDetailScreen from "@/app/screens/products/ProductDetailScreen";
import {
  BankingContent,
  ProductsHeader,
  ProductsTabs,
  ShopSmartContent,
  getProductsCardTranslationId,
} from "@/app/screens/products/ProductsScreen";
import { ACCOUNT_OPTION_ITEMS, ACCOUNT_PRODUCT_OPTIONS } from "@/data/accountDetails";
import {
  accountTransactionTemplateRows,
  languageSelectorOptions,
  messageRows,
  outboxRows,
  preloginProducts,
  spendingMoneyOutRows,
  standingOrderRows,
  type StandingOrderRow,
} from "./templateData";
import {
  AccountBalancePreviewCard,
  ContactInfoCard,
  TemplateShortcut,
  TemplateTransactionRow,
} from "./templateFlows";
import {
  DotMenu,
  MoreTemplateCard,
  TemplateAccountOptionIcon,
  TemplateAction,
  TemplateBottomButton,
  TemplateFiveBottomNavigation,
  TemplatePaymentHeroCard,
  TemplatePhoneSurface,
  TemplateRadioRow,
  TemplateSearchStrip,
  TemplateSectionTitle,
  TemplateTabs,
  TemplateTopChrome,
  TemplateTopLevelHeader,
} from "./templatePrimitives";

export function MessageListRow({ row, interactive }: { row: MessageListItem; interactive: boolean }) {
  return (
    <div className="grid h-[80px] grid-cols-[32px_1fr_48px_32px] items-center gap-[2px] px-[18px]">
      <div className="text-center">
        <p className="font-['UniCredit',sans-serif] uc-type-h2 leading-[20px] text-[var(--uc-text)]">{row.day}</p>
        <p className="font-['UniCredit',sans-serif] uc-type-n5-strong leading-[16px] text-[var(--uc-text-muted)]">{row.month}</p>
      </div>
      <div className="min-w-0 pl-[6px]">
        <p className="truncate font-['UniCredit',sans-serif] uc-type-n4-strong leading-[20px] text-[var(--uc-text)]">{row.title}</p>
        <p className="truncate font-['UniCredit',sans-serif] uc-type-n4 leading-[22px] text-[var(--uc-text-muted)]">{row.description}</p>
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

export function DocumentListRowTemplate({
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
      className="grid h-[80px] w-full grid-cols-[32px_1fr_48px_32px] items-center gap-[2px] px-[18px] text-left"
    >
      <span className="text-center">
        <span className="block font-['UniCredit',sans-serif] uc-type-h2 leading-[20px] text-[var(--uc-text)]">
          {row.day}
        </span>
        <span className="block font-['UniCredit',sans-serif] uc-type-n5-strong leading-[16px] text-[var(--uc-text-muted)]">
          {row.month}
        </span>
      </span>
      <span className="min-w-0 pl-[6px]">
        <span className="block truncate font-['UniCredit',sans-serif] uc-type-n4-strong uppercase leading-[20px] text-[var(--uc-text)]">
          {row.title}
        </span>
        <span className="block truncate font-['UniCredit',sans-serif] uc-type-n4 leading-[22px] text-[var(--uc-text-muted)]">
          {row.isLegal ? "Legal" : row.description}
        </span>
      </span>
      {row.badge ? (
        <span className="justify-self-center rounded-full bg-[var(--uc-action-soft)] px-[7px] py-[2px] font-['UniCredit',sans-serif] text-[11px] font-bold leading-[14px] text-[var(--uc-action)]">
          {row.badge}
        </span>
      ) : (
        <span />
      )}
      <span className="grid size-[32px] place-items-center justify-self-end text-[var(--uc-text)]">
        <AppIcon name="more-horizontal" color="currentColor" />
      </span>
    </TemplateAction>
  );
}

export function StandingOrderIcon({ icon }: { icon: IconName }) {
  return (
    <span className="grid size-[32px] place-items-center text-[var(--uc-text)]">
      <AppIcon name={icon} color="currentColor" />
    </span>
  );
}

export function StandingOrderListRow({ row, interactive }: { row: StandingOrderRow; interactive: boolean }) {
  return (
    <div className="grid h-[90px] grid-cols-[32px_1fr_32px] items-center gap-[8px] px-[22px]">
      <StandingOrderIcon icon="payment-templates" />
      <div className="min-w-0">
        <p className="truncate font-['UniCredit',sans-serif] uc-type-n4-strong leading-[20px] text-[var(--uc-text)]">{row.title}</p>
        <p className="font-['UniCredit',sans-serif] uc-type-n4 leading-[20px] text-[var(--uc-text-muted)]">{row.date}</p>
        <p className="mt-[5px] font-['UniCredit',sans-serif] uc-type-n2-strong leading-[22px] text-[var(--uc-text)]">
          {row.amount} <span className="text-[16px]">{row.currency}</span>
        </p>
      </div>
      <DotMenu interactive={interactive} />
    </div>
  );
}

export function MessagesInboxTemplate({ interactive }: { interactive: boolean }) {
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

export function DocumentsTemplate({ interactive }: { interactive: boolean }) {
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

export function RecurrentPaymentTemplate({ interactive }: { interactive: boolean }) {
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

export function HomeDashboardTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[92px] scrollbar-hide">
        <TemplateTopLevelHeader
          title="Hello, Robert"
          subtitle="Monday, 1 June"
          actions={[
            { icon: "amount-hide", label: "Hide amounts" },
            { icon: "header-profile", label: "Profile" },
            { icon: "header-messages", label: "Messages" },
          ]}
          interactive={interactive}
        />
        <main className="px-[24px] pt-[22px] font-['UniCredit',sans-serif]">
          <AccountBalancePreviewCard />
          <section className="mt-[22px] grid grid-cols-4 gap-[4px]">
            <TemplateShortcut icon="info-circle" label="Details" interactive={interactive} />
            <TemplateShortcut icon="account-options" label="Options" interactive={interactive} />
            <TemplateShortcut icon="add-money" label="Add money" interactive={interactive} />
            <TemplateShortcut icon="mcash" label="mCash" interactive={interactive} />
          </section>
          <section className="pt-[27px]">
            <SectionHeadingDivider title="LATEST TRANSACTIONS" />
            <div className="pt-[12px]">
              <TemplateTransactionRow title="Kindergarten 45" category="School fees" amount="-247,00 RON" icon="account-option-statement" />
              <TemplateTransactionRow title="Salary" category="Incoming payment" amount="+8.200,00 RON" icon="landmark" />
              <TemplateTransactionRow title="Online card payment" category="Shopping" amount="-74,50 RON" icon="shopping-bag" />
            </div>
          </section>
          <section className="pt-[18px]">
            <SectionHeadingDivider title="PRODUCTS" />
            <div className="mt-[14px] grid grid-cols-2 gap-[10px]">
              <div className="rounded-[8px] bg-[var(--uc-product-blue-deep)] p-[14px] text-[var(--uc-static-white)]">
                <p className="uc-type-h2 leading-[21px]">Savings</p>
                <p className="mt-[20px] uc-type-n2-strong leading-none">2.450 RON</p>
              </div>
              <div className="rounded-[8px] bg-[var(--uc-red-card)] p-[14px] text-[var(--uc-static-white)]">
                <p className="uc-type-h2 leading-[21px]">Cards</p>
                <p className="mt-[20px] uc-type-n2-strong leading-none">1 active</p>
              </div>
            </div>
          </section>
        </main>
      </div>
      <TemplateFiveBottomNavigation active="Home" />
    </TemplatePhoneSurface>
  );
}

export function PaymentsMenuTemplate({ interactive }: { interactive: boolean }) {
  const menu = getPaymentsMenuForCountry("RO");

  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[92px] scrollbar-hide">
        <TemplateTopLevelHeader
          title={menu.title}
          actions={[
            { icon: "header-profile", label: "Profile" },
            { icon: "header-messages", label: "Messages" },
            { icon: "help-circle", label: "Help" },
          ]}
          interactive={interactive}
        />
        <main className="px-[20px] pt-[8px]">
          <div className="flex flex-col gap-[13px]">
            {menu.primaryItems.map((item) => (
              <TemplatePaymentHeroCard key={item.id} item={item} interactive={interactive} />
            ))}
          </div>
          <section className="pt-[16px]">
            <SectionHeadingDivider title={menu.otherTitle} />
            <div className="overflow-x-auto overflow-y-hidden pt-[8px] scrollbar-hide">
              <div className="flex w-max gap-[18px] pr-[20px]">
                {menu.otherItems.map((item) => (
                  <PaymentOtherShortcut key={item.id} item={item} />
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
      <TemplateFiveBottomNavigation active="Payments" />
    </TemplatePhoneSurface>
  );
}

export function NewPaymentSheetTemplate({ interactive }: { interactive: boolean }) {
  const menu = getPaymentsMenuForCountry("RO");
  const sheet = menu.heroSheets["new-payment"];

  return (
    <TemplatePhoneSurface>
      <div className="absolute inset-0 bg-[var(--uc-surface)]">
        <TemplateTopLevelHeader
          title="Payments"
          actions={[
            { icon: "header-profile", label: "Profile" },
            { icon: "header-messages", label: "Messages" },
            { icon: "help-circle", label: "Help" },
          ]}
          interactive={interactive}
        />
        <div className="mt-[20px] px-[20px]">
          {menu.primaryItems.slice(0, 3).map((item) => (
            <div key={item.id} className="mb-[13px] opacity-80">
              <TemplatePaymentHeroCard item={item} interactive={false} />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-[rgb(var(--uc-static-black-rgb)_/_0.55)]" />
      <section className="absolute inset-x-0 bottom-0 rounded-t-[12px] bg-[var(--uc-sheet-bg)] p-[16px] pb-[32px]">
        <div className="mb-[18px] flex items-start justify-between gap-[16px]">
          <h1 className="font-['UniCredit',sans-serif] uc-type-h1 leading-normal text-[var(--uc-text)]">
            {sheet.title}
          </h1>
          <TemplateAction className="grid size-[32px] place-items-center" ariaLabel="Close" interactive={interactive}>
            <AppIcon name="close-x" color="var(--uc-text)" />
          </TemplateAction>
        </div>
        <div className="flex flex-col">
          {sheet.actions.map((action) => (
            <NewPaymentActionListItem key={action.id} action={action} onSelect={() => undefined} />
          ))}
        </div>
        <NewPaymentDiscoverBanner
          title={sheet.infoBanner.title}
          description={sheet.infoBanner.description}
        />
      </section>
    </TemplatePhoneSurface>
  );
}

export function ProductsMenuTemplate() {
  const menu = getProductsMenuForCountry("RO");
  const { t } = useLanguage();
  const localizeOffer = (offer: (typeof menu.offers)[number]) => ({
    ...offer,
    title: t(`runtime.productsMenu.offers.${offer.id}.title`, offer.title),
    description: t(`runtime.productsMenu.offers.${offer.id}.description`, offer.description),
  });
  const localizeCard = (card: (typeof menu.products)[number]) => {
    const translationId = getProductsCardTranslationId(card);

    return {
      ...card,
      title: translationId ? t(`runtime.productsMenu.cards.${translationId}`, card.title) : card.title,
    };
  };

  return (
    <TemplatePhoneSurface showSystemHeader={false}>
      <div className="relative flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]">
        <div className="h-[54px] flex-shrink-0 bg-[var(--uc-surface)]" />
        <ProductsHeader title={t("runtime.productsMenu.title", menu.title)} />
        <ProductsTabs
          activeTab="banking"
          bankingLabel={t("runtime.productsMenu.banking", menu.bankingTabLabel)}
          shopSmartLabel={t("runtime.productsMenu.shopSmart", menu.shopSmartTabLabel)}
          onChange={() => undefined}
        />

        <div className="relative z-0 flex-1 overflow-y-auto scrollbar-hide pb-[92px]">
          <BankingContent
            offersTitle={t("runtime.productsMenu.offersForYou", menu.offersTitle)}
            offers={menu.offers.map(localizeOffer)}
            productsTitle={menu.productsTitle ? t("runtime.productsMenu.ourProducts", menu.productsTitle) : ""}
            products={menu.products.map(localizeCard)}
            otherSolutionsTitle={t("runtime.productsMenu.otherSolutionsForYou", menu.otherSolutionsTitle)}
            otherSolutions={menu.otherSolutions.map(localizeCard)}
            onProductCardClick={() => undefined}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center border-t border-[var(--uc-border-muted)] bg-[var(--uc-bottom-bar-bg)]">
          <BottomNavigation activeTab="products" />
        </div>
      </div>
    </TemplatePhoneSurface>
  );
}

export function MoreMenuTemplate({ interactive }: { interactive: boolean }) {
  const cards = getMoreCardsForCountry("RO");

  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[92px] scrollbar-hide">
        <TemplateTopLevelHeader
          title="More"
          actions={[
            { icon: "header-profile", label: "Profile" },
            { icon: "header-messages", label: "Messages" },
            { icon: "help-circle", label: "Help" },
          ]}
          interactive={interactive}
        />
        <main className="px-[24px] pt-[24px]">
          <div className="flex flex-col gap-[12px]">
            {cards.map((card) => (
              <MoreTemplateCard key={card} type={card} interactive={interactive} />
            ))}
          </div>
        </main>
      </div>
      <TemplateFiveBottomNavigation active="More" />
    </TemplatePhoneSurface>
  );
}

export function ContactsDirectoryTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[32px] scrollbar-hide">
        <TemplateTopChrome title="Contact" interactive={interactive} />
        <TemplateSearchStrip interactive={interactive} />
        <main className="px-[16px]">
          <SectionHeadingDivider title="CONTACT US" />
          <div className="mt-[14px] flex flex-col gap-[12px]">
            <ContactInfoCard icon="contact-phone" title="Call us" description="Talk to a consultant." action="CALL" interactive={interactive} />
            <ContactInfoCard icon="contact-email" title="Write us" description="Send a secure message." action="SEND MESSAGE" interactive={interactive} />
            <ContactInfoCard icon="contact-location" title="Find a branch" description="ATMs and branches near you." action="OPEN MAP" interactive={interactive} />
            <ContactInfoCard icon="contact-website" title="Website" description="Open the UniCredit help page." action="OPEN WEBSITE" interactive={interactive} />
          </div>
        </main>
      </div>
    </TemplatePhoneSurface>
  );
}

export function MessagesOutboxTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <TemplateTopChrome title="Messages" interactive={interactive} />
      <TemplateTabs tabs={[{ label: "Inbox" }, { label: "Outbox", active: true }]} interactive={interactive} />
      <TemplateSearchStrip interactive={interactive} />
      <TemplateSectionTitle>2025</TemplateSectionTitle>
      <div className="pt-[20px]">
        {outboxRows.map((row) => (
          <MessageListRow key={row.id} row={row} interactive={interactive} />
        ))}
      </div>
    </TemplatePhoneSurface>
  );
}

export function PrimeBenefitItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid grid-cols-[32px_1fr] gap-[12px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[16px] font-['UniCredit',sans-serif]">
      <span className="grid size-[32px] place-items-center rounded-full bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]">
        <AppIcon name="prime-check" color="currentColor" />
      </span>
      <span className="min-w-0">
        <span className="block uc-type-n4-strong leading-[20px] text-[var(--uc-text)]">{title}</span>
        <span className="mt-[3px] block uc-type-n5 leading-[18px] text-[var(--uc-text-muted)]">
          {description}
        </span>
      </span>
    </div>
  );
}

export function PrimeBenefitsTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[104px] scrollbar-hide">
        <TemplateTopChrome title="Your benefits" interactive={interactive} />
        <main className="px-[24px] pt-[24px]">
          <div className="rounded-[8px] bg-[var(--uc-static-black)] p-[20px] font-['UniCredit',sans-serif] text-[var(--uc-static-white)]">
            <p className="uc-type-n5-strong uppercase leading-[18px] text-[rgb(var(--uc-static-white-rgb)_/_0.7)]">Prime</p>
            <h2 className="mt-[8px] uc-type-h1 leading-[32px]">Premium banking support</h2>
            <p className="mt-[12px] text-[15px] font-normal leading-[20px] text-[rgb(var(--uc-static-white-rgb)_/_0.82)]">
              Priority service, dedicated advice, and selected lifestyle benefits.
            </p>
          </div>
          <section className="pt-[24px]">
            <SectionHeadingDivider title="INCLUDED BENEFITS" />
            <div className="mt-[14px] flex flex-col gap-[12px]">
              <PrimeBenefitItem title="Priority support" description="Faster help through phone and secure messages." />
              <PrimeBenefitItem title="Dedicated advisor" description="A named advisor for everyday and long-term plans." />
              <PrimeBenefitItem title="Travel assistance" description="Useful support when you pay or travel abroad." />
            </div>
          </section>
        </main>
      </div>
      <TemplateBottomButton label="Explore Prime" interactive={interactive} bottom={32} />
    </TemplatePhoneSurface>
  );
}

export function PreloginBackgroundArt() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--uc-static-black)]" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(155deg,var(--uc-neutral-750)_0%,var(--uc-static-black)_54%,var(--uc-product-blue-deep)_100%)]" />
      <div className="absolute left-[38px] top-[160px] h-[212px] w-[142px] rotate-[-9deg] rounded-[28px] border-[8px] border-[rgb(var(--uc-static-white-rgb)_/_0.8)] bg-[rgb(var(--uc-static-white-rgb)_/_0.12)]" />
      <div className="absolute right-[-30px] top-[236px] h-[184px] w-[190px] rotate-[14deg] rounded-[28px] bg-[rgb(var(--uc-static-white-rgb)_/_0.13)]" />
      <div className="absolute bottom-[282px] left-[118px] h-[86px] w-[142px] rounded-[18px] bg-[linear-gradient(135deg,var(--uc-brand)_0%,var(--uc-orange-status)_100%)] shadow-[0_18px_32px_rgb(var(--uc-static-black-rgb)_/_0.3)]" />
    </div>
  );
}

export function PreloginProductRow({
  product,
  interactive,
}: {
  product: (typeof preloginProducts)[number];
  interactive: boolean;
}) {
  return (
    <TemplateAction
      ariaLabel={product.title}
      interactive={interactive}
      className="grid min-h-[64px] w-full grid-cols-[32px_1fr_24px] items-center gap-[12px] text-left"
    >
      <span className="grid size-[32px] place-items-center rounded-full bg-[rgb(var(--uc-static-white-rgb)_/_0.12)] text-[var(--uc-static-white)]">
        <AppIcon name={product.icon} color="currentColor" />
      </span>
      <span className="min-w-0 font-['UniCredit',sans-serif] text-[var(--uc-static-white)]">
        <span className="block uc-type-n4-strong leading-[20px]">{product.title}</span>
        <span className="mt-[2px] block text-[13px] font-normal leading-[16px] text-[rgb(var(--uc-static-white-rgb)_/_0.72)]">
          {product.description}
        </span>
      </span>
      <span className="grid size-[32px] place-items-center">
        <AppIcon name="chevron-link" color="var(--uc-static-white)" />
      </span>
    </TemplateAction>
  );
}

export function PreloginInactiveTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface statusBarVariant="dark" reserveSystemHeader={false}>
      <PreloginBackgroundArt />
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-center justify-between px-[24px] pt-[70px]">
          <UniCreditLogo className="h-[24px] w-auto" />
          <TemplateAction
            ariaLabel="Change language"
            interactive={interactive}
            className="flex h-[32px] items-center gap-[6px] rounded-full border border-[rgb(var(--uc-static-white-rgb)_/_0.45)] px-[12px] font-['UniCredit',sans-serif] text-[13px] font-bold text-[var(--uc-static-white)]"
          >
            EN
            <AppIcon name="chevron-down" color="currentColor" />
          </TemplateAction>
        </div>

        <section className="mt-auto rounded-t-[16px] bg-[rgb(var(--uc-static-black-rgb)_/_0.94)] px-[24px] pb-[32px] pt-[24px]">
          <h1 className="font-['UniCredit',sans-serif] text-[30px] font-bold leading-[34px] text-[var(--uc-static-white)]">
            New look, more services.
          </h1>
          <p className="mt-[8px] font-['UniCredit',sans-serif] text-[17px] font-normal leading-[21px] text-[rgb(var(--uc-static-white-rgb)_/_0.78)]">
            Open an account quickly and continue with everyday banking.
          </p>
          <div className="mt-[18px] flex flex-col gap-[6px]">
            {preloginProducts.map((product) => (
              <PreloginProductRow key={product.title} product={product} interactive={interactive} />
            ))}
          </div>
          <div className="mt-[20px]">
            {interactive ? (
              <PrimaryButton className="w-full">Activate application</PrimaryButton>
            ) : (
              <div className="flex h-[48px] w-full items-center justify-center rounded bg-[var(--uc-action-strong)] font-['UniCredit',sans-serif] text-base font-bold text-[var(--uc-static-white)]">
                Activate application
              </div>
            )}
          </div>
          <div className="mt-[20px] flex justify-between font-['UniCredit',sans-serif] text-[13px] font-bold uppercase leading-[16px] text-[var(--uc-static-white)]">
            <span>Contacts</span>
            <span>mToken</span>
            <span>Other</span>
          </div>
        </section>
      </div>
    </TemplatePhoneSurface>
  );
}

export function PreloginActiveTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface statusBarVariant="dark" reserveSystemHeader={false}>
      <PreloginBackgroundArt />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--uc-static-black-rgb)_/_0.78)_0%,rgb(var(--uc-static-black-rgb)_/_0)_54%)]" />
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-center justify-between px-[24px] pt-[70px]">
          <UniCreditLogo className="h-[24px] w-auto" />
          <TemplateAction
            ariaLabel="Change language"
            interactive={interactive}
            className="flex h-[32px] items-center gap-[6px] rounded-full border border-[rgb(var(--uc-static-white-rgb)_/_0.45)] px-[12px] font-['UniCredit',sans-serif] text-[13px] font-bold text-[var(--uc-static-white)]"
          >
            EN
            <AppIcon name="chevron-down" color="currentColor" />
          </TemplateAction>
        </div>
        <section className="px-[24px] pt-[30px] font-['UniCredit',sans-serif] text-[var(--uc-static-white)]">
          <h1 className="text-[38px] font-bold leading-[40px]">Welcome back</h1>
          <p className="mt-[8px] uc-type-p1 leading-normal text-[rgb(var(--uc-static-white-rgb)_/_0.82)]">
            Continue to Mobile Banking.
          </p>
        </section>
        <section className="mt-auto bg-[rgb(var(--uc-static-black-rgb)_/_0.94)] px-[24px] pb-[32px] pt-[32px]">
          {interactive ? (
            <PrimaryButton className="w-full">Log in</PrimaryButton>
          ) : (
            <div className="flex h-[48px] w-full items-center justify-center rounded bg-[var(--uc-action-strong)] font-['UniCredit',sans-serif] text-base font-bold text-[var(--uc-static-white)]">
              Log in
            </div>
          )}
          <div className="mt-[24px] flex justify-between font-['UniCredit',sans-serif] text-[13px] font-bold uppercase leading-[16px] text-[var(--uc-static-white)]">
            <span>Contacts</span>
            <span>mToken</span>
            <span>Other</span>
          </div>
        </section>
      </div>
    </TemplatePhoneSurface>
  );
}

export function LanguageSelectorSheetTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface statusBarVariant="dark" reserveSystemHeader={false}>
      <PreloginBackgroundArt />
      <div className="absolute inset-0 bg-[rgb(var(--uc-static-black-rgb)_/_0.52)]" />
      <section className="absolute inset-x-0 bottom-0 rounded-t-[12px] bg-[var(--uc-sheet-bg)] px-[24px] pb-[32px] pt-[20px]">
        <div className="mb-[18px] flex items-start justify-between gap-[16px]">
          <h1 className="font-['UniCredit',sans-serif] uc-type-h1 leading-normal text-[var(--uc-text)]">
            Select language
          </h1>
          <TemplateAction className="grid size-[32px] place-items-center" ariaLabel="Close" interactive={interactive}>
            <AppIcon name="close-x" color="var(--uc-text)" />
          </TemplateAction>
        </div>
        <div className="flex flex-col">
          {languageSelectorOptions.map((option) => (
            <TemplateRadioRow key={option.title} option={option} interactive={interactive} />
          ))}
        </div>
        <div className="mt-[20px]">
          {interactive ? (
            <PrimaryButton className="w-full">Confirm</PrimaryButton>
          ) : (
            <div className="flex h-[48px] w-full items-center justify-center rounded bg-[var(--uc-action-strong)] font-['UniCredit',sans-serif] text-base font-bold text-[var(--uc-static-white)]">
              Confirm
            </div>
          )}
        </div>
      </section>
    </TemplatePhoneSurface>
  );
}

export function MorePanelMenuTemplate() {
  return (
    <TemplatePhoneSurface statusBarVariant="dark" reserveSystemHeader={false}>
      <PreloginBackgroundArt />
      <PanelWithTranslations
        aboutSmartBanking="ABOUT SMART BANKING"
        exchangeRates="EXCHANGE RATES"
        findAtmBranches="FIND ATM & BRANCHES"
        startCoAppingSession="START CO-APPING SESSION"
      />
    </TemplatePhoneSurface>
  );
}

export function CoAppingSessionTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[32px] scrollbar-hide">
        <TemplateTopChrome title="Co-Apping session" showHelp={false} interactive={interactive} />
        <main className="px-[24px] pt-[24px] font-['UniCredit',sans-serif]">
          <div className="relative h-[160px] overflow-hidden rounded-[8px] bg-[linear-gradient(120deg,var(--uc-action-soft)_0%,var(--uc-product-blue)_100%)]">
            <div className="absolute bottom-[-22px] left-[30px] h-[132px] w-[116px] rounded-t-[48px] bg-[var(--uc-product-blue-deep)]" />
            <div className="absolute left-[56px] top-[33px] size-[50px] rounded-full bg-[var(--uc-product-brown)]" />
            <div className="absolute right-[25px] top-[31px] h-[98px] w-[110px] rounded-[14px] bg-[rgb(var(--uc-static-white-rgb)_/_0.58)] p-[12px]">
              <div className="h-[12px] w-[70px] rounded bg-[var(--uc-surface-muted)]" />
              <div className="mt-[12px] h-[12px] w-[50px] rounded bg-[var(--uc-surface-muted)]" />
              <div className="mt-[20px] h-[26px] rounded bg-[var(--uc-action)]" />
            </div>
          </div>
          <div className="pt-[24px] uc-type-n4 leading-[22px] text-[var(--uc-text)]">
            <p>A UniCredit consultant can guide you through the app while you stay in control.</p>
            <p className="mt-[16px]">Enter the session code shared by the consultant to start the secure co-apping session.</p>
          </div>
          <div className="pt-[24px]">
            <TextField
              label="Co-Apping code"
              value="472 915"
              onChange={() => undefined}
              helperText="Never share passwords, card PINs, or one-time authorization codes."
            />
          </div>
          <div className="mt-[24px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[14px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
            The session can be ended at any time from the shared screen banner.
          </div>
        </main>
      </div>
      <TemplateBottomButton label="Continue" interactive={interactive} bottom={32} />
    </TemplatePhoneSurface>
  );
}

export function AccountTransactionsListTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[88px] scrollbar-hide">
        <TemplateTopChrome title="Transactions" showHelp={false} interactive={interactive} />
        <main className="px-[24px] pt-[18px] font-['UniCredit',sans-serif]">
          <AccountBalancePreviewCard />
          <TemplateSearchStrip interactive={interactive} />
          <SectionHeadingDivider title="APRIL 2026" />
          <div className="pt-[12px]">
            {accountTransactionTemplateRows.map((row) => (
              <TemplateTransactionRow key={row.title} {...row} />
            ))}
          </div>
        </main>
      </div>
      <TemplateFiveBottomNavigation active="Home" />
    </TemplatePhoneSurface>
  );
}

export function SpendingMoneyOutTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <div className="h-full overflow-y-auto bg-[var(--uc-surface)] pb-[90px] scrollbar-hide">
        <TemplateTopLevelHeader
          title="My Spendings"
          subtitle="April 2026"
          actions={[{ icon: "help-circle", label: "Help" }]}
          interactive={interactive}
        />
        <main className="px-[24px] pt-[20px] font-['UniCredit',sans-serif]">
          <div className="rounded-[8px] bg-[var(--uc-surface-muted)] p-[18px]">
            <p className="uc-type-n5-strong uppercase leading-[18px] text-[var(--uc-text-muted)]">Money out</p>
            <p className="mt-[8px] text-[32px] font-bold leading-none text-[var(--uc-text)]">-2.945,60 <span className="text-[18px]">RON</span></p>
            <div className="mt-[18px] grid h-[96px] grid-cols-4 items-end gap-[10px]" aria-hidden="true">
              <span className="h-[84px] rounded-t-full bg-[var(--uc-product-pink)]" />
              <span className="h-[55px] rounded-t-full bg-[var(--uc-action)]" />
              <span className="h-[36px] rounded-t-full bg-[var(--uc-product-blue)]" />
              <span className="h-[27px] rounded-t-full bg-[var(--uc-orange-status)]" />
            </div>
          </div>
          <section className="pt-[24px]">
            <SectionHeadingDivider title="CATEGORIES" />
            <div className="pt-[14px]">
              {spendingMoneyOutRows.map((row) => (
                <div key={row.title} className="grid min-h-[74px] grid-cols-[36px_1fr_auto] items-center gap-[12px] border-b border-[var(--uc-border-muted)]">
                  <span className="grid size-[32px] place-items-center rounded-full bg-[var(--uc-action-soft)] text-[var(--uc-action)]">
                    <AppIcon name={row.icon} color="currentColor" />
                  </span>
                  <span className="min-w-0">
                    <span className="block uc-type-n4-strong leading-[20px] text-[var(--uc-text)]">{row.title}</span>
                    <span className="mt-[7px] block h-[5px] overflow-hidden rounded-full bg-[var(--uc-surface-muted)]">
                      <span className={`block h-full rounded-full ${row.barClass}`} style={{ width: row.share }} />
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block uc-type-n4-strong leading-[20px] text-[var(--uc-text)]">{row.amount}</span>
                    <span className="mt-[2px] block text-[13px] font-normal leading-[16px] text-[var(--uc-text-muted)]">{row.share}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
      <TemplateFiveBottomNavigation active="Spending" />
    </TemplatePhoneSurface>
  );
}

export function ProductsShopSmartTemplate() {
  const menu = getProductsMenuForCountry("RO");
  const { t } = useLanguage();

  return (
    <TemplatePhoneSurface showSystemHeader={false}>
      <div className="relative flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]">
        <div className="h-[54px] flex-shrink-0 bg-[var(--uc-surface)]" />
        <ProductsHeader title={t("runtime.productsMenu.title", menu.title)} />
        <ProductsTabs
          activeTab="shopsmart"
          bankingLabel={t("runtime.productsMenu.banking", menu.bankingTabLabel)}
          shopSmartLabel={t("runtime.productsMenu.shopSmart", menu.shopSmartTabLabel)}
          onChange={() => undefined}
        />

        <div className="relative z-0 flex-1 overflow-y-auto scrollbar-hide pb-[92px]">
          <ShopSmartContent
            summary={menu.shopSmartSummary}
            offerCards={menu.shopSmartOfferCards}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center border-t border-[var(--uc-border-muted)] bg-[var(--uc-bottom-bar-bg)]">
          <BottomNavigation activeTab="products" />
        </div>
      </div>
    </TemplatePhoneSurface>
  );
}

export function LogoutConfirmationTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface showSystemHeader={false}>
      <div className="absolute inset-0 bg-[var(--uc-surface)]">
        <MoreMenuTemplate interactive={false} />
      </div>
      <LogoutConfirmDialog isOpen onClose={() => undefined} onConfirm={interactive ? () => undefined : undefined} />
    </TemplatePhoneSurface>
  );
}

export function ProductDetailTemplate({ interactive }: { interactive: boolean }) {
  return (
    <TemplatePhoneSurface>
      <ProductDetailScreen
        title="Product name"
        cardId="account"
        optionId="current-account"
        actionLabel="Button"
        includeSafeArea={false}
        onBack={() => undefined}
        onActionClick={interactive ? () => undefined : undefined}
      />
    </TemplatePhoneSurface>
  );
}

export function AccountProductPromoTemplate({
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
        <span className="max-w-[250px] whitespace-pre-line font-['UniCredit',sans-serif] uc-type-n5 leading-[17px] text-[var(--uc-static-white)]">
          {description}
        </span>
      </span>
    </TemplateAction>
  );
}

export function AccountOptionsTemplate({ interactive }: { interactive: boolean }) {
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
                  <span className="block font-['UniCredit',sans-serif] uc-type-n5-strong uppercase leading-[18px] text-[var(--uc-text)]">
                    {item.title}
                  </span>
                  <span className="mt-[2px] block font-['UniCredit',sans-serif] uc-type-n5 leading-[18px] text-[var(--uc-text-muted)]">
                    {item.description}
                  </span>
                </span>
                <AppIcon name="chevron-link" color="var(--uc-text)" />
              </TemplateAction>
            ))}
          </div>

          <section className="pt-[28px]">
            <h2 className="border-b border-[var(--uc-border)] pb-[8px] font-['UniCredit',sans-serif] uc-type-n4-strong uppercase leading-[20px] text-[var(--uc-text)]">
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
