import api from "./api";

// Initial mock dataset for standalone frontend testing if backend CRUD is not yet deployed
let localCategories = [
    {
        categoryId: 1,
        name: "Laptop",
        level: 1,
        isParent: true,
        productCount: 42,
        subCategories: [
            { categoryId: 101, name: "Gaming Laptops", level: 2, isParent: false, productCount: 18, parentId: 1 },
            { categoryId: 102, name: "MacBook", level: 2, isParent: false, productCount: 14, parentId: 1 },
            { categoryId: 103, name: "Ultrabook", level: 2, isParent: false, productCount: 10, parentId: 1 },
        ]
    },
    {
        categoryId: 2,
        name: "Phone",
        level: 1,
        isParent: true,
        productCount: 65,
        subCategories: [
            { categoryId: 201, name: "iPhone", level: 2, isParent: false, productCount: 30, parentId: 2 },
            { categoryId: 202, name: "Samsung", level: 2, isParent: false, productCount: 22, parentId: 2 },
            { categoryId: 203, name: "Xiaomi", level: 2, isParent: false, productCount: 13, parentId: 2 },
        ]
    },
    {
        categoryId: 3,
        name: "Tablet",
        level: 1,
        isParent: true,
        productCount: 25,
        subCategories: [
            { categoryId: 301, name: "iPad", level: 2, isParent: false, productCount: 15, parentId: 3 },
            { categoryId: 302, name: "Android Tablets", level: 2, isParent: false, productCount: 10, parentId: 3 },
        ]
    },
    {
        categoryId: 4,
        name: "Desktop",
        level: 1,
        isParent: true,
        productCount: 19,
        subCategories: [
            { categoryId: 401, name: "PC Gaming", level: 2, isParent: false, productCount: 12, parentId: 4 },
            { categoryId: 402, name: "PC Office", level: 2, isParent: false, productCount: 7, parentId: 4 },
        ]
    },
    {
        categoryId: 5,
        name: "Accessories",
        level: 1,
        isParent: true,
        productCount: 54,
        subCategories: [
            { categoryId: 501, name: "Mouse", level: 2, isParent: false, productCount: 16, parentId: 5 },
            { categoryId: 502, name: "Keyboard", level: 2, isParent: false, productCount: 20, parentId: 5 },
            { categoryId: 503, name: "Headphones", level: 2, isParent: false, productCount: 18, parentId: 5 },
        ]
    }
];

export const getAllCategories = async () => {
    try {
        const response = await api.get("/categories/");
        if (response.data && Array.isArray(response.data)) {
            return response.data;
        }
        if (response.data?.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
    } catch (err) {
        console.warn("Backend API /categories/ failed or not found, using local category fallback data.", err.message);
    }
    return localCategories;
};

export const getCategoryHierarchy = async () => {
    return getAllCategories();
};

export const createCategory = async (categoryData) => {
    try {
        const response = await api.post("/admin/categories", categoryData);
        return response.data;
    } catch (err) {
        console.warn("Backend POST /admin/categories failed, simulating create locally.", err.message);
        const newId = Date.now();
        const level = parseInt(categoryData.level, 10) || 1;

        if (level === 1) {
            const newCat = {
                categoryId: newId,
                name: categoryData.name,
                level: 1,
                isParent: true,
                productCount: 0,
                subCategories: []
            };
            localCategories.push(newCat);
            return { success: true, data: newCat };
        } else {
            const parentId = parseInt(categoryData.parentId, 10);
            const parent = localCategories.find(c => c.categoryId === parentId);
            const newSub = {
                categoryId: newId,
                name: categoryData.name,
                level: 2,
                isParent: false,
                productCount: 0,
                parentId: parentId
            };
            if (parent) {
                if (!parent.subCategories) parent.subCategories = [];
                parent.subCategories.push(newSub);
            }
            return { success: true, data: newSub };
        }
    }
};

export const updateCategory = async (categoryId, categoryData) => {
    try {
        const response = await api.put(`/admin/categories/${categoryId}`, categoryData);
        return response.data;
    } catch (err) {
        console.warn(`Backend PUT /admin/categories/${categoryId} failed, simulating update locally.`, err.message);
        
        localCategories = localCategories.map(cat => {
            if (cat.categoryId === categoryId) {
                return { ...cat, name: categoryData.name };
            }
            if (cat.subCategories && cat.subCategories.length > 0) {
                cat.subCategories = cat.subCategories.map(sub => {
                    if (sub.categoryId === categoryId) {
                        return { ...sub, name: categoryData.name };
                    }
                    return sub;
                });
            }
            return cat;
        });

        return { success: true, message: "Updated successfully" };
    }
};

export const deleteCategory = async (categoryId) => {
    try {
        const response = await api.delete(`/admin/categories/${categoryId}`);
        return response.data;
    } catch (err) {
        console.warn(`Backend DELETE /admin/categories/${categoryId} failed, simulating delete locally.`, err.message);
        
        localCategories = localCategories.filter(cat => cat.categoryId !== categoryId);
        localCategories.forEach(cat => {
            if (cat.subCategories) {
                cat.subCategories = cat.subCategories.filter(sub => sub.categoryId !== categoryId);
            }
        });

        return { success: true, message: "Deleted successfully" };
    }
};
