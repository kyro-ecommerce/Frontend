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

const CartAccessories = ({ cartItems = [] }) => {
  const ids = (cartItems ?? []).map((item) => String(item?.productId || item?.product?.id || item?.id));
  const mainProductId = ids[0];
  const { data, status } = useRecoveringRecommendations(`cart:${JSON.stringify(ids)}`, async (signal) => {
    const res = await aiService.getComplementaryProducts(mainProductId, 6, { signal });
    return recommendationItems(res).filter((item) => !ids.includes(String(item.id || item.product_id || item.productId))).slice(0, 4);
  }, !!mainProductId && mainProductId !== "undefined");
  const accessories = data ?? [];
  if (!accessories.length) return <RecommendationStatus status={status} />;

  return (
    <div className="w-full mt-10 p-6 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-purple-50/90 rounded-2xl border border-indigo-100 shadow-sm">
      <RecommendationStatus status={status} hasData />
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
          🛒
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Gợi Ý Phụ Kiện Mua Kèm Trước Khi Thanh Toán
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">
              AI Smart Addon
            </span>
          </h3>
          <p className="text-xs text-gray-500">
            Bổ sung các phụ kiện đi kèm phù hợp nhất cho các sản phẩm trong giỏ hàng của bạn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        {accessories.map((item, index) => {
          const id = item.id || item.product_id || item.productId;
          const img = extractImageUrl(item);
          const title = item.productTitle || item.title || item.name || "Phụ kiện";
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
  );
};


export default CartAccessories;
