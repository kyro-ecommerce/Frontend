import assert from "node:assert/strict";
import test from "node:test";
import * as exposure from "../src/services/user/recommendationExposure.js";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";
import React from "react";
import { parseProductId } from "../src/services/user/productViewTracking.js";
import { normalizeCatalogRating, variantCapacityLabel } from "../src/features/user/product/recommendationCard.js";

function load(path, deps) {
  const { code } = transformSync(readFileSync(new URL(path, import.meta.url), "utf8"), { loader: "jsx", format: "cjs" });
  const module = { exports: {} };
  new Function("require", "module", "exports", code)((name) => {
    // The pure exposure module is safe to load for real in every harness.
    if (name.endsWith("/recommendationExposure.js")) return exposure;
    assert.ok(name in deps, `Unexpected dependency ${name}`);
    return deps[name];
  }, module, module.exports);
  return module.exports;
}
function nodes(tree) {
  if (!tree || typeof tree !== "object") return [];
  return [tree, ...React.Children.toArray(tree.props?.children).flatMap(nodes)];
}
const stub = { default: () => null, __esModule: true };

test("detail selection/query, purchase configuration and similar target share one identity", () => {
  let params = new URLSearchParams("variant=12");
  const Info = () => null;
  const Similar = () => null;
  const product = { id: 4, variants: [{ id: 11, active: true, stock: 2 }, { id: 12, active: true, stock: 3 }, { id: 13, active: true, stock: 0 }] };
  const { default: Detail } = load("../src/pages/user/ProductDetail/ProductDetail.jsx", {
    react: React,
    "react-router-dom": { useSearchParams: () => [params, (next) => { params = next; }] },
    "../../../services/user/productViewTracking.js": { parseProductId },
    "../../../hooks/user/useProductDetailPage": { useProductDetailPage: () => ({ productId: "4", product, productInfoData: product }) },
    "../../../features/user/product/ProductGallery": stub,
    "../../../features/user/product/ProductInfo": { default: Info, __esModule: true },
    "../../../features/user/product/ProductReviews": stub,
    "../../../features/user/product/RelatedProducts": { default: Similar, __esModule: true },
    "../../../features/user/product/ComplementaryAccessories": stub,
    "@mui/material": { Alert: "alert", CircularProgress: "progress", Typography: "span" },
  });
  let tree = nodes(Detail());
  assert.equal(tree.find((node) => node.type === Info).props.selectedVariantId, 12);
  assert.equal(tree.find((node) => node.type === Similar).props.targetVariantId, 12);
  assert.equal(tree.find((node) => node.type === Similar).props.showRankingControls, false);
  params = new URLSearchParams("variant=12&similar_policy=capacity_first");
  assert.equal(nodes(Detail()).find((node) => node.type === Similar).props.rankingPolicy, "hybrid");
  params.set("recommendation_demo", "1");
  const demo = nodes(Detail()).find((node) => node.type === Similar).props;
  assert.equal(demo.showRankingControls, true);
  assert.equal(demo.rankingPolicy, "capacity_first");
  demo.onRankingPolicyChange("hybrid");
  assert.equal(params.get("similar_policy"), "hybrid");
  tree.find((node) => node.type === Info).props.onVariantChange(11);
  tree = nodes(Detail());
  assert.equal(params.get("variant"), "11");
  assert.equal(tree.find((node) => node.type === Info).props.selectedVariantId, 11);
  assert.equal(tree.find((node) => node.type === Similar).props.targetVariantId, 11);
  for (const invalid of ["999", "13", "-1", "garbage", ""]) {
    params = new URLSearchParams(invalid ? `variant=${invalid}` : "");
    tree = nodes(Detail());
    assert.equal(tree.find((node) => node.type === Info).props.selectedVariantId, null);
    assert.equal(tree.some((node) => node.type === Similar), false);
  }
  product.variants = [];
  params = new URLSearchParams("variant=12");
  assert.equal(nodes(Detail()).some((node) => node.type === Similar), false);
});

test("similar wiring scopes requests by target SKU and forwards it with AbortSignal", async () => {
  let key;
  let request;
  const calls = [];
  const { default: Related } = load("../src/features/user/product/RelatedProducts.jsx", {
    react: React,
    "../../../hooks/user/useRecoveringRecommendations.js": { useRecoveringRecommendations: (scope, callback) => { key = scope; request = callback; return { data: [], status: "success" }; } },
    "../../../services/user/recommendationRecovery.js": { recommendationItems: (res) => res.recommendations },
    "../../../services/user/ai.service": { aiService: { getSimilarProducts: async (...args) => { calls.push(args); return { recommendations: [] }; } } },
    "./ProductCard": stub, "./RecommendationStatus": stub,
    "./recommendationCard.js": { mapSimilarProductCard: () => null },
  });
  const signal = new AbortController().signal;
  const normalTree = Related({ productId: 4, targetVariantId: 12 }); await request(signal);
  assert.equal(nodes(normalTree).some((node) => node.type === "select"), false);
  const demoTree = Related({ productId: 4, targetVariantId: 12, showRankingControls: true });
  assert.equal(nodes(demoTree).some((node) => node.type === "select"), true);
  assert.equal(key, "similar:4:12:hybrid");
  assert.deepEqual(calls[0], [4, 6, { signal, targetVariantId: 12, rankingPolicy: "hybrid" }]);
  Related({ productId: 4, targetVariantId: 11 });
  assert.equal(key, "similar:4:11:hybrid");
});

test("card keeps compact configuration/reason, folds evidence, and disclosure click stops navigation", () => {
  const destinations = [];
  const { default: Card } = load("../src/features/user/product/ProductCard.jsx", {
    react: React,
    "react-router-dom": { useNavigate: () => (path) => destinations.push(path) },
    "@mui/material": { Rating: () => null },
    "./recommendationCard.js": { normalizeCatalogRating, variantCapacityLabel },
    "./ImpressionTracker": stub,
  });
  const tree = Card({ productId: 4, title: "Fixture", price: 100,
    selectedVariant: { variant_id: 9, sku: "FIXTURE-9", ram_gb: 16, storage_gb: 1000, ram_source: "variantName" },
    recommendationReason: "Thông số gần cấu hình đang chọn; bằng chứng chi tiết chưa xác minh",
  });
  const all = nodes(tree);
  const reason = all.find((node) => node.props["aria-label"] === "Lý do gợi ý");
  assert.equal(reason.props.children, "Thông số gần cấu hình đang chọn");
  const details = all.find((node) => node.type === "details");
  assert.ok(details);
  assert.notEqual(details.props.open, true);
  assert.equal(nodes(details).find((node) => node.type === "summary").props.children, "Chi tiết gợi ý");
  let stopped = false;
  details.props.onClick({ stopPropagation: () => { stopped = true; } });
  assert.equal(stopped, true);
  assert.deepEqual(destinations, []);
  tree.props.onClick();
  assert.deepEqual(destinations, ["/product/4?variant=9"]);
});

test("similar transport sends optional target_variant_id without changing BE fields", async () => {
  let options;
  const { aiService } = load("../src/services/user/ai.service.js", {
    "../../config/user/ApiConfig": { API_BASE_URL: "https://fixture.invalid", api: { get: async (_url, config) => { options = config; return { data: {} }; } } },
    "./productViewTracking.js": { getAiSessionId: () => "fixture-session" }, "./util": {}, "./auth.service": {},
  });
  await aiService.getSimilarProducts(4, 6, { targetVariantId: 12 });
  assert.deepEqual(options.params, { limit: 6, session_id: "fixture-session", target_variant_id: 12 });
  await aiService.getSimilarProducts(4, 6);
  assert.deepEqual(options.params, { limit: 6, session_id: "fixture-session" });
});

test("tracked recommendation card is wrapped for impressions and reports an attributed click", () => {
  const destinations = [];
  const sent = [];
  exposure.registerExposureSender((type, productId, options) => sent.push([type, productId, options]));
  try {
    const Tracker = () => null;
    const { default: Card } = load("../src/features/user/product/ProductCard.jsx", {
      react: React,
      "react-router-dom": { useNavigate: () => (path) => destinations.push(path) },
      "@mui/material": { Rating: () => null },
      "./recommendationCard.js": { normalizeCatalogRating, variantCapacityLabel },
      "./ImpressionTracker": { default: Tracker, __esModule: true },
    });
    const tracking = { recommendationId: "rec-7", position: 2, modelVersion: "sku:hybrid", surface: "similar" };
    const tree = Card({ productId: 4, title: "Fixture", price: 100, tracking });
    assert.equal(tree.type, Tracker);
    assert.equal(tree.props.tracking, tracking);
    tree.props.children.props.onClick();
    assert.deepEqual(sent, [["CLICK", 4, { recommendationId: "rec-7", position: 2, modelVersion: "sku:hybrid", surface: "similar" }]]);
    assert.deepEqual(destinations, ["/product/4"]);
  } finally {
    exposure.registerExposureSender(null);
  }
});
