import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
                <p className="font-semibold text-gray-700 mb-1 m-0">{`${label}`}</p>
                <p className="text-blue-600 m-0">{`Doanh thu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payload[0].value)}`}</p>
            </div>
        );
    }
    return null;
};

const formatDate = (date) => date.toISOString().split('T')[0];

const RevenueByTime = ({ initialData = [], isLoading, onDateChange }) => {
    const [chartData, setChartData] = useState(initialData);

    // State cho date picker
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 6);
    const [startDate, setStartDate] = useState(lastWeek);
    const [endDate, setEndDate] = useState(today);

    useEffect(() => {
        setChartData(initialData);
    }, [initialData]);

    const handleFilterClick = () => {
        // Gọi hàm fetch từ hook với ngày đã chọn
        onDateChange(formatDate(startDate), formatDate(endDate));
    };

    const title = `Doanh thu theo khoảng thời gian`;

    return (
        <div className="bg-white rounded-lg p-5 shadow-sm h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
                <h3 className="text-base font-semibold m-0">{title}</h3>
                <div className="flex flex-wrap items-center gap-2">
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        dateFormat="dd/MM/yyyy"
                        className="p-2 border border-gray-300 rounded text-sm w-32 outline-none focus:border-blue-500"
                    />
                    <span className="text-gray-500 text-sm">đến</span>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        dateFormat="dd/MM/yyyy"
                        className="p-2 border border-gray-300 rounded text-sm w-32 outline-none focus:border-blue-500"
                    />
                    <button 
                        onClick={handleFilterClick} 
                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium cursor-pointer hover:bg-blue-700 disabled:opacity-50 transition-colors" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang tải...' : 'Xem'}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-gray-500">Đang tải dữ liệu biểu đồ...</div>
            ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(value) => value >= 1000000 ? `${value / 1000000}M` : value} tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-center py-10 text-gray-500 m-0">Không có dữ liệu doanh thu trong khoảng thời gian này.</p>
            )}
        </div>
    );
};

export default RevenueByTime;