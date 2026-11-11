import React from "react";
import { useAuthContext } from "../../../store/user/AuthContext";
import { useRecoveringRecommendations } from "../../../hooks/user/useRecoveringRecommendations.js";
import { recommendationItems } from "../../../services/user/recommendationRecovery.js";
import RecommendationStatus from "./RecommendationStatus";
import ProductCard from "./ProductCard";
import { normalizeCatalogRating } from "./recommendationCard.js";
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
  const { user, isAuthenticated } = useAuthContext();
  const userId = user?.id ?? user?.userId ?? user?.user_id;
  const { data, status } = useRecoveringRecommendations("home", async (signal) => {
    const res = isAuthenticated
      ? await aiService.getPersonalizedProducts(userId, 5, { signal })
      : await aiService.getTrendingProducts(5, { signal });
    return recommendationItems(res);
  });
  const products = data ?? [];
  const isLoading = status === "loading";
  if (!products.length && !isLoading) return <RecommendationStatus status={status} />;

  return (
    <div className="flex flex-col w-full max-md:max-w-full px-4 my-6">
      <RecommendationStatus status={status} hasData={products.length > 0} />
      {/* Header Section with AI Badge */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-3 mt-4 max-md:max-w-full">
        <div className="flex items-center gap-3">

          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Gợi Ý Sản Phẩm

            </h2>

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
            const origPrice = Number(product.original_price || product.originalPrice || product.minPrice || product.price || 0);
            const discPrice = Number(product.discounted_price || product.discountedPrice || product.minSalePrice || product.salePrice || product.sale_price || product.discountPrice || 0);
            const price = discPrice > 0 && discPrice < origPrice ? discPrice : (origPrice > 0 ? origPrice : Number(product.price || 0));
            const originalPrice = discPrice > 0 && origPrice > discPrice ? origPrice : null;
            let discountPercent = Number(product.discount_percent || product.discountPercent || 0);
            if (!discountPercent && origPrice > 0 && discPrice > 0 && origPrice > discPrice) {
              discountPercent = Math.round(((origPrice - discPrice) / origPrice) * 100);
            }
            const imageUrl = extractImageUrl(product);

            return (
              <div key={pid} className="relative group">
                <ProductCard
                  productId={pid}
                  image={imageUrl}
                  stockStatus="in stock"
                  title={product.title}
                  price={price}
                  originalPrice={originalPrice}
                  reviewCount={product.num_ratings || product.numRatings || 0}
                  ratingImage={normalizeCatalogRating(product.average_rating ?? product.averageRating)}
                  discountPercent={discountPercent}
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
