import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { buildSync } from "esbuild";
import {
  mapSimilarProductCard, normalizeCatalogRating, variantCapacityLabel,
} from "../src/features/user/product/recommendationCard.js";

// Render the actual JSX component without adding a test framework or writing a
// compiled file. Dependencies are real React/router/MUI, not component doubles.
const componentPath = fileURLToPath(new URL("../src/features/user/product/ProductCard.jsx", import.meta.url));
const compiled = buildSync({
  entryPoints: [componentPath], bundle: true, platform: "node", format: "cjs",
  packages: "external", write: false, logLevel: "silent",
}).outputFiles[0].text;
const componentModule = { exports: {} };
new Function("require", "module", "exports", compiled)(
  createRequire(componentPath), componentModule, componentModule.exports,
);
const ProductCard = componentModule.exports.default;

function render(props) {
  return renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(ProductCard, props)));
}

function fixture() {
  return {
    product_id: 4, title: "Fixture laptop", original_price: 25_000_000,
    discounted_price: 20_000_000, discount_percent: 20, average_rating: 0,
    comparison_basis: "sku_snapshot", reason: "Fixture reason, not a quality label",
    selected_variant: {
      variant_id: 9, sku: "FIXTURE-16GB", variant_name: "16GB/1TB SSD",
      price_vnd: 25_000_000, sale_price_vnd: 20_000_000, stock: 2,
      ram_gb: 16, storage_gb: 1000, ram_source: "variantName", storage_source: "variantName",
      parser_version: "laptop-variant-name-v1", verified: false,
    },
  };
}

test("zero/missing/invalid catalog rating is unknown, never five", () => {
  for (const value of [0, null, undefined, "", " ", true, false, [], [5], {}, NaN, Infinity, -1, 6]) {
    assert.equal(normalizeCatalogRating(value), null);
  }
  assert.equal(normalizeCatalogRating(4.5), 4.5);
  assert.equal(normalizeCatalogRating("4.5"), 4.5);
});

test("mapping preserves zero without falling through to five", () => {
  const input = { ...fixture(), averageRating: 0, average_rating: 5 };
  assert.equal(mapSimilarProductCard(input).ratingImage, null);
});

test("API fixture maps to same-SKU prices and actual component displays evidence", () => {
  const props = mapSimilarProductCard(fixture());
  assert.equal(props.price, 20_000_000);
  assert.equal(props.originalPrice, 25_000_000);
  assert.equal(props.discountPercent, 20);
  const html = render(props);
  for (const text of ["FIXTURE-16GB", "variant 9", "16 GB", "1000 GB", "Chưa có đánh giá", "chưa xác minh độc lập", "chọn đúng SKU", "Fixture reason"]) {
    assert.ok(html.includes(text), `Expected rendered text: ${text}`);
  }
  assert.ok(html.includes("20.000.000"));
  assert.ok(!html.includes("5 Stars"));
});

test("shared ProductCard itself does not restore five stars when props are missing", () => {
  const html = render({ title: "Fixture", ratingImage: 0 });
  assert.ok(html.includes("Chưa có đánh giá"));
  assert.ok(!html.includes("5 Stars"));
});

test("real positive rating still renders rather than becoming missing", () => {
  const html = render({ title: "Fixture", ratingImage: 4.5, reviewCount: 10 });
  assert.ok(!html.includes("Chưa có đánh giá"));
  assert.ok(html.includes("4.5 Stars"));
});

test("legacy responses render without invented SKU details", () => {
  const props = mapSimilarProductCard({ product_id: 1, title: "Legacy", original_price: 10_000_000, average_rating: 0 });
  const html = render(props);
  assert.ok(html.includes("Chưa có đánh giá"));
  assert.ok(!html.includes("Cấu hình SKU được gợi ý"));
  assert.equal(props.selectedVariant, null);
});

test("inconsistent SKU price pairs and missing evidence are not rendered", () => {
  for (const input of [
    { ...fixture(), discounted_price: 1 },
    { ...fixture(), original_price: 1 },
    { ...fixture(), selected_variant: null },
    { ...fixture(), selected_variant: { ...fixture().selected_variant, sale_price_vnd: 30_000_000 } },
  ]) assert.equal(mapSimilarProductCard(input), null);
});

test("unknown capacities stay unknown, not read from a parent or the variant title", () => {
  const input = fixture();
  input.selected_variant.ram_gb = null;
  input.ram_capacity = "64GB";
  const props = mapSimilarProductCard(input);
  assert.equal(variantCapacityLabel(props.selectedVariant), "RAM: chưa rõ · Lưu trữ: 1000 GB");
  assert.ok(!render(props).includes("64GB"));
});

test("catalog strings are escaped by React, not inserted as markup", () => {
  const input = fixture();
  input.selected_variant.sku = '<img src=x onerror="alert(1)">';
  const html = render(mapSimilarProductCard(input));
  assert.ok(html.includes("&lt;img"));
  assert.ok(!html.includes('<img src="x"'));
});

test("five audited callers preserve missing/zero ratings through their actual mapping expressions", () => {
  // Source-wiring regression plus real ProductCard render, not browser E2E of
  // the parent screens (their fetch/hooks are not executed by this test).
  const files = [
    "../src/pages/user/Catalog/Catalog.jsx",
    "../src/features/user/catalog/ZeroResultsRecommendations.jsx",
    "../src/features/user/product/ComplementaryAccessories.jsx",
    "../src/features/user/product/CartAccessories.jsx",
    "../src/features/user/product/RecommendedForYou.jsx",
  ];
  for (const file of files) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    const match = source.match(/normalizeCatalogRating\((?:item|product)\.average(?:Rating|_rating)\s*\?\?\s*(?:item|product)\.average(?:Rating|_rating)\)/);
    assert.ok(match, `Missing nullish rating mapping: ${file}`);
    const getRating = new Function("normalizeCatalogRating", "item", "product", `return ${match[0]};`);
    for (const input of [
      { averageRating: 0, average_rating: 0 }, {},
      { averageRating: null, average_rating: null },
    ]) {
      const rating = getRating(normalizeCatalogRating, input, input);
      assert.equal(rating, null, file);
      assert.ok(render({ title: "Fixture", ratingImage: rating }).includes("Chưa có đánh giá"), file);
    }
    const input = { averageRating: 4.5, average_rating: 4.5 };
    assert.equal(getRating(normalizeCatalogRating, input, input), 4.5, file);
  }
});
