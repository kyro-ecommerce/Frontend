import React from "react";
import { useFilter } from "./FilterContext";
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
    <div className="py-3 flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700 font-bold   tracking-wider">Đang chọn:</span>
        <button
          className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
          onClick={clearAllFilters}
        >
          Xóa tất cả
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {filterItems.map((item, index) => (
          <div
            key={`${item.type}-${item.value}-${index}`}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-lg text-xs font-semibold"
          >
            <span>{item.displayValue}</span>
            <button
              onClick={() => handleRemoveFilter(item.type, item.value)}
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-blue-200/70 text-blue-600 transition-colors cursor-pointer text-xs leading-none"
              aria-label="Bỏ lọc"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filter;