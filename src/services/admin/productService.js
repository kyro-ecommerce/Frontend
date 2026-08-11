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
    const { images, imageUrls, id, ...postPayload } = productData;
    return api.post("/admin/products", postPayload);
};

export const updateProduct = (productId, productData) => {
    const { images, imageUrls, ...putPayload } = productData;
    return api.put(`/admin/products/${productId}`, putPayload);
};

export const uploadProductImage = (productId, file) => {
    const body = new FormData();
    body.append("image", file);
    return api.post(`/images/upload/${productId}`, body, { headers: { "Content-Type": "multipart/form-data" } });
};

export const addProductImageUrl = (productId, url) => api.post(`/images/url/${productId}`, { url });

export const deleteProductImage = (imageId) => api.delete(`/images/delete/${imageId}`);

export const deleteProduct = (productId) => api.delete(`/admin/products/${productId}`);

export const getTopSellingProducts = (limit = 10) => api.get(`/admin/products/top-selling?limit=${limit}`);

export const getProductCategories = () => api.get(`/admin/products/categories`);

export const getFilterStatistics = () => api.get(`/admin/products/filter-stats`);

export const getRevenueByCateogry = () => api.get("/admin/products/revenue-by-category");
