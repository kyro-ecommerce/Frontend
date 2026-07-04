import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ----- State: color bây giờ là string hoặc null -----
  const [activeFilters, setActiveFilters] = useState({
    color: null, // Thay đổi: null nghĩa là không có màu nào được chọn (All)
    price: null,
    sort: '',
  });
  // ----------------------------------------------------

  // Đọc query string -> Cập nhật state
  useEffect(() => {
    console.log("[FilterContext Effect] location.search changed:", location.search);
    const params = new URLSearchParams(location.search);
    // Đọc trực tiếp giá trị color (string) hoặc null
    const colorParam = params.get('color');
    const priceParam = params.get('price');
    const sortParam = params.get('sort');

    const initialFilters = {
      color: colorParam || null, // Lấy giá trị hoặc null
      price: priceParam || null,
      sort: sortParam || '',
    };

    // Cập nhật state NẾU khác biệt thực sự
    if (activeFilters.price !== initialFilters.price ||
        activeFilters.color !== initialFilters.color ||
        activeFilters.sort !== initialFilters.sort) // So sánh trực tiếp string/null
    {
      console.log("[FilterContext Effect] State differs from URL, updating state:", initialFilters);
      setActiveFilters(initialFilters);
    } else {
      console.log("[FilterContext Effect] State matches URL params, no state update.");
    }
  }, [location.search]);

  // Cập nhật state và URL query string KHI người dùng tương tác UI
  // Cập nhật state và URL query string KHI người dùng tương tác UI
const updateFilters = (filterType, value, isActive) => {
  if (filterType !== 'price' && filterType !== 'color' && filterType !== 'sort') 
    return;


  // --- Cập nhật URL Query String TRƯỚC ---
  const params = new URLSearchParams(location.search);
  let shouldNavigate = false;

  if (filterType === 'sort') {
    const currentSort = params.get('sort');
    const newSort = isActive ? value : null;
    if (currentSort !== newSort) {
      if (newSort) {
        params.set('sort', newSort);
      } else {
        params.delete('sort');
      }
      shouldNavigate = true;
    }
  } else if (filterType === 'color') {
    const currentColor = params.get('color');
    // Value từ radio "All" sẽ là null hoặc "", value từ màu cụ thể là tên màu
    const newColor = isActive ? value : null;
    if (currentColor !== newColor) {
      if (newColor) {
        params.set('color', newColor);
      } else {
        params.delete('color'); // Xóa param nếu chọn "All" hoặc bỏ chọn
      }
      shouldNavigate = true;
    }
  } else if (filterType === 'price') {
    const currentPrice = params.get('price');
    const newPrice = isActive ? value : null; // Price cũng là radio
    if (currentPrice !== newPrice) {
      if (newPrice) {
        params.set('price', newPrice);
      } else {
        params.delete('price');
      }
      shouldNavigate = true;
    }
  }

  // Chỉ navigate nếu URL query thực sự thay đổi
  if (shouldNavigate) {
    const currentPathname = location.pathname;
    const queryString = params.toString();
    const newUrl = `${currentPathname}${queryString ? `?${queryString}` : ''}`;

    console.log("[FilterContext Update] Navigating to:", newUrl);
    navigate(newUrl, { replace: true });
  } else {
    console.log("[FilterContext Update] No change in URL needed.");
  }
  // State sẽ được cập nhật bởi useEffect sau khi URL thay đổi
};

  // Xóa một bộ lọc cụ thể
  const removeFilter = (filterType, value) => {
     if (filterType !== 'price' && filterType !== 'color' && filterType !== 'sort') return;
     // Gọi updateFilters với isActive = false để xóa filter khỏi URL/state
     updateFilters(filterType, value, false);
  };

  
  // Xóa tất cả bộ lọc price và color
// Xóa tất cả bộ lọc price và color
const clearAllFilters = () => {
  const params = new URLSearchParams(location.search);
  let didChange = false;
  
  if (params.has('color')) { 
    params.delete('color'); 
    didChange = true; 
  }
  
  if (params.has('price')) { 
    params.delete('price'); 
    didChange = true; 
  }

  if (params.has('sort')) {
    params.delete('sort');
    didChange = true;
  }

  if (didChange) {
    const currentPathname = location.pathname;
    const queryString = params.toString();
    const newUrl = `${currentPathname}${queryString ? `?${queryString}` : ''}`;
    
    console.log("[FilterContext Clear] Clearing filters, navigating to:", newUrl);
    navigate(newUrl, { replace: true });
  } else {
    console.log("[FilterContext Clear] No filters to clear.");
  }
  // State sẽ tự động cập nhật bởi useEffect
};

  // Đếm số lượng bộ lọc active
  const getActiveFilterCount = () => {
    let count = 0;
    // ----- Thay đổi cách đếm color -----
    count += activeFilters.color ? 1 : 0; // Đếm là 1 nếu color có giá trị (khác null)
    // -----------------------------------
    count += activeFilters.price ? 1 : 0;
    return count;
  };

  const value = { activeFilters, updateFilters, removeFilter, clearAllFilters, getActiveFilterCount };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

// Custom hook useFilter
export const useFilter = () => {
    const context = useContext(FilterContext);
    if (!context) {
      console.warn("useFilter must be used within a FilterProvider");
      return {
        // ----- Cập nhật default state -----
        activeFilters: { color: null, price: null },
        // --------------------------------
        updateFilters: () => {},
        removeFilter: () => {},
        clearAllFilters: () => {},
        getActiveFilterCount: () => 0
      };
    }
    return context;
  };