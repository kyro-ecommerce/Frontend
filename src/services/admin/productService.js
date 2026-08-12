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
