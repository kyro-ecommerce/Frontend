import api from "./api";

export const getAllCategories = async () => {
    const response = await api.get("/categories/");
    return response.data?.data || response.data;
};

export const getCategoryHierarchy = getAllCategories;

export const createCategory = async (categoryData) =>
    (await api.post("/admin/categories", categoryData)).data;

export const updateCategory = async (categoryId, categoryData) =>
    (await api.put(`/admin/categories/${categoryId}`, { name: categoryData.name })).data;

export const deleteCategory = async (categoryId) =>
    (await api.delete(`/admin/categories/${categoryId}`)).data;
