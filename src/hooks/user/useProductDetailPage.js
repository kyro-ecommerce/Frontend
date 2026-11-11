import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { productService } from "../../services/user/product.service";
import { aiService } from "../../services/user/ai.service";
import { createProductViewVisit, parseProductId } from "../../services/user/productViewTracking.js";

export const useProductDetailPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentAverageRating, setCurrentAverageRating] = useState(0);
    const [currentTotalReviews, setCurrentTotalReviews] = useState(0);
    const viewVisitRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        let cancelled = false;
        setProduct(null);
        viewVisitRef.current = null;

        if (parseProductId(productId) === null) {
            setError("Product ID is required");
            setLoading(false);
            return;
        }

        viewVisitRef.current = createProductViewVisit({
            productId,
            send: aiService.recordProductView,
        });

        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await productService.getProductById(productId);
                if (cancelled) return;
                const productData = response?.data?.data ?? response?.data;
                if (!productData || typeof productData !== "object") {
                    throw new Error("Product data not found");
                }
                if (parseProductId(productData.id ?? productData.product_id) !== parseProductId(productId)) {
                    throw new Error("Product identity does not match the requested page");
                }
                if (productData) {
                    setProduct(productData);
                    setCurrentAverageRating(productData.averageRating || 0);
                    setCurrentTotalReviews(productData.numRatings || 0);

                }
            } catch (err) {
                if (cancelled) return;
                console.error("Error fetching product:", err);
                setError("Product not found or error loading data.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchProduct();
        return () => { cancelled = true; };
    }, [productId]);

    useEffect(() => {
        if (loading || !product || parseProductId(product.id ?? product.product_id) !== parseProductId(productId)) return;
        const visit = viewVisitRef.current;
        const recordWhenVisible = () => {
            if (document.visibilityState === "visible") void visit?.record();
        };
        recordWhenVisible();
        document.addEventListener("visibilitychange", recordWhenVisible);
        return () => document.removeEventListener("visibilitychange", recordWhenVisible);
    }, [loading, product, productId]);

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
