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
};
