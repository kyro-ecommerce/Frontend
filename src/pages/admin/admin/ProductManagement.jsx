// src/pages/admin/ProductManagement.jsx - Updated to use AddProduct and EditProduct pages
import React, {useEffect, useRef, useState} from "react";
import {Navigate, useNavigate} from "react-router-dom";
import {Search} from "lucide-react";
import Layout from "../../../layouts/admin/Layout";
import {useAuth} from "../../../hooks/admin/useAuth.jsx";
import ProductList from "../../../features/admin/products/ProductList";
import {useProducts} from "../../../hooks/admin/useProducts";
import {ToastProvider, useToast} from "../../../store/admin/ToastContext";
import ProductDetailModal from "../../../features/admin/products/ProductDetailModal";

// Wrapper component to use toast in main component
const ProductManagementContent = () => {
    const { user, loading, isAdmin } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // State for managing modal
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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
        handleDeleteMultipleProducts,
        handlePageChange,
        updateFilters,
        clearFilters,
        refreshProducts
    } = useProducts();

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
            <div className="w-full">
                <div className="bg-white rounded-lg shadow-sm mb-5 border border-gray-200">
                    <div className="p-5">
                        {/* Filters Section - Exact same as Product.jsx */}
                        <div className="flex flex-col gap-4 mb-4 items-start justify-center w-full">
                            <div className="flex items-center gap-4 w-full max-w-md relative">
                                <Search className="absolute left-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="search"
                                    className="w-full py-2 pr-3 pl-10 rounded-md border border-gray-300 text-sm outline-none focus:border-blue-500"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={filters.keyword || ''}
                                    onChange={(e) => {
                                        // Update local state immediately for UI responsiveness
                                        const value = e.target.value;

                                        // Clear previous timeout
                                        if (searchTimeout.current) {
                                            clearTimeout(searchTimeout.current);
                                        }

                                        // Set new timeout for API call
                                        searchTimeout.current = setTimeout(() => {
                                            updateFilters({ keyword: value });
                                        }, 50);
                                    }}
                                />
                            </div>
                            <div className="w-full flex">
                                <div className="w-full flex">
                                    <div className="flex flex-row items-end gap-6 flex-wrap w-full">
                                        <div className="flex flex-row gap-5 flex-wrap">
                                            <div className="flex flex-col gap-2 items-start">
                                                <label className="text-sm font-medium text-gray-700">Danh mục</label>
                                                <select
                                                    value={localFilterState.topLevelCategory}
                                                    onChange={(e) => setLocalFilterState(prev => ({
                                                        ...prev,
                                                        topLevelCategory: e.target.value,
                                                        secondLevelCategory: '' // Reset subcategory when main category changes
                                                    }))}
                                                    className="rounded-md border border-gray-300 text-sm p-2 outline-none focus:border-blue-500 min-w-40 h-10"
                                                >
                                                    <option value="">Tất cả</option>
                                                    {categories?.topLevel?.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    )) || []}
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-2 items-start">
                                                <label className="text-sm font-medium text-gray-700">Danh mục con</label>
                                                <select
                                                    value={localFilterState.secondLevelCategory}
                                                    onChange={(e) => setLocalFilterState(prev => ({
                                                        ...prev,
                                                        secondLevelCategory: e.target.value
                                                    }))}
                                                    className="rounded-md border border-gray-300 text-sm p-2 outline-none focus:border-blue-500 min-w-40 h-10"
                                                    disabled={!localFilterState.topLevelCategory}
                                                >
                                                    <option value="">Tất cả</option>
                                                    {localFilterState.topLevelCategory && categories?.secondLevel?.[localFilterState.topLevelCategory] &&
                                                        categories.secondLevel[localFilterState.topLevelCategory].map(subcat => (
                                                            <option key={subcat} value={subcat}>{subcat}</option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-2 items-start">
                                                <label className="text-sm font-medium text-gray-700">Khoảng giá</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        placeholder="Từ"
                                                        value={localFilterState.minPrice}
                                                        onChange={(e) => setLocalFilterState(prev => ({
                                                            ...prev,
                                                            minPrice: e.target.value
                                                        }))}
                                                        className="rounded-md border border-gray-300 text-sm p-2 text-center h-10 w-25 outline-none focus:border-blue-500"
                                                    />
                                                    <span className="text-gray-500"> - </span>
                                                    <input
                                                        type="number"
                                                        placeholder="Đến"
                                                        value={localFilterState.maxPrice}
                                                        onChange={(e) => setLocalFilterState(prev => ({
                                                            ...prev,
                                                            maxPrice: e.target.value
                                                        }))}
                                                        className="rounded-md border border-gray-300 text-sm p-2 text-center h-10 w-25 outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 items-start">
                                                <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                                                <select
                                                    value={localFilterState.status}
                                                    onChange={(e) => setLocalFilterState(prev => ({
                                                        ...prev,
                                                        status: e.target.value
                                                    }))}
                                                    className="rounded-md border border-gray-300 text-sm p-2 outline-none focus:border-blue-500 min-w-30 h-10"
                                                >
                                                    <option value="all">Tất cả</option>
                                                    <option value="inStock">Còn hàng</option>
                                                    <option value="outOfStock">Hết hàng</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-2 items-start">
                                                <label className="text-sm font-medium text-gray-700">Sắp xếp theo</label>
                                                <select
                                                    value={sortBy}
                                                    onChange={(e) => handleSort(e.target.value)}
                                                    className="rounded-md border border-gray-300 text-sm p-2 outline-none focus:border-blue-500 min-w-35 h-10"
                                                >
                                                    <option value="createdAt">Ngày thêm</option>
                                                    <option value="id">ID</option>
                                                    <option value="price">Giá bán</option>
                                                    <option value="quantity">Kho hàng</option>
                                                    <option value="quantitySold">Đã bán</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-2 items-start">
                                                <label className="text-sm font-medium text-gray-700">Thứ tự</label>
                                                <button
                                                    className="bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-100 h-10 w-10 transition-colors"
                                                    onClick={() => handleSort(sortBy)}
                                                >
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-row gap-3 items-end ml-auto">
                                            <button
                                                className="px-4 py-2 bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                                                onClick={handleClearFilters}
                                            >
                                                Xóa bộ lọc
                                            </button>
                                            <button
                                                className="px-4 py-2 bg-blue-600 text-white border-none hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
                                                onClick={handleApplyFilters}
                                            >
                                                Lọc
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && <div className="text-red-500 my-4 bg-red-50 p-3 rounded-md">{error}</div>}

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
                            onDelete={handleDelete}
                        />

                        <div className="flex flex-col items-center mt-6 gap-3">
                            <div className="flex flex-wrap justify-center items-center gap-2">
                                <button
                                    className={`px-3 py-2 rounded-md text-sm font-medium inline-flex items-center justify-center gap-2 cursor-pointer transition-colors border max-w-fit disabled:opacity-50 disabled:cursor-not-allowed ${pagination.currentPage === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    onClick={() => goToPage(0)}
                                    disabled={pagination.currentPage === 0}
                                >
                                    Trang đầu
                                </button>

                                <button
                                    className="px-3 py-2 rounded-md text-sm font-medium inline-flex items-center justify-center gap-2 cursor-pointer transition-colors border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 max-w-fit disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        className="px-3 py-2 rounded-md text-sm font-medium text-center border border-gray-300 w-16 outline-none focus:border-blue-500"
                                    />
                                </div>

                                <button
                                    className="px-3 py-2 rounded-md text-sm font-medium inline-flex items-center justify-center gap-2 cursor-pointer transition-colors border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 max-w-fit disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!pagination.hasNext}
                                    onClick={nextPage}
                                >
                                    Trang kế
                                </button>

                                <button
                                    className={`px-3 py-2 rounded-md text-sm font-medium inline-flex items-center justify-center gap-2 cursor-pointer transition-colors border max-w-fit disabled:opacity-50 disabled:cursor-not-allowed ${pagination.currentPage === pagination.totalPages - 1 || pagination.totalPages === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    onClick={() => goToPage(pagination.totalPages - 1)}
                                    disabled={pagination.currentPage === pagination.totalPages - 1 || pagination.totalPages === 0}
                                >
                                    Trang cuối
                                </button>
                            </div>

                            <div className="text-sm text-gray-500">
                                Hiển thị {products?.length || 0} trên {pagination?.totalElements || 0} sản phẩm
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {isDetailModalOpen && selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedProduct(null);
                    }}
                    onEdit={(product) => {
                        // Handle edit functionality if needed
                        console.log("Edit product:", product);
                    }}
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