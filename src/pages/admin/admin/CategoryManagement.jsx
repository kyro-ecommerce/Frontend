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
            <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
                <div className="max-w-7xl mx-auto space-y-4">
                    {/* Metric Summary Cards */}
                    <CategoryStats stats={stats} />

                    {/* Container cho bộ lọc và danh sách */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
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

                        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">{error}</div>}

                        {/* Hierarchical Category List Table */}
                        <CategoryList
                            categories={filteredCategories}
                            isLoading={isLoading}
                            onEditCategory={handleOpenEditModal}
                            onDeleteCategory={handleOpenDeleteModal}
                            onAddSubCategory={handleAddSubCategory}
                        />
                    </div>
                </div>

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
