import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import BreadcrumbNav from "../../components/layout/BreadcrumbNav";
import ProductControls from "../../components/features/catalog/ProductControls";
import FilterSidebar from "../../components/features/catalog/FilterSidebar";
import Filter from "../../components/features/catalog/Filter";
import ProductCard from "../../components/features/product/ProductCard";
import ProductSkeleton from "../../components/features/product/ProductSkeleton";
import Pagination from "../../components/common/Pagination";
import { productService } from "../../services/product.service";

// --- Hàm định dạng giá ---
const formatPrice = (price) => {
  if (typeof price !== 'number') return "N/A";
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

  // --- Fetch và Xử lý Dữ liệu ---
  const fetchDataAndPaginate = useCallback(async () => {
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
      const filterPayload = {
        // Luôn lấy topLevelCategory từ path - đây là category chính
        topLevelCategory: (location.pathname.includes('/laptop')) ? "laptop" : 
                          (categoryProp && categoryProp !== 'all') ? categoryProp : undefined,
        
        // Chỉ thêm secondLevelCategory khi nó có giá trị
        secondLevelCategory: secondLevelCategoryProp || undefined,
        
        // Giữ nguyên các tham số lọc trong mọi trường hợp
        color: colorFilter || undefined,
        minPrice: minPrice,
        maxPrice: maxPrice,
        sort: sortFilter || undefined,
        
        // Ưu tiên keyword từ query parameter, sau đó từ path
        keyword: queryKeyword || keyword || undefined
      };
  
      console.log("Filter payload:", filterPayload);
  
      // 3. Gọi API lọc sản phẩm
      const response = await productService.getProductByFilter(filterPayload);
      console.log("API response:", response);
  
      const fetchedData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
  
      // 4. Lưu trữ và Phân trang Client-side
      setAllFilteredProducts(fetchedData);
      const totalFetchedItems = fetchedData.length;
      setTotalItems(totalFetchedItems);
  
      const calculatedTotalPages = Math.ceil(totalFetchedItems / itemsPerPage);
      setTotalPages(calculatedTotalPages);
  
      // Tính toán slice cho trang hiện tại
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setCurrentProducts(fetchedData.slice(startIndex, endIndex));
  
      setStatusMessage("");
      setMessageType("");
  
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
      setStatusMessage(error.response?.data?.message || "Tải sản phẩm thất bại. Vui lòng thử lại.");
      setMessageType("error");
      setAllFilteredProducts([]);
      setCurrentProducts([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      // Thêm timeout nhỏ để hiện skeleton rõ hơn (có thể bỏ trong production)
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [categoryProp, secondLevelCategoryProp, currentPage, location.search, itemsPerPage, keyword, location.pathname]);

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
              {/* Filter Active Tags - Truyền callback để bắt sự kiện khi xóa filter */}
              <Filter onFilterRemove={() => setLoading(true)} />
              
              {/* Product Controls (Sort, View) */}
              <ProductControls 
                shown={loading ? 0 : currentProducts.length} 
                total={loading ? 0 : totalItems} 
                onSortChange={() => setLoading(true)} 
              />
              
              {/* Product Grid */}
              {!loading && !allFilteredProducts.length && messageType !== 'error' && (
          <div className="text-center p-10 text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</div>
        )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-4">
                {/* Hiển thị skeleton khi đang loading */}
                {loading ? (
                  skeletonItems
                ) : (
                  // Hiển thị sản phẩm thực khi đã load xong
                  currentProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      productId={product.id}
                      image={product.imageUrls?.[0]?.downloadUrl || "/Placeholder2.png"}
                      stockStatus={product.quantity > 0 ? "in stock" : "out of stock"}
                      title={product.title}
                      price={formatPrice(product.discountedPrice)}
                      originalPrice={formatPrice(product.price)}
                      reviewCount={product.numRatings || 0}
                      discountPercent={product.discountPercent || 0}
                      onClick={() => navigate(`/product/${product.id}`)}
                    />
                  ))
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