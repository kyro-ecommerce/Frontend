import { api } from "../../config/user/ApiConfig";
import { API_BASE_URL } from "../../config/user/ApiConfig";


export const reviewService = {
    getReviewsByProduct: (productId) =>
        api.get(`${API_BASE_URL}/reviews/product/${productId}`),

    addReview: (reviewData) =>
        api.post(`${API_BASE_URL}/reviews`, reviewData),

    deleteReview: (reviewId) =>
        api.delete(`${API_BASE_URL}/reviews/${reviewId}`),

    canReview: (reviewId) =>
        api.get(`${API_BASE_URL}/reviews/can-review/${reviewId}`),
};
