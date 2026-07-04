// src/components/features/product/ProductCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartContext } from "../../../contexts/CartContext";
import { useToast } from "../../../contexts/ToastContext";
import { Rating, CircularProgress, Button as MuiButton } from '@mui/material';

const ProductCard = ({
  productId,
  image,
  stockStatus = "in stock",
  title,
  price,
  originalPrice,
  reviewCount,
  ratingImage, // Đây là averageRating
  discountPercent
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addItemToCart: addItemToCartFromContext, isLoading: isCartContextLoading } = useCartContext();

  const handleCardClick = () => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  // Các hàm handleAddToCart, handleBuyNow giữ nguyên

  const isOutOfStock = stockStatus !== "in stock";
  const displayRating = typeof ratingImage === 'number' ? ratingImage : 0;

  return (
    <div
      // Bỏ: flex-shrink-0 w-48 md:w-56
      // Thêm: w-full (để card chiếm hết ô của grid item)
      className={`flex flex-col border rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl bg-white group w-full ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={!isOutOfStock ? handleCardClick : undefined}
      style={{ minHeight: '390px' }} // Có thể tăng nhẹ minHeight nếu cần
    >
      <div className="relative w-full pt-[80%] bg-gray-100">
        {isOutOfStock && (
          <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full z-10 shadow">Hết hàng</div>
        )}
        {discountPercent > 0 && !isOutOfStock && (
          <div className="absolute top-1.5 right-1.5 bg-yellow-400 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full z-10 shadow">
            -{discountPercent}%
          </div>
        )}
        <img
          src={image || "/Placeholder2.png"}
          className="absolute top-0 left-0 w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          alt={title || "Product Image"}
          loading="lazy"
        />
      </div>

      {/* Tăng padding chung cho nội dung card */}
      <div className="flex flex-col p-3 flex-grow"> {/* p-2 -> p-3 */}
        {/* Tăng kích thước chữ cho rating và review count */}
        <div className="flex items-center text-xs text-gray-500 mb-1"> {/* text-[10px] -> text-xs, mb-0.5 -> mb-1 */}
          <Rating value={displayRating} readOnly precision={0.5} size="small" sx={{ color: '#faaf00', fontSize: '1rem' }} /> {/* fontSize: '0.7rem' -> '1rem' */}
          <span className="ml-1.5">({reviewCount || 0})</span> {/* ml-1 -> ml-1.5 */}
        </div>

        {/* Tăng kích thước chữ cho tiêu đề, điều chỉnh chiều cao và margin */}
        <h3
          className="text-sm font-medium text-gray-700 h-10 overflow-hidden mb-1.5 leading-tight group-hover:text-blue-600 transition-colors" // text-xs -> text-sm, h-9 -> h-10, mb-1 -> mb-1.5
          title={title || "Product Name"}
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
        >
          {title || "Tên sản phẩm"}
        </h3>

        <div className="mt-auto">
          {/* Tăng kích thước chữ cho giá và margin */}
          <div className="mb-2"> {/* mb-1.5 -> mb-2 */}
            <span className="text-base font-semibold text-red-500"> {/* text-sm -> text-base */}
              {price || "Liên hệ"}
            </span>
            {originalPrice && price !== originalPrice && (
              <span className="ml-1.5 text-xs text-gray-400 line-through"> {/* text-[9px] -> text-xs, ml-1 -> ml-1.5 */}
                {originalPrice}
              </span>
            )}
          </div>
          {/* Các nút "Add to Cart" và "Buy Now" sẽ được ẩn đi theo thiết kế mới nếu bạn muốn tập trung vào click card */}
          {/* Nếu vẫn muốn giữ, có thể cần style lại cho phù hợp với kích thước mới */}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;