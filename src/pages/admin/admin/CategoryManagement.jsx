import React, { useState } from "react";
import Layout from "../../../layouts/admin/Layout";
import { useCategories } from "../../../hooks/admin/useCategories.jsx";
import CategoryStats from "../../../features/admin/categories/CategoryStats";
import CategoryFilters from "../../../features/admin/categories/CategoryFilters";
import CategoryList from "../../../features/admin/categories/CategoryList";
import CategoryFormModal from "../../../features/admin/categories/CategoryFormModal";
import CategoryDeleteModal from "../../../features/admin/categories/CategoryDeleteModal";

const CategoryManagement = () => {
    const {
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
        handleDeleteCategory
    } = useCategories();

    const [defaultParent, setDefaultParent] = useState(null);

    const handleAddSubCategory = (parentCat) => {
        setDefaultParent(parentCat);
        handleOpenAddModal();
    };

    return (
        <Layout>
            <div className="space-y-6 pb-12">
                {/* Page Title & Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                            Quản lý danh mục
                        </h1>
                        <p className="text-xs font-medium text-slate-500 m-0 mt-1">
                            Tổ chức và quản lý các phân loại danh mục sản phẩm của cửa hàng
                        </p>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <CategoryStats stats={stats} />

                {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">{error}</div>}

                {/* Filter and Control Bar */}
                <CategoryFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedLevel={selectedLevel}
                    onLevelChange={setSelectedLevel}
                    onOpenAddModal={() => {
                        setDefaultParent(null);
                        handleOpenAddModal();
                    }}
                />

                {/* Hierarchical Category List Table */}
                <CategoryList
                    categories={filteredCategories}
                    isLoading={isLoading}
                    onEditCategory={handleOpenEditModal}
                    onDeleteCategory={handleOpenDeleteModal}
                    onAddSubCategory={handleAddSubCategory}
                />

                {/* Add / Edit Form Modal */}
                <CategoryFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => {
                        setIsFormModalOpen(false);
                        setDefaultParent(null);
                    }}
                    onSave={handleSaveCategory}
                    editingCategory={editingCategory}
                    parentCategories={parentCategories}
                    defaultParent={defaultParent}
                />

                {/* Delete Confirmation Modal */}
                <CategoryDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirmDelete={handleDeleteCategory}
                    category={deletingCategory}
                />
            </div>
        </Layout>
    );
};

export default CategoryManagement;
