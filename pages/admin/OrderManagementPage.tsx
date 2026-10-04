import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { Eye, Edit, Search, ShoppingCart, RotateCcw, Calendar, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import OrderDetailModal from '../../components/admin/OrderDetailModal';
import OrderStatusModal from '../../components/admin/OrderStatusModal';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';

const statusBadgeStyles: { [key in OrderStatus]: string } = {
  Pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  Confirmed: 'bg-cyan-500/15 text-neon-cyan border border-neon-cyan/30',
  Shipped: 'bg-emerald-500/15 text-neon-emerald border border-neon-emerald/30',
  Cancelled: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
};

const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters state
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 400);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ data: Order[] }>('/order');
      setOrders(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshTrigger]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      const customerMatch = searchTerm
        ? (order.User?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
           order.User?.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
           order.id.toString().includes(lowerCaseSearchTerm))
        : true;

      const statusMatch = statusFilter ? order.status === statusFilter : true;
      const orderDate = new Date(order.order_date);
      const startDateMatch = startDate ? orderDate >= new Date(startDate) : true;
      const endDateMatch = endDate ? orderDate <= new Date(new Date(endDate).setUTCHours(23, 59, 59, 999)) : true;
      
      return customerMatch && statusMatch && startDateMatch && endDateMatch;
    });
  }, [orders, searchTerm, statusFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, startDate, endDate]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    try {
      await api.put(`/order/${selectedOrder.id}`, { status: newStatus });
      setIsStatusModalOpen(false);
      setSelectedOrder(null);
      setRefreshTrigger(t => t + 1);
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert('Cập nhật trạng thái đơn hàng thất bại. Vui lòng thử lại.');
    }
  };

  const resetFilters = () => {
    setInputValue('');
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="text-neon-cyan" size={26} />
            <span>Quản Lý Đơn Đặt Hàng</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Theo dõi tiến trình thanh toán, vận chuyển và cập nhật trạng thái đơn
          </p>
        </div>
      </div>
      
      {/* Filters Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/90 shadow-xl flex flex-wrap gap-3 items-center">
        <div className="relative flex-grow min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Tìm theo tên khách, email, mã đơn..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as OrderStatus | '')}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-neon-cyan cursor-pointer min-w-[150px]"
        >
          <option value="" className="bg-slate-950">Tất cả trạng thái</option>
          <option value="Pending" className="bg-slate-950">Pending (Chờ duyệt)</option>
          <option value="Confirmed" className="bg-slate-950">Confirmed (Đã xác nhận)</option>
          <option value="Shipped" className="bg-slate-950">Shipped (Đang giao)</option>
          <option value="Cancelled" className="bg-slate-950">Cancelled (Đã hủy)</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-neon-cyan"
            title="Từ ngày"
          />
          <span className="text-slate-500 font-mono">-</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-neon-cyan"
            title="Đến ngày"
          />
        </div>

        {(inputValue || statusFilter || startDate || endDate) && (
          <button 
            onClick={resetFilters} 
            className="p-2.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
            title="Xóa bộ lọc"
          >
            <RotateCcw size={15} />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-center text-xs">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden p-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[11px] uppercase bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Mã Đơn</th>
                  <th scope="col" className="px-5 py-3.5">Khách Hàng</th>
                  <th scope="col" className="px-5 py-3.5">Ngày Đặt</th>
                  <th scope="col" className="px-5 py-3.5">Tổng Tiền</th>
                  <th scope="col" className="px-5 py-3.5">Trạng Thái</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/50 font-mono">
                {currentOrders.length > 0 ? currentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-850 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">#{order.id}</td>
                    <td className="px-5 py-3.5 font-sans">
                      <div className="font-semibold text-white">{order.User?.name || 'Khách vãng lai'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{order.User?.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(order.order_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-neon-cyan">
                      {parseFloat(order.total_amount).toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${statusBadgeStyles[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewDetails(order)} 
                          className="p-1.5 rounded-lg bg-slate-800 text-neon-cyan hover:bg-slate-700 transition-colors" 
                          title="Xem chi tiết đơn hàng"
                        >
                          <Eye size={15} />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(order)} 
                          className="p-1.5 rounded-lg bg-slate-800 text-neon-emerald hover:bg-slate-700 transition-colors" 
                          title="Cập nhật trạng thái"
                        >
                          <Edit size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 font-sans">
                      Không tìm thấy đơn hàng nào khớp với điều kiện lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 pt-2">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
      
      {selectedOrder && (
        <>
          <OrderDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            order={selectedOrder}
          />
          <OrderStatusModal
            isOpen={isStatusModalOpen}
            onClose={() => setIsStatusModalOpen(false)}
            order={selectedOrder}
            onSave={handleSaveStatus}
          />
        </>
      )}
    </div>
  );
};

export default OrderManagementPage;