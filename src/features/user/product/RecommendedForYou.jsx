import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { aiService } from "../../../services/user/ai.service";

const formatPrice = (price) => {
  if (typeof price !== "number" || isNaN(price)) return "N/A";
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const extractImageUrl = (product) => {
  if (!product) return "/Placeholder2.png";
  if (typeof product.image_url === "string" && product.image_url.trim()) return product.image_url.trim();
  if (typeof product.imageUrl === "string" && product.imageUrl.trim()) return product.imageUrl.trim();
  if (typeof product.image === "string" && product.image.trim()) return product.image.trim();
  
  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    const first = product.imageUrls[0];
    if (typeof first === "string") return first;
    if (first && first.downloadUrl) return first.downloadUrl;
    if (first && first.url) return first.url;
  }
  
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    if (typeof first === "string") return first;
    if (first && first.downloadUrl) return first.downloadUrl;
    if (first && first.url) return first.url;
  }

  if (Array.isArray(product.image_urls) && product.image_urls.length > 0) {
    const first = product.image_urls[0];
    if (typeof first === "string") return first;
  }
  
  return "/Placeholder2.png";
};

const RecommendedForYou = () => {
  const [products, setProducts] = useState([]);
  const [strategy, setStrategy] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      // Retrieve logged-in user from localStorage if available
      let userId = null;
      try {
        const storedUser = localStorage.getItem("user") || localStorage.getItem("userInfo");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          userId = parsed.id || parsed.userId || parsed.user_id;
        }
      } catch (e) {
        console.debug("Could not parse stored user:", e);
      }

      let res;
      if (userId && userId > 0) {
        res = await aiService.getPersonalizedProducts(userId, 5);
      } else {
        res = await aiService.getTrendingProducts(5);
      }

      const items = res?.recommendations || res?.data || (Array.isArray(res) ? res : []);
      setProducts(items);
      setStrategy(res?.strategy || "");
    } catch (error) {
      console.warn("Could not fetch AI recommendations, trying fallback trending:", error);
      try {
        const fallbackRes = await aiService.getTrendingProducts(5);
        const fallbackItems = fallbackRes?.recommendations || [];
        setProducts(fallbackItems);
      } catch (fallbackError) {
        console.error("AI service unreachable:", fallbackError);
        setProducts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (!isLoading && products.length === 0) {
    return null; // Gracefully hide if no recommendations available
  }

  return (
    <div className="flex flex-col w-full max-md:max-w-full px-4 my-6">
      {/* Header Section with AI Badge */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-3 mt-4 max-md:max-w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-blue-600 to-cyan-400 text-white shadow-md animate-pulse">
            ✨
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Dành Riêng Cho Bạn
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border border-purple-200">
                AI Personalization
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Gợi ý thông minh dựa trên mô hình lọc cộng tác & hành vi quan tâm
            </p>
          </div>
        </div>
        <a
          href="/product/all"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline flex items-center gap-1 cursor-pointer"
        >
          Xem toàn bộ
        </a>

      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-2 text-black max-md:max-w-full">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="w-full p-2">
              <div className="animate-pulse flex flex-col space-y-3 bg-gray-100 p-4 rounded-xl h-80">
                <div className="bg-gray-200 h-40 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                  <div className="bg-gray-200 h-6 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          products.map((product) => {
            const pid = product.product_id || product.id;
            const price = product.discounted_price || product.discountedPrice || product.original_price || product.price;
            const origPrice = product.original_price || product.price;
            const imageUrl = extractImageUrl(product);

            return (
              <div key={pid} className="relative group">
                {/* AI Reason Badge Overlay */}
                {product.reason && (
                  <div className="absolute top-3 left-3 z-10 max-w-[75%] pointer-events-none">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-800 to-indigo-800 text-white shadow-md backdrop-blur-md truncate max-w-full">
                      ✨ {product.reason}
                    </span>
                  </div>
                )}
                <ProductCard
                  productId={pid}
                  image={imageUrl}
                  stockStatus="in stock"
                  title={product.title}
                  price={formatPrice(price)}
                  originalPrice={origPrice && origPrice > price ? formatPrice(origPrice) : ""}
                  reviewCount={product.num_ratings || product.numRatings || 0}
                  ratingImage={product.average_rating || product.averageRating || 5.0}
                  discountPercent={product.discount_percent || product.discountPercent || 0}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};


export default RecommendedForYou;
