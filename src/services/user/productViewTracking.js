import { v4 as uuidv4 } from "uuid";

export const PRODUCT_VIEW_PATH = "/ai/interactions/view";
const SESSION_KEY = "kyro.product-view.session.v1";

export function parseProductId(value) {
  if (typeof value !== "number" && (typeof value !== "string" || !/^\d+$/.test(value))) {
    return null;
  }
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function createViewSessionProvider({
  storage = () => globalThis.sessionStorage,
  createId = uuidv4,
} = {}) {
  let memorySession;
  return () => {
    try {
      const store = storage();
      const existing = store.getItem(SESSION_KEY);
      if (typeof existing === "string" && /^view-session-[0-9a-f-]{36}$/i.test(existing)) {
        memorySession = existing;
        return existing;
      }
      memorySession ??= `view-session-${createId()}`;
      store.setItem(SESSION_KEY, memorySession);
    } catch {
      // Storage restrictions must not break the product page.
      memorySession ??= `view-session-${createId()}`;
    }
    return memorySession;
  };
}

export const getAiSessionId = createViewSessionProvider();

export function createProductViewEvent(productId, {
  sessionId = getAiSessionId,
  createId = uuidv4,
  now = () => new Date(),
} = {}) {
  const id = parseProductId(productId);
  if (id === null) throw new Error("A product VIEW requires a positive, safe integer product ID");
  return Object.freeze({
    product_id: id,
    event_id: `view-${createId()}`,
    session_id: sessionId(),
    occurred_at: now().toISOString(),
  });
}

export async function deliverProductView(event, {
  post,
  wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
}) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { data } = await post(event);
      if (["recorded", "duplicate"].includes(data?.status) && data.event_id === event.event_id) {
        return data;
      }
      // A gateway fallback returning HTTP 200 is not a recording acknowledgement.
      return null;
    } catch (error) {
      const status = error?.response?.status;
      const transient = !status || status === 429 || status >= 500;
      if (attempt === 0 && transient) await wait(250);
      else return null;
    }
  }
  return null;
}

export function createProductViewVisit({ productId, send, makeEvent = createProductViewEvent }) {
  let delivery;
  return {
    record() {
      if (!delivery) {
        delivery = Promise.resolve()
          .then(() => makeEvent(productId))
          .then(send)
          .catch(() => null);
      }
      return delivery;
    },
  };
}
