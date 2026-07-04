import { Navigate } from "react-router-dom";
import DashboardStats from "../../components/features/dashboard/DashboardStats";
import RecentOrders from "../../components/features/dashboard/RecentOrders";
import RevenueByCategory from "../../components/features/dashboard/RevenueByCategory.jsx";
import RevenueByTime from "../../components/features/dashboard/RevenueByTime.jsx";
import TopSellingProducts from "../../components/features/dashboard/TopSellingProducts";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useDashboard} from "../../hooks/useDashboard.jsx";
import "../../styles/admin/dashboard/dashboard.css";

const Dashboard = () => {
    const { user, loading, isAdmin } = useAuth();
    const { dashboardData, isLoading, error, isChartLoading, fetchRevenueForRange } = useDashboard();

    // Nếu đang tải thông tin người dùng
    if (loading) {
        return <div>Đang tải...</div>;
    }

    // Nếu người dùng không đăng nhập hoặc không phải admin
    if (!user || !isAdmin()) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Layout>
            <div className="content-wrapper">
                {isLoading ? (
                    <div className="loading-message" style={{ textAlign: 'center', padding: '50px' }}>
                        Đang tải dữ liệu dashboard...
                    </div>
                ) : error ? (
                    <div className="error-message" style={{ textAlign: 'center', padding: '30px', color: 'var(--red-color)' }}>
                        {error}
                    </div>
                ) : (
                    <>
                        <DashboardStats stats={dashboardData.productStats} />

                        <div className="dashboard-grid">
                            <RevenueByTime
                                initialData={dashboardData.revenueChartData}
                                isLoading={isChartLoading}
                                onDateChange={fetchRevenueForRange}
                            />
                            <RevenueByCategory data={dashboardData.categoryRevenue} />
                        </div>

                        <div className="dashboard-grid">
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