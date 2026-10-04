import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { DollarSign, Package, Users, ShoppingCart, TrendingUp, Award, Layers } from 'lucide-react';
import api from '../../services/api';
import { RevenueData, TopProductData, OrderStatusData, TopCustomerData, OrderPercentageData, OrderStatus } from '../../types';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

const COLORS = ['#00F0FF', '#3B82F6', '#A855F7', '#10B981', '#F43F5E'];

const DashboardPage: React.FC = () => {
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusData[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomerData[]>([]);
  const [orderPercentage, setOrderPercentage] = useState<{ status: OrderStatus; percentage: number; }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          revenueRes,
          topProductsRes,
          orderStatusRes,
          topCustomersRes,
          orderPercentageRes,
        ] = await Promise.all([
          api.get<{data: RevenueData[]}>('/statistics/revenue'),
          api.get<{data: TopProductData[]}>('/statistics/top-products'),
          api.get<{data: OrderStatusData[]}>('/statistics/orders-status'),
          api.get<{data: TopCustomerData[]}>('/statistics/top-customers'),
          api.get<{data: OrderPercentageData[]}>('/statistics/order-percentage'),
        ]);

        setRevenue(revenueRes.data || []);
        setTopProducts(topProductsRes.data || []);
        setOrderStatus(orderStatusRes.data || []);
        setTopCustomers(topCustomersRes.data || []);
        const rawPercentages = orderPercentageRes.data || [];
        setOrderPercentage(rawPercentages.map((d: any) => ({...d, percentage: parseFloat(d.percentage)})));
      } catch (err: any) {
        setError(err.message || 'Không thể tải dữ liệu thống kê tổng quan.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const totalRevenue = revenue.reduce((acc, item) => acc + parseFloat(item.total_revenue || '0'), 0);
  const totalOrders = orderStatus.reduce((acc, item) => acc + parseInt(item.count || '0', 10), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Spinner />
        <p className="text-xs font-mono text-slate-400">ĐANG TẢI DỮ LIỆU COMMAND CENTER...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-500/10 border border-rose-500/30 rounded-3xl text-center text-rose-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp className="text-neon-cyan" size={28} />
            <span>Trung Tâm Điều Khiển Bán Hàng</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Số liệu thời gian thực về doanh số, đơn hàng và phân bố kho hàng
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-neon-emerald"></span>
          <span>Dữ liệu tự động đồng bộ</span>
        </div>
      </div>
      
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card 
          title="Tổng Doanh Thu" 
          value={`${Math.round(totalRevenue).toLocaleString('vi-VN')} ₫`} 
          icon={<DollarSign className="text-neon-emerald" size={26} />} 
          color="text-neon-emerald"
        />
        <Card 
          title="Tổng Đơn Hàng" 
          value={totalOrders} 
          icon={<ShoppingCart className="text-neon-cyan" size={26} />} 
          color="text-neon-cyan"
        />
        <Card 
          title="Top Linh Kiện Bán Chạy" 
          value={topProducts.length} 
          icon={<Package className="text-neon-purple" size={26} />} 
          color="text-neon-purple"
        />
        <Card 
          title="Khách Hàng Thân Thiết" 
          value={topCustomers.length} 
          icon={<Users className="text-neon-rose" size={26} />} 
          color="text-neon-rose"
        />
      </div>
      
      {/* Charts Section Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-neon-cyan" />
              <span>Biến Động Doanh Thu Theo Ngày</span>
            </h2>
            <span className="text-[10px] font-mono text-neon-cyan bg-cyan-500/10 px-2 py-0.5 rounded border border-neon-cyan/20">
              VNĐ
            </span>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} fontStyle="mono" />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `${(Number(val) / 1000000).toFixed(0)}M`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid #1E293B', borderRadius: '12px', fontSize: '12px', color: '#F8FAFC' }}
                formatter={(value: any) => [`${parseFloat(value).toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="total_revenue" name="Doanh thu" stroke="#00F0FF" strokeWidth={3} dot={{ fill: '#00F0FF', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Order Status Pie Chart */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-neon-purple" />
              <span>Tỷ Lệ Trạng Thái Đơn Hàng</span>
            </h2>
            <span className="text-[10px] font-mono text-neon-purple bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Distribution
            </span>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderPercentage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name || ''}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="percentage"
                nameKey="status"
              >
                {orderPercentage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid #1E293B', borderRadius: '12px', fontSize: '12px', color: '#F8FAFC' }}
                formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'Tỷ lệ']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Section Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award size={18} className="text-yellow-400" />
              <span>Top Sản Phẩm Bán Chạy Nhất</span>
            </h2>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B"/>
              <XAxis type="number" stroke="#64748B" fontSize={11} />
              <YAxis dataKey="Product.name" type="category" stroke="#64748B" width={140} fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid #1E293B', borderRadius: '12px', fontSize: '12px', color: '#F8FAFC' }}
                formatter={(val: any) => [`${val} chiếc`, 'Đã bán']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="total_sold" fill="#A855F7" name="Số lượng bán ra" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Top Customers Table */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-neon-emerald" />
              <span>Top Khách Hàng Chi Tiêu Lớn</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-800 uppercase font-mono text-slate-400">
                <tr>
                  <th className="py-3 px-3">Khách hàng</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3 text-right">Tổng chi tiêu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {topCustomers.map(customer => (
                  <tr key={customer.user_id} className="hover:bg-slate-850 transition-colors">
                    <td className="py-3 px-3 font-bold text-white font-sans">{customer.User.name}</td>
                    <td className="py-3 px-3 text-slate-400">{customer.User.email}</td>
                    <td className="py-3 px-3 text-right font-black text-neon-cyan">
                      {parseFloat(customer.total_spent).toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default DashboardPage;