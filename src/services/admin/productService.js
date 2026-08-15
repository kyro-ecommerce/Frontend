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

    if (keyword && keyword.trim()) queryParams.append('keyword', keyword.trim());
    if (categoryId !== null && categoryId !== undefined && categoryId !== '') queryParams.append('categoryId', categoryId);
    if (color) queryParams.append('color', color);
    if (minPrice !== null && minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice))) {
        queryParams.append('minPrice', Number(minPrice));
    }
    if (maxPrice !== null && maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice))) {
        queryParams.append('maxPrice', Number(maxPrice));
    }
    if (brand) queryParams.append('brand', brand);
    if (inStock !== null && inStock !== undefined) queryParams.append('inStock', inStock);
    if (minRating !== null && minRating !== undefined) queryParams.append('minRating', minRating);

    return api.get(`/admin/products?${queryParams.toString()}`);
};

export const getProductById = (productId) => api.get(`/admin/products/${productId}`);

export const createProduct = (productData) => {
    const { images, imageUrls, id, ...postPayload } = productData;
    return api.post("/admin/products", postPayload);
};

export const updateProduct = async (productId, productData) => {
    const { images, imageUrls, newImageFiles = [], newImageUrls = [], removedImageIds = [], ...patchPayload } = productData;
    const response = await api.patch(`/admin/products/${productId}`, patchPayload);
    for (const file of newImageFiles) await uploadProductImage(productId, file);
    for (const url of newImageUrls) await addProductImageUrl(productId, url);
    for (const imageId of removedImageIds) await deleteProductImage(imageId);
    return response;
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
