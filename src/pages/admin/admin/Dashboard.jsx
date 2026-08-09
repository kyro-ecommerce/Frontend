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
            <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-400 font-medium text-xs">
                        Đang tải dữ liệu dashboard...
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-center font-semibold text-xs">
                        {error}
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto space-y-4">
                        <DashboardStats productStats={dashboardData.productStats} orderStats={dashboardData.orderStats} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                            {/* Left Column */}
                            <div className="lg:col-span-2 space-y-4">
                                <RevenueByTime
                                    initialData={dashboardData.revenueChartData}
                                    isLoading={isChartLoading}
                                    onDateChange={fetchRevenueForRange}
                                    orderStats={dashboardData.orderStats}
                                />
                                <RecentOrders orders={dashboardData.recentOrders} />
                            </div>

                            {/* Right Column */}
                            <div className="lg:col-span-1 space-y-4">
                                <RevenueByCategory data={dashboardData.categoryRevenue} />
                                <TopSellingProducts products={dashboardData.topSellingProducts} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;