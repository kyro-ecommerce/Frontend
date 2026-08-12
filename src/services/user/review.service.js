import { api } from "../../config/user/ApiConfig";
import { API_BASE_URL } from "../../config/user/ApiConfig";


export const reviewService = {
    getReviewsByProduct: (productId) =>
        api.get(`${API_BASE_URL}/products/${productId}/reviews`),

    addReview: (productId, reviewData) =>
        api.post(`${API_BASE_URL}/products/${productId}/reviews`, reviewData),

    deleteReview: (reviewId) =>
        api.delete(`${API_BASE_URL}/reviews/${reviewId}`),

    canReview: (productId) =>
        api.get(`${API_BASE_URL}/products/${productId}/review-eligibility`),
};
