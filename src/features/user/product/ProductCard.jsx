// src/components/features/product/ProductCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rating } from '@mui/material';

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === 'number') {
    if (isNaN(value) || value <= 0) return null;
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  }
  if (typeof value === 'string') {
    if (value.includes("₫") || value.includes("VND")) return value;
    const num = Number(value.replace(/[^0-9]/g, ''));
    if (!isNaN(num) && num > 0) {
      return num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }
    return value;
  }
  return String(value);
};

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
  const formattedPrice = formatPrice(price);
  const formattedOriginalPrice = formatPrice(originalPrice);


  return (
    <div
      onClick={!isOutOfStock ? handleCardClick : undefined}
      className={`group flex flex-col items-center justify-between p-4 sm:p-5 rounded-3xl bg-white border border-gray-100 hover:border-blue-400/40 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(37,99,235,0.12)] hover:-translate-y-2 transition-all duration-300 ease-out w-full relative overflow-hidden ${
        isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{ minHeight: '350px' }}
    >
      {/* Badges */}
      {isOutOfStock && (
        <span className="absolute top-3.5 left-3.5 bg-gray-900/80 text-white text-[11px] font-semibold px-3 py-1 rounded-full z-10 shadow-sm backdrop-blur-md">
          Hết hàng
        </span>
      )}
      {discountPercent > 0 && !isOutOfStock && (
        <span className="absolute top-3.5 right-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-extrabold px-3 py-1 rounded-full z-10 shadow-md transform group-hover:scale-105 transition-transform">
          -{discountPercent}%
        </span>
      )}

      {/* Image Container with Soft Background */}
      <div className="w-full h-44 sm:h-48 flex items-center justify-center p-3 mb-3 bg-gray-50/80 rounded-2xl group-hover:bg-blue-50/30 transition-colors duration-300 relative overflow-hidden">
        <img
          src={image || "/Placeholder2.png"}
          alt={title || "Product Image"}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/Placeholder2.png";
          }}
          className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110 drop-shadow-sm"
        />

      </div>

      {/* Content Section */}
      <div className="flex flex-col items-center text-center w-full mt-auto">
        {/* Rating Stars */}
        <div className="flex items-center justify-center gap-1 mb-1.5">
          <Rating
            value={displayRating}
            readOnly
            precision={0.5}
            size="small"
            sx={{
              color: '#F59E0B',
              fontSize: '1.1rem',
            }}
          />
          {reviewCount > 0 && (
            <span className="text-[11px] font-medium text-gray-400">({reviewCount})</span>
          )}
        </div>

        {/* Product Title */}
        <h3
          className="text-sm font-bold text-gray-800 h-10 line-clamp-2 leading-snug mb-2 group-hover:text-blue-600 transition-colors duration-200"
          title={title || "Product Name"}
        >
          {title || "Tên sản phẩm"}
        </h3>

        {/* Price Section */}
        <div className="flex items-baseline justify-center gap-2 mt-auto pt-1">
          <span className="text-base sm:text-lg font-extrabold text-[#E05600] tracking-tight">
            {formattedPrice || "Liên hệ"}
          </span>
          {formattedOriginalPrice && formattedPrice !== formattedOriginalPrice && (
            <span className="text-xs text-gray-400 font-normal line-through">
              {formattedOriginalPrice}
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductCard;