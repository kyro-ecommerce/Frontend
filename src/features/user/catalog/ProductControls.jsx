import React, { useEffect, useState } from "react";
import { useFilter } from "./FilterContext";


const BackButton = () => {
  return (
    <button
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold shadow-xs hover:bg-gray-50 hover:border-gray-300 hover:text-blue-600 hover:-translate-x-0.5 transition-all duration-200 cursor-pointer"
      onClick={() => window.history.back()}
      aria-label="Go back"
    >
      <span className="text-base leading-none">‹</span> Quay lại
    </button>
  );
};

const ItemsCounter = ({ itemsShown, totalItems }) => {
  return (
    <div className="px-4 py-2.5 rounded-xl bg-gray-100/80 border border-gray-200/60 text-gray-600 text-sm font-medium flex items-center gap-1.5">
      <span>Hiển thị</span>
      <span className="font-bold text-gray-900">{itemsShown}</span>
      <span>/</span>
      <span className="font-bold text-gray-900">{totalItems}</span>
      <span>sản phẩm</span>
    </div>
  );
};

const SortControl = ({ onSortChange }) => {
  const { activeFilters, updateFilters } = useFilter();
  
  const sortOptions = [
    { label: "Sắp xếp theo", value: "" },
    { label: "Giá thấp đến cao", value: "price_low" },
    { label: "Giá cao đến thấp", value: "price_high" },
    { label: "Giảm giá nhiều", value: "discount" },
    { label: "Mới nhất", value: "newest" }
  ];

  const handleSortChange = (event) => {
    const value = event.target.value;
    updateFilters('sort', value, value !== "");
    if (onSortChange) onSortChange();
  };

  return (
    <div className="relative flex items-center">
      <select 
        className="px-4 py-2.5 pr-9 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm font-semibold shadow-xs hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none transition-all duration-200"
        value={activeFilters.sort || ""}
        onChange={handleSortChange}
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 flex items-center text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

const ProductControls = ({ shown, total, onSortChange }) => {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 mb-6 w-full max-md:max-w-full">
      <BackButton />
      <div className="flex items-center gap-3 ml-auto text-sm">
        <ItemsCounter itemsShown={shown || 0} totalItems={total || 0} />
        <SortControl onSortChange={onSortChange} />
      </div>
    </nav>
  );
};

export default ProductControls;