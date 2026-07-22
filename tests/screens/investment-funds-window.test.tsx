// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import InvestmentsFundBanner from "@/app/components/investments/InvestmentsFundBanner";
import type { InvestmentCatalogSecurity } from "@/app/config/investmentsPortfolioConfig";
import {
  InvestmentFundCollectionScreen,
  InvestmentFundsSelectionScreen,
} from "@/app/screens/investments/InvestmentFundsWindowScreens";

const securities: InvestmentCatalogSecurity[] = [
  {
    id: "one-off-fund",
    title: "Amundi Climate Focus Fund",
    sourceProductName: "Investment catalogue",
    status: "active",
    contributionType: "ONE OFF",
    value: 250,
    currency: "EUR",
    instrumentCurrency: "EUR",
    localValue: 6200,
    localCurrency: "CZK",
    securityAccountId: "catalog-eur",
    securityAccountName: "Available funds",
    securityAccountCurrency: "EUR",
    productType: "Fund",
    assetClass: "Equity",
    riskLevel: "High",
    liquidity: "Monthly",
    marketPrice: 42.68,
    quantity: 0,
    performanceAmount: 282.1,
    performancePercent: 4.55,
    logoId: "unicredit",
    owned: false,
    productId: "CZCLIMATE1",
    inceptionDate: "19.07.2020",
    lastUpdate: "21.07.2026",
    description: "Equity fund in EUR.",
  },
  {
    id: "regular-fund",
    title: "Sustainable Future Mixed Fund",
    sourceProductName: "Investment catalogue",
    status: "active",
    contributionType: "RECURRENT",
    value: 190,
    currency: "USD",
    instrumentCurrency: "USD",
    localValue: 4400,
    localCurrency: "CZK",
    securityAccountId: "catalog-usd",
    securityAccountName: "Available funds",
    securityAccountCurrency: "USD",
    productType: "Fund",
    assetClass: "Balanced",
    riskLevel: "Medium",
    liquidity: "Monthly",
    marketPrice: 35.27,
    quantity: 0,
    performanceAmount: 165,
    performancePercent: 3.75,
    logoId: "unicredit",
    owned: false,
    productId: "CZSUSTAIN2",
    inceptionDate: "20.07.2021",
    lastUpdate: "21.07.2026",
    description: "Balanced fund in USD.",
  },
];

afterEach(cleanup);

describe("Investments funds window", () => {
  it("keeps collection banners at a minimum height and lets multiline content grow the card", () => {
    render(
      <InvestmentsFundBanner
        title="A collection title that wraps naturally onto two lines"
        description="A subtitle that also wraps naturally onto two lines"
        actionLabel="FIND OUT MORE"
        variant="selection-plus"
      />,
    );

    const banner = screen.getByRole("button", { name: /A collection title/i });
    expect(banner.classList.contains("min-h-[126px]")).toBe(true);
    expect(banner.classList.contains("h-[126px]")).toBe(false);
    expect(banner.classList.contains("shrink-0")).toBe(true);
    expect(banner.classList.contains("isolate")).toBe(true);
  });

  it("scrolls the complete storefront and collapses its title into the standard header", () => {
    const onSelectCollection = vi.fn();

    render(
      <InvestmentFundsSelectionScreen
        onBack={vi.fn()}
        onSearch={vi.fn()}
        onSelectCollection={onSelectCollection}
      />,
    );

    const page = screen.getByTestId("investment-funds-selection");
    expect(page.classList.contains("overflow-y-auto")).toBe(true);
    expect(page.classList.contains("overflow-hidden")).toBe(false);
    expect(page.querySelector('[data-investment-funds-fixed-header="selection"]')).toBeNull();
    expect(screen.getByRole("button", { name: /Search funds/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Our Onemarket funds/i })).toBeTruthy();

    const compactTitle = screen
      .getAllByRole("heading", { name: "Our funds selection" })
      .find((heading) => heading.classList.contains("uc-type-n4-strong"));
    expect(compactTitle).toBeDefined();
    fireEvent.scroll(page, { target: { scrollTop: 96 } });
    expect(compactTitle?.style.opacity).toBe("1");
    expect(screen.getByRole("button", { name: /Selection\+ portfolios/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Featured this month/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Equity funds/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Balanced funds/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Conservative funds/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Our Onemarket funds/i }));
    expect(onSelectCollection).toHaveBeenCalledWith("onemarket");
  });

  it("groups collection funds and opens the selected existing security", () => {
    const onSelectSecurity = vi.fn();

    render(
      <InvestmentFundCollectionScreen
        collectionId="onemarket"
        securities={securities}
        country="CZ"
        amountsHidden={false}
        onBack={vi.fn()}
        onSelectSecurity={onSelectSecurity}
      />,
    );

    expect(screen.getAllByRole("heading", { name: "Our Onemarket funds" })).toHaveLength(1);
    const oneOffSection = screen.getByRole("region", { name: "One-off investment" });
    const regularSection = screen.getByRole("region", { name: "Regular investment" });
    expect(within(oneOffSection).getByText("1")).toBeTruthy();
    expect(within(regularSection).getByText("1")).toBeTruthy();

    fireEvent.click(within(oneOffSection).getByRole("button", { name: /Amundi Climate Focus Fund/i }));
    expect(onSelectSecurity).toHaveBeenCalledWith(securities[0]);
  });

  it("keeps the complete collection hero fixed while only the fund content scrolls", () => {
    render(
      <InvestmentFundCollectionScreen
        collectionId="onemarket"
        securities={securities}
        country="CZ"
        amountsHidden={false}
        onBack={vi.fn()}
        onSelectSecurity={vi.fn()}
      />,
    );

    const page = screen.getByTestId("investment-fund-collection-onemarket");
    const fixedHeader = page.querySelector('[data-investment-funds-fixed-header="collection"]');
    const scrollRegion = page.querySelector('[data-investment-funds-scroll-region="collection"]');

    expect(page.classList.contains("overflow-hidden")).toBe(true);
    expect(page.classList.contains("overflow-y-auto")).toBe(false);
    expect(fixedHeader).not.toBeNull();
    expect(fixedHeader?.firstElementChild?.classList.contains("pt-[var(--uc-phone-top-reserve,54px)]")).toBe(true);
    const hero = fixedHeader?.querySelector("section");
    const heroTitle = within(fixedHeader as HTMLElement).getByRole("heading", { name: "Our Onemarket funds" });
    const heroSubtitle = within(fixedHeader as HTMLElement).getByText(/Choose from a range of model portfolios/i);
    expect(hero?.classList.contains("h-[132px]")).toBe(true);
    expect(hero?.classList.contains("min-h-[188px]")).toBe(false);
    expect(heroTitle.classList.contains("line-clamp-1")).toBe(true);
    expect(heroSubtitle.classList.contains("line-clamp-3")).toBe(true);
    expect(scrollRegion?.classList.contains("overflow-y-auto")).toBe(true);
    expect(within(scrollRegion as HTMLElement).getByText(/Model portfolios combine/i)).toBeTruthy();
    expect(within(scrollRegion as HTMLElement).getByRole("region", { name: "One-off investment" })).toBeTruthy();
  });

  it("continues each collection banner color through the safe area and controls", () => {
    render(
      <InvestmentFundCollectionScreen
        collectionId="selection-plus"
        securities={securities}
        country="CZ"
        amountsHidden={false}
        onBack={vi.fn()}
        onSelectSecurity={vi.fn()}
      />,
    );

    const page = screen.getByTestId("investment-fund-collection-selection-plus");
    const fixedHeader = page.querySelector('[data-investment-funds-fixed-header="collection"]') as HTMLElement;

    expect(fixedHeader.style.backgroundColor).toBe("rgb(229, 217, 199)");
    expect(fixedHeader.firstElementChild?.classList.contains("bg-[var(--uc-surface)]")).toBe(false);
  });
});
