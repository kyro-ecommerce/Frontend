// src/hooks/useProducts.jsx - Updated with proper filter integration
import { useState, useEffect, useCallback, useRef } from "react";
import { categoryService, productService } from "../../services/admin/index.js";
import { getErrorMessage } from "../../utils/errorUtils.js";

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState({
        topLevel: [],
        secondLevel: {},
        ids: {}
    });
    const latestRequest = useRef(0);


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
        categoryId: null,
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
            const tree = await categoryService.getAllCategories();
            const catData = {
                topLevel: tree.map(category => category.name),
                secondLevel: Object.fromEntries(
                    tree.map(category => [category.name, (category.subCategories || []).map(sub => sub.name)])
                ),
                ids: Object.fromEntries(tree.flatMap(category => [
                    [category.name, category.categoryId],
                    ...(category.subCategories || []).map(sub => [sub.name, sub.categoryId])
                ])),
                rawCategories: tree || []
            };
            setCategories(catData);
            return catData;
        } catch (err) {
            console.error('Error fetching categories:', err);
            return { topLevel: [], secondLevel: {}, ids: {} };
        }
    }, []);

    const fetchProducts = useCallback(async (page = 0, size = 10, currentSortBy = sortBy, currentSortOrder = sortOrder, currentFilters = null) => {
        const requestId = ++latestRequest.current;
        setIsLoading(true);

        try {
            const filtersToUse = currentFilters || filters;
            const parsePrice = (val) => {
                if (val === null || val === undefined || val === '') return null;
                const num = Number(val);
                return isNaN(num) ? null : num;
            };

            const response = await productService.getAllProducts({
                page,
                size,
                sortBy: currentSortBy,
                sortDir: currentSortOrder,
                keyword: filtersToUse.keyword,
                categoryId: filtersToUse.categoryId,
                color: filtersToUse.color,
                minPrice: parsePrice(filtersToUse.minPrice),
                maxPrice: parsePrice(filtersToUse.maxPrice),
                inStock: filtersToUse.status === 'all' ? null : filtersToUse.status === 'inStock'
            });

            const pageData = response.data?.data || response.data || {};
            if (requestId !== latestRequest.current) return;
            const productList = pageData.content || pageData.products || (Array.isArray(pageData) ? pageData : []);
            setProducts(productList);

            const currentPage = pageData.page ?? 0;
            const totalPages = pageData.totalPages ?? 0;
            const totalElements = pageData.totalElements ?? 0;
            const pageSize = pageData.size ?? size;
            const isFirst = pageData.first ?? true;
            const isLast = pageData.last ?? true;

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
            if (requestId !== latestRequest.current) return;
            setError(getErrorMessage(err, 'Không thể lấy danh sách sản phẩm'));
            throw err;
        } finally {
            if (requestId === latestRequest.current) setIsLoading(false);
        }
    }, [filters, sortBy, sortOrder]);

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
            categoryId: null,
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
        updateFilters({ keyword: term });
    }, [updateFilters]);

    // Handle category filter (for compatibility)
    const handleCategoryFilter = useCallback((categoryName) => {
        setSelectedCategory(categoryName);

        if (!categoryName) {
            updateFilters({ categoryId: null, topLevelCategory: '', secondLevelCategory: '' });
            return;
        }

        const categoryId = categories.ids[categoryName];
        if (categoryId) {
            updateFilters({ categoryId });
        } else {
            console.warn(`Category ID not found for: ${categoryName}`);
        }
    }, [categories.ids, updateFilters]);

    // Handle sort
    const handleSort = useCallback((field, order) => {
        setSortBy(field);
        setSortOrder(order);
        fetchProducts(pagination.currentPage, pagination.pageSize, field, order);
    }, [fetchProducts, pagination.currentPage, pagination.pageSize]);

    // Handle page change
    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchProducts(newPage, pagination.pageSize);
        }
    }, [fetchProducts, pagination.totalPages, pagination.pageSize]);

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
            const errorMsg = getErrorMessage(err, "Không thể thêm sản phẩm.");
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
            const errorMsg = getErrorMessage(err, "Không thể cập nhật sản phẩm.");
            setError(`Không thể cập nhật sản phẩm: ${errorMsg}`);
            await fetchProducts(pagination.currentPage, pagination.pageSize).catch(() => {});
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
            const errorMsg = getErrorMessage(err, "Không thể xóa sản phẩm. Vui lòng thử lại.");
            setError(errorMsg);
            return { success: false, error: errorMsg };
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
                categoryId: null,
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
