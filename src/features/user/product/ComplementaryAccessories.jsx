import React from "react";
import { useRecoveringRecommendations } from "../../../hooks/user/useRecoveringRecommendations.js";
import { recommendationItems } from "../../../services/user/recommendationRecovery.js";
import RecommendationStatus from "./RecommendationStatus";
import { aiService } from "../../../services/user/ai.service";
import ProductCard from "./ProductCard";
import { normalizeCatalogRating } from "./recommendationCard.js";

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

const ComplementaryAccessories = ({ productId }) => {
  const { data, status } = useRecoveringRecommendations(`complementary:${productId}`, async (signal) => {
    const filterList = (list) => list.filter((item) => {
      const itemId = item.id || item.product_id || item.productId;
      return itemId != null && String(itemId) !== String(productId);
    }).slice(0, 4);
    const res = await aiService.getComplementaryProducts(productId, 6, { signal });
    if (signal.aborted) return null;
    const items = filterList(recommendationItems(res));
    // Only a successful empty result permits general-discovery fallback.
    if (items.length) return { items, source: "complementary" };
    const trending = await aiService.getTrendingProducts(6, { signal });
    return { items: filterList(recommendationItems(trending)), source: "trending" };
  }, !!productId);
  const accessories = data?.items ?? [];
  const recommendationSource = data?.source ?? "complementary";
  if (!accessories.length) return <RecommendationStatus status={status} />;

  return (
    <section className="w-full bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/70 p-6 md:p-8 border border-indigo-100/80 my-10 rounded-3xl shadow-[0_10px_35px_rgba(79,70,229,0.06)]">
      <RecommendationStatus status={status} hasData />
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {recommendationSource === "trending" ? "Bạn có thể quan tâm" : "Phụ Kiện Gợi Ý Mua Kèm"}
            </h2>
            {recommendationSource === "trending" && (
              <p className="text-sm text-gray-600">Gợi ý chung từ danh mục, không phải phụ kiện mua kèm hoặc gợi ý cá nhân hóa.</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {accessories.map((item, index) => {
            const id = item.id || item.product_id || item.productId;
            const img = extractImageUrl(item);
            const title = item.productTitle || item.title || item.name || "Sản phẩm";
            const origPrice = Number(item.original_price || item.originalPrice || item.minPrice || item.price || 0);
            const discPrice = Number(item.discounted_price || item.discountedPrice || item.minSalePrice || item.salePrice || item.sale_price || item.discountPrice || 0);
            const price = discPrice > 0 && discPrice < origPrice ? discPrice : (origPrice > 0 ? origPrice : Number(item.price || 0));
            const originalPrice = discPrice > 0 && origPrice > discPrice ? origPrice : null;
            let discount = Number(item.discount_percent || item.discountPercent || 0);
            if (!discount && origPrice > 0 && discPrice > 0 && origPrice > discPrice) {
              discount = Math.round(((origPrice - discPrice) / origPrice) * 100);
            }
            const rating = normalizeCatalogRating(item.averageRating ?? item.average_rating);

            return (
              <ProductCard
                key={id || index}
                productId={id}
                image={img}
                title={title}
                price={price}
                originalPrice={originalPrice}
                ratingImage={rating}
                discountPercent={discount}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};


export default ComplementaryAccessories;
