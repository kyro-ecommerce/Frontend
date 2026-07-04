import { Navigate } from "react-router-dom";
import DashboardStats from "../../../features/admin/dashboard/DashboardStats";
import RecentOrders from "../../../features/admin/dashboard/RecentOrders";
import RevenueByCategory from "../../../features/admin/dashboard/RevenueByCategory.jsx";
import RevenueByTime from "../../../features/admin/dashboard/RevenueByTime.jsx";
import TopSellingProducts from "../../../features/admin/dashboard/TopSellingProducts";
import Layout from "../../../layouts/admin/Layout";
import { useAuth } from "../../../hooks/admin/useAuth.jsx";
import { useDashboard} from "../../../hooks/admin/useDashboard.jsx";

const Dashboard = () => {
    const { user, loading, isAdmin } = useAuth();
    const { dashboardData, isLoading, error, isChartLoading, fetchRevenueForRange } = useDashboard();

    // Nếu đang tải thông tin người dùng
    if (loading) {
        return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
    }

    // Nếu người dùng không đăng nhập hoặc không phải admin
    if (!user || !isAdmin()) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Layout>
            <div className="p-6">
                {isLoading ? (
                    <div className="text-center p-12 text-gray-500 text-lg">
                        Đang tải dữ liệu dashboard...
                    </div>
                ) : error ? (
                    <div className="text-center p-8 text-red-500 font-medium">
                        {error}
                    </div>
                ) : (
                    <>
                        <DashboardStats stats={dashboardData.productStats} />

                        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3.75 mb-3.75 items-start">
                            <RevenueByTime
                                initialData={dashboardData.revenueChartData}
                                isLoading={isChartLoading}
                                onDateChange={fetchRevenueForRange}
                            />
                            <RevenueByCategory data={dashboardData.categoryRevenue} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3.75 mb-3.75 items-start">
                            <RecentOrders orders={dashboardData.recentOrders} />
                            <TopSellingProducts products={dashboardData.topSellingProducts} />
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;