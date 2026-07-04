import React, { useEffect, useState } from "react";
import { useFilter } from "../../../components/features/catalog/FilterContext";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { productService } from "../../../services/product.service";

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
            const response = await productService.getSecondCategory(topCategory);
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
    
      // Giữ lại query string (color, price, sort, v.v.) từ URL hiện tại
      const queryString = params.toString();
      const targetUrl = `${targetPath}${queryString ? `?${queryString}` : ''}`;
    
      console.log(`Navigating to category: ${targetUrl}`);
      navigate(targetUrl, { replace: true });
    };



  return (
    <aside className="w-[20%] max-md:ml-0 max-md:w-full">
      <div className="max-md:mt-1.5">
        <section className="bg-violet-50 divide-y divide-gray-300">
          {/* Filter Header & Clear Button */}
          <div className="max-w-full text-center rounded-none w-[250px]">
             <div className="flex flex-col px-4 py-5">
              <h2 className="self-center text-base font-bold text-black">Filters</h2>
            </div>
          </div>

          {/* --- Category Section (Radio Buttons for Navigation) --- */}
          {topCategory && topCategory !== 'all' && (
            <section className="px-4 py-5 w-full text-black min-w-[250px]">
                <div
                    className="flex gap-5 justify-between text-sm font-semibold whitespace-nowrap cursor-pointer mb-3"
                    onClick={() => toggleSection('category')}
                >
                    {/* Đổi tên "Types" nếu muốn */}
                    <h3>{topCategory.charAt(0).toUpperCase() + topCategory.slice(1)} Types</h3>
                    <img src={expandedSections.category ? "/UpArrow.svg" : "/DownArrow.svg"} alt="Toggle" className="object-contain shrink-0 w-4 aspect-square"/>
                </div>
                {expandedSections.category && (
                    <div className="flex flex-col gap-1 mt-4 text-sm leading-7">
                        {categoryLoading && <div>Loading...</div>}
                        {categoryError && <div className="text-red-600">Error: {categoryError}</div>}
                        {/* Radio "All" (Xem tất cả trong topCategory) */}
                        {!categoryLoading && !categoryError && categoryData && (
                             <div key="all-types" className="flex items-center">
                                <input
                                    type="radio"
                                    id={`category-all-${topCategory}`}
                                    name="secondLevelCategoryFilter"
                                    value="" // Giá trị rỗng cho All
                                    checked={!secondLevelCategoryFromUrl} // Checked khi không có second level trên URL
                                    onChange={() => handleCategoryChange("")} // Điều hướng về /topCategory/1
                                    className="mr-2 cursor-pointer"
                                />
                                <label htmlFor={`category-all-${topCategory}`} className="cursor-pointer">
                                    All {topCategory.charAt(0).toUpperCase() + topCategory.slice(1)}
                                </label>
                             </div>
                        )}
                        {/* Map categories cấp 2 */}
                        {!categoryLoading && !categoryError && categoryData?.data?.length > 0 && (
                            categoryData.data.map((category) => {
                                // Sử dụng tên category trực tiếp làm slug (hoặc dùng ID nếu ổn định hơn)
                                const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
                                const isChecked = secondLevelCategoryFromUrl?.toLowerCase() === categorySlug;
                                const inputId = `category-${categorySlug}-${category.id}`; // Đảm bảo ID duy nhất

                                return (
                                    <div key={category.id || category.name} className="flex items-center">
                                        <input
                                            type="radio"
                                            id={inputId}
                                            name="secondLevelCategoryFilter" // Cùng name để nhóm radio
                                            value={categorySlug} // Value là slug
                                            checked={isChecked}
                                            onChange={() => handleCategoryChange(categorySlug)} // Điều hướng về /topCategory/slug/1
                                            className="mr-2 cursor-pointer"
                                        />
                                        <label htmlFor={inputId} className="cursor-pointer">
                                            {category.name}
                                        </label>
                                    </div>
                                );
                            })
                        )}
                        {/* Thông báo nếu không có sub-category */}
                        {!categoryLoading && !categoryError && (!categoryData || !categoryData.data || categoryData.data.length === 0) && (
                             <div className="text-gray-500 pl-6">No specific types found.</div>
                        )}
                    </div>
                )}
            </section>
          )}
          {/* ----------------------------------------------------------- */}

          <section className="px-4 py-5 w-full text-black min-w-[250px]">
            <div className="flex gap-5 justify-between text-sm font-semibold whitespace-nowrap cursor-pointer mb-3" onClick={() => toggleSection('color')}>
              <h3 className="my-auto">Color</h3>
              <img src={expandedSections.color ? "/UpArrow.svg" : "/DownArrow.svg"} alt="Toggle color" className="object-contain shrink-0 w-4 aspect-square"/>
            </div>
            {expandedSections.color && (
              <div className="text-sm leading-7 flex flex-col gap-1 mt-4">
                {/* 1. Radio Button cho "All Colors" */}
                <div key="color-all" className="flex items-center">
                    <input
                        type="radio"
                        id="color-all"
                        name="colorFilter" // Cùng name cho nhóm color
                        value="" // Giá trị rỗng hoặc null cho "All"
                        // Checked khi activeFilters.color là null
                        checked={!activeFilters.color}
                        // Gọi updateFilters với value=null và isActive=false để xóa filter
                        onChange={() => {
                            console.log("Updating color: All");
                            updateFilters('color', null, false);
                         }}
                        className="mr-2 cursor-pointer"
                    />
                    <label htmlFor="color-all" className="cursor-pointer">All Colors</label>
                </div>

                {/* 2. Map qua các màu cụ thể */}
                {colors.map((color) => (
                  <div key={color.value} className="flex items-center">
                    <input
                      type="radio" // Đổi thành radio
                      id={`color-${color.value.toLowerCase()}`} // ID duy nhất
                      name="colorFilter" // Cùng name với "All Colors"
                      value={color.value} // Value là tên màu
                      // Checked khi activeFilters.color khớp với value của radio này
                      checked={activeFilters.color === color.value}
                      // Gọi updateFilters với value=tên màu và isActive=true
                      onChange={() => {
                        console.log("Updating color:", color.value);
                        updateFilters('color', color.value, true);
                      }}
                      className="mr-2 cursor-pointer"
                    />
                    <label htmlFor={`color-${color.value.toLowerCase()}`} className="cursor-pointer">
                        {color.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </section>
          {/* ---------------------------------------------------- */}

          {/* --- Price Section --- */}
          <section className="p-4 w-full text-black min-w-[250px]">
             <div className="flex gap-5 justify-between text-sm font-semibold whitespace-nowrap cursor-pointer mb-3" onClick={() => toggleSection('price')}>
                 <h3>Price</h3>
                 <img src={expandedSections.price ? "/UpArrow.svg" : "/DownArrow.svg"} alt="Toggle price" className="object-contain shrink-0 w-4 aspect-square"/>
             </div>
             {expandedSections.price && (
                 <div className="flex flex-col gap-2 text-sm leading-7 mt-4">
                     {priceRanges.map((priceRange) => (
                         <div key={priceRange.value} className="flex items-center">
                             <input
                                 type="radio"
                                 id={`price-${priceRange.value}`}
                                 name="priceFilter" // Đổi tên radio group cho price
                                 value={priceRange.value}
                                 checked={activeFilters.price === priceRange.value}
                                 onChange={() => {
                                     console.log("Updating price:", priceRange.value);
                                     updateFilters('price', priceRange.value, true); // Cập nhật context/query
                                 }}
                                 className="mr-2 cursor-pointer"
                             />
                             <label htmlFor={`price-${priceRange.value}`} className="cursor-pointer">{priceRange.range}</label>
                         </div>
                     ))}
                     {/* Thêm nút bỏ chọn Price */}
                     {activeFilters.price && (
                        <button
                            onClick={() => updateFilters('price', activeFilters.price, false)}
                            className="text-xs text-blue-600 hover:underline mt-1 pl-6" // Style cho nút bỏ chọn
                        >
                            Clear price filter
                        </button>
                     )}
                 </div>
             )}
          </section>


          {/* --- Sort Section --- */}
          <section className="p-4 w-full text-black min-w-[250px]">
             <div className="flex gap-5 justify-between text-sm font-semibold whitespace-nowrap cursor-pointer mb-3" onClick={() => toggleSection('sort')}>
                 <h3>Sort</h3>
                 <img src={expandedSections.sort ? "/UpArrow.svg" : "/DownArrow.svg"} alt="Toggle price" className="object-contain shrink-0 w-4 aspect-square"/>
             </div>
             {expandedSections.sort && (
                 <div className="flex flex-col gap-2 text-sm leading-7 mt-4">
                     {sortOptions.map((sortOptions) => (
                         <div key={sortOptions.value} className="flex items-center">
                             <input
                                 type="radio"
                                 id={`sort-${sortOptions.value}`}
                                 name="sortFilter" // Đổi tên radio group cho price
                                 value={sortOptions.value}
                                 checked={activeFilters.sort === sortOptions.value}
                                 onChange={() => {
                                     updateFilters('sort', sortOptions.value, true); // Cập nhật context/query
                                 }}
                                 className="mr-2 cursor-pointer"
                             />
                             <label htmlFor={`sort-${sortOptions.value}`} className="cursor-pointer">{sortOptions.label}</label>
                         </div>
                     ))}
                     {/* Thêm nút bỏ chọn Price */}
                     {activeFilters.sort && (
                        <button
                            onClick={() => updateFilters('sort', activeFilters.sort, false)}
                            className="text-xs text-blue-600 hover:underline mt-1 pl-6" // Style cho nút bỏ chọn
                        >
                            Clear price filter
                        </button>
                     )}
                 </div>
             )}
          </section>

        </section>
      </div>
    </aside>
  );
};

export default FilterSidebar;