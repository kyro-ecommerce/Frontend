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
  chatStream: async (message, onMetadata, onChunk, onDone, onError) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
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
                if (onDone) onDone();
              }
            } catch (err) {
              console.error("Failed to parse SSE line:", rawJson, err);
            }
          }
        }
      }
      if (onDone) onDone();
    } catch (error) {
      console.error("Lỗi khi stream AI Chatbot:", error);
      if (onError) onError(error);
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
        params: { q: query, limit },
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
  getTrendingProducts: async (limit = 5) => {
    try {
      const response = await api.get(`${API_BASE_URL}/ai/recommendations/trending`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy gợi ý sản phẩm bán chạy:", error);
      throw error;
    }
  },
};

