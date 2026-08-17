import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { productService } from "../../services/user/product.service";

export const useProductDetailPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentAverageRating, setCurrentAverageRating] = useState(0);
    const [currentTotalReviews, setCurrentTotalReviews] = useState(0);

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
