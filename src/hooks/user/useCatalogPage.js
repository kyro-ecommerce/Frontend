import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { productService } from "../../services/user/product.service";

export const extractImageUrl = (product) => {
  if (!product) return "/Placeholder2.png";
  if (typeof product.image_url === "string" && product.image_url.trim()) return product.image_url.trim();
  if (typeof product.imageUrl === "string" && product.imageUrl.trim()) return product.imageUrl.trim();
  if (typeof product.image === "string" && product.image.trim()) return product.image.trim();

  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    const first = product.imageUrls[0];
    if (typeof first === "string") return first;
    if (first && first.downloadUrl) return first.downloadUrl;
    if (first && first.url) return first.url;
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    if (typeof first === "string") return first;
    if (first && first.downloadUrl) return first.downloadUrl;
    if (first && first.url) return first.url;
  }

  return "/Placeholder2.png";
};

export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return "N/A";
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

export const useCatalogPage = (categoryProp) => {
  const { secondLevelCategory: secondLevelCategoryProp, search: keywordFromPath, page: pageFromParams } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const pageFromQuery = searchParams.get('page');
  const currentPage = parseInt(pageFromQuery || pageFromParams || "1", 10);
  const itemsPerPage = 12;

  const keyword = searchParams.get('q') || keywordFromPath || null;

  const [allFilteredProducts, setAllFilteredProducts] = useState([]);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [categoryTree, setCategoryTree] = useState(null);
  const latestRequest = useRef(0);

  useEffect(() => {
    productService.getCategories()
      .then(response => setCategoryTree(response.data || []))
      .catch(() => setCategoryTree([]));
  }, []);

  const fetchDataAndPaginate = useCallback(async () => {
    if (categoryProp !== 'all' && categoryTree === null) return;
    const requestId = ++latestRequest.current;
    setLoading(true);
    setStatusMessage("Đang tải sản phẩm...");
    setMessageType("info");

    setAllFilteredProducts([]);
    setCurrentProducts([]);

    try {
      const queryParams = new URLSearchParams(location.search);
      const colorFilter = queryParams.get('color');
      const priceFilter = queryParams.get('price');
      const sortFilter = queryParams.get('sort');
      const queryKeyword = queryParams.get('q');

      let minPrice = null;
      let maxPrice = null;
      if (priceFilter) {
        const parts = priceFilter.split('-');
        const parsedMin = parseInt(parts[0], 10);
        const parsedMax = parseInt(parts[1], 10);
        if (!isNaN(parsedMin)) minPrice = parsedMin;
        if (!isNaN(parsedMax)) maxPrice = parsedMax;
      }

      const searchKeyword = queryKeyword || keyword;
      const categoryAliases = {
        desktops: 'desktop-computers',
        others: 'other-products'
      };
      const topName = categoryAliases[categoryProp] || categoryProp;
      const topCategory = categoryTree?.find(category => category.name.toLowerCase() === String(topName).toLowerCase());
      const selectedCategory = secondLevelCategoryProp
        ? topCategory?.subCategories?.find(category =>
            category.name.toLowerCase().replace(/\s+/g, '-') === secondLevelCategoryProp.toLowerCase())
        : topCategory;
      const sortMap = {
        price_low: 'price,asc',
        price_high: 'price,desc',
        discount: 'discountPercent,desc',
        newest: 'createdAt,desc'
      };
      const filterPayload = {
        categoryId: categoryProp === 'all' ? undefined : (selectedCategory?.categoryId ?? -1),
        color: colorFilter || undefined,
        minPrice: minPrice,
        maxPrice: maxPrice,
        sort: sortMap[sortFilter] || undefined,
        keyword: searchKeyword || undefined,
        page: currentPage - 1,
        size: itemsPerPage
      };

      const response = await productService.getProductByFilter(filterPayload);
      if (requestId !== latestRequest.current) return;
      const pageData = response.data || {};
      const fetchedData = pageData.content || [];

      setAllFilteredProducts(fetchedData);
      setTotalItems(pageData.totalElements || 0);
      setTotalPages(pageData.totalPages || 0);
      setCurrentProducts(fetchedData);

      setStatusMessage("");
      setMessageType("");

    } catch (error) {
      if (requestId !== latestRequest.current) return;
      console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
      setStatusMessage(error.response?.data?.message || "Tải sản phẩm thất bại. Vui lòng thử lại.");
      setMessageType("error");
      setAllFilteredProducts([]);
      setCurrentProducts([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [categoryProp, secondLevelCategoryProp, currentPage, location.search, itemsPerPage, keyword, categoryTree]);

  useEffect(() => {
    fetchDataAndPaginate();
  }, [fetchDataAndPaginate]);

  const handlePageChange = useCallback((newPage, replace = false) => {
    if (newPage < 1 || (totalPages > 0 && newPage > totalPages) || newPage === currentPage) {
      return;
    }
    const params = new URLSearchParams(location.search);
    params.set('page', newPage.toString());
    const queryString = params.toString();
    const targetUrl = `${location.pathname}${queryString ? `?${queryString}` : ''}`;
    navigate(targetUrl, { replace: replace, state: location.state });
  }, [currentPage, totalPages, location.search, location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!loading) {
      if (totalPages > 0 && currentPage > totalPages) {
        handlePageChange(totalPages, true);
      }
      else if (currentPage < 1 && totalPages >= 0) {
        handlePageChange(1, true);
      }
    }
    window.scrollTo(0, 0);
  }, [currentPage, totalPages, loading, handlePageChange]);

  const categoryTitleMap = {
    "laptop": "Laptop", "desktops": "Máy tính bàn", "phone": "Điện thoại",
    "components": "Linh kiện", "accessories": "Phụ kiện", "others": "Khác",
    "deals": "Khuyến mãi", "all": "Tất cả sản phẩm"
  };
  const secondLevelCategoryTitleMap = {
    "acer": "Acer", "dell": "Dell", "apple": "Apple", "asus": "Asus", "hp": "HP",
  };

  const pageTitle = searchParams.get('q')
    ? `Kết quả tìm kiếm: "${searchParams.get('q')}"`
    : keyword
      ? `Kết quả tìm kiếm: "${keyword}"`
      : secondLevelCategoryProp
        ? `${categoryTitleMap[categoryProp] || categoryProp} - ${secondLevelCategoryTitleMap[secondLevelCategoryProp] || secondLevelCategoryProp}`
        : (categoryTitleMap[categoryProp] || "Tất cả sản phẩm");

  return {
    currentPage,
    itemsPerPage,
    allFilteredProducts,
    currentProducts,
    totalPages,
    totalItems,
    loading,
    setLoading,
    statusMessage,
    messageType,
    categoryTree,
    pageTitle,
    handlePageChange
  };
};
