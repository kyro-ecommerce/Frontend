// components/features/product/ProductSkeleton.jsx
import React from "react";

const ProductSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-between p-5 rounded-[28px] bg-[#F8F9FA] border border-gray-100 animate-pulse w-full h-[340px]">
      {/* Skeleton cho ảnh sản phẩm */}
      <div className="h-44 bg-gray-200 rounded-2xl w-full"></div>
      
      {/* Skeleton cho nội dung */}
      <div className="w-full flex flex-col items-center mt-auto space-y-2">
        <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
        <div className="h-5 bg-gray-200 rounded-full w-1/3 mt-1"></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;