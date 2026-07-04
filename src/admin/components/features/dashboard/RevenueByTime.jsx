import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../styles/admin/dashboard/overview.css';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`${label}`}</p>
                <p className="info">{`Doanh thu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payload[0].value)}`}</p>
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
        <div className="revenue-chart-container">
            <div className="chart-header">
                <h3 className="chart-title">{title}</h3>
                <div className="date-range-picker">
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        dateFormat="dd/MM/yyyy"
                        className="date-input"
                    />
                    <span>đến</span>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        dateFormat="dd/MM/yyyy"
                        className="date-input"
                    />
                    <button onClick={handleFilterClick} className="filter-btn" disabled={isLoading}>
                        {isLoading ? 'Đang tải...' : 'Xem'}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="loading-message">Đang tải dữ liệu biểu đồ...</div>
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
                <p className="no-data-message">Không có dữ liệu doanh thu trong khoảng thời gian này.</p>
            )}
        </div>
    );
};

export default RevenueByTime;