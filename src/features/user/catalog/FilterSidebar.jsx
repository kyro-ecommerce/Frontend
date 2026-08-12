import React, { useEffect, useState } from "react";
import { useFilter } from "./FilterContext";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { productService } from "../../../services/user/product.service";
import Filter from "./Filter";

// Price filter data (Giữ nguyên)
const priceRanges = [
  // ... (dữ liệu giá)
    { range: "50.000 To 200.000", value: "50000-199999" },
    { range: "100.000 To 500.000", value: "200000-499999" },
    { range: "500.000 To 2.000.000", value: "500000-1999999" },
    { range: "2.000.000 To 10.000.000", value: "2000000-9999999" },
    { range: "10.000.000 To 50.000.000", value: "10000000-49999999" },
    { range: "50.000.000 To 100.000.000", value: "50000000-99999999" }
];

// Color filter data (Giữ nguyên)
const colors = [
  { name: "Trắng", value: "Trắng" }, // Giả sử value là tên màu luôn
  { name: "Đen", value: "Đen" },
  { name: "Xanh", value: "Xanh" }, // Thêm các màu khác nếu cần
  // ...
];

const sortOptions = [
  { label: "Mặc định", value: "" },
  { label: "Giá thấp đến cao", value: "price_low" },
  { label: "Giá cao đến thấp", value: "price_high" },
  { label: "Giảm giá nhiều", value: "discount" },
  { label: "Mới nhất", value: "newest" }
];

// Nhận topCategory từ props của Catalog component
const FilterSidebar = ({ topCategory }) => {
  const { activeFilters, updateFilters, clearAllFilters } = useFilter();
  const location = useLocation(); // Để lấy query string hiện tại
  const { secondLevelCategory: secondLevelCategoryFromUrl } = useParams(); 
  const navigate = useNavigate(); // 

  // --- State cho categories ---
  // Lưu trữ object response từ API { data: [...], message: ... } hoặc null
  const [categoryData, setCategoryData] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false); // Chỉ loading khi fetch categories
  const [categoryError, setCategoryError] = useState(null);
  // ---------------------------

  // --- State cho sections (Giữ nguyên) ---
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    color: true,
    sort: true
  });

  // --- Fetch second-level categories khi topCategory thay đổi ---
  useEffect(() => {
    // Hàm async để fetch data
    const fetchSecondCategories = async () => {
        // Chỉ fetch khi topCategory có giá trị và không phải 'all'
        if (!topCategory || topCategory === 'all') {
            setCategoryData(null); // Xóa data cũ nếu không fetch
            setCategoryLoading(false);
            setCategoryError(null);
            return; // Không làm gì nếu là trang 'all' hoặc không có topCategory
        }

        setCategoryLoading(true); // Bắt đầu loading
        setCategoryError(null); // Reset lỗi
        setCategoryData(null); // Reset data cũ

        try {
            // *** Gọi API service đã tạo ***
            const categoryAliases = { desktops: 'desktop-computers', others: 'other-products' };
            const response = await productService.getSecondCategory(categoryAliases[topCategory] || topCategory);
            console.log("Fetched second categories:", response.data); // Log dữ liệu từ API
            setCategoryData(response.data); // Lưu toàn bộ object { data: [...], message: ...} vào state
        } catch (err) {
            console.error("Error fetching second categories:", err);
            setCategoryError(err.response?.data?.message || err.message || "Failed to load categories");
            setCategoryData(null); // Đảm bảo data là null khi lỗi
        } finally {
            setCategoryLoading(false); // Kết thúc loading
        }
    };

    fetchSecondCategories(); // Gọi hàm fetch

    // Dependency array: Chạy lại effect này khi `topCategory` thay đổi
  }, [topCategory]);

  // --- Các hàm xử lý khác (Giữ nguyên) ---
  const toggleSection = (section) => { /* ... */
    setExpandedSections({
        ...expandedSections,
        [section]: !expandedSections[section]
      });
  };
  const handleClearAll = () => { /* ... */
    clearAllFilters();
  };
  // ----------------------------------------

    // Hàm xử lý chọn Radio Button Category (Điều hướng)



    // *** Sửa đổi handleCategoryChange ***
    const handleCategoryChange = (slug) => {
      // Lấy query parameters hiện tại (color, price, sort, v.v.)
      const params = new URLSearchParams(location.search);
      
      // Xây dựng URL mới dựa vào slug
      let targetPath;
    
      if (slug) {
        // Nếu có slug (chọn subcategory cụ thể), URL sẽ là: /topCategory/slug
        targetPath = `/${topCategory}/${slug}`;
      } else {
        // Nếu slug rỗng (chọn "All"), URL sẽ chỉ là: /topCategory
        targetPath = `/${topCategory}`;
      }
    
      const queryString = params.toString();
      const targetUrl = `${targetPath}${queryString ? `?${queryString}` : ''}`;
    
      console.log(`Navigating to category: ${targetUrl}`);
      navigate(targetUrl, { replace: true });
    };

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col divide-y divide-gray-100">
        {/* Filter Header */}
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span>Bộ lọc sản phẩm</span>
          </h2>
        </div>

        {/* Mục đang chọn (Filter Tags) */}
        <Filter />

        {/* --- Category Section --- */}
        {topCategory && topCategory !== 'all' && (
          <section className="py-4">
            <div
              className="flex justify-between items-center text-sm font-bold text-gray-800 cursor-pointer mb-2 group"
              onClick={() => toggleSection('category')}
            >
              <span>{topCategory.charAt(0).toUpperCase() + topCategory.slice(1)} Types</span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections.category ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {expandedSections.category && (
              <div className="flex flex-col gap-1 mt-3 text-sm text-gray-700">
                {categoryLoading && <div className="text-gray-400 text-xs py-1">Đang tải...</div>}
                {categoryError && <div className="text-red-500 text-xs py-1">Lỗi: {categoryError}</div>}
                {!categoryLoading && !categoryError && categoryData && (
                  <label key="all-types" className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="secondLevelCategoryFilter"
                      value=""
                      checked={!secondLevelCategoryFromUrl}
                      onChange={() => handleCategoryChange("")}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">Tất cả {topCategory}</span>
                  </label>
                )}
                {!categoryLoading && !categoryError && categoryData?.length > 0 && (
                  categoryData.map((category) => {
                    const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
                    const isChecked = secondLevelCategoryFromUrl?.toLowerCase() === categorySlug;
                    const inputId = `category-${categorySlug}-${category.id}`;

                    return (
                      <label key={category.id || category.name} htmlFor={inputId} className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          id={inputId}
                          name="secondLevelCategoryFilter"
                          value={categorySlug}
                          checked={isChecked}
                          onChange={() => handleCategoryChange(categorySlug)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className={`text-sm ${isChecked ? 'font-bold text-blue-600' : 'font-medium text-gray-700'}`}>{category.name}</span>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </section>
        )}

        {/* --- Color Section --- */}
        <section className="py-4">
          <div
            className="flex justify-between items-center text-sm font-bold text-gray-800 cursor-pointer mb-2 group"
            onClick={() => toggleSection('color')}
          >
            <span>Màu sắc (Color)</span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections.color ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {expandedSections.color && (
            <div className="flex flex-col gap-1 mt-3 text-sm text-gray-700">
              <label htmlFor="color-all" className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  id="color-all"
                  name="colorFilter"
                  value=""
                  checked={!activeFilters.color}
                  onChange={() => updateFilters('color', null, false)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className={`text-sm ${!activeFilters.color ? 'font-bold text-blue-600' : 'font-medium text-gray-700'}`}>Tất cả màu sắc</span>
              </label>
              {colors.map((color) => (
                <label key={color.value} htmlFor={`color-${color.value.toLowerCase()}`} className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    id={`color-${color.value.toLowerCase()}`}
                    name="colorFilter"
                    value={color.value}
                    checked={activeFilters.color === color.value}
                    onChange={() => updateFilters('color', color.value, true)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`text-sm ${activeFilters.color === color.value ? 'font-bold text-blue-600' : 'font-medium text-gray-700'}`}>{color.name}</span>
                </label>
              ))}
            </div>
          )}
        </section>

        {/* --- Price Section --- */}
        <section className="py-4">
          <div
            className="flex justify-between items-center text-sm font-bold text-gray-800 cursor-pointer mb-2 group"
            onClick={() => toggleSection('price')}
          >
            <span>Mức giá (Price)</span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedSections.price ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {expandedSections.price && (
            <div className="flex flex-col gap-1 mt-3 text-sm text-gray-700">
              {priceRanges.map((priceRange) => (
                <label key={priceRange.value} htmlFor={`price-${priceRange.value}`} className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    id={`price-${priceRange.value}`}
                    name="priceFilter"
                    value={priceRange.value}
                    checked={activeFilters.price === priceRange.value}
                    onChange={() => updateFilters('price', priceRange.value, true)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`text-sm ${activeFilters.price === priceRange.value ? 'font-bold text-blue-600' : 'font-medium text-gray-700'}`}>{priceRange.range}</span>
                </label>
              ))}
              {/* {activeFilters.price && (
                <button
                  onClick={() => updateFilters('price', activeFilters.price, false)}
                  className="text-xs text-blue-600 font-medium hover:underline mt-1 self-start pl-2 cursor-pointer"
                >
                  Xóa lọc giá
                </button>
              )} */}
            </div>
          )}
        </section>
      </div>
    </aside>
  );
};

export default FilterSidebar;
