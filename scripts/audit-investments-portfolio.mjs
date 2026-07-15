import assert from "node:assert/strict";
import { createServer } from "vite";

const COUNTRIES = ["RO", "CZ", "SK", "HU", "RS", "BA", "BA_BL", "SI"];
const expectedProductTypeCounts = {
  Fund: 4,
  Bond: 2,
  Stock: 2,
  ETF: 1,
  "Money market": 1,
};

const expectedTransactionTypes = [
  "COUPON",
  "BUY",
  "OTHER WITHDRAWAL",
  "COUPON",
  "BUY",
  "SELL",
  "OTHER WITHDRAWAL",
  "COUPON",
  "BUY",
  "SELL",
  "SELL",
  "OTHER WITHDRAWAL",
  "COUPON",
  "BUY",
  "SELL",
  "SELL",
];

const expectedOrderStatuses = [
  "EXECUTED",
  "PENDING",
  "EXECUTED",
  "EXECUTED",
  "PENDING",
  "REJECTED",
  "EXECUTED",
  "PENDING",
  "EXECUTED",
  "REJECTED",
  "EXECUTED",
  "PENDING",
  "EXECUTED",
  "EXECUTED",
];

const expectedOrderTypes = [
  "BUY",
  "BUY",
  "SELL",
  "BUY",
  "SELL",
  "SELL",
  "BUY",
  "SELL",
  "BUY",
  "SELL",
  "BUY",
  "SELL",
  "BUY",
  "SELL",
];

const expectedDistributionColors = ["#00A3E0", "#5BC199", "#074861", "#885BC1", "#535453", "#24A06B"];

function assertClose(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) <= 0.01, `${message}: expected ${expected}, received ${actual}`);
}

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const portfolio = await vite.ssrLoadModule("/src/app/config/investmentsPortfolioConfig.ts");

  assert.deepEqual(portfolio.buildInvestmentDistributionItems([], "product-type"), []);
  assert.deepEqual(portfolio.buildInvestmentHistoryTransactions([], "RO"), []);
  assert.deepEqual(portfolio.buildInvestmentHistoryOrders([], "RO"), []);

  for (const country of COUNTRIES) {
    const sourceProducts = [
      { type: "investment_account", balance: 10_000, name: "Investment portfolio" },
    ];
    const sourceTotal = portfolio.calculateInvestmentProductsTotalValue(sourceProducts);
    const securities = portfolio.buildInvestmentSecurities(sourceProducts, country);
    const active = securities.filter((security) => security.status === "active");
    const inactive = securities.filter((security) => security.status === "inactive");
    const activeTotal = active.reduce((sum, security) => sum + security.localValue, 0);
    const typeCounts = Object.fromEntries(
      Object.keys(expectedProductTypeCounts).map((type) => [
        type,
        active.filter((security) => security.productType === type).length,
      ]),
    );

    assert.equal(securities.length, 12, `${country}: expected 12 owned securities`);
    assert.equal(active.length, 10, `${country}: expected 10 active securities`);
    assert.equal(inactive.length, 2, `${country}: expected 2 inactive securities`);
    assertClose(activeTotal, sourceTotal, `${country}: active local values must equal source portfolio total`);
    assert.ok(
      inactive.every((security) => security.localValue === 0 && security.performanceAmount === 0 && security.quantity === 0),
      `${country}: inactive securities must carry no financial value`,
    );
    assert.deepEqual(typeCounts, expectedProductTypeCounts, `${country}: active product types must match the portfolio model`);

    const inactiveOnly = inactive.map((security) => ({ ...security, localValue: 1_000 }));
    assert.deepEqual(
      portfolio.buildInvestmentDistributionItems(inactiveOnly, "product-type"),
      [],
      `${country}: inactive-only securities must not produce a distribution`,
    );
    assert.deepEqual(
      portfolio.buildInvestmentHistoryTransactions(inactiveOnly, country),
      [],
      `${country}: inactive-only securities must not produce transactions`,
    );
    assert.deepEqual(
      portfolio.buildInvestmentHistoryOrders(inactiveOnly, country),
      [],
      `${country}: inactive-only securities must not produce orders`,
    );

    active.forEach((security) => {
      assert.ok(security.marketPrice > 0, `${country}:${security.id}: market price must be positive`);
      assertClose(
        security.marketPrice * security.quantity,
        security.value,
        `${country}:${security.id}: price times quantity must equal instrument value`,
      );
    });

    ["product-type", "currency", "asset-class", "account-list"].forEach((tabId) => {
      const items = portfolio.buildInvestmentDistributionItems(securities, tabId);
      assertClose(
        items.reduce((sum, item) => sum + item.value, 0),
        sourceTotal,
        `${country}:${tabId}: distribution values must equal the portfolio total`,
      );
      assert.equal(
        items.reduce((sum, item) => sum + item.percent, 0),
        100,
        `${country}:${tabId}: distribution percentages must equal 100`,
      );
    });

    const productTypeDistribution = portfolio.buildInvestmentDistributionItems(securities, "product-type");
    assert.deepEqual(
      productTypeDistribution.map(({ label, value, percent }) => ({ label, value, percent })),
      [
        { label: "Fund", value: 3_800, percent: 38 },
        { label: "Bond", value: 2_200, percent: 22 },
        { label: "Stock", value: 1_600, percent: 16 },
        { label: "ETF", value: 1_400, percent: 14 },
        { label: "Money market", value: 1_000, percent: 10 },
      ],
      `${country}: canonical product-type distribution must retain exact values and percentages`,
    );

    const transactions = portfolio.buildInvestmentHistoryTransactions(securities, country);
    const orders = portfolio.buildInvestmentHistoryOrders(securities, country);
    assert.equal(transactions.length, 16, `${country}: canonical transaction history must contain 16 rows`);
    assert.equal(orders.length, 14, `${country}: canonical order history must contain 14 rows`);
    assert.ok(
      [...transactions, ...orders].every((item) => active.some((security) => item.id.includes(security.id))),
      `${country}: history rows must reference active securities only`,
    );
    assert.deepEqual(transactions.map((item) => item.type), expectedTransactionTypes, `${country}: transaction type sequence`);
    assert.deepEqual(orders.map((item) => item.status), expectedOrderStatuses, `${country}: order status sequence`);
    assert.deepEqual(orders.map((item) => item.orderType), expectedOrderTypes, `${country}: order type sequence`);
    assert.equal(transactions[0]?.date, "2026-06-18T00:00:00.000Z", `${country}: first transaction date`);
    assert.equal(transactions.at(-1)?.date, "2024-09-20T00:00:00.000Z", `${country}: last transaction date`);
    assert.equal(orders[0]?.date, "2026-06-22T00:00:00.000Z", `${country}: first order date`);
    assert.equal(orders.at(-1)?.date, "2024-09-19T00:00:00.000Z", `${country}: last order date`);

    const oneActiveSecurity = active.slice(0, 1);
    const singleSecurityTransactions = portfolio.buildInvestmentHistoryTransactions(oneActiveSecurity, country);
    const singleSecurityOrders = portfolio.buildInvestmentHistoryOrders(oneActiveSecurity, country);
    assert.equal(singleSecurityTransactions.length, 16, `${country}: one active security must cycle across all transactions`);
    assert.equal(singleSecurityOrders.length, 14, `${country}: one active security must cycle across all orders`);
    assert.ok(
      [...singleSecurityTransactions, ...singleSecurityOrders].every((item) => item.id.includes(oneActiveSecurity[0].id)),
      `${country}: one-security history must retain the sole security`,
    );

    const sevenGroups = active.slice(0, 7).map((security, index) => ({
      ...security,
      localValue: 700 - index * 50,
      securityAccountId: `palette-${index}`,
      securityAccountName: `Palette ${index}`,
    }));
    assert.deepEqual(
      portfolio.buildInvestmentDistributionItems(sevenGroups, "account-list").map((item) => item.color),
      [...expectedDistributionColors, expectedDistributionColors[0]],
      `${country}: distribution palette must retain order and wrap after six groups`,
    );
  }

  console.log("investment portfolio consistency audit ok countries=8 active=10 inactive=2");
} finally {
  await vite.close();
}
