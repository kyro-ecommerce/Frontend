import React, { useEffect, useState } from "react";
import { aiService } from "../../../services/user/ai.service";
import ProductCard from "./ProductCard";

const RelatedProducts = ({ productId }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const fetchSimilar = async () => {
      setLoading(true);
      try {
        const res = await aiService.getSimilarProducts(productId, 6);
        console.log("AI Similar Products raw res:", res);
        const productsList = res?.items || res?.recommendations || res?.data || (Array.isArray(res) ? res : []);
        const filteredList = productsList.filter((item) => {
          const itemId = item.id || item.product_id || item.productId;
          return String(itemId) !== String(productId);
        }).slice(0, 4);
        setSimilarProducts(filteredList);
      } catch (err) {
        console.error("Error fetching AI recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [productId]);

  if (loading || !similarProducts || similarProducts.length === 0) return null;

  return (
    <section className="w-full bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/70 p-6 md:p-8 border border-indigo-100/80 my-10 rounded-3xl shadow-[0_10px_35px_rgba(79,70,229,0.06)]">
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
            const id = item.id || item.product_id || item.productId;
            const img = item.imageUrl || item.image_url || item.image || (Array.isArray(item.images) ? item.images[0] : null) || "/Placeholder2.png";
            const title = item.productTitle || item.title || item.name || "Sản phẩm";
            const origPrice = Number(item.original_price || item.originalPrice || item.price || 0);
            const discPrice = Number(item.discounted_price || item.discountedPrice || 0);
            const price = discPrice > 0 ? discPrice : (origPrice > 0 ? origPrice : Number(item.price || 0));
            const originalPrice = discPrice > 0 && origPrice > discPrice ? origPrice : null;
            let discount = Number(item.discount_percent || item.discountPercent || 0);
            if (!discount && origPrice > 0 && discPrice > 0 && origPrice > discPrice) {
              discount = Math.round(((origPrice - discPrice) / origPrice) * 100);
            }
            const rating = Number(item.averageRating || item.average_rating || 5);

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

export default RelatedProducts;
