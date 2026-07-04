import { useState, useEffect, useCallback } from "react";
import { dashboardService, productService } from "../services/index.js";
import { formatCurrency } from "../utils/format.js";

export const useAnalytics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [summary, setSummary] = useState({
        totalProducts: 0,
        totalSales: 0
    });
    const [topProducts, setTopProducts] = useState([]);


    // Hàm fetch tất cả dữ liệu phân tích
    const fetchAnalyticsData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 1. Lấy dữ liệu doanh thu theo tháng
            try {
                const salesResponse = await dashboardService.getMonthlyRevenue();
                if (salesResponse.status === 200) {
                    setSalesData(salesResponse.data.data.monthlyData || []);
                }
            } catch (err) {
                console.warn("Không thể tải dữ liệu doanh thu theo tháng:", err);
            }

            // 2. Lấy dữ liệu doanh thu theo danh mục
            try {
                const categoryResponse = await dashboardService.getRevenueDistribution();
                if (categoryResponse.status === 200) {
                    setCategoryData(categoryResponse.data.data || {});
                }
            } catch (err) {
                console.warn("Không thể tải dữ liệu phân bổ doanh thu:", err);
            }

            // 3. Lấy dữ liệu sản phẩm và tính toán tổng số, tổng doanh thu
            try {
                const productsResponse = await productService.getAllProducts();
                if (productsResponse.status === 200) {
                    const products = productsResponse.data.data || [];

                    // Tính tổng số sản phẩm
                    const totalProducts = products.length;

                    // Tính tổng doanh thu và xử lý dữ liệu top products
                    let totalSales = 0;
                    const processedProducts = products.map(product => {
                        const price = product.discountedPrice || product.price || 0;
                        const quantitySold = product.quantitySold || 0;
                        const totalSalesProduct = price * quantitySold;

                        // Cộng vào tổng doanh thu
                        totalSales += totalSalesProduct;

                        return {
                            id: product.id,
                            name: product.title,
                            price: price,
                            quantitySold: quantitySold,
                            totalSales: totalSalesProduct,
                            category: product.category?.name || "Chưa phân loại"
                        };
                    });

                    // Sắp xếp theo doanh thu giảm dần
                    processedProducts.sort((a, b) => b.totalSales - a.totalSales);

                    // Cập nhật state
                    setSummary({
                        totalProducts,
                        totalSales
                    });

                    setTopProducts(processedProducts);
                }
            } catch (err) {
                console.warn("Không thể tải dữ liệu sản phẩm:", err);
            }
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu phân tích:", err);
            setError("Không thể tải dữ liệu phân tích. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Gọi hàm fetch khi hook được sử dụng lần đầu
    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    // Trả về tất cả dữ liệu và hàm cần thiết
    return {
        isLoading,
        error,
        salesData,
        categoryData,
        summary,
        topProducts,
        formatCurrency,
        refreshData: fetchAnalyticsData // Hàm để làm mới dữ liệu khi cần
    };
};