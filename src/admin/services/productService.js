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

    return api.get(`/admin/products/all?${queryParams.toString()}`);
};

export const getProductById = (productId) => api.get(`/admin/products/${productId}`);

export const createProduct = (productData) => {
    // Handle FormData for images
    if (productData.images && productData.images.length > 0) {
        const formData = new FormData();

        // Add product data
        Object.keys(productData).forEach(key => {
            if (key !== 'images') {
                if (typeof productData[key] === 'object') {
                    formData.append(key, JSON.stringify(productData[key]));
                } else {
                    formData.append(key, productData[key]);
                }
            }
        });

        // Add image files
        productData.images.forEach((image, index) => {
            formData.append(`images`, image);
        });

        return api.post("/admin/products/create", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    return api.post("/admin/products/create", productData);
};

export const updateProduct = (productId, productData) => {
    // Handle FormData for images
    if (productData.images && productData.images.length > 0) {
        const formData = new FormData();

        Object.keys(productData).forEach(key => {
            if (key !== 'images') {
                if (typeof productData[key] === 'object') {
                    formData.append(key, JSON.stringify(productData[key]));
                } else {
                    formData.append(key, productData[key]);
                }
            }
        });

        productData.images.forEach((image, index) => {
            formData.append(`images`, image);
        });

        return api.put(`/admin/products/${productId}/update`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    return api.put(`/admin/products/${productId}/update`, productData);
};

export const deleteProduct = (productId) => api.delete(`/admin/products/${productId}/delete`);

export const deleteMultipleProducts = (productIds) => {
    return api.delete(`/admin/products/delete-multiple`, {
        data: { ids: productIds }
    });
};

export const getTopSellingProducts = (limit = 10) => api.get(`/admin/products/top-selling?limit=${limit}`);

export const getProductCategories = () => api.get(`/admin/products/categories`);

export const getFilterStatistics = () => api.get(`/admin/products/filter-stats`);

export const getRevenueByCateogry = () => api.get("/admin/products/revenue-by-category");