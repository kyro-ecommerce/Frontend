// src/pages/admin/ProductManagement.jsx - Updated to use AddProduct and EditProduct pages
import React, {useEffect, useRef, useState} from "react";
import {Navigate, useNavigate} from "react-router-dom";
import {Search} from "lucide-react";
import Layout from "../../components/layout/Layout";
import {useAuth} from "../../hooks/useAuth.jsx";
import ProductList from "../../components/features/products/ProductList";
import {useProducts} from "../../hooks/useProducts";
import {ToastProvider, useToast} from "../../contexts/ToastContext";
import "../../styles/admin/product/products.css";
import ProductDetailModal from "../../components/features/products/ProductDetailModal";

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
            <div className="products-container">
                <div className="card">
                    <div className="card-content">
                        {/* Filters Section - Exact same as Product.jsx */}
                        <div className="filters-product">
                            <div className="search-container">
                                <Search className="search-icon" />
                                <input
                                    type="search"
                                    className="search-input"
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
                            <div className="filter-actions">
                                <div className="filter-dropdown-container">
                                    <div className="filter-dropdown">
                                        <div className="filter-dropdown-content">
                                            <div className="filter-group">
                                                <label>Danh mục</label>
                                                <select
                                                    value={localFilterState.topLevelCategory}
                                                    onChange={(e) => setLocalFilterState(prev => ({
                                                        ...prev,
                                                        topLevelCategory: e.target.value,
                                                        secondLevelCategory: '' // Reset subcategory when main category changes
                                                    }))}
                                                    className="filter-select"
                                                >
                                                    <option value="">Tất cả</option>
                                                    {categories?.topLevel?.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    )) || []}
                                                </select>
                                            </div>

                                            <div className="filter-group">
                                                <label>Danh mục con</label>
                                                <select
                                                    value={localFilterState.secondLevelCategory}
                                                    onChange={(e) => setLocalFilterState(prev => ({
                                                        ...prev,
                                                        secondLevelCategory: e.target.value
                                                    }))}
                                                    className="filter-select"
                                                    disabled={!localFilterState.topLevelCategory}
                                                >
                                                    <option value="">Tất cả</option>
                                                    {localFilterState.topLevelCategory && categories?.secondLevel?.[localFilterState.topLevelCategory] &&
                                                        categories.secondLevel[localFilterState.topLevelCategory].map(subcat => (
                                                            <option key={subcat} value={subcat}>{subcat}</option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div className="filter-group">
                                                <label>Khoảng giá</label>
                                                <div className="price-range">
                                                    <input
                                                        type="number"
                                                        placeholder="Từ"
                                                        value={localFilterState.minPrice}
                                                        onChange={(e) => setLocalFilterState(prev => ({
                                                            ...prev,
                                                            minPrice: e.target.value
                                                        }))}
                                                        className="filter-input"
                                                    />
                                                    <span> - </span>
                                                    <input
                                                        type="number"
                                                        placeholder="Đến"
                                                        value={localFilterState.maxPrice}
                                                        onChange={(e) => setLocalFilterState(prev => ({
                                                            ...prev,
                                                            maxPrice: e.target.value
                                                        }))}
                                                        className="filter-input"
                                                    />
                                                </div>
                                            </div>

                                            <div className="filter-group">
                                                <label>Trạng thái</label>
                                                <select
                                                    value={localFilterState.status}
                                                    onChange={(e) => setLocalFilterState(prev => ({
                                                        ...prev,
                                                        status: e.target.value
                                                    }))}
                                                    className="filter-select"
                                                >
                                                    <option value="all">Tất cả</option>
                                                    <option value="inStock">Còn hàng</option>
                                                    <option value="outOfStock">Hết hàng</option>
                                                </select>
                                            </div>

                                            <div className="filter-group">
                                                <label>Sắp xếp theo</label>
                                                <select
                                                    value={sortBy}
                                                    onChange={(e) => handleSort(e.target.value)}
                                                    className="filter-select"
                                                >
                                                    <option value="createdAt">Ngày thêm</option>
                                                    <option value="id">ID</option>
                                                    <option value="price">Giá bán</option>
                                                    <option value="quantity">Kho hàng</option>
                                                    <option value="quantitySold">Đã bán</option>
                                                </select>
                                            </div>

                                            <div className="filter-group">
                                                <label>Thứ tự</label>
                                                <button
                                                    className="filter-select sort-direction-btn"
                                                    onClick={() => handleSort(sortBy)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: 'white',
                                                        border: '1px solid #ccc',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="filter-dropdown-footer">
                                            <button
                                                className="button outline small"
                                                onClick={handleClearFilters}
                                            >
                                                Xóa bộ lọc
                                            </button>
                                            <button
                                                className="button primary small"
                                                onClick={handleApplyFilters}
                                            >
                                                Lọc
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

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

                        <div className="pagination-container">
                            <div className="pagination">
                                <button
                                    className={`button-product outline small ${pagination.currentPage === 0 ? 'active' : ''}`}
                                    onClick={() => goToPage(0)}
                                    disabled={pagination.currentPage === 0}
                                >
                                    Trang đầu
                                </button>

                                <button
                                    className="button-product outline small"
                                    disabled={!pagination.hasPrevious}
                                    onClick={previousPage}
                                >
                                    Trang Trước
                                </button>

                                <div className="page-input-container">
                                    <input
                                        type="number"
                                        value={pageInput}
                                        onChange={handlePageInputChange}
                                        onKeyPress={handlePageInputKeyPress}
                                        placeholder={`${pagination.currentPage + 1}`}
                                        min="1"
                                        max={pagination.totalPages}
                                        className="button-product outline small"
                                    />
                                </div>

                                <button
                                    className="button-product outline small"
                                    disabled={!pagination.hasNext}
                                    onClick={nextPage}
                                >
                                    Trang kế
                                </button>

                                <button
                                    className={`button-product outline small ${pagination.currentPage === pagination.totalPages - 1 || pagination.totalPages === 0 ? 'active' : ''}`}
                                    onClick={() => goToPage(pagination.totalPages - 1)}
                                    disabled={pagination.currentPage === pagination.totalPages - 1 || pagination.totalPages === 0}
                                >
                                    Trang cuối
                                </button>
                            </div>

                            <div className="pagination-info">
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