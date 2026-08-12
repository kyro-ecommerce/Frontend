import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import BreadcrumbNav from "../../../layouts/user/BreadcrumbNav";
import ProductControls from "../../../features/user/catalog/ProductControls";
import FilterSidebar from "../../../features/user/catalog/FilterSidebar";
import Filter from "../../../features/user/catalog/Filter";
import ProductCard from "../../../features/user/product/ProductCard";
import ProductSkeleton from "../../../features/user/product/ProductSkeleton";
import Pagination from "../../../components/user/common/Pagination";
import { productService } from "../../../services/user/product.service";
import ZeroResultsRecommendations from "../../../features/user/catalog/ZeroResultsRecommendations";

const extractImageUrl = (product) => {
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

// --- Hàm định dạng giá ---
const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return "N/A";
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// --- Component Catalog ---
const Catalog = ({ category: categoryProp }) => {
  // Lấy các tham số từ URL path và query
  const { secondLevelCategory: secondLevelCategoryProp, search: keywordFromPath } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  // Lấy trang từ query parameter nếu có, nếu không thì từ path params
  const pageFromQuery = searchParams.get('page');
  const pageFromParams = useParams().page;
  const currentPage = parseInt(pageFromQuery || pageFromParams || "1", 10);

  const itemsPerPage = 12;

  // Cập nhật: Lấy keyword từ query parameter q nếu có, hoặc từ path parameter
  const keyword = searchParams.get('q') || keywordFromPath || null;

  // --- State ---
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

  // --- Fetch và Xử lý Dữ liệu ---
  const fetchDataAndPaginate = useCallback(async () => {
    if (categoryProp !== 'all' && categoryTree === null) return;
    const requestId = ++latestRequest.current;
    setLoading(true);
    setStatusMessage("Đang tải sản phẩm...");
    setMessageType("info");
  
    // Reset state trước mỗi lần fetch
    setAllFilteredProducts([]);
    setCurrentProducts([]);
  
    try {
      // 1. Phân tích Query String từ URL
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
  
      // 2. Tạo payload cho API
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
  
      console.log("Filter payload:", filterPayload);
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

  // --- Mapping tên danh mục ---
  const categoryTitleMap = {
    "laptop": "Laptop", "desktops": "Máy tính bàn", "phone": "Điện thoại",
    "components": "Linh kiện", "accessories": "Phụ kiện", "others": "Khác",
    "deals": "Khuyến mãi", "all": "Tất cả sản phẩm"
  };
  const secondLevelCategoryTitleMap = {
    "acer": "Acer", "dell": "Dell", "apple": "Apple", "asus": "Asus", "hp": "HP",
  };

  // --- Effect: Xử lý trang không hợp lệ ---
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
  }, [currentPage, totalPages, loading]);

  // --- Loại bỏ effect cập nhật totalItem/totalPage trên URL vì không cần thiết ---
  // Không cần phải đặt những thông tin này vào URL

  // --- Hàm xử lý chuyển trang ---
  const handlePageChange = (newPage, replace = false) => {
    if (newPage < 1 || (totalPages > 0 && newPage > totalPages) || newPage === currentPage) {
      return;
    }
  
    // Lấy query parameters hiện tại (color, price, sort, v.v.)
    const params = new URLSearchParams(location.search);
    
    // Cập nhật page
    params.set('page', newPage.toString());
  
    // Giữ nguyên URL path hiện tại và chỉ cập nhật query params
    const queryString = params.toString();
    const targetUrl = `${location.pathname}${queryString ? `?${queryString}` : ''}`;
    
    navigate(targetUrl, { replace: replace, state: location.state });
  };

  // --- Xác định tiêu đề trang ---
  const pageTitle = searchParams.get('q') 
    ? `Kết quả tìm kiếm: "${searchParams.get('q')}"`
    : keyword 
      ? `Kết quả tìm kiếm: "${keyword}"`
      : secondLevelCategoryProp
        ? `${categoryTitleMap[categoryProp] || categoryProp} - ${secondLevelCategoryTitleMap[secondLevelCategoryProp] || secondLevelCategoryProp}`
        : (categoryTitleMap[categoryProp] || "Tất cả sản phẩm");

  // Tạo mảng skeletons cho hiệu ứng loading
  const skeletonItems = Array(itemsPerPage).fill(0).map((_, index) => (
    <ProductSkeleton key={`skeleton-${index}`} />
  ));

  // --- Render component ---
  return (
    <div className="flex overflow-hidden flex-col pt-3 bg-gray-50 min-h-screen">
      <div className="flex flex-col self-center mt-4 w-full max-w-screen-xl px-4">
        <h1 className="self-start mt-4 mb-4 text-2xl md:text-3xl font-semibold text-gray-800">
          {pageTitle} ({loading ? "..." : totalItems})
        </h1>

        {/* Loading/Error/No Results Messages */}
        {!loading && messageType === 'error' && (
          <div className="text-center p-4 text-red-600 bg-red-100 rounded border border-red-300">{statusMessage}</div>
        )}


        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 mt-4">
          {/* Sidebar - Truyền callback để bắt sự kiện khi filter thay đổi */}
          <FilterSidebar topCategory={categoryProp} onFilterChange={() => setLoading(true)} />

          {/* Main Content Area */}
          <section className="w-full">
            <div className="flex flex-col w-full">
              {/* Product Controls (Sort, View) */}
              <ProductControls 
                shown={loading ? 0 : currentProducts.length} 
                total={loading ? 0 : totalItems} 
                onSortChange={() => setLoading(true)} 
              />
              
              {/* Product Grid */}
              {!loading && !allFilteredProducts.length && messageType !== 'error' && (
                <ZeroResultsRecommendations />
              )}


              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-4">
                {/* Hiển thị skeleton khi đang loading */}
                {loading ? (
                  skeletonItems
                ) : (
                  // Hiển thị sản phẩm thực khi đã load xong
                  currentProducts.map((product, index) => {
                    const pid = product.id || product.product_id;
                    const price = Number(product.discountedPrice || product.discounted_price || product.price || product.original_price || 0);
                    const origPrice = Number(product.originalPrice || product.original_price || product.price || 0);
                    const imageUrl = extractImageUrl(product);
                    const rating = Number(product.averageRating || product.average_rating || 5);
                    const numRatings = Number(product.numRatings || product.num_ratings || 0);
                    const discount = Number(product.discountPercent || product.discount_percent || 0);

                    return (
                      <ProductCard
                        key={pid || index}
                        productId={pid}
                        image={imageUrl}
                        stockStatus={product.quantity > 0 || product.is_active !== false ? "in stock" : "out of stock"}
                        title={product.title}
                        price={formatPrice(price)}
                        originalPrice={origPrice > price ? formatPrice(origPrice) : null}
                        reviewCount={numRatings}
                        ratingImage={rating}
                        discountPercent={discount}
                      />
                    );
                  })

                )}
              </div>
              
              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(newPage) => handlePageChange(newPage, false)}
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
