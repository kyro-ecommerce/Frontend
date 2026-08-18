import { api, API_BASE_URL } from "../../config/user/ApiConfig";

export const aiService = {
  /**
   * Send chat message to AI shopping consultant (Gemini RAG)
   * @param {string} message 
   */
  chat: async (message) => {
    try {
      const response = await api.post(`${API_BASE_URL}/ai/chat`, { message });
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
  chatStream: async (message, onMetadata, onChunk, onDone, onError, userId = null) => {
    try {
      let activeUserId = userId;
      if (!activeUserId) {
        try {
          const storedUser = localStorage.getItem("user") || localStorage.getItem("userInfo");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            activeUserId = parsed.id || parsed.userId || parsed.user_id || 0;
          }
        } catch (e) {
          console.debug("Could not parse stored user:", e);
        }
      }

      const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, user_id: activeUserId || 0 }),
      });

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
  search: async (query, limit = 10, userId = null) => {
    try {
      let activeUserId = userId;
      if (!activeUserId) {
        try {
          const storedUser = localStorage.getItem("user") || localStorage.getItem("userInfo");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            activeUserId = parsed.id || parsed.userId || parsed.user_id || 0;
          }
        } catch (e) {
          console.debug("Could not parse stored user:", e);
        }
      }

      const response = await api.get(`${API_BASE_URL}/ai/search`, {
        params: { q: query, limit, user_id: activeUserId || 0 },
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
  getSimilarProducts: async (productId, limit = 5) => {
    try {
      const response = await api.get(`${API_BASE_URL}/ai/recommendations/similar/${productId}`, {
        params: { limit },
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
  getComplementaryProducts: async (productId, limit = 5) => {
    try {
      const response = await api.get(`${API_BASE_URL}/ai/recommendations/complementary/${productId}`, {
        params: { limit },
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
  getPersonalizedProducts: async (userId, limit = 5) => {
    try {
      const response = await api.get(`${API_BASE_URL}/ai/recommendations/personalized/${userId}`, {
        params: { limit },
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
  /**
   * Record explicit user interaction (VIEW / CART) to AI Service
   * @param {string} type ("VIEW" | "CART")
   * @param {string} queryText 
   * @param {string} categoryName 
   * @param {number|null} userId 
   */
  recordInteraction: async (type, queryText = "", categoryName = "", userId = null) => {
    try {
      let activeUserId = userId;
      if (!activeUserId) {
        try {
          const storedUser = localStorage.getItem("user") || localStorage.getItem("userInfo");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            activeUserId = parsed.id || parsed.userId || parsed.user_id || 0;
          }
        } catch (e) {
          console.debug("Could not parse stored user:", e);
        }
      }
      const response = await api.post(`${API_BASE_URL}/ai/interactions/record`, {
        user_id: activeUserId || 0,
        interaction_type: type,
        query_text: queryText,
        category_name: categoryName,
      });
      return response.data;
    } catch (error) {
      console.debug("Could not record interaction:", error);
      return null;
    }
  },
};


