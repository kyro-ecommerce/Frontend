import React, {useEffect, useRef, useState} from "react";
import {Navigate, useNavigate} from "react-router-dom";
import {Search, Plus} from "lucide-react";
import Layout from "../../../layouts/admin/Layout";
import {useAuth} from "../../../hooks/admin/useAuth.jsx";
import ProductList from "../../../features/admin/products/ProductList";
import {useProducts} from "../../../hooks/admin/useProducts";
import {ToastProvider, useToast} from "../../../store/admin/ToastContext";
import ProductDetailModal from "../../../features/admin/products/ProductDetailModal";
import ProductFormModal from "../../../features/admin/products/ProductFormModal";
import { translateCategoryName } from "../../../utils/admin/format.js";

// Wrapper component to use toast in main component
const ProductManagementContent = () => {
    const { user, loading, isAdmin } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // State for managing modal
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const searchTimeout = useRef(null);

    // Filter and search state
    const [searchQuery, setSearchQuery] = useState("");
    const [subcategories, setSubcategories] = useState([]);
    const [pageInput, setPageInput] = useState("");

    // Local filter state (same as Product.jsx)
    const [localFilterState, setLocalFilterState] = useState({
        topLevelCategory: '',
        secondLevelCategory: '',
        minPrice: '',
        maxPrice: '',
        status: 'all'
    });

    // Product management hook - now includes pagination
    const {
        products,
        categories,
        pagination,
        isLoading,
        error,
        selectedCategory,
        sortBy,
        sortOrder,
        filters,
        handleSearch,
        handleCategoryFilter,
        handleSort,
        handleDeleteProduct,
        handlePageChange,
        updateFilters,
        clearFilters,
        refreshProducts,
        handleAddProduct,
        handleUpdateProduct
    } = useProducts();

    // Modal handlers for add / edit product
    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
        setIsFormModalOpen(true);
        setIsDetailModalOpen(false);
    };

    const handleSaveProduct = async (productData) => {
        try {
            let result;
            if (editingProduct) {
                result = await handleUpdateProduct(editingProduct.id, productData);
            } else {
                result = await handleAddProduct(productData);
            }

            if (result.success) {
                toast.success(editingProduct ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm mới thành công!");
                setIsFormModalOpen(false);
                setEditingProduct(null);
                refreshProducts();
            } else {
                toast.error(result.error || "Thao tác thất bại!");
            }
        } catch (err) {
            toast.error(`Đã xảy ra lỗi: ${err.message}`);
        }
    };

    useEffect(() => {
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, []);

    useEffect(() => {
        if (filters.topLevelCategory) {
            // Get subcategories for selected category from hook's categories
            const subcats = categories?.secondLevel?.[filters.topLevelCategory] || [];
            setSubcategories(subcats);
        } else {
            setSubcategories([]);
        }
    }, [filters.topLevelCategory, categories]);

    useEffect(() => {
        setLocalFilterState({
            topLevelCategory: filters.topLevelCategory || '',
            secondLevelCategory: filters.secondLevelCategory || '',
            minPrice: filters.minPrice || '',
            maxPrice: filters.maxPrice || '',
            status: filters.status || 'all'
        });
    }, [filters]);

    // Apply filters (same logic as Product.jsx)
    const handleApplyFilters = () => {
        updateFilters({
            topLevelCategory: localFilterState.topLevelCategory,
            secondLevelCategory: localFilterState.secondLevelCategory,
            minPrice: localFilterState.minPrice ? parseInt(localFilterState.minPrice) : null,
            maxPrice: localFilterState.maxPrice ? parseInt(localFilterState.maxPrice) : null,
            status: localFilterState.status
        });
    };

    // Clear filters
    const handleClearFilters = () => {
        setLocalFilterState({
            topLevelCategory: '',
            secondLevelCategory: '',
            minPrice: '',
            maxPrice: '',
            status: 'all'
        });
        clearFilters();
    };

    // Pagination handlers
    const goToPage = (page) => {
        if (page >= 0 && page < pagination.totalPages) {
            handlePageChange(page);
        }
    };

    const nextPage = () => {
        if (pagination.hasNext) {
            goToPage(pagination.currentPage + 1);
        }
    };

    const previousPage = () => {
        if (pagination.hasPrevious) {
            goToPage(pagination.currentPage - 1);
        }
    };

    const handlePageInputChange = (e) => {
        setPageInput(e.target.value);
    };

    const handlePageInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            const pageNumber = parseInt(pageInput);
            if (pageNumber >= 1 && pageNumber <= pagination.totalPages) {
                goToPage(pageNumber - 1); // Convert to 0-based index
            }
            setPageInput("");
        }
    };

    // Handle viewing product details
    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setIsDetailModalOpen(true);
    };
    // Handle deleting a single product
    const handleDelete = async (productId) => {
        try {
            const result = await handleDeleteProduct(productId);
            if (result.success) {
                toast.success("Xóa sản phẩm thành công!");

                // Check if current page becomes empty after deletion
                const remainingItems = products.length - 1;
                if (remainingItems === 0 && pagination.currentPage > 0) {
                    // Go to previous page if current page becomes empty
                    goToPage(pagination.currentPage - 1);
                }
            } else {
                toast.error(`Lỗi xóa sản phẩm: ${result.error}`);
            }
        } catch (err) {
            toast.error(`Đã xảy ra lỗi: ${err.message}`);
        }
    };

    // If loading user information
    if (loading) {
        return <div>Đang tải...</div>;
    }

    // If user is not logged in or not admin
    if (!user || !isAdmin()) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Layout>
            <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                        {/* Filters & Action Section */}
                        <div className="flex flex-col gap-4 mb-4 items-start justify-center w-full">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
                                <div className="flex items-center gap-4 w-full max-w-md relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="search"
                                        className="w-full py-2.5 pr-4 pl-10 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#1D7461] focus:ring-2 focus:ring-[#1D7461]/20 transition-all"
                                        placeholder="Tìm kiếm sản phẩm..."
                                        value={filters.keyword || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (searchTimeout.current) {
                                                clearTimeout(searchTimeout.current);
                                            }
                                            searchTimeout.current = setTimeout(() => {
                                                updateFilters({ keyword: value });
                                            }, 50);
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={handleOpenAddModal}
                                    className="px-4 py-2.5 bg-[#1D7461] hover:bg-[#136050] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-[#1D7461]/20 border-none flex items-center justify-center gap-1.5 shrink-0"
                                >
                                    <Plus className="w-4 h-4" /> Thêm sản phẩm
                                </button>
                            </div>
                            <div className="w-full flex">
                                <div className="w-full flex">
                                    <div className="flex flex-row items-end gap-4 flex-wrap w-full">
                                        <div className="flex flex-row gap-4 flex-wrap">
                                            <div className="flex flex-col gap-1.5 items-start">
                                                <label className="text-xs font-bold text-slate-600">Danh mục</label>
                                                <select
                                                    value={localFilterState.topLevelCategory}
                                                    onChange={(e) => setLocalFilterState(prev => ({
                                                        ...prev,
                                                        topLevelCategory: e.target.value,
                                                        secondLevelCategory: ''
                                                    }))}
                                                    className="rounded-xl border border-slate-200 text-xs font-semibold p-2.5 outline-none focus:border-[#1D7461] min-w-40 h-10 bg-white"
                                                >
                                                    <option value="">Tất cả</option>
                                                    {categories?.topLevel?.map(cat => (
                                                        <option key={cat} value={cat}>{translateCategoryName(cat)}</option>
                                                    )) || []}
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-1.5 items-start">
                                                <label className="text-xs font-bold text-slate-600">Danh mục con</label>
                                                <select
                                                    value={localFilterState.secondLevelCategory}
                                                    onChange={(e) => setLocalFilterState(prev => ({
                                                        ...prev,
                                                        secondLevelCategory: e.target.value
                                                    }))}
                                                    className="rounded-xl border border-slate-200 text-xs font-semibold p-2.5 outline-none focus:border-[#1D7461] min-w-40 h-10 bg-white disabled:opacity-50"
                                                    disabled={!localFilterState.topLevelCategory}
                                                >
                                                    <option value="">Tất cả</option>
                                                    {localFilterState.topLevelCategory && categories?.secondLevel?.[localFilterState.topLevelCategory] &&
                                                        categories.secondLevel[localFilterState.topLevelCategory].map(subcat => (
                                                            <option key={subcat} value={subcat}>{translateCategoryName(subcat)}</option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-1.5 items-start">
                                                <label className="text-xs font-bold text-slate-600">Khoảng giá</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        placeholder="Từ"
                                                        value={localFilterState.minPrice}
                                                        onChange={(e) => setLocalFilterState(prev => ({
                                                            ...prev,
                                                            minPrice: e.target.value
                                                        }))}
                                                        className="rounded-xl border border-slate-200 text-xs font-semibold p-2 text-center h-10 w-24 outline-none focus:border-[#1D7461] bg-white"
                                                    />
                                                    <span className="text-slate-400 font-bold text-xs">-</span>
                                                    <input
                                                        type="number"
                                                        placeholder="Đến"
                                                        value={localFilterState.maxPrice}
                                                        onChange={(e) => setLocalFilterState(prev => ({
                                                            ...prev,
                                                            maxPrice: e.target.value
                                                        }))}
                                                        className="rounded-xl border border-slate-200 text-xs font-semibold p-2 text-center h-10 w-24 outline-none focus:border-[#1D7461] bg-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5 items-start">
                                                <label className="text-xs font-bold text-slate-600">Trạng thái</label>
                                                <select
                                                    value={localFilterState.status}
                                                    onChange={(e) => setLocalFilterState(prev => ({
                                                        ...prev,
                                                        status: e.target.value
                                                    }))}
                                                    className="rounded-xl border border-slate-200 text-xs font-semibold p-2.5 outline-none focus:border-[#1D7461] min-w-30 h-10 bg-white"
                                                >
                                                    <option value="all">Tất cả</option>
                                                    <option value="inStock">Còn hàng</option>
                                                    <option value="outOfStock">Hết hàng</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-1.5 items-start">
                                                <label className="text-xs font-bold text-slate-600">Sắp xếp theo</label>
                                                <select
                                                    value={sortBy}
                                                    onChange={(e) => handleSort(e.target.value)}
                                                    className="rounded-xl border border-slate-200 text-xs font-semibold p-2.5 outline-none focus:border-[#1D7461] min-w-35 h-10 bg-white"
                                                >
                                                    <option value="createdAt">Ngày thêm</option>
                                                    <option value="id">ID</option>
                                                    <option value="price">Giá bán</option>
                                                    <option value="quantity">Kho hàng</option>
                                                    <option value="quantitySold">Đã bán</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-1.5 items-start">
                                                <label className="text-xs font-bold text-slate-600">Thứ tự</label>
                                                <button
                                                    className="bg-white border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50 h-10 w-10 transition-colors font-bold text-slate-700"
                                                    onClick={() => handleSort(sortBy)}
                                                >
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-row gap-2.5 items-end ml-auto">
                                            <button
                                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                                onClick={handleClearFilters}
                                            >
                                                Xóa bộ lọc
                                            </button>
                                            <button
                                                className="px-4 py-2.5 bg-[#1D7461] hover:bg-[#136050] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-[#1D7461]/20 border-none"
                                                onClick={handleApplyFilters}
                                            >
                                                Lọc
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && <div className="text-red-600 my-4 bg-red-50 border border-red-200 p-3 rounded-xl text-xs font-semibold">{error}</div>}

                        {/* Product List */}
                        <ProductList
                            products={products}
                            isLoading={isLoading}
                            categories={categories}
                            onCategoryFilter={handleCategoryFilter}
                            selectedCategory={selectedCategory}
                            onSort={handleSort}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onView={handleViewProduct}
                            onEdit={handleOpenEditModal}
                            onAddProduct={handleOpenAddModal}
                            onDelete={handleDelete}
                        />

                        <div className="flex flex-col items-center mt-6 gap-3">
                            <div className="flex flex-wrap justify-center items-center gap-2">
                                <button
                                    className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${pagination.currentPage === 0 ? 'bg-[#1D7461] text-white border-[#1D7461]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                    onClick={() => goToPage(0)}
                                    disabled={pagination.currentPage === 0}
                                >
                                    Trang đầu
                                </button>

                                <button
                                    className="px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!pagination.hasPrevious}
                                    onClick={previousPage}
                                >
                                    Trang Trước
                                </button>

                                <div>
                                    <input
                                        type="number"
                                        value={pageInput}
                                        onChange={handlePageInputChange}
                                        onKeyPress={handlePageInputKeyPress}
                                        placeholder={`${pagination.currentPage + 1}`}
                                        min="1"
                                        max={pagination.totalPages}
                                        className="px-3 py-2 rounded-xl text-xs font-bold text-center border border-slate-200 w-16 outline-none focus:border-[#1D7461] bg-white"
                                    />
                                </div>

                                <button
                                    className="px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!pagination.hasNext}
                                    onClick={nextPage}
                                >
                                    Trang kế
                                </button>

                                <button
                                    className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${pagination.currentPage === pagination.totalPages - 1 || pagination.totalPages === 0 ? 'bg-[#1D7461] text-white border-[#1D7461]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                    onClick={() => goToPage(pagination.totalPages - 1)}
                                    disabled={pagination.currentPage === pagination.totalPages - 1 || pagination.totalPages === 0}
                                >
                                    Trang cuối
                                </button>
                            </div>

                            <div className="text-xs font-semibold text-slate-400">
                                Hiển thị {products?.length || 0} trên {pagination?.totalElements || 0} sản phẩm
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Detail Modal */}
            {isDetailModalOpen && selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedProduct(null);
                    }}
                    onEdit={(product) => {
                        handleOpenEditModal(product);
                    }}
                />
            )}

            {/* Product Form Modal (Add / Edit) */}
            {isFormModalOpen && (
                <ProductFormModal
                    product={editingProduct}
                    categories={categories}
                    onClose={() => {
                        setIsFormModalOpen(false);
                        setEditingProduct(null);
                    }}
                    onSave={handleSaveProduct}
                />
            )}
        </Layout>
    );
};

// Wrapper with ToastProvider
const ProductManagement = () => {
    return (
        <ToastProvider>
            <ProductManagementContent />
        </ToastProvider>
    );
};

export default ProductManagement;
