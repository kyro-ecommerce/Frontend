import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { transformSync } from "esbuild";
import axios from "axios";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { recommendationItems, retryDelay, recoverRecommendations } from "../src/services/user/recommendationRecovery.js";

const flush = () => new Promise((resolve) => setImmediate(resolve));
const httpError = (status, retryAfter) => ({ response: { status, headers: { "retry-after": retryAfter } } });

function environment() {
  const browser = new EventTarget();
  browser.navigator = { onLine: true };
  const page = new EventTarget();
  page.visibilityState = "visible";
  let clock = 0;
  let nextId = 0;
  const timers = new Map();
  return {
    browser, page, timers, now: () => clock,
    schedule: (callback, delay) => { const id = ++nextId; timers.set(id, { callback, at: clock + delay }); return id; },
    unschedule: (id) => timers.delete(id),
    advance: async (ms) => {
      clock += ms;
      for (const [id, timer] of [...timers]) {
        if (timer.at <= clock && timers.delete(id)) timer.callback();
      }
      await flush();
    },
    event: (name) => (name === "visibilitychange" ? page : browser).dispatchEvent(new Event(name)),
  };
}

test("retry policy: only network, timeout, 429 and 5xx; backoff becomes 30 seconds", () => {
  for (const status of [400, 401, 403, 404, 409, 422]) assert.equal(retryDelay(httpError(status), 1), null);
  for (const error of [new Error("contract failure"), { code: "ERR_CANCELED" }]) assert.equal(retryDelay(error, 1), null);
  for (const error of [httpError(429), httpError(500), httpError(503), { code: "ERR_NETWORK" }, { code: "ECONNABORTED" }, { code: "ETIMEDOUT" }]) {
    assert.deepEqual([1, 2, 3, 4, 5, 8].map((attempt) => retryDelay(error, attempt)), [1000, 2000, 4000, 8000, 30000, 30000]);
  }
});

test("Retry-After supports seconds/date and cannot be bypassed by focus events", async () => {
  assert.equal(retryDelay(httpError(429, "12"), 1, 0), 12000);
  assert.equal(retryDelay(httpError(503, "Thu, 01 Jan 1970 00:00:20 GMT"), 1, 0), 20000);
  assert.equal(retryDelay(httpError(503, "invalid"), 1, 0), 1000);
  const env = environment();
  let calls = 0;
  const stop = recoverRecommendations({ ...env, publish: () => {}, load: async () => { calls++; throw httpError(429, "12"); } });
  await flush();
  env.event("focus"); env.event("online");
  await env.advance(11999);
  assert.equal(calls, 1);
  await env.advance(1);
  assert.equal(calls, 2);
  stop();
});

test("initial failure automatically recovers without remount/reload, then stops polling", async () => {
  const env = environment();
  const states = [];
  let calls = 0;
  const stop = recoverRecommendations({ ...env, publish: (state) => states.push(state), load: async () => {
    if (++calls === 1) throw httpError(503);
    return [{ product_id: 4 }];
  } });
  await flush();
  assert.equal(states.at(-1).status, "reconnecting");
  await env.advance(1000);
  assert.equal(calls, 2);
  assert.deepEqual(states.at(-1), { status: "success", data: [{ product_id: 4 }] });
  assert.equal(env.timers.size, 0);
  await env.advance(120000);
  assert.equal(calls, 2);
  stop();
});

test("hidden/offline suspends retries, returning tab/network resumes a due retry", async () => {
  for (const mode of ["hidden", "offline"]) {
    const env = environment();
    let calls = 0;
    const stop = recoverRecommendations({ ...env, publish: () => {}, load: async () => { calls++; throw httpError(503); } });
    await flush();
    if (mode === "hidden") env.page.visibilityState = "hidden";
    else env.browser.navigator.onLine = false;
    env.event(mode === "hidden" ? "visibilitychange" : "offline");
    assert.equal(env.timers.size, 0);
    await env.advance(60000);
    assert.equal(calls, 1);
    env.page.visibilityState = "visible"; env.browser.navigator.onLine = true;
    env.event(mode === "hidden" ? "visibilitychange" : "online");
    await flush();
    assert.equal(calls, 2);
    stop();
  }
});

test("valid empty succeeds; malformed payload is terminal, not a transport outage", async () => {
  for (const payload of [{ recommendations: [] }, { recommendations: {} }, {}]) {
    const env = environment();
    let state;
    const stop = recoverRecommendations({ ...env, publish: (next) => { state = next; }, load: async () => recommendationItems(payload) });
    await flush();
    assert.equal(state.status, Array.isArray(payload.recommendations) ? "success" : "error");
    assert.equal(env.timers.size, 0);
    stop();
  }
});

test("refresh failure retains snapshot, recovers; concurrent resume events coalesce", async () => {
  const env = environment();
  const states = [];
  let calls = 0;
  let finish;
  const stop = recoverRecommendations({ ...env, publish: (state) => states.push(state), load: async () => {
    calls++;
    if (calls === 1) return [4];
    if (calls === 2) return new Promise((resolve, reject) => { finish = reject; });
    return [7];
  } });
  await flush();
  await env.advance(60000);
  env.event("focus"); env.event("online"); env.event("visibilitychange");
  assert.equal(calls, 2);
  assert.deepEqual(states.at(-1), { status: "refreshing", data: [4] });
  finish(httpError(503));
  await flush();
  assert.deepEqual(states.at(-1), { status: "reconnecting", data: [4] });
  await env.advance(1000);
  assert.deepEqual(states.at(-1), { status: "success", data: [7] });
  stop();
});

test("401/403/404 remain stopped even after focus/online, including stale snapshots", async () => {
  for (const status of [401, 403, 404]) {
    const env = environment();
    let calls = 0;
    const stop = recoverRecommendations({ ...env, publish: () => {}, load: async () => {
      if (++calls === 1) return [4];
      throw httpError(status);
    } });
    await flush();
    await env.advance(60000);
    env.event("focus"); await flush();
    await env.advance(60000);
    env.event("online"); env.event("focus"); env.event("visibilitychange"); await flush();
    assert.equal(calls, 2);
    assert.equal(env.timers.size, 0);
    stop();
  }
});

test("dispose aborts in-flight load, suppresses late publish and removes listeners/timers", async () => {
  const env = environment();
  const states = [];
  let finish;
  let signal;
  const stop = recoverRecommendations({ ...env, publish: (state) => states.push(state), load: (requestSignal) => {
    signal = requestSignal;
    return new Promise((resolve) => { finish = resolve; });
  } });
  stop();
  assert.equal(signal.aborted, true);
  finish([4]); await flush();
  assert.equal(states.length, 1);
  env.event("focus"); env.event("online"); env.event("visibilitychange");
  await env.advance(60000);
  assert.equal(states.length, 1);
  assert.equal(env.timers.size, 0);
});

function loadModule(path, dependencies) {
  const { code } = transformSync(readFileSync(new URL(path, import.meta.url), "utf8"), { loader: "jsx", format: "cjs" });
  const module = { exports: {} };
  new Function("require", "module", "exports", code)((name) => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  }, module, module.exports);
  return module.exports;
}

test("home chooses the live auth-context actor; personalized errors never downgrade to trending", async () => {
  let auth;
  let request;
  const calls = [];
  let failure;
  const { default: Home } = loadModule("../src/features/user/product/RecommendedForYou.jsx", {
    react: React,
    "../../../store/user/AuthContext": { useAuthContext: () => auth },
    "../../../hooks/user/useRecoveringRecommendations.js": { useRecoveringRecommendations: (_key, load) => {
      request = load;
      return { data: [], status: "success" };
    } },
    "../../../services/user/recommendationRecovery.js": { recommendationItems },
    "./RecommendationStatus": { default: () => null },
    "./ProductCard": { default: () => null },
    "./recommendationCard.js": { normalizeCatalogRating: () => null },
    "../../../services/user/ai.service": { aiService: {
      getTrendingProducts: async (...args) => { calls.push(["trending", ...args]); return { recommendations: [] }; },
      getPersonalizedProducts: async (...args) => { calls.push(["personalized", ...args]); if (failure) throw failure; return { recommendations: [] }; },
    } },
  });
  const signal = new AbortController().signal;
  auth = { isAuthenticated: false };
  Home(); await request(signal);
  assert.deepEqual(calls.pop(), ["trending", 5, { signal }]);
  auth = { isAuthenticated: true, user: { id: 42 } };
  Home(); await request(signal);
  assert.deepEqual(calls.pop(), ["personalized", 42, 5, { signal }]);
  auth = { isAuthenticated: true, user: { userId: 43 } };
  Home(); failure = httpError(503);
  await assert.rejects(request(signal), (error) => error === failure);
  assert.deepEqual(calls, [["personalized", 43, 5, { signal }]]);
});

test("all four recommendation transports carry cancellation and finite timeout", async () => {
  const calls = [];
  const { aiService } = loadModule("../src/services/user/ai.service.js", {
    "../../config/user/ApiConfig": { API_BASE_URL: "https://fixture.invalid/api/v1", api: { get: async (...args) => { calls.push(args); return { data: { recommendations: [] } }; } } },
    "./productViewTracking.js": {}, "./util": {}, "./auth.service": {},
  });
  const signal = new AbortController().signal;
  await aiService.getSimilarProducts(4, 6, { signal });
  await aiService.getComplementaryProducts(4, 6, { signal });
  await aiService.getPersonalizedProducts(42, 6, { signal });
  await aiService.getTrendingProducts(6, { signal });
  assert.deepEqual(calls.map(([url]) => url.split("/recommendations/")[1]), ["similar/4", "complementary/4", "personalized/42", "trending"]);
  for (const [, options] of calls) assert.deepEqual(options, { signal, timeout: 15000, params: { limit: 6 } });
});

test("real hook clears old actor/product before effects and ignores their late response", async () => {
  const env = environment();
  let auth = { isLoading: true, isAuthenticated: false };
  const slots = [];
  let cursor = 0;
  let cleanup;
  let effect;
  let previousDeps;
  const requests = [];
  const { useRecoveringRecommendations } = loadModule("../src/hooks/user/useRecoveringRecommendations.js", {
    react: {
      useState: (initial) => { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], (value) => { slots[i] = value; }]; },
      useRef: (initial) => { const i = cursor++; return slots[i] ?? (slots[i] = { current: initial }); },
      useEffect: (callback, deps) => { if (JSON.stringify(previousDeps) !== JSON.stringify(deps)) { previousDeps = deps; effect = callback; } },
    },
    "../../store/user/AuthContext": { useAuthContext: () => auth },
    "../../services/user/recommendationRecovery.js": { recoverRecommendations: (options) => recoverRecommendations({ ...env, ...options }) },
  });
  const render = (key) => { cursor = 0; return useRecoveringRecommendations(key, (signal) => new Promise((resolve) => requests.push({ signal, resolve }))); };
  const commit = () => { if (effect) { cleanup?.(); const next = effect; effect = null; cleanup = next(); } };
  assert.equal(render("similar:4").status, "idle"); commit();
  assert.equal(requests.length, 0);
  auth = { isLoading: false, isAuthenticated: true, user: { id: 42 } };
  render("similar:4"); commit();
  requests[0].resolve([4]); await flush();
  assert.deepEqual(render("similar:4").data, [4]);
  render("similar:6"); commit();
  assert.equal(render("similar:6").data, null);
  auth = { ...auth, user: { id: 43 } };
  assert.equal(render("similar:6").data, null); commit();
  assert.equal(requests[1].signal.aborted, true);
  requests[2].resolve([7]); await flush();
  requests[1].resolve([99]); await flush();
  assert.deepEqual(render("similar:6").data, [7]);
  auth = { isLoading: false, isAuthenticated: false };
  assert.equal(render("similar:6").data, null); commit();
  cleanup();
});

test("status UI distinguishes retry, terminal failure and stale snapshots", () => {
  const { default: Status } = loadModule("../src/features/user/product/RecommendationStatus.jsx", { react: React });
  const retry = renderToStaticMarkup(React.createElement(Status, { status: "reconnecting" }));
  assert.ok(retry.includes('role="status"'));
  assert.ok(retry.includes("không cần tải lại trang"));
  const stale = renderToStaticMarkup(React.createElement(Status, { status: "error", hasData: true }));
  assert.ok(stale.includes("giá và tồn kho chưa được cập nhật lại"));
  assert.ok(!stale.includes("tự kết nối lại"));
  assert.equal(renderToStaticMarkup(React.createElement(Status, { status: "success" })), "");
});

test("local HTTP + real Axios: 503 then recovery on same controller, no AI/DB writes", async () => {
  let calls = 0;
  const server = createServer((_request, response) => {
    response.writeHead(++calls === 1 ? 503 : 200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ recommendations: [{ product_id: 4 }] }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const env = environment();
  let state;
  let changed;
  const nextState = () => new Promise((resolve) => { changed = resolve; });
  const first = nextState();
  const stop = recoverRecommendations({ ...env, publish: (next) => {
    state = next;
    if (next.status !== "loading") changed?.();
  }, load: async (signal) => recommendationItems((await axios.get(`http://127.0.0.1:${server.address().port}`, { signal, timeout: 1000, proxy: false })).data) });
  try {
    await first;
    assert.equal(state.status, "reconnecting");
    const recovered = nextState();
    await env.advance(1000);
    await recovered;
    assert.deepEqual(state, { status: "success", data: [{ product_id: 4 }] });
    assert.equal(calls, 2);
  } finally {
    stop();
    await new Promise((resolve) => server.close(resolve));
  }
});
