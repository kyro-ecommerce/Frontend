import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';
import { productService } from '../../../services/user/product.service';

const formatPrice = (price) => {
  if (typeof price !== 'number') return 'N/A';
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const SearchBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync with URL query param
  useEffect(() => {
    const currentQ = searchParams.get('q');
    if (currentQ !== searchTerm) {
      setSearchTerm(currentQ || '');
    }
  }, [location.search]);

  // Debounced search logic for live dropdown suggestions
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setResults([]);
      setTotalCount(0);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await productService.getProductByFilter({ keyword: trimmed, size: 7 });
        const productList = response.data?.content || [];
        setTotalCount(response.data?.totalElements || 0);
        setResults(productList);
        setIsOpen(true);
      } catch (error) {
        console.error('Lỗi khi tìm kiếm sản phẩm:', error);
        setResults([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      setIsOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSelectProduct = (productId) => {
    setIsOpen(false);
    navigate(`/product/${productId}`);
  };

  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setTotalCount(0);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-56 sm:w-64 md:w-72 lg:w-80 text-left">
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <div className="flex items-center w-full bg-gray-100/90 hover:bg-gray-200/70 focus-within:bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-full px-3.5 py-1.5 transition-all duration-200 shadow-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (results.length > 0 && searchTerm.trim()) setIsOpen(true);
            }}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none pr-2"
          />

          {isLoading && (
            <FiLoader className="animate-spin text-blue-600 text-base mr-1.5 shrink-0" />
          )}

          {searchTerm && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-0.5 mr-1 focus:outline-none transition-colors"
              title="Xóa"
            >
              <FiX className="text-sm" />
            </button>
          )}

          <button
            type="submit"
            className="flex items-center justify-center p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-full focus:outline-none transition-colors duration-200 shrink-0"
            title="Tìm kiếm"
          >
            <FiSearch className="text-base" />
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden text-left">
          {results.length > 0 ? (
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 flex justify-between items-center">
                <span>Gợi ý sản phẩm ({totalCount})</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 scrollbar-thin scrollbar-thumb-gray-200">
                {results.map((product) => {
                  const imgUrl = product.imageUrls?.[0]?.downloadUrl || '/Placeholder2.png';
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product.id)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/70 cursor-pointer transition-colors group"
                    >
                      <img
                        src={imgUrl}
                        alt={product.title}
                        className="w-11 h-11 object-contain bg-white rounded-lg p-1 border border-gray-100 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                          {product.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-blue-600">
                            {formatPrice(product.discountedPrice || product.price)}
                          </span>
                          {product.discountPercent > 0 && (
                            <span className="text-[10px] text-gray-400 line-through">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalCount > 7 && (
                <div
                  onClick={() => handleSearchSubmit()}
                  className="px-4 py-2.5 bg-gray-50 hover:bg-blue-50 text-center text-xs font-semibold text-blue-600 cursor-pointer transition-colors border-t border-gray-100"
                >
                  Xem tất cả {totalCount} kết quả cho "{searchTerm}" →
                </div>
              )}
            </div>
          ) : !isLoading ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Không tìm thấy sản phẩm phù hợp với "{searchTerm}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
