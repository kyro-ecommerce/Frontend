import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";
import React from "react";
import { normalizeCatalogRating } from "../src/features/user/product/recommendationCard.js";
import { recommendationItems, recoverRecommendations } from "../src/services/user/recommendationRecovery.js";

function load(relativePath, dependencies) {
  // Run the real recovery hook/controller, but keep this wiring harness off
  // the browser/network. Timers are inert here; retry timing has separate tests.
  if (relativePath.endsWith(".jsx") && !relativePath.endsWith("RecommendationStatus.jsx")) {
    dependencies = { ...dependencies,
      "../../../services/user/recommendationRecovery.js": { recommendationItems },
      "../../../store/user/AuthContext": { useAuthContext: () => ({ isAuthenticated: false, isLoading: false }) },
      "../../../hooks/user/useRecoveringRecommendations.js": load("../src/hooks/user/useRecoveringRecommendations.js", {
        react: { ...dependencies.react, useRef: (initial) => dependencies.react.useState({ current: initial })[0] },
        "../../store/user/AuthContext": { useAuthContext: () => ({ isAuthenticated: false, isLoading: false }) },
        "../../services/user/recommendationRecovery.js": { recoverRecommendations: (options) => recoverRecommendations({
          ...options, browser: new EventTarget(), page: new EventTarget(), schedule: () => 0, unschedule: () => {},
        }) },
      }),
      "./RecommendationStatus": { default: () => null, __esModule: true },
      "../product/RecommendationStatus": { default: () => null, __esModule: true },
    };
  }
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  const { code } = transformSync(source, { loader: "jsx", format: "cjs", jsx: "transform" });
  const module = { exports: {} };
  new Function("require", "module", "exports", code)((name) => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  }, module, module.exports);
  return module.exports;
}

test("trending service forwards limit and response; empty data and failures are not replaced", async () => {
  const calls = [];
  let payload = { recommendations: [{ product_id: 4 }] };
  let failure;
  const { aiService } = load("../src/services/user/ai.service.js", {
    "../../config/user/ApiConfig": {
      API_BASE_URL: "https://fixture.invalid/api/v1",
      api: { get: async (...args) => {
        calls.push(args);
        if (failure) throw failure;
        return { data: payload };
      } },
    },
    "./productViewTracking.js": {},
    "./util": {},
    "./auth.service": {},
  });
  assert.equal(await aiService.getTrendingProducts(4), payload);
  assert.deepEqual(calls[0], ["https://fixture.invalid/api/v1/ai/recommendations/trending", { timeout: 15000, signal: undefined, params: { limit: 4 } }]);
  payload = { recommendations: [] };
  assert.equal(await aiService.getTrendingProducts(), payload);
  assert.equal(calls[1][1].params.limit, 5);
  failure = new Error("fixture transport failure");
  await assert.rejects(aiService.getTrendingProducts(), (error) => error === failure);
});

// Executes the real component's fetch/mapping using a minimal hook harness.
// Transport and ProductCard are doubles: this is wiring coverage, not browser E2E.
async function renderRecommendations(response, failure) {
  const states = [];
  const effects = [];
  let cursor = 0;
  const Card = () => null;
  const { default: Component } = load("../src/features/user/catalog/ZeroResultsRecommendations.jsx", {
    react: { ...React,
      useState: (initial) => {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (value) => { states[index] = value; }];
      },
      useEffect: (effect) => { effects.push(effect); },
    },
    "../../../services/user/ai.service": { aiService: { getTrendingProducts: async (limit) => {
      assert.equal(limit, 4);
      if (failure) throw failure;
      return response;
    } } },
    "../product/ProductCard": { default: Card, __esModule: true },
    "../product/recommendationCard.js": { normalizeCatalogRating },
  });
  Component();
  effects[0]();
  await new Promise((resolve) => setImmediate(resolve));
  cursor = 0;
  const tree = Component();
  const cards = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (node.type === Card) cards.push(node.props);
    for (const child of React.Children.toArray(node.props?.children)) visit(child);
  }
  visit(tree);
  return cards;
}

test("zero-results component maps canonical prices and preserves zero rating/discount", async () => {
  const [card] = await renderRecommendations({ recommendations: [{
    product_id: 4, title: "Fixture", discounted_price: 20_000_000,
    minSalePrice: 1, original_price: 25_000_000,
    average_rating: 0, discount_percent: 0, discountPercent: 99,
  }] });
  assert.equal(card.productId, 4);
  assert.equal(card.price, (20_000_000).toLocaleString("vi-VN", { style: "currency", currency: "VND" }));
  assert.ok(card.originalPrice.includes("25.000.000"));
  assert.equal(card.ratingImage, null);
  assert.equal(card.discountPercent, 0);
});

test("zero-results supports legacy price; missing/invalid prices do not invent discounts", async () => {
  const cards = await renderRecommendations({ recommendations: [
    { minSalePrice: 100, price: 200 },
    { original_price: 200 },
    { discounted_price: Infinity, original_price: 200 },
    { discounted_price: 0, minSalePrice: 100 },
  ] });
  assert.ok(cards[0].price.includes("100"));
  for (const card of cards.slice(1, 3)) {
    assert.equal(card.price, "N/A");
    assert.equal(card.originalPrice, null);
  }
  assert.ok(cards[3].price.startsWith("0"));
});

test("zero-results renders no cards for empty, malformed, or failed response", async (t) => {
  for (const response of [{ recommendations: [] }, {}, { recommendations: {} }]) {
    assert.deepEqual(await renderRecommendations(response), []);
  }
  t.mock.method(console, "warn", () => {});
  assert.deepEqual(await renderRecommendations(null, new Error("fixture failure")), []);
});

for (const name of ["FlashSale", "TopSale", "LatestTop"]) {
  test(`${name} uses BE minPrice/minSalePrice and hides invalid original prices`, async () => {
    const products = [
      { id: 9, minPrice: 699_000, minSalePrice: 496_290, discountPercent: 29 },
      { id: 1, minPrice: 100, minSalePrice: 100 },
      { id: 2, minPrice: 100, minSalePrice: 200 },
      { id: 3, minSalePrice: 100, price: 999 },
      { id: 4, minPrice: 200 },
      { id: 5, minPrice: Infinity, minSalePrice: 100 },
      { id: 6, minPrice: 200, minSalePrice: NaN },
      { id: 7, minPrice: 200, minSalePrice: 0 },
      { id: 8, minPrice: 200, minSalePrice: "100" },
    ];
    let state = [];
    let effect;
    const Card = () => null;
    const { default: Component } = load(`../src/features/user/product/${name}.jsx`, {
      react: { ...React,
        useState: () => [state, (value) => { state = value; }],
        useEffect: (callback) => { effect = callback; },
      },
      "react-router-dom": { useNavigate: () => () => {} },
      "./ProductCard": { default: Card, __esModule: true },
      "../../../services/user/product.service": {
        productService: { getProductByFilter: async () => ({ data: { content: products } }) },
      },
    });
    Component();
    effect();
    await new Promise((resolve) => setImmediate(resolve));
    const cards = [];
    function visit(node) {
      if (!node || typeof node !== "object") return;
      if (node.type === Card) cards.push(node.props);
      for (const child of React.Children.toArray(node.props?.children)) visit(child);
    }
    visit(Component());
    assert.equal(cards.length, products.length);
    const money = (value) => value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    assert.equal(cards[0].price, money(496_290));
    assert.equal(cards[0].originalPrice, money(699_000));
    assert.equal(cards[0].discountPercent, 29);
    for (const card of cards.slice(1)) assert.equal(card.originalPrice, null);
    for (const index of [4, 6, 7, 8]) assert.equal(cards[index].price, null);
    assert.ok(!JSON.stringify(cards).includes("N/A"));
  });
}

// Hook/transport wiring only; not browser E2E or a claim of device compatibility.
function complementaryHarness(getComplementaryProducts, getTrendingProducts = () => { throw new Error("Unexpected trending call"); }) {
  const states = [];
  let cursor = 0;
  let effect;
  const calls = [];
  const Card = () => null;
  const { default: Component } = load("../src/features/user/product/ComplementaryAccessories.jsx", {
    react: { ...React,
      useState: (initial) => {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (value) => { states[index] = value; }];
      },
      useEffect: (callback) => { effect = callback; },
    },
    "../../../services/user/ai.service": { aiService: {
      getComplementaryProducts: (...args) => {
        assert.ok(args[2].signal instanceof AbortSignal);
        calls.push(args.slice(0, 2));
        return getComplementaryProducts(...args);
      },
      getTrendingProducts: (...args) => { assert.ok(args[1].signal instanceof AbortSignal); calls.push(["trending", args[0]]); return getTrendingProducts(...args); },
    } },
    "./ProductCard": { default: Card, __esModule: true },
    "./recommendationCard.js": { normalizeCatalogRating },
  });
  return {
    calls,
    render(productId) {
      cursor = 0;
      const tree = Component({ productId });
      const cards = [];
      const texts = [];
      function visit(node) {
        if (typeof node === "string" || typeof node === "number") { texts.push(String(node)); return; }
        if (!node || typeof node !== "object") return;
        if (node.type === Card) cards.push(node.props);
        for (const child of React.Children.toArray(node.props?.children)) visit(child);
      }
      visit(tree);
      return { tree, cards, text: texts.join(" ") };
    },
    effect: () => effect(),
    settle: () => new Promise((resolve) => setImmediate(resolve)),
  };
}

test("complementary cards come only from their API, exclude target and cap at four", async () => {
  const harness = complementaryHarness(async () => ({ recommendations: [
    { product_id: 4 }, null,
    ...[18, 21, 10, 11, 17].map((id) => ({ product_id: id, title: `Fixture ${id}`, original_price: 200, discounted_price: 100, average_rating: 0 })),
  ] }));
  harness.render(4);
  harness.effect();
  await harness.settle();
  const { cards, text } = harness.render(4);
  assert.deepEqual(harness.calls, [[4, 6]]);
  assert.deepEqual(cards.map((c) => c.productId), [18, 21, 10, 11]);
  assert.equal(cards[0].price, 100);
  assert.equal(cards[0].originalPrice, 200);
  assert.equal(cards[0].ratingImage, null);
  assert.ok(text.includes("Phụ Kiện Gợi Ý Mua Kèm"));
  assert.ok(!text.includes("Bạn có thể quan tâm"));
});

test("malformed complementary response hides section without disguising it as empty", async () => {
  for (const response of [{}, { recommendations: {} }, null]) {
    const harness = complementaryHarness(async () => response);
    harness.render(4);
    harness.effect();
    await harness.settle();
    assert.deepEqual(harness.render(4).cards, []);
    assert.deepEqual(harness.calls, [[4, 6]]);
  }
});

test("empty/self-only complementary results use trending with a general-discovery heading", async () => {
  for (const response of [{ recommendations: [] }, { recommendations: [{ product_id: 4 }] }]) {
    const harness = complementaryHarness(async () => response, async (limit) => {
      assert.equal(limit, 6);
      return { recommendations: [4, 1, 2, 3, 5, 6].map((id) => ({ product_id: id, title: `Fixture ${id}`, original_price: 200, discounted_price: 100 })) };
    });
    harness.render(4);
    harness.effect();
    await harness.settle();
    const { cards, text } = harness.render(4);
    assert.deepEqual(cards.map((card) => card.productId), [1, 2, 3, 5]);
    assert.equal(cards[0].price, 100);
    assert.ok(text.includes("Bạn có thể quan tâm"));
    assert.ok(text.includes("Gợi ý chung từ danh mục"));
    assert.ok(!text.includes("Phụ Kiện Gợi Ý Mua Kèm"));
    assert.deepEqual(harness.calls, [[4, 6], ["trending", 6]]);
  }
});

test("empty/malformed/failed trending fallback hides the section", async (t) => {
  t.mock.method(console, "error", () => {});
  for (const fallback of [
    async () => ({ recommendations: [] }),
    async () => ({ recommendations: {} }),
    async () => { throw new Error("Fixture trending failure"); },
  ]) {
    const harness = complementaryHarness(async () => ({ recommendations: [] }), fallback);
    harness.render(4);
    harness.effect();
    await harness.settle();
    assert.deepEqual(harness.render(4).cards, []);
    assert.deepEqual(harness.calls, [[4, 6], ["trending", 6]]);
  }
});

test("failed complementary request hides section without requesting trending", async (t) => {
  t.mock.method(console, "error", () => {});
  const harness = complementaryHarness(async () => { throw new Error("Fixture failure"); });
  harness.render(4);
  harness.effect();
  await harness.settle();
  assert.deepEqual(harness.render(4).cards, []);
  assert.deepEqual(harness.calls, [[4, 6]]);
});

test("late response from previous product cannot replace current complementary cards", async () => {
  const pending = {};
  const harness = complementaryHarness((id) => new Promise((resolve) => { pending[id] = resolve; }));
  harness.render(4);
  const cleanup = harness.effect();
  cleanup();
  harness.render(6);
  const cleanupCurrent = harness.effect();
  pending[6]({ recommendations: [{ product_id: 18 }] });
  await harness.settle();
  pending[4]({ recommendations: [{ product_id: 21 }] });
  await harness.settle();
  assert.deepEqual(harness.render(6).cards.map((c) => c.productId), [18]);
  assert.deepEqual(harness.calls, [[4, 6], [6, 6]]);
  cleanupCurrent();
  harness.render(null);
  harness.effect();
  assert.deepEqual(harness.render(null).cards, []);
  assert.equal(harness.calls.length, 2);
});

test("late trending fallback cannot overwrite new product cards or heading", async () => {
  let finishTrending;
  const harness = complementaryHarness(
    async (id) => ({ recommendations: id === 4 ? [] : [{ product_id: 18 }] }),
    () => new Promise((resolve) => { finishTrending = resolve; }),
  );
  harness.render(4);
  const cleanup = harness.effect();
  await harness.settle();
  cleanup();
  harness.render(6);
  harness.effect();
  await harness.settle();
  finishTrending({ recommendations: [{ product_id: 1 }] });
  await harness.settle();
  const { cards, text } = harness.render(6);
  assert.deepEqual(cards.map((card) => card.productId), [18]);
  assert.ok(text.includes("Phụ Kiện Gợi Ý Mua Kèm"));
  assert.ok(!text.includes("Bạn có thể quan tâm"));
});
