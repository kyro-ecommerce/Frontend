import { useState, useEffect, useCallback, useMemo } from "react";
import { categoryService } from "../../services/admin/index.js";

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("all"); // 'all', '1', '2'
    
    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await categoryService.getAllCategories();
            setCategories(data || []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách danh mục:", err);
            setError("Không thể tải danh mục sản phẩm");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Flat list of parent categories (Level 1)
    const parentCategories = useMemo(() => {
        return categories.filter(c => c.level === 1 || c.isParent);
    }, [categories]);

    // Statistics calculation
    const stats = useMemo(() => {
        let level1Count = 0;
        let level2Count = 0;
        let totalProducts = 0;

        categories.forEach(cat => {
            if (cat.level === 1 || cat.isParent) {
                level1Count += 1;
                totalProducts += (cat.productCount || 0);
                if (cat.subCategories && cat.subCategories.length > 0) {
                    level2Count += cat.subCategories.length;
                    cat.subCategories.forEach(sub => {
                        totalProducts += (sub.productCount || 0);
                    });
                }
            } else if (cat.level === 2) {
                level2Count += 1;
                totalProducts += (cat.productCount || 0);
            }
        });

        return {
            totalCategories: level1Count + level2Count,
            level1Count,
            level2Count,
            totalProducts
        };
    }, [categories]);

    // Filtered categories based on search and level
    const filteredCategories = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return categories.map(parent => {
            const parentMatches = !term || parent.name.toLowerCase().includes(term);
            
            const matchingSubcategories = (parent.subCategories || []).filter(sub => {
                const subMatches = !term || sub.name.toLowerCase().includes(term);
                if (selectedLevel === "1") return false; // Hide level 2 if filtering level 1
                return subMatches;
            });

            if (selectedLevel === "2") {
                // If level 2 filter is selected, only show parents that have matching subcategories
                if (matchingSubcategories.length > 0) {
                    return { ...parent, subCategories: matchingSubcategories, isExpandedDefault: true };
                }
                return null;
            }

            if (selectedLevel === "1") {
                // If level 1 filter is selected, show parents without subcategories
                if (parentMatches) {
                    return { ...parent, subCategories: [] };
                }
                return null;
            }

            // 'all' level selected
            if (parentMatches || matchingSubcategories.length > 0) {
                return {
                    ...parent,
                    subCategories: matchingSubcategories,
                    isExpandedDefault: Boolean(term && matchingSubcategories.length > 0)
                };
            }

            return null;
        }).filter(Boolean);
    }, [categories, searchTerm, selectedLevel]);

    // CRUD Action Handlers
    const handleOpenAddModal = () => {
        setEditingCategory(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (category) => {
        setEditingCategory(category);
        setIsFormModalOpen(true);
    };

    const handleOpenDeleteModal = (category) => {
        setDeletingCategory(category);
        setIsDeleteModalOpen(true);
    };

    const handleSaveCategory = async (formData) => {
        try {
            if (editingCategory) {
                await categoryService.updateCategory(editingCategory.categoryId, formData);
            } else {
                await categoryService.createCategory(formData);
            }
            await fetchCategories();
            setIsFormModalOpen(false);
            setEditingCategory(null);
            return { success: true };
        } catch (err) {
            console.error("Lỗi khi lưu danh mục:", err);
            return { success: false, error: err.message };
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            await categoryService.deleteCategory(categoryId);
            await fetchCategories();
            setIsDeleteModalOpen(false);
            setDeletingCategory(null);
            return { success: true };
        } catch (err) {
            console.error("Lỗi khi xóa danh mục:", err);
            return { success: false, error: err.message };
        }
    };

    return {
        categories,
        filteredCategories,
        parentCategories,
        stats,
        isLoading,
        error,
        searchTerm,
        setSearchTerm,
        selectedLevel,
        setSelectedLevel,
        isFormModalOpen,
        setIsFormModalOpen,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        editingCategory,
        deletingCategory,
        handleOpenAddModal,
        handleOpenEditModal,
        handleOpenDeleteModal,
        handleSaveCategory,
        handleDeleteCategory,
        refreshCategories: fetchCategories
    };
};
