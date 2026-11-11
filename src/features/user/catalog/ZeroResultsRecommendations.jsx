import React from "react";
import { useRecoveringRecommendations } from "../../../hooks/user/useRecoveringRecommendations.js";
import { recommendationItems } from "../../../services/user/recommendationRecovery.js";
import RecommendationStatus from "../product/RecommendationStatus";
import { aiService } from "../../../services/user/ai.service";
import ProductCard from "../product/ProductCard";
import { normalizeCatalogRating } from "../product/recommendationCard.js";

const formatPrice = (price) => {
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) return "N/A";
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

const ZeroResultsRecommendations = () => {
  const { data, status } = useRecoveringRecommendations("zero-results", async (signal) => {
    return recommendationItems(await aiService.getTrendingProducts(4, { signal }));
  });
  const trending = data ?? [];
  if (!trending.length) {
    return (
      <div className="text-center p-8 text-gray-500 font-medium">
        Rất tiếc, không tìm thấy sản phẩm nào phù hợp với bộ lọc.
        <RecommendationStatus status={status} />
      </div>
    );
  }

  return (
    <div className="w-full my-6 p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/40 rounded-2xl border border-gray-200 shadow-sm text-left">
      <RecommendationStatus status={status} hasData />
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
          🔍
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Không tìm thấy kết quả từ khóa?
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-800">
              AI Smart Discovery
            </span>
          </h3>
          <p className="text-xs text-gray-500">
            Dưới đây là các sản phẩm nổi bật bán chạy được AI đề xuất cho bạn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {trending.map((product, index) => {
          const pid = product.product_id || product.id;
          const price = product.discounted_price ?? product.minSalePrice;
          const origPrice = product.original_price ?? product.price;
          const imageUrl = extractImageUrl(product);

          return (
            <div key={pid || index} className="relative group">
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
                title={product.title}
                price={formatPrice(price)}
                originalPrice={Number.isFinite(price) && price >= 0 && Number.isFinite(origPrice) && origPrice > price ? formatPrice(origPrice) : null}
                ratingImage={normalizeCatalogRating(product.average_rating ?? product.averageRating)}
                discountPercent={product.discount_percent ?? product.discountPercent ?? 0}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default ZeroResultsRecommendations;
