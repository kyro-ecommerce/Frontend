import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { productService } from "../../services/user/product.service";
import { aiService } from "../../services/user/ai.service";

export const useProductDetailPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentAverageRating, setCurrentAverageRating] = useState(0);
    const [currentTotalReviews, setCurrentTotalReviews] = useState(0);
    const recordedProductRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        if (!productId || productId === "undefined") {
            setError("Product ID is required");
            setLoading(false);
            return;
        }

        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await productService.getProductById(productId);
                const productData = response?.data?.data ?? response?.data;
                if (!productData || typeof productData !== "object") {
                    throw new Error("Product data not found");
                }
                if (productData) {
                    setProduct(productData);
                    setCurrentAverageRating(productData.averageRating || 0);
                    setCurrentTotalReviews(productData.numRatings || 0);

                    // Record VIEW interaction to AI Service once per product page load
                    if (recordedProductRef.current !== productId) {
                        recordedProductRef.current = productId;
                        const catName = productData.categoryName || productData.category_name || productData.category?.name || (typeof productData.category === "string" ? productData.category : "") || "";
                        const titleStr = productData.title || productData.name || `Product ID ${productId}`;
                        aiService.recordInteraction("VIEW", `View product ${titleStr}`, catName);
                    }
                }
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("Product not found or error loading data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const handleRatingUpdate = useCallback((newAverageRating, newTotalReviews) => {
        console.log("ProductDetail received rating update:", newAverageRating, newTotalReviews);
        setCurrentAverageRating(newAverageRating);
        setCurrentTotalReviews(newTotalReviews);
    }, []);

    const productInfoData = product ? {
        ...product,
        averageRating: currentAverageRating,
        numRatings: currentTotalReviews,
    } : null;

    return {
        productId,
        product,
        loading,
        error,
        currentAverageRating,
        currentTotalReviews,
        productInfoData,
        handleRatingUpdate
    };
};
