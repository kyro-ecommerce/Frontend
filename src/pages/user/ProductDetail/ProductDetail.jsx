import React from "react";
import { useSearchParams } from "react-router-dom";
import { parseProductId } from "../../../services/user/productViewTracking.js";
import ProductGallery from "../../../features/user/product/ProductGallery";
import ProductInfo from "../../../features/user/product/ProductInfo";
import ProductReviews from "../../../features/user/product/ProductReviews";
import RelatedProducts from "../../../features/user/product/RelatedProducts";
import ComplementaryAccessories from "../../../features/user/product/ComplementaryAccessories";
import { useProductDetailPage } from "../../../hooks/user/useProductDetailPage";
import { Alert, CircularProgress, Typography } from "@mui/material";

const ProductDetail = () => {
  const {
    productId,
    product,
    loading,
    error,
    currentAverageRating,
    currentTotalReviews,
    productInfoData,
    handleRatingUpdate
  } = useProductDetailPage();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedVariant = searchParams.get("variant");
  const selectedVariantId = parseProductId(requestedVariant);
  const selectedVariant = product?.variants?.find((variant) => variant.id === selectedVariantId && variant.active && variant.stock > 0);
  const needsVariantChoice = !selectedVariant && (!!requestedVariant || (product?.variants?.length ?? 0) > 0);
  const chooseVariant = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set("variant", String(id));
    setSearchParams(next, { replace: true });
  };
  const recommendationDemo = searchParams.get("recommendation_demo") === "1";
  const rankingPolicy = recommendationDemo && searchParams.get("similar_policy") === "capacity_first" ? "capacity_first" : "hybrid";
  const chooseRankingPolicy = (policy) => {
    const next = new URLSearchParams(searchParams);
    next.set("similar_policy", policy);
    setSearchParams(next, { replace: true });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 4 }}>
          Đang tải sản phẩm...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ width: '100%', maxWidth: 500, marginTop: 2, mx: 'auto' }}
      >
        {error} Tải sản phẩm không thành công.
      </Alert>
    );
  }

  return (
    <div className="flex overflow-hidden flex-col pt-3 bg-white w-full">
      <main className="w-full max-w-screen-xl mx-auto px-4 md:px-8">
        {productInfoData && (
          <>
            <section className="flex flex-col lg:flex-row gap-8 lg:gap-12 py-6 justify-center items-start">
              {/* ProductGallery */}
              <ProductGallery item={product} />
              {/* ProductInfo */}
              <ProductInfo item={productInfoData} selectedVariantId={selectedVariant?.id ?? null} onVariantChange={chooseVariant} />
            </section>

            <ProductReviews
              productId={productId}
              onRatingUpdate={handleRatingUpdate}
              initialAverageRating={currentAverageRating}
              initialTotalReviews={currentTotalReviews}
            />

            {/* AI Gợi ý sản phẩm tương tự */}
            {requestedVariant && !selectedVariant && <Alert severity="warning">SKU trong liên kết không còn khả dụng hoặc không thuộc sản phẩm này. Vui lòng chọn lại cấu hình.</Alert>}
            {needsVariantChoice ? (
              <p className="my-4 text-sm text-gray-600">Chọn cấu hình để xem sản phẩm tương tự đúng SKU.</p>
            ) : <RelatedProducts productId={productId} targetVariantId={selectedVariant?.id ?? null} rankingPolicy={rankingPolicy} onRankingPolicyChange={chooseRankingPolicy} showRankingControls={recommendationDemo} />}

            {/* AI Gợi ý phụ kiện mua kèm */}
            <ComplementaryAccessories productId={productId} />
          </>
        )}
        {!productInfoData && !loading && <p className="text-center py-10">Không tìm thấy thông tin sản phẩm.</p>}
      </main>
    </div>
  );
};

export default ProductDetail;
