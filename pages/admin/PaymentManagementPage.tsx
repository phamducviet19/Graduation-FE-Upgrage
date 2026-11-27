import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../services/api';
import { Payment } from '../../types';
import { Search, CreditCard, RotateCcw, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';

const paymentStatusStyles: { [key: string]: string } = {
  Completed: 'bg-emerald-500/15 text-neon-emerald border border-neon-emerald/30',
  Success: 'bg-emerald-500/15 text-neon-emerald border border-neon-emerald/30',
  Pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  Failed: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
};

const PaymentManagementPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 400);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ success: boolean; data: Payment[] }>('/payment');
      setPayments(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải lịch sử thanh toán.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments, refreshTrigger]);

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      const matchesSearch = searchTerm
        ? (payment.order_id.toString().includes(lowerCaseSearchTerm) ||
           payment.amount.includes(lowerCaseSearchTerm) ||
           payment.method.toLowerCase().includes(lowerCaseSearchTerm))
        : true;

      const matchesStatus = statusFilter ? payment.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const currentPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="text-neon-emerald" size={26} />
            <span>Lịch Sử Giao Dịch & Thanh Toán</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Giao dịch cổng VNPay, chuyển khoản ngân hàng và COD
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-800/90 shadow-xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, phương thức, số tiền..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-neon-cyan cursor-pointer"
        >
          <option value="" className="bg-slate-950">Tất cả trạng thái</option>
          <option value="Success" className="bg-slate-950">Success (Thành công)</option>
          <option value="Pending" className="bg-slate-950">Pending (Đang chờ)</option>
          <option value="Failed" className="bg-slate-950">Failed (Thất bại)</option>
        </select>

        {(inputValue || statusFilter) && (
          <button 
            onClick={() => { setInputValue(''); setStatusFilter(''); }} 
            className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw size={14} />
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
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-800/90 shadow-2xl p-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[11px] uppercase bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Mã GD</th>
                  <th scope="col" className="px-5 py-3.5">Mã Đơn</th>
                  <th scope="col" className="px-5 py-3.5">Phương Thức</th>
                  <th scope="col" className="px-5 py-3.5">Số Tiền</th>
                  <th scope="col" className="px-5 py-3.5">Thời Gian</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/50 font-mono">
                {currentPayments.length > 0 ? currentPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-850 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500">#{payment.id}</td>
                    <td className="px-5 py-3.5 font-bold text-white">#{payment.order_id}</td>
                    <td className="px-5 py-3.5 font-sans font-medium text-slate-200 uppercase">
                      {payment.method}
                    </td>
                    <td className="px-5 py-3.5 font-black text-neon-emerald">
                      {parseFloat(payment.amount).toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {payment.payment_date ? new Date(payment.payment_date).toLocaleString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${paymentStatusStyles[payment.status] || 'bg-slate-800 text-slate-300'}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 font-sans">
                      Không tìm thấy giao dịch nào.
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
    </div>
  );
};

export default PaymentManagementPage;