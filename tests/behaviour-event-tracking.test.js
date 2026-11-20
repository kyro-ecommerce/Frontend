import assert from "node:assert/strict";
import test from "node:test";
import {
  BEHAVIOUR_EVENT_PATH,
  createBehaviourEvent,
} from "../src/services/user/productViewTracking.js";

const UUID = "27f43d67-998c-4aeb-89f7-48a27a4bf321";
const fixed = {
  sessionId: () => `view-session-${UUID}`,
  createId: () => UUID,
  now: () => new Date("2026-11-20T03:00:00Z"),
};

test("ADD_TO_CART event carries product, ids and UTC time but never an actor", () => {
  assert.equal(BEHAVIOUR_EVENT_PATH, "/ai/interactions/event");
  const event = createBehaviourEvent("ADD_TO_CART", "42", { ...fixed, surface: "product_detail" });
  assert.deepEqual(event, {
    event_type: "ADD_TO_CART",
    product_id: 42,
    event_id: `add_to_cart-${UUID}`,
    session_id: `view-session-${UUID}`,
    occurred_at: "2026-11-20T03:00:00.000Z",
    surface: "product_detail",
  });
  assert.ok(Object.isFrozen(event));
  assert.equal("user_id" in event, false);
});

test("CLICK keeps recommendation attribution only when well-formed", () => {
  const event = createBehaviourEvent("CLICK", 7, {
    ...fixed, recommendationId: "rec-1", position: 2, modelVersion: "v1",
  });
  assert.equal(event.recommendation_id, "rec-1");
  assert.equal(event.position, 2);
  assert.equal(event.model_version, "v1");
  const bare = createBehaviourEvent("CLICK", 7, { ...fixed, position: -1, recommendationId: "" });
  assert.equal("position" in bare, false);
  assert.equal("recommendation_id" in bare, false);
});

test("unsupported types and invalid product ids are rejected", () => {
  assert.throws(() => createBehaviourEvent("PURCHASE", 1, fixed));
  assert.throws(() => createBehaviourEvent("VIEW", 1, fixed));
  assert.throws(() => createBehaviourEvent("CLICK", "abc", fixed));
  assert.throws(() => createBehaviourEvent("CLICK", 0, fixed));
});
