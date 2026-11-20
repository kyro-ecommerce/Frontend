import React from "react";
import { useRecoveringRecommendations } from "../../../hooks/user/useRecoveringRecommendations.js";
import { recommendationItems } from "../../../services/user/recommendationRecovery.js";
import { attachRecommendation, cardTracking } from "../../../services/user/recommendationExposure.js";
import RecommendationStatus from "./RecommendationStatus";
import { aiService } from "../../../services/user/ai.service";
import ProductCard from "./ProductCard";
import { mapSimilarProductCard } from "./recommendationCard.js";

const RelatedProducts = ({ productId, targetVariantId = null, rankingPolicy = "hybrid", onRankingPolicyChange = () => {}, showRankingControls = false }) => {
  const { data, status } = useRecoveringRecommendations(`similar:${productId}:${targetVariantId}:${rankingPolicy}`, async (signal) => {
    const res = await aiService.getSimilarProducts(productId, 4, { signal, targetVariantId, rankingPolicy });
    return { items: attachRecommendation(recommendationItems(res), res, "similar").filter((item) => String(item.id || item.product_id || item.productId) !== String(productId)).slice(0, 4), comparisonStatus: res.comparison_status };
  }, !!productId);
  const similarProducts = data?.items ?? [];
  if (!similarProducts.length && status !== "success") return <RecommendationStatus status={status} />;

  return (
    <section className="w-full bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/70 p-6 md:p-8 border border-indigo-100/80 my-10 rounded-3xl shadow-[0_10px_35px_rgba(79,70,229,0.06)]">
      <RecommendationStatus status={status} hasData />
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-start gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Sản Phẩm Tương Tự
            </h2>
            {showRankingControls && <label className="block mt-2 text-sm text-gray-600">
              Cách xếp hạng: <select value={rankingPolicy} onChange={(event) => onRankingPolicyChange(event.target.value)} className="border rounded p-1">
                <option value="hybrid">Hiện tại (baseline)</option>
                <option value="capacity_first">Gần RAM/lưu trữ trước (thử nghiệm)</option>
              </select>
            </label>}
            {showRankingControls && rankingPolicy === "capacity_first" && <p className="mt-2 text-sm text-gray-600">Ưu tiên cấu hình gần SKU đang chọn; bằng nhau ưu tiên giá thấp hơn. Không so hiệu năng CPU/GPU, không tự đặt ngân sách.</p>}
          </div>
        </div>
        {!similarProducts.length && <p className="text-sm text-gray-600">{data?.comparisonStatus === "unknown_target_capacities" ? "Chưa đủ RAM/lưu trữ của SKU gốc để so sánh cấu hình." : "Chưa có SKU tương tự đủ điều kiện trong catalog."}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {similarProducts.map((item, index) => {
            const card = mapSimilarProductCard(item);
            if (!card) return null;

            return (
              <ProductCard
                key={card.productId || index}
                {...card}
                tracking={cardTracking(item, index)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
