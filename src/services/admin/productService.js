// src/services/productService.js - Updated with comprehensive admin filters
import api from './api';

export const getAllProducts = (params = {}) => {
    const {
        page = 0,
        size = 20,
        sortBy = 'createdAt',
        sortDir = 'desc',
        keyword = '',
        categoryId = null,
        color = '',
        minPrice = null,
        maxPrice = null,
        brand = '',
        inStock = null,
        minRating = null
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('size', size);
    queryParams.append('sort', `${sortBy},${sortDir}`);

    if (keyword) queryParams.append('keyword', keyword);
    if (categoryId !== null) queryParams.append('categoryId', categoryId);
    if (color) queryParams.append('color', color);
    if (minPrice !== null) queryParams.append('minPrice', minPrice);
    if (maxPrice !== null) queryParams.append('maxPrice', maxPrice);
    if (brand) queryParams.append('brand', brand);
    if (inStock !== null) queryParams.append('inStock', inStock);
    if (minRating !== null) queryParams.append('minRating', minRating);

    return api.get(`/admin/products?${queryParams.toString()}`);
};

export const getProductById = (productId) => api.get(`/admin/products/${productId}`);

export const createProduct = (productData) => {
    const { images, imageUrls, id, ...postPayload } = productData;
    return api.post("/admin/products", postPayload);
};

export const updateProduct = (productId, productData) => {
    const { images, imageUrls, ...patchPayload } = productData;
    return api.patch(`/admin/products/${productId}`, patchPayload);
};

export const uploadProductImage = (productId, file) => {
    const body = new FormData();
    body.append("image", file);
    return api.post(`/admin/products/${productId}/images`, body, { headers: { "Content-Type": "multipart/form-data" } });
};

export const addProductImageUrl = (productId, url) => api.post(`/admin/products/${productId}/images`, { url });

export const deleteProductImage = (imageId) => api.delete(`/admin/images/${imageId}`);

export const deleteProduct = (productId) => api.delete(`/admin/products/${productId}`);

export const getTopSellingProducts = (limit = 10) => api.get(`/admin/analytics/products/top-selling?limit=${limit}`);

export const getProductCategories = () => api.get(`/categories`);

export const getFilterStatistics = () => api.get(`/admin/analytics/products/summary`);

export const getRevenueByCateogry = () => api.get("/admin/analytics/products/revenue-by-category");
