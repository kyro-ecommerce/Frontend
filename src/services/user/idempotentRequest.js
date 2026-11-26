// Keep the key after an uncertain outcome; a confirmed response completes this action.
const inFlight = new Map();
const pending = new Map();

export function runIdempotent(scope, payload, send, storage = globalThis.sessionStorage) {
  const identity = `kyro:pending:${scope}:${JSON.stringify(payload)}`;
  if (inFlight.has(identity)) return inFlight.get(identity);
  let key = pending.get(identity);
  try { key ||= storage?.getItem(identity); } catch { /* Storage may be disabled. */ }
  key ||= globalThis.crypto.randomUUID();
  pending.set(identity, key);
  try { storage?.setItem(identity, key); } catch { /* In-memory retry still works. */ }
  const request = Promise.resolve().then(() => send(key)).then(result => {
    pending.delete(identity);
    try { storage?.removeItem(identity); } catch { /* No persisted key. */ }
    return result;
  }).catch(error => {
    // Validation/ownership failures did not create this resource. Uncertain server/network
    // failures retain the same key so a retry can recover the committed result.
    if (error.response?.status >= 400 && error.response.status < 500 && error.response.status !== 408 && error.response.status !== 429) {
      pending.delete(identity);
      try { storage?.removeItem(identity); } catch { /* No persisted key. */ }
    }
    throw error;
  }).finally(() => inFlight.delete(identity));
  inFlight.set(identity, request);
  return request;
}
