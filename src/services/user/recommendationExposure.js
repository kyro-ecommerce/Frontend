// Pure helpers linking rendered recommendation cards to the response that served them.
// Network delivery lives in aiService.recordProductEvent; nothing here sends requests.

export const RECOMMENDATION_META = "__recommendation";

/** Copy items, tagging each with the response's exposure id, model version and surface. */
export function attachRecommendation(items, response, surface) {
  const recommendationId = response?.recommendation_id;
  if (!Array.isArray(items) || typeof recommendationId !== "string" || !recommendationId) return items;
  const meta = Object.freeze({
    recommendationId,
    modelVersion: response.model_version ?? response.strategy ?? null,
    surface,
  });
  return items.map((item) => (item && typeof item === "object" ? { ...item, [RECOMMENDATION_META]: meta } : item));
}

/** Tracking props for a card at its displayed position, or null for untracked items. */
export function cardTracking(item, position) {
  const meta = item?.[RECOMMENDATION_META];
  if (!meta || !Number.isSafeInteger(position) || position < 0) return null;
  return { ...meta, position };
}

/** True the first time a (recommendation, product) pair is seen; re-renders do not resend. */
export function createImpressionGate(limit = 2000) {
  const seen = new Set();
  return (recommendationId, productId) => {
    const key = `${recommendationId}:${productId}`;
    if (seen.has(key)) return false;
    if (seen.size >= limit) seen.delete(seen.values().next().value);
    seen.add(key);
    return true;
  };
}

export const firstImpression = createImpressionGate();

// Delivery is registered by ai.service so UI components depend only on this pure module.
let sender = null;
export function registerExposureSender(fn) {
  sender = typeof fn === "function" ? fn : null;
}

/** Send IMPRESSION / CLICK for a tracked card; untracked cards send nothing. */
export function sendRecommendationEvent(eventType, productId, tracking) {
  if (!sender || !tracking || !productId) return;
  try { sender(eventType, productId, eventOptions(tracking)); } catch { /* tracking never breaks UI */ }
}

/** Options for aiService.recordProductEvent from card tracking props. */
export function eventOptions(tracking) {
  return {
    recommendationId: tracking.recommendationId,
    position: tracking.position,
    modelVersion: tracking.modelVersion,
    surface: tracking.surface,
  };
}
