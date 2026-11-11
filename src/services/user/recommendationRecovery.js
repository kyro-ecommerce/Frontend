// Only transport failures are recoverable. A valid empty list is a success.
export function recommendationItems(response) {
  const items = response?.recommendations ?? response?.items ?? response?.data ?? (Array.isArray(response) ? response : null);
  if (!Array.isArray(items)) throw new Error("Invalid recommendation response");
  return items.filter((item) => item && typeof item === "object");
}

export function retryDelay(error, attempt, now = Date.now()) {
  const status = error?.response?.status;
  const network = !status && (error?.code === "ERR_NETWORK" || error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT" || !!error?.request);
  if (!network && status !== 429 && !(status >= 500 && status <= 599)) return null;
  const headers = error?.response?.headers;
  const value = headers?.get?.("retry-after") ?? headers?.["retry-after"];
  const seconds = value == null || String(value).trim() === "" ? NaN : Number(value);
  const retryAfter = Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : Math.max(0, Date.parse(value) - now);
  const backoff = [1000, 2000, 4000, 8000, 30000][Math.min(attempt - 1, 4)];
  return Number.isFinite(retryAfter) ? Math.max(backoff, retryAfter) : backoff;
}

// One controller per mounted scope: no shared cache, identity or timer.
export function recoverRecommendations({ load, publish, browser = window, page = document, schedule = setTimeout, unschedule = clearTimeout, now = Date.now }) {
  let disposed = false;
  let running = false;
  let timer;
  let controller;
  let attempt = 0;
  let retryAt = 0;
  let retryable = false;
  let terminal = false;
  let data = null;
  let lastSuccess = -Infinity;
  const active = () => page.visibilityState !== "hidden" && browser.navigator?.onLine !== false;
  const clear = () => { unschedule(timer); timer = undefined; };
  const arm = () => {
    clear();
    if (!disposed && retryable && active()) {
      // setTimeout is a signed 32-bit delay; never overflow a long Retry-After.
      timer = schedule(() => { timer = undefined; wake(); }, Math.min(Math.max(0, retryAt - now()), 2147483647));
    }
  };
  const wake = () => {
    if (disposed || running || !retryable || !active()) return;
    if (now() < retryAt) arm();
    else run();
  };
  async function run() {
    if (disposed || running) return;
    clear();
    running = true;
    controller = new AbortController();
    publish({ data, status: data === null ? "loading" : "refreshing" });
    try {
      const result = await load(controller.signal);
      if (disposed) return;
      data = result;
      lastSuccess = now();
      attempt = 0;
      retryable = false;
      terminal = false;
      publish({ data, status: "success" });
    } catch (error) {
      if (disposed) return;
      const delay = retryDelay(error, ++attempt, now());
      retryable = delay !== null;
      terminal = !retryable;
      retryAt = now() + (delay ?? 0);
      publish({ data, status: retryable ? "reconnecting" : "error" });
    } finally {
      running = false;
      arm();
    }
  }
  const visibility = () => { if (active()) wake(); else clear(); };
  // Refresh snapshots on return, at most once a minute; never poll successes.
  const resume = () => {
    if (!disposed && !running && active() && !terminal && !retryable && data !== null && now() - lastSuccess >= 60000) run();
    else wake();
  };
  const visibilityChanged = () => { visibility(); if (active()) resume(); };
  browser.addEventListener("online", resume);
  browser.addEventListener("focus", resume);
  browser.addEventListener("offline", visibility);
  page.addEventListener("visibilitychange", visibilityChanged);
  run();
  return () => {
    disposed = true;
    clear();
    controller?.abort();
    browser.removeEventListener("online", resume);
    browser.removeEventListener("focus", resume);
    browser.removeEventListener("offline", visibility);
    page.removeEventListener("visibilitychange", visibilityChanged);
  };
}
