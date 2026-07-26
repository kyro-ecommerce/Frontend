// src/components/features/product/ProductCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rating } from '@mui/material';

const ProductCard = ({
  productId,
  image,
  stockStatus = "in stock",
  title,
  price,
  originalPrice,
  reviewCount,
  ratingImage, // averageRating
  discountPercent
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  const isOutOfStock = stockStatus !== "in stock";
  const displayRating = typeof ratingImage === 'number' && ratingImage > 0 ? ratingImage : 5;

  return (
    <div
      onClick={!isOutOfStock ? handleCardClick : undefined}
      className={`group flex flex-col items-center justify-between p-5 rounded-[28px] bg-[#F8F9FA] border border-gray-100 hover:border-gray-200/80 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-out w-full relative ${
        isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{ minHeight: '340px' }}
    >
      {/* Badges */}
      {isOutOfStock && (
        <span className="absolute top-3.5 left-3.5 bg-red-500 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full z-10 shadow-sm">
          Hết hàng
        </span>
      )}
      {discountPercent > 0 && !isOutOfStock && (
        <span className="absolute top-3.5 right-3.5 bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] text-[11px] font-bold px-2.5 py-0.5 rounded-full z-10 shadow-sm">
          -{discountPercent}%
        </span>
      )}

      {/* Image Container */}
      <div className="w-full h-44 sm:h-48 flex items-center justify-center p-2 mb-2">
        <img
          src={image || "/Placeholder2.png"}
          alt={title || "Product Image"}
          loading="lazy"
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content Section - Fully Centered */}
      <div className="flex flex-col items-center text-center w-full mt-auto">
        {/* Rating Stars */}
        <div className="flex items-center justify-center mb-1.5">
          <Rating
            value={displayRating}
            readOnly
            precision={0.5}
            size="small"
            sx={{
              color: '#FAAF00', // Vàng rực rỡ như thiết kế mẫu Ảnh 2
              fontSize: '1.15rem',
            }}
          />
        </div>

        {/* Product Title */}
        <h3
          className="text-sm font-semibold text-gray-900 h-10 line-clamp-2 leading-snug mb-2 group-hover:text-blue-600 transition-colors"
          title={title || "Product Name"}
        >
          {title || "Tên sản phẩm"}
        </h3>

        {/* Price Section */}
        <div className="flex items-center justify-center gap-1.5 mt-auto">
          <span className="text-base sm:text-lg font-bold text-[#D96B27]">
            {price || "Liên hệ"}
          </span>
          {originalPrice && price !== originalPrice && (
            <span className="text-xs text-gray-400 font-normal line-through">
              {originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;