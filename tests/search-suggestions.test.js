import assert from "node:assert/strict";
import test from "node:test";
import { fromAiResults, fromCatalogResults, loadSuggestions } from "../src/services/user/searchSuggestions.js";

const ai = { results: [
  { product_id: 10, title: "Tai nghe Sony", original_price: 8000000, discounted_price: 7400000, image_url: "a.png" },
  { product_id: 11, title: "AirPods", original_price: 6000000, discounted_price: null },
  { product_id: 0, title: "invalid" },
] };

test("AI rows map to the dropdown shape without inventing discounts", () => {
  assert.deepEqual(fromAiResults(ai), [
    { id: 10, title: "Tai nghe Sony", image: "a.png", salePrice: 7400000, originalPrice: 8000000 },
    { id: 11, title: "AirPods", image: "/Placeholder2.png", salePrice: 6000000, originalPrice: null },
  ]);
});

test("catalog rows keep their previous fields", () => {
  const rows = fromCatalogResults({ data: { content: [
    { id: 3, title: "X", imageUrls: [{ downloadUrl: "x.png" }], minSalePrice: 90, price: 100, discountPercent: 10 },
  ] } });
  assert.deepEqual(rows, [{ id: 3, title: "X", image: "x.png", salePrice: 90, originalPrice: 100 }]);
});

test("AI first; catalog when AI fails or finds nothing", async () => {
  const catalogSearch = async ({ keyword, size }) => ({ data: { totalElements: 12, content: [{ id: 5, title: keyword, minSalePrice: size }] } });
  const fromAi = await loadSuggestions("tai nghe", { aiSearch: async () => ai, catalogSearch });
  assert.equal(fromAi.source, "ai");
  assert.deepEqual(fromAi.items.map((i) => i.id), [10, 11]);

  const empty = await loadSuggestions("zzz", { aiSearch: async () => ({ results: [] }), catalogSearch });
  assert.equal(empty.source, "catalog");
  assert.equal(empty.total, 12);

  const failed = await loadSuggestions("x", { aiSearch: async () => { throw new Error("down"); }, catalogSearch });
  assert.equal(failed.source, "catalog");
});
