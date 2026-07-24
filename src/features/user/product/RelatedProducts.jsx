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
        const res = await aiService.getSimilarProducts(productId, 4);
        const productsList = res?.items || res?.recommendations || res?.data || (Array.isArray(res) ? res : []);
        setSimilarProducts(productsList);
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
    <section className="px-64 py-10 max-md:p-5 bg-gray-50 border-t border-gray-100 mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span>✨</span> Sản Phẩm Tương Tự (AI Gợi Ý)
        </h2>
      </div>
      <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {similarProducts.map((item) => (
          <ProductCard
            key={item.product_id || item.id}
            productId={item.product_id || item.id}
            image={item.image_url || item.imageUrl}
            title={item.title || item.name}
            price={item.discounted_price || item.price}
            originalPrice={item.original_price || item.originalPrice}
            ratingImage={item.average_rating || item.averageRating}
            discountPercent={item.discount_percent || item.discountPercent}
          />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
