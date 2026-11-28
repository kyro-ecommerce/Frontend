import api from './api';

export const getPaymentReviews = () => api.get('/admin/payments/reviews');

export const getPaymentReviewDetail = (paymentId) =>
    api.get(`/admin/payments/reviews/${paymentId}`);
