import { api, API_BASE_URL } from "../../config/user/ApiConfig";
import {
  BEHAVIOUR_EVENT_PATH,
  createBehaviourEvent,
  deliverProductView,
  getAiSessionId,
  PRODUCT_VIEW_PATH,
} from "./productViewTracking.js";
import { registerExposureSender } from "./recommendationExposure.js";
import { getTokenFromLocalStorage, saveTokenToLocalStorage } from "./util";
import { authService } from "./auth.service";

export const aiService = {
  // Actor identity is asserted by the gateway, never copied from localStorage.
  recordProductView: (event) => deliverProductView(event, {
    post: (payload) => api.post(`${API_BASE_URL}${PRODUCT_VIEW_PATH}`, payload),
  }),
  // Fire-and-forget: tracking must never block or fail a shopping action.
  recordProductEvent: (eventType, productId, options = {}) => Promise.resolve()
    .then(() => createBehaviourEvent(eventType, productId, options))
    .then((event) => deliverProductView(event, {
      post: (payload) => api.post(`${API_BASE_URL}${BEHAVIOUR_EVENT_PATH}`, payload),
    }))
    .catch(() => null),
  /**
   * Send chat message to AI shopping consultant (Gemini RAG)
   * @param {string} message 
   */
  chat: async (message, { conversationId = null } = {}) => {
    try {
      const response = await api.post(`${API_BASE_URL}/ai/chat`, {
        message,
        session_id: getAiSessionId(),
        ...(conversationId ? { conversation_id: conversationId } : {}),
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi kết nối AI Chatbot:", error);
      throw error;
    }
  },

  /**
   * Stream chat response from AI shopping consultant via SSE
   * @param {string} message 
   * @param {function} onMetadata ({ source, recommended_products })
   * @param {function} onChunk (textChunk)
   * @param {function} onDone ()
   * @param {function} onError (err)
   */
  chatStream: async (message, onMetadata, onChunk, onDone, onError, { conversationId = null } = {}) => {
    try {
      const token = getTokenFromLocalStorage();
      const body = JSON.stringify({
        message,
        session_id: getAiSessionId(),
        ...(conversationId ? { conversation_id: conversationId } : {}),
      });
      const send = (accessToken) => fetch(`${API_BASE_URL}/ai/chat/stream`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body,
      });
      let response = await send(token);
      // Retry only a rejected (not yet streamed) authenticated request, once.
      // Never silently downgrade an expired/invalid login to guest.
      if (response.status === 401 && token) {
        const refreshed = await authService.refreshToken();
        if (!refreshed) throw new Error("Could not refresh AI chat authentication");
        saveTokenToLocalStorage(refreshed);
        response = await send(refreshed);
      }

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let isCompleted = false;

      const finishStream = () => {
        if (!isCompleted) {
          isCompleted = true;
          if (onDone) onDone();
        }
      };

      const parseSseLine = (line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const rawJson = trimmed.slice(6);
          try {
            const evt = JSON.parse(rawJson);
            if (evt.type === "metadata") {
              if (onMetadata) onMetadata(evt);
            } else if (evt.type === "chunk") {
              if (onChunk) onChunk(evt.content);
            } else if (evt.type === "done") {
              finishStream();
            }
          } catch (err) {
            console.error("Failed to parse SSE line:", rawJson, err);
          }
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          if (buffer.trim()) {
            parseSseLine(buffer);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (const line of lines) {
          parseSseLine(line);
        }
      }
      finishStream();
    } catch (error) {
      console.error("Lỗi khi stream AI Chatbot:", error);
      if (onError) onError(error);
    }
  },

  /**
   * Send explicit user feedback on AI response (thumbs_up / thumbs_down)
   * @param {string} feedback ("thumbs_up" | "thumbs_down")
   * @param {string} messageText 
   */
  sendFeedback: async (feedback, messageText = "") => {
    try {
      const response = await api.post(`${API_BASE_URL}/ai/chat/feedback`, {
        feedback,
        message_text: messageText,
        session_id: getAiSessionId(),
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gửi phản hồi AI Chatbot:", error);
      return null;
    }
  },


  /**
   * Perform Hybrid AI Search
   * @param {string} query 
   * @param {number} limit 
   */
  search: async (query, limit = 10) => {
    try {
      const response = await api.get(`${API_BASE_URL}/ai/search`, {
        params: { q: query, limit, session_id: getAiSessionId() },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm AI Search:", error);
      throw error;
    }
  },

  /**
   * Get Similar Product Recommendations
   * @param {number} productId 
   * @param {number} limit 
   */
  getSimilarProducts: async (productId, limit = 5, options = {}) => {
    try {
      const response = await api.get(`${API_BASE_URL}/ai/recommendations/similar/${productId}`, {
        timeout: 15000, signal: options.signal,
        params: { limit, session_id: getAiSessionId(), ...(options.targetVariantId != null ? { target_variant_id: options.targetVariantId } : {}), ...(options.rankingPolicy ? { ranking_policy: options.rankingPolicy } : {}) },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy gợi ý sản phẩm tương tự:", error);
      throw error;
    }
  },

  /**
   * Get Complementary Product Recommendations
   * @param {number} productId 
   * @param {number} limit 
   */
  getComplementaryProducts: async (productId, limit = 5, options = {}) => {
    try {
      const response = await api.get(`${API_BASE_URL}/ai/recommendations/accessories/${productId}`, {
        timeout: 15000, signal: options.signal,
        params: { limit, session_id: getAiSessionId() },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy gợi ý sản phẩm đi kèm:", error);
      throw error;
    }
  },
  /**
   * Get Personalized Product Recommendations for user
   * @param {number} userId 
   * @param {number} limit 
   */
  getPersonalizedProducts: async (userId, limit = 5, options = {}) => {
    try {
      const response = await api.get(`${API_BASE_URL}/ai/recommendations/personalized/${userId}`, {
        timeout: 15000, signal: options.signal,
        params: { limit, session_id: getAiSessionId() },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy gợi ý cá nhân hóa:", error);
      throw error;
    }
  },

  /**
   * Get Cold-Start Trending Products
   * @param {number} limit 
   */
  getTrendingProducts: async (limit = 5, options = {}) => {
    const response = await api.get(`${API_BASE_URL}/ai/recommendations/trending`, {
      timeout: 15000, signal: options.signal,
      params: { limit, session_id: getAiSessionId() },
    });
    return response.data;
  },
};

// Recommendation cards report IMPRESSION/CLICK through this sender.
registerExposureSender((eventType, productId, options) => aiService.recordProductEvent(eventType, productId, options));
