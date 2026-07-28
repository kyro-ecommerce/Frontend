import React, { useEffect, useState } from "react";
import { aiService } from "../../../services/user/ai.service";
import ProductCard from "../product/ProductCard";

const formatPrice = (price) => {
  if (typeof price !== "number" || isNaN(price)) return "N/A";
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const ZeroResultsRecommendations = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const res = await aiService.getTrendingProducts(4);
        const list = res?.recommendations || res?.items || res?.data || (Array.isArray(res) ? res : []);
        setTrending(list);
      } catch (err) {
        console.warn("Could not fetch zero results trending fallback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading || !trending || trending.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 font-medium">
        Rất tiếc, không tìm thấy sản phẩm nào phù hợp với bộ lọc.
      </div>
    );
  }

  return (
    <div className="w-full my-6 p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/40 rounded-2xl border border-gray-200 shadow-sm text-left">
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
          const price = product.discounted_price || product.discountedPrice || product.original_price || product.price;
          const origPrice = product.original_price || product.price;
          const imageUrl = product.image_url || product.imageUrl || product.image || "/Placeholder2.png";

          return (
            <div key={pid || index} className="relative group">
              {product.reason && (
                <div className="absolute top-2 left-2 z-10 max-w-[90%]">
                  <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-purple-900/90 text-white truncate max-w-full shadow-sm">
                    ✨ {product.reason}
                  </span>
                </div>
              )}
              <ProductCard
                productId={pid}
                image={imageUrl}
                title={product.title}
                price={formatPrice(price)}
                originalPrice={origPrice > price ? formatPrice(origPrice) : null}
                ratingImage={product.average_rating || product.averageRating || 5}
                discountPercent={product.discount_percent || product.discountPercent || 0}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ZeroResultsRecommendations;
