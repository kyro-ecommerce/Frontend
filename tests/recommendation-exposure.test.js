import assert from "node:assert/strict";
import test from "node:test";
import {
  attachRecommendation,
  cardTracking,
  createImpressionGate,
  eventOptions,
  RECOMMENDATION_META,
} from "../src/services/user/recommendationExposure.js";
import { createBehaviourEvent } from "../src/services/user/productViewTracking.js";

const response = { recommendation_id: "rec-1", strategy: "catalog_popularity", model_version: "catalog_popularity" };

test("items are tagged with the serving response without mutating it", () => {
  const items = [{ product_id: 1 }, { product_id: 2 }];
  const tagged = attachRecommendation(items, response, "trending");
  assert.equal(items[0][RECOMMENDATION_META], undefined);
  assert.deepEqual(cardTracking(tagged[1], 1), {
    recommendationId: "rec-1", modelVersion: "catalog_popularity", surface: "trending", position: 1,
  });
});

test("responses without an exposure id stay untracked", () => {
  const items = [{ product_id: 1 }];
  assert.equal(attachRecommendation(items, { strategy: "x" }, "trending"), items);
  assert.equal(cardTracking(items[0], 0), null);
  assert.equal(cardTracking(attachRecommendation(items, response, "trending")[0], -1), null);
});

test("an impression is reported once per list and product", () => {
  const gate = createImpressionGate(2);
  assert.equal(gate("rec-1", 1), true);
  assert.equal(gate("rec-1", 1), false);
  assert.equal(gate("rec-2", 1), true);   // a new list is a new exposure
  assert.equal(gate("rec-3", 1), true);   // bounded: oldest key evicted
  assert.equal(gate("rec-1", 1), true);
});

test("tracking becomes an attributed IMPRESSION event without an actor", () => {
  const tracking = cardTracking(attachRecommendation([{ product_id: 9 }], response, "similar")[0], 3);
  const event = createBehaviourEvent("IMPRESSION", 9, {
    ...eventOptions(tracking), sessionId: () => "s", createId: () => "id", now: () => new Date("2026-11-21T00:00:00Z"),
  });
  assert.equal(event.event_type, "IMPRESSION");
  assert.equal(event.recommendation_id, "rec-1");
  assert.equal(event.position, 3);
  assert.equal(event.surface, "similar");
  assert.equal("user_id" in event, false);
});
