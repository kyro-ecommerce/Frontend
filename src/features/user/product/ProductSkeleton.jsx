// components/features/product/ProductSkeleton.jsx
import React from "react";

const ProductSkeleton = () => {
  return (
    <div className="flex flex-col h-full border border-gray-200 rounded-md overflow-hidden animate-pulse bg-white">
      {/* Skeleton cho ảnh sản phẩm */}
      <div className="h-48 bg-gray-200 w-full"></div>
      
      {/* Skeleton cho tiêu đề */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        
        {/* Skeleton cho giá */}
        <div className="flex gap-2 items-center mt-auto">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;