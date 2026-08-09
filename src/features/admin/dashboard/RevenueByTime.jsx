import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatCurrency } from '../../../utils/admin/format.js';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 text-white p-3 rounded-2xl shadow-xl backdrop-blur-md border border-slate-700/50 text-xs">
                <p className="font-medium text-slate-400 mb-1">{`Ngày: ${label}`}</p>
                <p className="font-extrabold text-[#34D399] text-sm">{`Doanh thu: ${formatCurrency(payload[0].value)}`}</p>
            </div>
        );
    }
    return null;
};

const formatDate = (date) => date.toISOString().split('T')[0];

const RevenueByTime = ({ initialData = [], isLoading, onDateChange, orderStats = {} }) => {
    const safeData = Array.isArray(initialData) ? initialData : [];
    const [chartData, setChartData] = useState(safeData);

    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 6);
    const [startDate, setStartDate] = useState(lastWeek);
    const [endDate, setEndDate] = useState(today);

    useEffect(() => {
        setChartData(Array.isArray(initialData) ? initialData : []);
    }, [initialData]);

    const handleFilterClick = () => {
        onDateChange(formatDate(startDate), formatDate(endDate));
    };

    const completedRate = orderStats.totalOrders > 0
        ? Math.round(((orderStats.completedOrders || 0) / orderStats.totalOrders) * 100)
        : 0;

    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-3">
                <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight m-0">
                        Doanh thu theo thời gian
                    </h3>
                    <p className="text-xs text-slate-400 font-medium m-0 mt-0.5">Biến động doanh số bán hàng theo ngày</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            dateFormat="dd/MM/yyyy"
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 w-28 outline-none focus:ring-2 focus:ring-[#1D7461]/20 text-center"
                        />
                        <span className="text-slate-400 text-xs font-bold">đến</span>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            dateFormat="dd/MM/yyyy"
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 w-28 outline-none focus:ring-2 focus:ring-[#1D7461]/20 text-center"
                        />
                    </div>
                    <button 
                        onClick={handleFilterClick} 
                        className="px-3.5 py-1.5 bg-[#1D7461] hover:bg-[#136050] text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm shadow-[#1D7461]/20 border-none disabled:opacity-50" 
                        disabled={isLoading}
                    >
                        Lọc
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className="w-full">
                {isLoading ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-medium">Đang tải biểu đồ...</div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <YAxis
                                tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val}
                                tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="revenue" radius={[8, 8, 0, 0]} maxBarSize={48}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#1D7461' : '#2DD4BF'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center py-12 text-slate-400 text-xs font-medium">Không có dữ liệu doanh thu trong khoảng thời gian này.</div>
                )}
            </div>
        </div>
    );
};

export default RevenueByTime;