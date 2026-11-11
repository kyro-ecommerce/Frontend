import React from "react";
import { useRecoveringRecommendations } from "../../../hooks/user/useRecoveringRecommendations.js";
import { recommendationItems } from "../../../services/user/recommendationRecovery.js";
import RecommendationStatus from "./RecommendationStatus";
import { aiService } from "../../../services/user/ai.service";
import ProductCard from "./ProductCard";
import { mapSimilarProductCard } from "./recommendationCard.js";

const RelatedProducts = ({ productId }) => {
  const { data, status } = useRecoveringRecommendations(`similar:${productId}`, async (signal) => {
    const res = await aiService.getSimilarProducts(productId, 6, { signal });
    return recommendationItems(res).filter((item) => String(item.id || item.product_id || item.productId) !== String(productId)).slice(0, 4);
  }, !!productId);
  const similarProducts = data ?? [];
  if (!similarProducts.length) return <RecommendationStatus status={status} />;

  return (
    <section className="w-full bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/70 p-6 md:p-8 border border-indigo-100/80 my-10 rounded-3xl shadow-[0_10px_35px_rgba(79,70,229,0.06)]">
      <RecommendationStatus status={status} hasData />
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Sản Phẩm Tương Tự
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {similarProducts.map((item, index) => {
            const card = mapSimilarProductCard(item);
            if (!card) return null;

            return (
              <ProductCard
                key={card.productId || index}
                {...card}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
