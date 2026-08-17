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

export const createProduct = async (productData) => {
    const { images, imageUrls, newImageFiles = [], newImageUrls = [], removedImageIds = [], id, ...postPayload } = productData;
    const response = await api.post("/admin/products", postPayload);
    const createdProductId = response.data?.data?.id || response.data?.id || response.data?.productId;
    if (createdProductId) {
        for (const file of newImageFiles) {
            try { await uploadProductImage(createdProductId, file); } catch (err) { console.error("Lỗi khi tải ảnh file:", err); }
        }
        for (const url of newImageUrls) {
            try { await addProductImageUrl(createdProductId, url); } catch (err) { console.error("Lỗi khi thêm URL ảnh:", err); }
        }
    }
    return response;
};

export const updateProduct = async (productId, productData) => {
    const {
        images,
        imageUrls,
        newImageFiles = [],
        newImageUrls = [],
        removedImageIds = [],
        id,
        createdAt,
        updatedAt,
        ratings,
        reviews,
        averageRating,
        numRatings,
        category,
        ...patchPayload
    } = productData;

    const response = await api.patch(`/admin/products/${productId}`, patchPayload);

    for (const file of newImageFiles) {
        try { await uploadProductImage(productId, file); } catch (err) { console.error("Lỗi khi tải ảnh file:", err); }
    }
    for (const url of newImageUrls) {
        try { await addProductImageUrl(productId, url); } catch (err) { console.error("Lỗi khi thêm URL ảnh:", err); }
    }
    for (const imageId of removedImageIds) {
        try { await deleteProductImage(imageId); } catch (err) { console.error("Lỗi khi xoá ảnh:", err); }
    }
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
