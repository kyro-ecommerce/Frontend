import assert from "node:assert/strict";
import test from "node:test";
import { conditionsOf, createConversationStore } from "../src/services/user/chatConversation.js";

const ID = "conv-27f43d67-998c-4aeb-89f7-48a27a4bf321";

function memoryStorage() {
  const map = new Map();
  return { getItem: (k) => (map.has(k) ? map.get(k) : null), setItem: (k, v) => map.set(k, v), removeItem: (k) => map.delete(k) };
}

test("conversation id survives in tab storage and can be cleared", () => {
  const storage = memoryStorage();
  const store = createConversationStore(() => storage);
  assert.equal(store.get(), null);
  store.set(ID);
  assert.equal(createConversationStore(() => storage).get(), ID);
  store.clear();
  assert.equal(store.get(), null);
});

test("malformed ids from a response are ignored", () => {
  const store = createConversationStore(() => memoryStorage());
  for (const bad of [null, "", "conv-1", "<script>", 42]) store.set(bad);
  assert.equal(store.get(), null);
});

test("blocked storage falls back to memory", () => {
  const store = createConversationStore(() => { throw new Error("blocked"); });
  store.set(ID);
  assert.equal(store.get(), ID);
});

test("conditions are read defensively", () => {
  assert.deepEqual(conditionsOf({ conditions: ["laptop", "≤ 20tr", "", 3] }), ["laptop", "≤ 20tr"]);
  assert.deepEqual(conditionsOf({}), []);
  assert.deepEqual(conditionsOf(null), []);
});
