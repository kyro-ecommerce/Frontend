// src/services/productService.js - Updated with comprehensive admin filters
import api from './api';

export const getAllProducts = (params = {}) => {
    const {
        page = 0,
        size = 10,
        sortBy = 'createdAt',
        sortDir = 'desc',
        keyword = '',
        topLevelCategory = '',
        secondLevelCategory = '',
        color = '',
        minPrice = null,
        maxPrice = null,
        status = 'all'
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('size', size);
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortDir', sortDir);

    if (keyword) queryParams.append('keyword', keyword);
    if (topLevelCategory) queryParams.append('topLevelCategory', topLevelCategory);
    if (secondLevelCategory) queryParams.append('secondLevelCategory', secondLevelCategory);
    if (color) queryParams.append('color', color);
    if (minPrice !== null) queryParams.append('minPrice', minPrice);
    if (maxPrice !== null) queryParams.append('maxPrice', maxPrice);
    if (status && status !== 'all') queryParams.append('status', status);

    return api.get(`/admin/products?${queryParams.toString()}`);
};

export const getProductById = (productId) => api.get(`/admin/products/${productId}`);

export const createProduct = (productData) => {
    // Clean payload for CreateProductRequest (remove 'images' and 'id' which don't exist on CreateProductRequest)
    const { images, id, ...postPayload } = productData;
    return api.post("/admin/products", postPayload);
};

export const updateProduct = (productId, productData) => {
    // Clean payload for Product entity (remove CreateProductRequest specific fields)
    const { imageUrls, topLevelCategory, secondLevelCategory, ...putPayload } = productData;
    if (!putPayload.images && imageUrls) {
        putPayload.images = imageUrls;
    }
    return api.put(`/admin/products/${productId}`, putPayload);
};

export const deleteProduct = (productId) => api.delete(`/admin/products/${productId}`);

export const deleteMultipleProducts = (productIds) => {
    return api.delete(`/admin/products/delete-multiple`, {
        data: { ids: productIds }
    });
};

export const getTopSellingProducts = (limit = 10) => api.get(`/admin/products/top-selling?limit=${limit}`);

export const getProductCategories = () => api.get(`/admin/products/categories`);

export const getFilterStatistics = () => api.get(`/admin/products/filter-stats`);

export const getRevenueByCateogry = () => api.get("/admin/products/revenue-by-category");