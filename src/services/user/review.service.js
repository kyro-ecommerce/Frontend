import { api } from "../../config/user/ApiConfig";
import { API_BASE_URL } from "../../config/user/ApiConfig";


export const reviewService = {

    getReviewsByProduct: (productId) =>
        api.get(`${API_BASE_URL}/review/product/${productId}`),

    addReview: (reviewData) =>
        api.post(`${API_BASE_URL}/review/create`, reviewData),

    deleteReview: (reviewId) =>
        api.delete(`${API_BASE_URL}/review/delete/${reviewId}`),

    canReview: (reviewId) =>
        api.get(`${API_BASE_URL}/review/can-review/${reviewId}`),
};