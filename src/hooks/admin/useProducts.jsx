// src/hooks/useProducts.jsx - Updated with proper filter integration
import { useState, useEffect, useCallback } from "react";
import { productService } from "../../services/admin/index.js";

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState({
        topLevel: [],
        secondLevel: {}
    });
    const [isRequestInProgress, setIsRequestInProgress] = useState(false);


    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        hasNext: false,
        hasPrevious: false,
        pageSize: 10,
        isFirst: true,
        isLast: true
    });

    // Filter state for admin
    const [filters, setFilters] = useState({
        keyword: '',
        topLevelCategory: '',
        secondLevelCategory: '',
        color: '',
        minPrice: null,
        maxPrice: null,
        status: 'all'
    });

    // Sort state
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Search term state for compatibility
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const response = await productService.getProductCategories();
            const catData = response.data?.data || response.data || { topLevel: [], secondLevel: {} };
            setCategories(catData);
            return catData;
        } catch (err) {
            console.error('Error fetching categories:', err);
            return { topLevel: [], secondLevel: {} };
        }
    }, []);

    const fetchProducts = useCallback(async (page = 0, size = 10, currentSortBy = sortBy, currentSortOrder = sortOrder, currentFilters = null) => {
        // Prevent duplicate requests
        if (isRequestInProgress) {
            console.log('Request already in progress, skipping...');
            return;
        }

        setIsRequestInProgress(true);
        setIsLoading(true);

        try {
            const filtersToUse = currentFilters || filters;
            const response = await productService.getAllProducts({
                page,
                size,
                sortBy: currentSortBy,
                sortDir: currentSortOrder,
                keyword: filtersToUse.keyword,
                topLevelCategory: filtersToUse.topLevelCategory,
                secondLevelCategory: filtersToUse.secondLevelCategory,
                color: filtersToUse.color,
                minPrice: filtersToUse.minPrice,
                maxPrice: filtersToUse.maxPrice,
                status: filtersToUse.status
            });

            const pageData = response.data?.data || response.data || {};
            const productList = pageData.content || pageData.products || (Array.isArray(pageData) ? pageData : []);
            setProducts(productList);

            const paginationData = pageData.pagination || {};
            const currentPage = pageData.number ?? pageData.currentPage ?? paginationData.currentPage ?? 0;
            const totalPages = pageData.totalPages ?? paginationData.totalPages ?? 1;
            const totalElements = pageData.totalElements ?? paginationData.totalElements ?? productList.length;
            const pageSize = pageData.size ?? pageData.pageSize ?? paginationData.pageSize ?? 10;
            const isFirst = pageData.first ?? pageData.isFirst ?? paginationData.isFirst ?? (currentPage === 0);
            const isLast = pageData.last ?? pageData.isLast ?? paginationData.isLast ?? (currentPage >= totalPages - 1);

            setPagination({
                currentPage,
                totalPages,
                totalElements,
                hasNext: !isLast,
                hasPrevious: !isFirst,
                pageSize,
                isFirst,
                isLast
            });

            return pageData;
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể lấy danh sách sản phẩm');
            throw err;
        } finally {
            setIsLoading(false);
            setIsRequestInProgress(false);
        }
    }, [filters, sortBy, sortOrder, isRequestInProgress]);

    const updateFilters = useCallback((newFilters, shouldCallAPI = true) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);

        if (shouldCallAPI) {
            fetchProducts(0, pagination.pageSize, sortBy, sortOrder, updatedFilters);
        }
    }, [fetchProducts, pagination.pageSize, sortBy, sortOrder, filters]);

    const clearFilters = useCallback(() => {
        const defaultFilters = {
            keyword: '',
            topLevelCategory: '',
            secondLevelCategory: '',
            color: '',
            minPrice: null,
            maxPrice: null,
            status: 'all'
        };
        setFilters(defaultFilters);
        setSearchTerm('');
        setSelectedCategory('');
        fetchProducts(0, pagination.pageSize, sortBy, sortOrder, defaultFilters);
    }, [fetchProducts, pagination.pageSize, sortBy, sortOrder]);



    // Handle search (for compatibility with existing components)
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setFilters(prev => ({ ...prev, keyword: term }));
        // Reset to first page when searching
    }, [fetchProducts, pagination.pageSize, sortBy, sortOrder, filters]);

    // Handle category filter (for compatibility)
    const handleCategoryFilter = useCallback((category) => {
        setSelectedCategory(category);
        setFilters(prev => ({ ...prev, topLevelCategory: category, secondLevelCategory: '' }));
        // Reset to first page when filtering
    }, [fetchProducts, pagination.pageSize, sortBy, sortOrder, filters]);

    // Handle sort
    const handleSort = useCallback((field) => {
        let newSortBy = field;
        let newSortOrder = 'desc';

        if (sortBy === field) {
            // If sorting by same field, toggle order
            newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        }

        setSortBy(newSortBy);
        setSortOrder(newSortOrder);

        // Reset to first page when sorting
        fetchProducts(0, pagination.pageSize, newSortBy, newSortOrder);
    }, [sortBy, sortOrder, fetchProducts, pagination.pageSize]);

    // Handle page change
    const handlePageChange = useCallback((page) => {
        fetchProducts(page, pagination.pageSize);
    }, [fetchProducts, pagination.pageSize]);

    // Handle add product
    const handleAddProduct = useCallback(async (productData) => {
        try {
            setError(null);
            const response = await productService.createProduct(productData);
            if (response.status === 200 || response.status === 201) {
                // Refresh current page to show updated data
                await fetchProducts(pagination.currentPage, pagination.pageSize);
                return { success: true, data: response.data?.data || response.data };
            }
            return { success: false, error: "Cannot add product" };
        } catch (err) {
            console.error("Error adding product:", err);
            const errorMsg = err.response?.data?.message || err.message || "Unknown error";
            setError(`Không thể thêm sản phẩm: ${errorMsg}`);
            return { success: false, error: errorMsg };
        }
    }, [fetchProducts, pagination.currentPage, pagination.pageSize]);

    // Handle update product
    const handleUpdateProduct = useCallback(async (productId, productData) => {
        try {
            setError(null);
            const response = await productService.updateProduct(productId, productData);
            if (response.status === 200 || response.status === 201) {
                // Refresh current page to show updated data
                await fetchProducts(pagination.currentPage, pagination.pageSize);
                return { success: true, data: response.data?.data || response.data };
            }
            return { success: false, error: "Cannot update product" };
        } catch (err) {
            console.error("Error updating product:", err);
            const errorMsg = err.response?.data?.message || err.message || "Unknown error";
            setError(`Không thể cập nhật sản phẩm: ${errorMsg}`);
            return { success: false, error: errorMsg };
        }
    }, [fetchProducts, pagination.currentPage, pagination.pageSize]);

    // Handle delete product
    const handleDeleteProduct = useCallback(async (productId) => {
        try {
            setError(null);
            const response = await productService.deleteProduct(productId);
            if (response.status === 200) {
                // Check if current page becomes empty after deletion
                const remainingItems = products.length - 1;
                let targetPage = pagination.currentPage;

                if (remainingItems === 0 && pagination.currentPage > 0) {
                    // Go to previous page if current page becomes empty
                    targetPage = pagination.currentPage - 1;
                }

                await fetchProducts(targetPage, pagination.pageSize);
                return { success: true };
            }
            return { success: false, error: "Cannot delete product" };
        } catch (err) {
            console.error("Error deleting product:", err);
            setError("Cannot delete product. Please try again.");
            return { success: false, error: err.message || "Unknown error" };
        }
    }, [fetchProducts, products.length, pagination.currentPage, pagination.pageSize]);

    // Initial load
    useEffect(() => {
        let isMounted = true;

        const initialLoad = async () => {
            try {
                await fetchCategories();
                if (isMounted) {
                    await fetchProducts(0, pagination.pageSize);
                }
            } catch (error) {
                console.error('Initial load error:', error);
            }
        };

        initialLoad();

        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array - only run on mount


    return {
        products,
        categories,
        pagination,
        isLoading,
        error,
        searchTerm,
        selectedCategory,
        sortBy,
        sortOrder,
        filters,
        handleSearch,
        handleCategoryFilter,
        handleSort,
        handleAddProduct,
        handleUpdateProduct,
        handleDeleteProduct,
        handlePageChange,
        refreshProducts: () => fetchProducts(pagination.currentPage, pagination.pageSize),
        // New methods for direct filter management
        updateFilters: (newFilters) => {
            const updatedFilters = { ...filters, ...newFilters };
            setFilters(updatedFilters);
            fetchProducts(0, pagination.pageSize, sortBy, sortOrder, updatedFilters);
        },
        clearFilters: () => {
            const defaultFilters = {
                keyword: '',
                topLevelCategory: '',
                secondLevelCategory: '',
                color: '',
                minPrice: null,
                maxPrice: null,
                status: 'all'
            };
            setFilters(defaultFilters);
            setSearchTerm('');
            setSelectedCategory('');
            fetchProducts(0, pagination.pageSize, sortBy, sortOrder, defaultFilters);
        }
    };
};
