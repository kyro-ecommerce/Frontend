import assert from "node:assert/strict";
import test from "node:test";
import {
  createProductViewEvent,
  createProductViewVisit,
  createViewSessionProvider,
  deliverProductView,
  parseProductId,
  PRODUCT_VIEW_PATH,
} from "../src/services/user/productViewTracking.js";

const UUID = "27f43d67-998c-4aeb-89f7-48a27a4bf321";
const event = createProductViewEvent("42", {
  sessionId: () => `view-session-${UUID}`,
  createId: () => UUID,
  now: () => new Date("2026-10-29T03:00:00Z"),
});

test("VIEW carries product identity, stable event/session IDs, and UTC time only", () => {
  assert.equal(PRODUCT_VIEW_PATH, "/ai/interactions/view");
  assert.deepEqual(event, {
    product_id: 42,
    event_id: `view-${UUID}`,
    session_id: `view-session-${UUID}`,
    occurred_at: "2026-10-29T03:00:00.000Z",
  });
  assert.ok(Object.isFrozen(event));
  assert.equal("user_id" in event, false);
  assert.equal("interaction_type" in event, false);
});

test("invalid product identities are rejected without array-position renumbering", () => {
  for (const input of [0, -1, null, true, "abc", "1e3", "", 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(parseProductId(input), null);
    assert.throws(() => createProductViewEvent(input));
  }
});

test("session survives a new provider instance using the same sessionStorage", () => {
  const values = new Map();
  const storage = () => ({ getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) });
  let generated = 0;
  const provider = createViewSessionProvider({ storage, createId: () => { generated += 1; return UUID; } });
  assert.equal(provider(), provider());
  const reloaded = createViewSessionProvider({ storage, createId: () => { throw new Error("must reuse"); } });
  assert.equal(reloaded(), `view-session-${UUID}`);
  assert.equal(generated, 1);
});

test("blocked storage keeps a stable in-memory session for the page lifetime", () => {
  const provider = createViewSessionProvider({
    storage: () => { throw new Error("storage blocked"); }, createId: () => UUID,
  });
  assert.equal(provider(), provider());
});

test("retry after a lost response reuses the exact event and accepts duplicate acknowledgement", async () => {
  const sent = [];
  let delays = 0;
  const result = await deliverProductView(event, {
    post: async (payload) => {
      sent.push(payload);
      if (sent.length === 1) throw new Error("response lost");
      return { data: { status: "duplicate", event_id: payload.event_id } };
    },
    wait: async () => { delays += 1; },
  });
  assert.equal(sent.length, 2);
  assert.equal(sent[0], sent[1]);
  assert.equal(delays, 1);
  assert.equal(result.status, "duplicate");
});

test("validation, auth, and missing-catalog errors do not trigger tracking retries", async () => {
  for (const status of [400, 401, 403, 404, 409, 422]) {
    let attempts = 0;
    const result = await deliverProductView(event, {
      post: async () => { attempts += 1; throw { response: { status } }; },
      wait: async () => { throw new Error("must not retry"); },
    });
    assert.equal(result, null);
    assert.equal(attempts, 1);
  }
});

test("transient errors have a bounded retry rather than an infinite loop", async () => {
  let attempts = 0;
  const result = await deliverProductView(event, {
    post: async () => { attempts += 1; throw { response: { status: 503 } }; },
    wait: async () => {},
  });
  assert.equal(attempts, 2);
  assert.equal(result, null);
});

test("HTTP 200 fallback and wrong-event acknowledgements are not recording success", async () => {
  for (const data of [{ message: "service unavailable" }, { status: "recorded", event_id: "different" }]) {
    assert.equal(await deliverProductView(event, { post: async () => ({ data }) }), null);
  }
});

test("a visit waits for record and coalesces repeated render/visibility callbacks", async () => {
  let created = 0;
  let sent = 0;
  const visit = createProductViewVisit({
    productId: 42,
    makeEvent: () => { created += 1; return event; },
    send: async () => { sent += 1; return { status: "recorded" }; },
  });
  assert.equal(created, 0);
  const first = visit.record();
  assert.equal(visit.record(), first);
  await first;
  await visit.record();
  assert.equal(created, 1);
  assert.equal(sent, 1);
});

test("a later visit to the same product gets a different event identity", async () => {
  const ids = [];
  let count = 0;
  for (let visit = 0; visit < 2; visit += 1) {
    await createProductViewVisit({
      productId: 42,
      makeEvent: () => ({ ...event, event_id: `visit-${++count}` }),
      send: async (payload) => { ids.push(payload.event_id); },
    }).record();
  }
  assert.notEqual(ids[0], ids[1]);
});

test("tracking failure does not reject the product-page visit", async () => {
  const visit = createProductViewVisit({
    productId: 42, makeEvent: () => event,
    send: async () => { throw new Error("tracking unavailable"); },
  });
  assert.equal(await visit.record(), null);
});
