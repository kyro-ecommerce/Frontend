import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductGallery from "../../../features/user/product/ProductGallery";
import ProductInfo from "../../../features/user/product/ProductInfo";
import ProductReviews from "../../../features/user/product/ProductReviews";
import RelatedProducts from "../../../features/user/product/RelatedProducts";
import { productService } from "../../../services/user/product.service";
import { Alert, CircularProgress, Typography } from "@mui/material";

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null); // State cho toàn bộ dữ liệu sản phẩm
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State riêng cho rating để dễ dàng cập nhật từ ProductReviews
  const [currentAverageRating, setCurrentAverageRating] = useState(0);
  const [currentTotalReviews, setCurrentTotalReviews] = useState(0);

  useEffect(() => {
    if (!productId || productId === "undefined") {
      setError("Product ID is required");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true); // Bắt đầu loading khi fetch
      setError(null); // Reset lỗi cũ
      try {
        const response = await productService.getProductById(productId);
        const productData = response?.data?.data ?? response?.data;
        if (!productData || typeof productData !== "object") {
          throw new Error("Product data not found");
        }
        console.log('productttttttt :>> ', productData);
        if (productData) {
          setProduct(productData);
          setCurrentAverageRating(productData.averageRating || 0);
          setCurrentTotalReviews(productData.numRatings || 0);
        }
      } catch (err) {
        console.error("Error fetching product:", err); // Log lỗi chi tiết
        setError("Product not found or error loading data."); // Thông báo lỗi chung
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Hàm callback để ProductReviews cập nhật rating lên ProductDetail
  const handleRatingUpdate = (newAverageRating, newTotalReviews) => {
    console.log("ProductDetail received rating update:", newAverageRating, newTotalReviews);
    setCurrentAverageRating(newAverageRating);
    setCurrentTotalReviews(newTotalReviews);
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

  // Tạo một đối tượng product mới để truyền xuống ProductInfo,
  // bao gồm cả rating đã được cập nhật
  const productInfoData = product ? {
    ...product,
    averageRating: currentAverageRating, // Sử dụng rating đã cập nhật
    numRatings: currentTotalReviews,     // Sử dụng số lượng đánh giá đã cập nhật
  } : null;


  return (
    <div className="flex overflow-hidden flex-col pt-3 bg-white w-full">
      <main className="w-full max-w-screen-xl mx-auto px-4 md:px-8">
        {productInfoData && ( // Chỉ render khi có productInfoData
          <>
            <section className="flex gap-10 py-10 max-md:flex-col justify-center">
              {/* ProductGallery có thể chỉ cần dữ liệu gốc */}
              <ProductGallery item={product} />
              {/* ProductInfo nhận dữ liệu đã cập nhật rating */}
              <ProductInfo item={productInfoData} />
            </section>

            <ProductReviews
              productId={productId}
              // Truyền hàm callback xuống ProductReviews
              onRatingUpdate={handleRatingUpdate}
              // Truyền rating và total ban đầu xuống để ProductReviews có thể hiển thị ngay lập tức
              initialAverageRating={currentAverageRating}
              initialTotalReviews={currentTotalReviews}
            />

            {/* AI Gợi ý sản phẩm tương tự */}
            <RelatedProducts productId={productId} />
          </>
        )}
        {!productInfoData && !loading && <p className="text-center py-10">Không tìm thấy thông tin sản phẩm.</p>}
      </main>
    </div>
  );
};

export default ProductDetail;