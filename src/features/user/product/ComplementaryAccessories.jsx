import React, { useEffect, useState } from "react";
import { aiService } from "../../../services/user/ai.service";
import ProductCard from "./ProductCard";

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
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const fetchAccessories = async () => {
      setLoading(true);
      try {
        const res = await aiService.getComplementaryProducts(productId, 4);
        const list = res?.recommendations || res?.items || res?.data || (Array.isArray(res) ? res : []);
        setAccessories(list);
      } catch (err) {
        console.error("Error fetching complementary accessories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessories();
  }, [productId]);

  if (loading || !accessories || accessories.length === 0) return null;

  return (
    <section className="w-full bg-gradient-to-br from-purple-50/80 via-pink-50/40 to-blue-50/70 p-6 md:p-8 border border-purple-100/80 my-8 rounded-3xl shadow-[0_10px_35px_rgba(168,85,247,0.06)]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold">
              🎧
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                Phụ Kiện Gợi Ý Mua Kèm
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  Cross-Category Synergy
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Các thiết bị phụ kiện tương thích tối ưu nhất cho sản phẩm này
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {accessories.map((item, index) => {
            const id = item.id || item.product_id || item.productId;
            const img = extractImageUrl(item);
            const title = item.productTitle || item.title || item.name || "Phụ kiện";
            const price = Number(item.discountedPrice || item.discounted_price || item.price || 0);
            const origPrice = Number(item.originalPrice || item.original_price || item.price || 0);
            const rating = Number(item.averageRating || item.average_rating || 5);
            const discount = Number(item.discountPercent || item.discount_percent || 0);

            return (
              <div key={id || index} className="relative group">
                {item.reason && (
                  <div className="absolute top-3 left-3 z-10 max-w-[75%] pointer-events-none">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-800 to-indigo-800 text-white shadow-md backdrop-blur-md truncate max-w-full">
                      ✨ {item.reason}
                    </span>
                  </div>
                )}
                <ProductCard
                  productId={id}
                  image={img}
                  title={title}
                  price={price}
                  originalPrice={origPrice > price ? origPrice : null}
                  ratingImage={rating}
                  discountPercent={discount}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};


export default ComplementaryAccessories;
