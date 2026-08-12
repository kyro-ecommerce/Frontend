import { api } from "../../config/user/ApiConfig";
import { API_BASE_URL } from "../../config/user/ApiConfig";

export const productService = {
    getProductById: (productId) => {
        try{
            if (!productId) {
                throw new Error("Product ID is required");
            }
            return api.get(`${API_BASE_URL}/products/${productId}`);
        } catch (error) {
            console.error("Error fetching product by ID:", error);
            throw error; // Rethrow the error to be handled by the calling function
        }
    },

    getAllProducts: (params = {}) =>
        api.get(`${API_BASE_URL}/products`, { params }),

    getProductByFilter: (filterPayload) => {
        const {
            categoryId,
            color,
            minPrice,
            maxPrice,
            sort,
            keyword,
            brand,
            inStock,
            minRating,
            page = 0,
            size = 20
        } = filterPayload;

        // Xây dựng params cho Axios
        const params = {
            categoryId: categoryId || undefined,
            color: color || undefined,
            minPrice: minPrice ?? undefined, // Gửi nếu là số
            maxPrice: maxPrice ?? undefined,
            sort: sort || undefined,
            keyword: keyword || undefined,
            brand: brand || undefined,
            inStock: inStock ?? undefined,
            minRating: minRating ?? undefined,
            page,
            size
        };

        // Loại bỏ các key undefined
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

        console.log("Calling API: GET /products with Query Params:", params);
        // Gọi API với params trong config
        return api.get(`${API_BASE_URL}/products`, { params }); // Axios sẽ tự chuyển thành query string
    },



    getSecondCategory: (topCategory) =>
        api.get(`${API_BASE_URL}/categories/${topCategory}`),

    getCategories: () => api.get(`${API_BASE_URL}/categories/`)

};
