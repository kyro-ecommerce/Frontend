import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";

// Execute the real service with isolated HTTP/storage boundaries; not browser E2E.
function service({ token = null, refresh = async () => "refreshed-fixture-token" } = {}) {
  const calls = [];
  const saved = [];
  const dependencies = {
    "../../config/user/ApiConfig": {
      API_BASE_URL: "https://fixture.invalid/api/v1",
      api: {
        post: async (...args) => { calls.push(["POST", ...args]); return { data: {} }; },
        get: async (...args) => { calls.push(["GET", ...args]); return { data: {} }; },
      },
    },
    "./productViewTracking.js": { getAiSessionId: () => "fixture-session" },
    "./recommendationExposure.js": { registerExposureSender: () => {} },
    "./util": { getTokenFromLocalStorage: () => token, saveTokenToLocalStorage: (value) => saved.push(value) },
    "./auth.service": { authService: { refreshToken: refresh } },
  };
  const source = readFileSync(new URL("../src/services/user/ai.service.js", import.meta.url), "utf8");
  const { code } = transformSync(source, { loader: "js", format: "cjs" });
  const module = { exports: {} };
  new Function("require", "module", "exports", code)((name) => {
    assert.ok(name in dependencies, name);
    return dependencies[name];
  }, module, module.exports);
  return { ai: module.exports.aiService, calls, saved };
}

const streamResponse = () => new Response(
  'data: {"type":"metadata","recommended_products":[]}\n\ndata: {"type":"chunk","content":"Fixture reply"}\n\ndata: {"type":"done"}\n\n',
  { status: 200, headers: { "Content-Type": "text/event-stream" } },
);

test("chat/search/feedback send session, never a browser-claimed account ID", async () => {
  const { ai, calls } = service();
  await ai.chat("Fixture request");
  await ai.search("laptop", 4, 999); // Legacy extra argument is not an identity.
  await ai.sendFeedback("thumbs_up", "Fixture message");
  assert.deepEqual(calls[0][2], { message: "Fixture request", session_id: "fixture-session" });
  assert.deepEqual(calls[1][2].params, { q: "laptop", limit: 4, session_id: "fixture-session" });
  assert.equal(calls[2][2].session_id, "fixture-session");
  for (const call of calls) assert.ok(!JSON.stringify(call).includes('"user_id"'));
});

test("SSE forwards access token, keeps session and completes callbacks once", async (t) => {
  const { ai } = service({ token: "signed-fixture-token" });
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => { requests.push([url, options]); return streamResponse(); });
  const chunks = [];
  let done = 0;
  await ai.chatStream("Fixture", () => {}, (chunk) => chunks.push(chunk), () => done++, assert.fail, 999);
  assert.equal(done, 1);
  assert.deepEqual(chunks, ["Fixture reply"]);
  assert.equal(requests[0][1].headers.Authorization, "Bearer signed-fixture-token");
  assert.equal(requests[0][1].credentials, "include");
  assert.deepEqual(JSON.parse(requests[0][1].body), { message: "Fixture", session_id: "fixture-session" });
  assert.ok(!JSON.stringify(requests).includes("X-Internal-Token"));
});

test("guest SSE has no fabricated Authorization or user_id", async (t) => {
  const { ai } = service();
  let options;
  t.mock.method(globalThis, "fetch", async (_, value) => { options = value; return streamResponse(); });
  await ai.chatStream("Fixture", null, null, null, assert.fail);
  assert.equal(options.headers.Authorization, undefined);
  assert.equal(JSON.parse(options.body).user_id, undefined);
});

test("authenticated SSE refreshes once after a rejected request, preserving payload", async (t) => {
  let refreshes = 0;
  const { ai, saved } = service({ token: "expired-fixture", refresh: async () => { refreshes++; return "new-fixture"; } });
  const requests = [];
  t.mock.method(globalThis, "fetch", async (_, options) => {
    requests.push(options);
    return requests.length === 1 ? new Response("", { status: 401 }) : streamResponse();
  });
  await ai.chatStream("Fixture", null, null, null, assert.fail);
  assert.equal(refreshes, 1);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].body, requests[1].body);
  assert.equal(requests[1].headers.Authorization, "Bearer new-fixture");
  assert.deepEqual(saved, ["new-fixture"]);
});

test("failed refresh/repeated 401 cannot retry indefinitely or downgrade to guest", async (t) => {
  t.mock.method(console, "error", () => {});
  for (const refreshFails of [false, true]) {
    let refreshes = 0;
    let requests = 0;
    const { ai } = service({ token: "expired-fixture", refresh: async () => {
      refreshes++;
      if (refreshFails) throw new Error("Fixture refresh failure");
      return "new-fixture";
    } });
    t.mock.method(globalThis, "fetch", async (_, options) => {
      requests++;
      assert.ok(options.headers.Authorization);
      return new Response("", { status: 401 });
    });
    let errors = 0;
    let done = 0;
    await ai.chatStream("Fixture", null, null, () => done++, () => errors++);
    assert.equal(refreshes, 1);
    assert.equal(requests, refreshFails ? 1 : 2);
    assert.equal(errors, 1);
    assert.equal(done, 0);
  }
});

test("multi-turn chat sends the conversation id but never a user id", async (t) => {
  const { ai, calls } = service();
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => { requests.push([url, options]); return streamResponse(); });
  const conversationId = "conv-27f43d67-998c-4aeb-89f7-48a27a4bf321";
  await ai.chatStream("RAM 16GB", null, null, null, assert.fail, { conversationId });
  assert.deepEqual(JSON.parse(requests[0][1].body), {
    message: "RAM 16GB", session_id: "fixture-session", conversation_id: conversationId,
  });
  await ai.chat("RAM 16GB", { conversationId });
  assert.deepEqual(calls.at(-1)[2], { message: "RAM 16GB", session_id: "fixture-session", conversation_id: conversationId });
});
