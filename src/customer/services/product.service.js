import { api } from "../config/ApiConfig";
import { API_BASE_URL } from "../config/ApiConfig";

export const productService = {
    getProductById: (productId) => {
        try{
            if (!productId) {
                throw new Error("Product ID is required");
            }
            return api.get(`${API_BASE_URL}/products/id/${productId}`);
        } catch (error) {
            console.error("Error fetching product by ID:", error);
            throw error; // Rethrow the error to be handled by the calling function
        }
    },

    getAllProducts: () =>
        api.get(`${API_BASE_URL}/products/all`),

    getProductByFilter: (filterPayload) => {
        const {
            topLevelCategory,
            secondLevelCategory,
            color,
            minPrice,
            maxPrice,
            sort,
            keyword
            // Bỏ pageNumber, pageSize nếu backend không dùng
        } = filterPayload;

        // Xây dựng params cho Axios
        const params = {
            topLevelCategory: topLevelCategory || undefined,
            secondLevelCategory: secondLevelCategory || undefined,
            color: color || undefined,
            minPrice: minPrice ?? undefined, // Gửi nếu là số
            maxPrice: maxPrice ?? undefined,
            sort: sort || undefined,
            keyword: keyword || undefined
        };

        // Loại bỏ các key undefined
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

        console.log("Calling API: GET /products/ with Query Params:", params);
        // Gọi API với params trong config
        return api.get(`${API_BASE_URL}/products/`, { params }); // Axios sẽ tự chuyển thành query string
    },



    getSecondCategory: (topCategory) =>
        api.get(`${API_BASE_URL}/categories/${topCategory}`)

};

