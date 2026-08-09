import React from 'react';

const categoryNameMap = {
    "Laptop": "Laptop",
    "Phone": "Điện thoại",
    "Mobile": "Điện thoại",
    "Tablet": "Máy tính bảng",
    "Desktop-Computers": "Máy tính để bàn",
    "Desktop": "Máy tính để bàn",
    "Accessories": "Phụ kiện",
    "Accessory": "Phụ kiện",
    "Smartwatch": "Đồng hồ thông minh",
    "Watch": "Đồng hồ thông minh",
    "Audio": "Thiết bị âm thanh",
    "Camera": "Máy ảnh",
    "Uncategorized": "Chưa phân loại",
    "Other-Products": "Khác"
};

const translateCategoryName = (name) => {
    if (!name) return "Chưa phân loại";
    if (categoryNameMap[name]) return categoryNameMap[name];
    const lower = String(name).toLowerCase();
    for (const [key, val] of Object.entries(categoryNameMap)) {
        if (key.toLowerCase() === lower) return val;
    }
    return name;
};

const RevenueByCategory = ({ data = {} }) => {
    // Chuyển đổi dữ liệu từ nhiều định dạng có thể có
    let storeData = [];

    if (typeof data === 'object' && data !== null) {
        const categoryMap = data.categoryRevenue || data.categories || data;
        
        if (typeof categoryMap === 'object' && categoryMap !== null) {
            const entries = Object.entries(categoryMap);
            // Tính tổng doanh thu
            const totalSum = entries.reduce((sum, [, val]) => {
                const amount = typeof val === 'number' ? val : (val?.value || val?.revenue || 0);
                return sum + amount;
            }, 0);

            // Gom nhóm theo tên tiếng Việt đã dịch
            const aggregated = {};
            entries.forEach(([name, info]) => {
                const vnName = translateCategoryName(name);
                const revenue = typeof info === 'number' ? info : (info?.value || info?.revenue || 0);
                aggregated[vnName] = (aggregated[vnName] || 0) + revenue;
            });

            storeData = Object.entries(aggregated).map(([name, revenue]) => {
                const percentage = totalSum > 0 ? (revenue / totalSum) * 100 : 0;
                return { name, revenue, percentage };
            });
        }
    }

    if (storeData.length === 0) {
        storeData = [{ name: "Chưa có dữ liệu", percentage: 100, revenue: 0 }];
    }

    let displayData = [...storeData];
    const otherIndex = displayData.findIndex(item => item.name === "Khác");
    let otherItem = null;

    if (otherIndex !== -1) {
        otherItem = displayData.splice(otherIndex, 1)[0];
    }

    displayData.sort((a, b) => b.percentage - a.percentage);

    if (otherItem) {
        displayData.push(otherItem);
    }

    const colors = ["#1D7461", "#0D9488", "#14B8A6", "#2DD4BF", "#5EEAD4", "#99F6E4", "#CCFBF1"];

    // Tạo biểu đồ Donut dạng SVG khéo léo
    const createDonutChartSegments = () => {
        let total = displayData.reduce((sum, item) => sum + item.percentage, 0);
        if (total === 0) total = 100;

        let startAngle = 0;
        const outerR = 45;
        const innerR = 30; // Donut hole radius

        return displayData.map((item, index) => {
            const percentage = item.percentage / total;
            const angle = percentage * Math.PI * 2;
            const endAngle = startAngle + angle;

            const x1_out = 50 + outerR * Math.cos(startAngle);
            const y1_out = 50 + outerR * Math.sin(startAngle);
            const x2_out = 50 + outerR * Math.cos(endAngle);
            const y2_out = 50 + outerR * Math.sin(endAngle);

            const x1_in = 50 + innerR * Math.cos(endAngle);
            const y1_in = 50 + innerR * Math.sin(endAngle);
            const x2_in = 50 + innerR * Math.cos(startAngle);
            const y2_in = 50 + innerR * Math.sin(startAngle);

            const largeArcFlag = angle > Math.PI ? 1 : 0;
            const path = `M${x1_out},${y1_out} A${outerR},${outerR} 0 ${largeArcFlag},1 ${x2_out},${y2_out} L${x1_in},${y1_in} A${innerR},${innerR} 0 ${largeArcFlag},0 ${x2_in},${y2_in} Z`;

            const segment = (
                <path
                    key={index}
                    d={path}
                    fill={colors[index % colors.length]}
                    className="hover:opacity-85 transition-opacity cursor-pointer"
                />
            );

            startAngle = endAngle;
            return segment;
        });
    };

    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col">
            <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 m-0 mb-1">
                    Doanh thu theo danh mục
                </h3>
                <p className="text-xs text-slate-400 font-medium m-0 mb-3">Tỷ lệ đóng góp doanh số theo loại sản phẩm</p>

                {/* Center Donut SVG */}
                <div className="relative w-32 h-32 mx-auto mb-3 flex items-center justify-center">
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                        {createDonutChartSegments()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Danh mục</span>
                        <span className="text-sm font-extrabold text-slate-800">{displayData.length}</span>
                    </div>
                </div>

                {/* Legend items with progress bar */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-hide">
                    {displayData.map((item, index) => {
                        const color = colors[index % colors.length];
                        return (
                            <div key={index} className="group">
                                <div className="flex justify-between items-center text-xs mb-1">
                                    <span className="flex items-center gap-2 font-semibold text-slate-700 truncate max-w-35">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                                        <span className="capitalize truncate">{item.name}</span>
                                    </span>
                                    <span className="font-extrabold text-slate-900">{item.percentage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: color }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RevenueByCategory;