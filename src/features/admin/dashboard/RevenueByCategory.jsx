import React from 'react';

const RevenueByCategory = ({ data = {} }) => {
    // Hàm xử lý khi click vào một mục danh mục
    const handleItemClick = (name, percentage) => {
        console.log(`Clicked on: ${name} (${percentage.toFixed(1)}%)`);
        // Có thể mở modal chi tiết hoặc navigate đến trang phân tích cụ thể
    };

    // Chuyển đổi dữ liệu từ nhiều định dạng có thể có
    let storeData = [];

    if (typeof data === 'object' && data !== null) {
        if (data.categories) {
            // Nếu data có cấu trúc { categories: {...} }
            storeData = Object.entries(data.categories).map(([name, info]) => ({
                name,
                percentage: info.percentage || 0,
                revenue: info.value || 0
            }));
        } else {
            // Nếu data là đối tượng với các cặp key-value trực tiếp
            storeData = Object.entries(data).map(([name, info]) => ({
                name,
                percentage: typeof info === 'object' ? (info.percentage || 0) : 0,
                revenue: typeof info === 'object' ? (info.value || 0) : 0
            }));
        }
    }

    // Nếu không có dữ liệu, hiển thị một mục mặc định
    if (storeData.length === 0) {
        storeData = [{ name: "Chưa có dữ liệu", percentage: 100, revenue: 0 }];
    }

    // Xử lý dữ liệu để đảm bảo "Khác" luôn ở cuối
    let displayData = [...storeData];

    // Tìm và loại bỏ phần tử "Khác" (nếu có)
    const otherIndex = displayData.findIndex(item => item.name === "Khác");
    let otherItem = null;

    if (otherIndex !== -1) {
        otherItem = displayData.splice(otherIndex, 1)[0];
    }

    // Sắp xếp các phần tử còn lại theo phần trăm giảm dần
    displayData.sort((a, b) => b.percentage - a.percentage);

    // Thêm lại phần tử "Khác" vào cuối danh sách
    if (otherItem) {
        displayData.push(otherItem);
    }

    // Màu sắc cho biểu đồ tròn
    const colors = ["#4A6CF7", "#6366F1", "#8B5CF6", "#EC4899", "#F97316", "#10B981", "#3B82F6"];

    // Tính toán các phần của biểu đồ tròn
    const createPieChartSegments = () => {
        let total = displayData.reduce((sum, item) => sum + item.percentage, 0);
        if (total === 0) total = 100; // Tránh chia cho 0

        let startAngle = 0;
        return displayData.map((item, index) => {
            const percentage = item.percentage / total;
            const angle = percentage * Math.PI * 2;
            const endAngle = startAngle + angle;

            const x1 = 50 + 45 * Math.cos(startAngle);
            const y1 = 50 + 45 * Math.sin(startAngle);
            const x2 = 50 + 45 * Math.cos(endAngle);
            const y2 = 50 + 45 * Math.sin(endAngle);

            const largeArcFlag = angle > Math.PI ? 1 : 0;
            const path = `M50,50 L${x1},${y1} A45,45 0 ${largeArcFlag},1 ${x2},${y2} Z`;
            const segment = (
                <path key={index} d={path} fill={colors[index % colors.length]}/>
            );

            startAngle = endAngle;
            return segment;
        });
    };

    return (
        <div className="bg-white rounded-lg p-5 shadow-sm h-full">
            <div className="text-base font-semibold mb-5">Doanh thu theo danh mục</div>
            <div className="w-37.5 h-37.5 mx-auto mb-6">
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                    {createPieChartSegments()}
                </svg>
            </div>

            <ul className="list-none p-0 m-0">
                {displayData.map((item, index) => (
                    <li key={index}
                        className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleItemClick(item.name, item.percentage)}
                    >
                        <span className="flex items-center">
                            <span
                                className="inline-block w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: colors[index % colors.length] }}
                            ></span>
                            {item.name}
                        </span>
                        <span className="font-semibold">{item.percentage.toFixed(1)}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RevenueByCategory;