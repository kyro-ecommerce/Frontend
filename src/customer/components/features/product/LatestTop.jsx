// src/components/features/product/LatestTop.jsx
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { productService } from "../../../services/product.service";
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate nếu chưa có

const formatPrice = (price) => {
  if (typeof price !== 'number') return "N/A";
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};



const LatestTop = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate(); // Khởi tạo useNavigate

  const fetchProducts = async () => {
    try {
      const filterPayload = {
        // sort: "discount" || undefined,
        // // sort: "price_low" || undefined,
        sort: "newest" || undefined,
      };
      const response = await productService.getProductByFilter(filterPayload);
      setProducts(response.data.slice(0, 5)); // Vẫn giữ nguyên lấy 6 sản phẩm
    } catch (error) {
      console.error("Error fetching flash sale products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col w-full max-md:max-w-full px-4"> {/* Thêm px-4 để có khoảng trống hai bên */}
      <div className="flex flex-wrap gap-5 justify-between items-center mb-2 mt-5 max-md:max-w-full"> {/* Giảm mb, thêm items-center */}
        <div className="text-2xl font-semibold text-black">
          SẢN PHẨM MỚI NHẤT
        </div>
        <a
          href="/product/all" // Cân nhắc dùng Link của react-router-dom nếu đây là SPA
          className="text-sm leading-none text-blue-600 hover:underline">
           Xem toàn bộ sản phẩm
        </a>
      </div>
      {/* Thay đổi từ flex flex-wrap sang grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-3.5 text-black max-md:max-w-full">
        {products && products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              productId={product.id}
              image={product.imageUrls?.[0]?.downloadUrl || "/Placeholder2.png"}
              stockStatus={product.quantity > 0 ? "in stock" : "out of stock"}
              title={product.title}
              price={formatPrice(product.discountedPrice)}
              originalPrice={formatPrice(product.price)}
              reviewCount={product.numRatings || 0}
              ratingImage={product.averageRating || 0} // Truyền averageRating
              discountPercent={product.discountPercent || 0}
              // onClick đã được xử lý bên trong ProductCard, không cần truyền ở đây nữa
            />
          ))
        ) : (
          // Có thể thêm skeleton loading ở đây cho trải nghiệm người dùng tốt hơn
          Array.from({ length: 5 }).map((_, index) => (
             <div key={index} className="w-full p-2"> {/* Giả lập container cho skeleton */}
                <div className="animate-pulse flex flex-col space-y-3 bg-gray-100 p-4 rounded-lg h-[390px]">
                    <div className="bg-gray-200 h-40 rounded"></div>
                    <div className="space-y-2">
                        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                        <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                        <div className="bg-gray-200 h-6 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LatestTop;