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

function assertClose(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) <= 0.01, `${message}: expected ${expected}, received ${actual}`);
}

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const portfolio = await vite.ssrLoadModule("/src/app/config/investmentsPortfolioConfig.ts");
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
  }

  console.log("investment portfolio consistency audit ok countries=8 active=10 inactive=2");
} finally {
  await vite.close();
}
