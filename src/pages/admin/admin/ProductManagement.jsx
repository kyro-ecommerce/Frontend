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
import { getErrorMessage } from "../../../utils/errorUtils";

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
                refreshProducts();
            } else {
                toast.error(result.error || "Thao tác thất bại!");
            }
            return result;
        } catch (err) {
            toast.error(`Đã xảy ra lỗi: ${err.message}`);
            return { success: false, error: err.message };
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

    // Instant filter helper
    const applyImmediateFilter = (changes) => {
        const nextState = { ...localFilterState, ...changes };
        setLocalFilterState(nextState);

        const selectedCat = nextState.secondLevelCategory || nextState.topLevelCategory;
        updateFilters({
            topLevelCategory: nextState.topLevelCategory,
            secondLevelCategory: nextState.secondLevelCategory,
            categoryId: selectedCat ? categories.ids?.[selectedCat] : null,
            minPrice: nextState.minPrice !== '' && nextState.minPrice !== null ? parseInt(nextState.minPrice) : null,
            maxPrice: nextState.maxPrice !== '' && nextState.maxPrice !== null ? parseInt(nextState.maxPrice) : null,
            status: nextState.status
        });
    };

    // Apply filters manually if needed
    const handleApplyFilters = () => {
        applyImmediateFilter({});
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

    // Active filters count
    const activeFilterCount = (localFilterState.topLevelCategory ? 1 : 0) +
        (localFilterState.secondLevelCategory ? 1 : 0) +
        (localFilterState.minPrice !== '' || localFilterState.maxPrice !== '' ? 1 : 0) +
        (localFilterState.status !== 'all' ? 1 : 0) +
        (filters.keyword ? 1 : 0);

    // Price preset handler
    const handlePricePreset = (min, max) => {
        applyImmediateFilter({ minPrice: min, maxPrice: max });
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
                        <div className="flex flex-col gap-4 mb-5 w-full">
                            {/* Row 1: Search Bar + Status Tabs + Add Product Button */}
                            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full">
                                <div className="flex items-center gap-3 w-full md:max-w-md relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="search"
                                        className="w-full h-10 pr-4 pl-10 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#1D7461] focus:ring-2 focus:ring-[#1D7461]/20 transition-all bg-white"
                                        placeholder="Tìm kiếm sản phẩm theo tên..."
                                        value={filters.keyword || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (searchTimeout.current) {
                                                clearTimeout(searchTimeout.current);
                                            }
                                            searchTimeout.current = setTimeout(() => {
                                                updateFilters({ keyword: value });
                                            }, 150);
                                        }}
                                    />
                                </div>

                                {/* Status Tabs */}
                                <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60 shrink-0">
                                    {[
                                        { id: 'all', label: 'Tất cả' },
                                        { id: 'inStock', label: 'Còn hàng' },
                                        { id: 'outOfStock', label: 'Hết hàng' }
                                    ].map((tab) => {
                                        const isActive = localFilterState.status === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => applyImmediateFilter({ status: tab.id })}
                                                className={`px-3.5 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                                                    isActive
                                                        ? 'bg-[#1D7461] text-white shadow-xs'
                                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={handleOpenAddModal}
                                    className="h-10 px-4 bg-[#1D7461] hover:bg-[#136050] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-[#1D7461]/20 border-none flex items-center justify-center gap-1.5 shrink-0 ml-auto md:ml-0"
                                >
                                    <Plus className="w-4 h-4" /> Thêm sản phẩm
                                </button>
                            </div>

                            {/* Row 2: Category Dropdowns + Sort Control + Price Presets */}
                            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex flex-col gap-3">
                                <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Top Level Category */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-600 shrink-0">Danh mục:</span>
                                            <select
                                                value={localFilterState.topLevelCategory}
                                                onChange={(e) => applyImmediateFilter({
                                                    topLevelCategory: e.target.value,
                                                    secondLevelCategory: ''
                                                })}
                                                className="rounded-xl border border-slate-200 text-xs font-semibold px-3 h-9 outline-none focus:border-[#1D7461] bg-white text-slate-800 cursor-pointer shadow-2xs min-w-36"
                                            >
                                                <option value="" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Tất cả danh mục</option>
                                                {categories?.topLevel?.map(cat => (
                                                    <option key={cat} value={cat} className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>{translateCategoryName(cat)}</option>
                                                )) || []}
                                            </select>
                                        </div>

                                        {/* Second Level Category */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-600 shrink-0">Danh mục con:</span>
                                            <select
                                                value={localFilterState.secondLevelCategory}
                                                onChange={(e) => applyImmediateFilter({ secondLevelCategory: e.target.value })}
                                                className="rounded-xl border border-slate-200 text-xs font-semibold px-3 h-9 outline-none focus:border-[#1D7461] bg-white text-slate-800 disabled:opacity-50 cursor-pointer shadow-2xs min-w-36"
                                                disabled={!localFilterState.topLevelCategory}
                                            >
                                                <option value="" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Tất cả danh mục con</option>
                                                {localFilterState.topLevelCategory && categories?.secondLevel?.[localFilterState.topLevelCategory] &&
                                                    categories.secondLevel[localFilterState.topLevelCategory].map(subcat => (
                                                        <option key={subcat} value={subcat} className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>{translateCategoryName(subcat)}</option>
                                                    ))}
                                            </select>
                                        </div>

                                        {/* Sort Control */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-600 shrink-0">Sắp xếp:</span>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => handleSort(e.target.value, sortOrder)}
                                                className="rounded-xl border border-slate-200 text-xs font-semibold px-3 h-9 outline-none focus:border-[#1D7461] bg-white text-slate-800 cursor-pointer shadow-2xs min-w-32"
                                            >
                                                <option value="createdAt" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Ngày thêm</option>
                                                <option value="id" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>ID</option>
                                                <option value="price" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Giá bán</option>
                                                <option value="quantity" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Kho hàng</option>
                                                <option value="quantitySold" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Đã bán</option>
                                            </select>
                                            
                                            {/* Sleek Sort Direction Toggle Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleSort(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                                                className="h-9 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all font-bold text-xs text-slate-700 shadow-2xs active:scale-95"
                                                title={sortOrder === 'asc' ? 'Đang xếp Tăng dần (Bấm để xếp Giảm dần)' : 'Đang xếp Giảm dần (Bấm để xếp Tăng dần)'}
                                            >
                                                <span className="text-[#1D7461] font-extrabold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                                <span>{sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Clear Filter Button */}
                                    {activeFilterCount > 0 && (
                                        <button
                                            type="button"
                                            className="px-3.5 h-9 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                                            onClick={handleClearFilters}
                                        >
                                            <span>Xóa bộ lọc</span>
                                            <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                                                {activeFilterCount}
                                            </span>
                                        </button>
                                    )}
                                </div>

                                {/* Price Range Row */}
                                <div className="flex flex-wrap items-center justify-start gap-4 pt-2.5 border-t border-slate-200/60">
                                    {/* Custom Min / Max Price Inputs (Left) */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-slate-600 shrink-0">Tùy chỉnh giá:</span>
                                        <input
                                            type="number"
                                            placeholder="Từ giá"
                                            maxLength={9}
                                            max={999999999}
                                            value={localFilterState.minPrice}
                                            onChange={(e) => {
                                                const val = e.target.value.slice(0, 9);
                                                setLocalFilterState(prev => ({ ...prev, minPrice: val }));
                                                if (searchTimeout.current) clearTimeout(searchTimeout.current);
                                                searchTimeout.current = setTimeout(() => {
                                                    applyImmediateFilter({ minPrice: val });
                                                }, 400);
                                            }}
                                            className="rounded-lg border border-slate-200 text-xs font-semibold px-2 py-1 text-center h-8 w-24 outline-none focus:border-[#1D7461] bg-white shadow-2xs"
                                        />
                                        <span className="text-slate-400 font-bold text-xs">-</span>
                                        <input
                                            type="number"
                                            placeholder="Đến giá"
                                            maxLength={9}
                                            max={999999999}
                                            value={localFilterState.maxPrice}
                                            onChange={(e) => {
                                                const val = e.target.value.slice(0, 9);
                                                setLocalFilterState(prev => ({ ...prev, maxPrice: val }));
                                                if (searchTimeout.current) clearTimeout(searchTimeout.current);
                                                searchTimeout.current = setTimeout(() => {
                                                    applyImmediateFilter({ maxPrice: val });
                                                }, 400);
                                            }}
                                            className="rounded-lg border border-slate-200 text-xs font-semibold px-2 py-1 text-center h-8 w-24 outline-none focus:border-[#1D7461] bg-white shadow-2xs"
                                        />
                                    </div>

                                    {/* Price Presets (Following Custom Inputs) */}
                                    <div className="flex flex-wrap items-center gap-1.5 border-l border-slate-200/80 pl-4">
                                        <span className="text-xs font-bold text-slate-500 mr-1 shrink-0">Giá nhanh:</span>
                                        {[
                                            { label: 'Tất cả', min: '', max: '' },
                                            { label: '< 5 triệu', min: '', max: '5000000' },
                                            { label: '5 - 15 triệu', min: '5000000', max: '15000000' },
                                            { label: '15 - 30 triệu', min: '15000000', max: '30000000' },
                                            { label: '> 30 triệu', min: '30000000', max: '' },
                                        ].map((preset) => {
                                            const isSelected = localFilterState.minPrice === preset.min && localFilterState.maxPrice === preset.max;
                                            return (
                                                <button
                                                    key={preset.label}
                                                    type="button"
                                                    onClick={() => handlePricePreset(preset.min, preset.max)}
                                                    className={`px-2.5 h-7 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                                                        isSelected
                                                            ? 'bg-[#1D7461]/10 text-[#1D7461] border-[#1D7461] font-bold shadow-2xs'
                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                                                    }`}
                                                >
                                                    {preset.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 my-4 bg-red-50 border border-red-200 p-3 rounded-xl text-xs font-semibold">
                                {getErrorMessage(error, "Không thể lọc dữ liệu sản phẩm. Vui lòng kiểm tra lại điều kiện lọc.")}
                            </div>
                        )}

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
                            totalElements={pagination.totalElements}
                        />

                        <div className="flex justify-center items-center pt-3 border-t border-slate-200/60 mt-4">
                            <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-50/80 p-1 rounded-2xl border border-slate-200/80">
                                <button
                                    className="px-3 py-1.5 text-xs font-extrabold rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                                    onClick={() => goToPage(0)}
                                    disabled={pagination.currentPage === 0}
                                    title="Trang đầu"
                                >
                                    « Đầu
                                </button>

                                <button
                                    className="px-3 py-1.5 text-xs font-extrabold rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                                    disabled={!pagination.hasPrevious}
                                    onClick={previousPage}
                                >
                                    ‹ Trước
                                </button>

                                <div className="flex items-center gap-1.5 px-2">
                                    <span className="text-xs font-bold text-slate-500">Trang</span>
                                    <input
                                        type="number"
                                        value={pageInput}
                                        onChange={handlePageInputChange}
                                        onKeyPress={handlePageInputKeyPress}
                                        placeholder={`${pagination.currentPage + 1}`}
                                        min="1"
                                        max={pagination.totalPages}
                                        className="w-12 py-1 px-1 text-xs font-black text-center text-[#1D7461] bg-white border border-slate-300 rounded-lg outline-none focus:border-[#1D7461] focus:ring-1 focus:ring-[#1D7461]"
                                    />
                                    <span className="text-xs font-bold text-slate-500">/ {pagination.totalPages || 1}</span>
                                </div>

                                <button
                                    className="px-3 py-1.5 text-xs font-extrabold rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                                    disabled={!pagination.hasNext}
                                    onClick={nextPage}
                                >
                                    Kế ›
                                </button>

                                <button
                                    className="px-3 py-1.5 text-xs font-extrabold rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                                    onClick={() => goToPage(pagination.totalPages - 1)}
                                    disabled={pagination.currentPage === pagination.totalPages - 1 || pagination.totalPages === 0}
                                    title="Trang cuối"
                                >
                                    Cuối »
                                </button>
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
