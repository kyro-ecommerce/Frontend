import { api } from "../../config/user/ApiConfig";
import { API_BASE_URL } from "../../config/user/ApiConfig";


export const reviewService = {
    getReviewsByProduct: (productId) =>
        api.get(`${API_BASE_URL}/reviews/product/${productId}`).catch(() =>
            api.get(`${API_BASE_URL}/review/product/${productId}`)
        ),

    addReview: (reviewData) =>
        api.post(`${API_BASE_URL}/reviews/create`, reviewData),

    deleteReview: (reviewId) =>
        api.delete(`${API_BASE_URL}/reviews/delete/${reviewId}`),

    canReview: (reviewId) =>
        api.get(`${API_BASE_URL}/reviews/can-review/${reviewId}`),
};