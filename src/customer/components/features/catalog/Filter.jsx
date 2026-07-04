import React from "react";
import { useFilter } from "../../../components/features/catalog/FilterContext";
// Bỏ useNavigate nếu không dùng
// import { useLocation, useNavigate } from "react-router-dom";

const Filter = () => {
  const { activeFilters, removeFilter, clearAllFilters } = useFilter();

  // Create array of active filters to display
  const getActiveFilterItems = () => {
    const items = [];

    // ----- Sửa cách thêm color filter -----
    if (activeFilters.color) { // Chỉ thêm nếu color có giá trị
      items.push({
        type: 'color',
        value: activeFilters.color, // Giá trị là string
        // Hiển thị tên màu (Viết hoa chữ cái đầu)
        displayValue: activeFilters.color.charAt(0).toUpperCase() + activeFilters.color.slice(1)
      });
    }
    // ------------------------------------

    // Add price filter (Giữ nguyên)
    if (activeFilters.price) {
      const [min, max] = activeFilters.price.split('-');
      const formattedMin = parseInt(min).toLocaleString('vi-VN');
      const formattedMax = parseInt(max).toLocaleString('vi-VN');
      items.push({
        type: 'price',
        value: activeFilters.price,
        displayValue: `${formattedMin}đ - ${formattedMax}đ`
      });
    }

    // Bỏ discount filter nếu không dùng

    return items;
  };

  const filterItems = getActiveFilterItems();

  if (filterItems.length === 0) {
    return null;
  }

  // Handle filter removal
  const handleRemoveFilter = (filterType, filterValue) => {
    // Khi xóa color hoặc price, gọi removeFilter (nó sẽ gọi updateFilters với isActive=false)
    removeFilter(filterType, filterValue);
  };

  return (
    <div className="flex flex-row mt-5 gap-2 justify-start items-center max-w-full text-sm font-semibold leading-loose text-black w-full flex-wrap"> {/* Đổi thành justify-start */}
      {filterItems.map((item, index) => (
        <div
          key={`${item.type}-${item.value}-${index}`}
          className="flex flex-row gap-2.5 justify-center items-center px-4 py-2 bg-gray-100 rounded-full border border-solid border-gray-300 max-md:pr-5" // Thay đổi style
        >
          <span>
            {item.displayValue}{" "}
          </span>
          <img
            src="/Close.png" // Đảm bảo có icon này
            alt="Remove filter"
            className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" // Thay đổi style icon
            onClick={() => handleRemoveFilter(item.type, item.value)}
          />
        </div>
      ))}
      {filterItems.length > 0 && (
        <button
          className="ml-2 px-3 py-2 text-xs text-red-600 hover:underline" // Style khác cho Clear All
          onClick={clearAllFilters}
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default Filter;