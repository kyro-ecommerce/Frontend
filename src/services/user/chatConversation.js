// Multi-turn chat: remembers the server's conversation id for this browser tab.
// The server checks ownership; this only avoids starting over on every message.

const KEY = "kyro.chat.conversation.v1";
const ID_PATTERN = /^conv-[0-9a-f-]{36}$/i;

export function createConversationStore(storage = () => globalThis.sessionStorage) {
  let memory = null;
  const read = () => {
    try {
      const value = storage().getItem(KEY);
      return typeof value === "string" && ID_PATTERN.test(value) ? value : memory;
    } catch {
      return memory;
    }
  };
  return {
    get: read,
    set(id) {
      if (typeof id !== "string" || !ID_PATTERN.test(id)) return;
      memory = id;
      try { storage().setItem(KEY, id); } catch { /* storage may be blocked */ }
    },
    clear() {
      memory = null;
      try { storage().removeItem(KEY); } catch { /* storage may be blocked */ }
    },
  };
}

export const chatConversation = createConversationStore();

/** Active-condition chips from a chat response or stream metadata event. */
export function conditionsOf(payload) {
  const items = payload?.conditions;
  return Array.isArray(items) ? items.filter((c) => typeof c === "string" && c.trim()).slice(0, 10) : [];
}
