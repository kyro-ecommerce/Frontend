// src/components/features/product/ProductCardList.jsx
import React from "react";
// Xóa: import { useDispatch } from "react-redux";
// Xóa: import { addItemToCart } from "../../../State/Cart/Action";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../../../contexts/CartContext"; // THAY ĐỔI
import { useToast } from "../../../contexts/ToastContext";     // THAY ĐỔI
import { Rating, CircularProgress, Button as MuiButton } from '@mui/material'; // THÊM MUI

const ProductCardList = ({
  image,
  sku,
  title,
  originalPrice, // Nên là số để tính toán
  currentPrice,  // Nên là số để tính toán
  averageRating, // Thêm prop này (giả sử là rating dạng số)
  numReviews,   // Thêm prop này
  available,
  cpu,
  featured,
  ioport,
  productId,
  discountPercent // Thêm prop này
}) => {
  // Xóa: const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast(); // THAY ĐỔI
  // THAY ĐỔI: Sử dụng useCartContext
  const { addItemToCart: addItemToCartFromContext, isLoading: isCartContextLoading } = useCartContext();

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return "N/A";
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const handleViewDetails = () => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  const handleAddToCart = async (e) => { // THAY ĐỔI: async/await
    e.stopPropagation(); // Ngăn sự kiện click lan ra card
    if (!productId || !available || available.toLowerCase() !== 'in stock') {
        showToast("Sản phẩm hiện không có sẵn.", "warning");
        return;
    }

    const cartData = { productId, quantity: 1 };
    try {
      // THAY ĐỔI: Gọi hàm từ context
      await addItemToCartFromContext(cartData);
      showToast(`${title || 'Sản phẩm'} đã được thêm vào giỏ hàng!`, "success");
    } catch (error) {
      console.error("Error adding to cart (ProductCardList):", error);
      showToast(error.response?.data?.message || error.message || "Không thể thêm vào giỏ hàng.", "error");
    }
  };

  const isOutOfStock = !available || available.toLowerCase() !== 'in stock';

  return (
    <article
        className={`flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 mb-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ${isOutOfStock ? 'opacity-70' : 'cursor-pointer'}`}
        onClick={!isOutOfStock ? handleViewDetails : undefined}
    >
      {/* Image Section */}
      <div className="w-full md:w-1/4 flex-shrink-0">
        <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
            {isOutOfStock && (
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full z-10 shadow">Hết hàng</div>
            )}
            {discountPercent > 0 && !isOutOfStock && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-semibold px-2 py-0.5 rounded-full z-10 shadow">
                    -{discountPercent}%
                </div>
            )}
            <img
                src={image || "/Placeholder2.png"}
                className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                alt={title || "Product Image"}
                loading="lazy"
            />
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {sku && <p className="text-xs text-gray-500 mb-1">SKU: {sku}</p>}
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-1.5 hover:text-blue-600 transition-colors" title={title}>
            {title || "Product Title"}
          </h2>
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <Rating value={averageRating || 0} readOnly precision={0.5} size="small" />
            <span className="ml-1.5">({numReviews || 0} đánh giá)</span>
          </div>
          <div className="text-base md:text-lg font-bold text-red-600 mb-1">
            {formatCurrency(currentPrice)}
            {originalPrice > currentPrice && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Specs/Features (simplified example) */}
        <div className="text-xs text-gray-600 mt-2 mb-3 space-y-0.5">
          {cpu && <p><strong>CPU:</strong> {cpu}</p>}
          {featured && <p><strong>Featured:</strong> {featured}</p>}
          {ioport && <p><strong>I/O Ports:</strong> {ioport}</p>}
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-2">
          <MuiButton
            variant="contained"
            size="small"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isCartContextLoading}
            startIcon={isCartContextLoading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
                bgcolor: 'rgb(37 99 235)', // blue-600
                '&:hover': { bgcolor: 'rgb(29 78 216)' }, // blue-700
                color: 'white', textTransform: 'none', fontSize: '0.85rem', py: 0.8, px:2.5
            }}
          >
            {isOutOfStock ? "Hết hàng" : (isCartContextLoading ? "Đang xử lý..." : "Thêm vào giỏ")}
          </MuiButton>
        </div>
      </div>
    </article>
  );
};

export default ProductCardList;