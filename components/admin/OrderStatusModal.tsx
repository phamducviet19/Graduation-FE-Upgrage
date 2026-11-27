import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newStatus: OrderStatus) => Promise<void>;
  order: Order | null;
}

const statusLabels: Record<OrderStatus, string> = {
  Pending: 'Chờ xử lý (Pending)',
  Confirmed: 'Đã xác nhận (Confirmed)',
  Shipped: 'Đang giao hàng (Shipped)',
  Cancelled: 'Đã hủy đơn (Cancelled)',
};

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({ isOpen, onClose, onSave, order }) => {
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setNewStatus(order.status);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(newStatus);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Cancelled'];
  const isShipped = order.status === 'Shipped';
  const isCancelled = order.status === 'Cancelled';

  const isStatusDisabled = (status: OrderStatus): boolean => {
    if (isShipped || isCancelled) return true;
    if (order.status === 'Pending' && status === 'Shipped') return true;
    if (order.status === 'Confirmed' && status === 'Pending') return true;
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="text-neon-cyan" size={20} />
            <span>Cập Nhật Trạng Thái Đơn Hàng</span>
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" 
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
              <p className="text-slate-400">Mã đơn hàng: <strong className="text-neon-cyan">#{order.id}</strong></p>
              <p className="text-slate-400">Trạng thái hiện tại: <strong className="text-white">{statusLabels[order.status] || order.status}</strong></p>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Trạng thái mới
              </label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-neon-cyan disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed"
                disabled={isShipped || isCancelled}
              >
                {availableStatuses.map(status => (
                  <option
                    key={status}
                    value={status}
                    disabled={isStatusDisabled(status)}
                    className="bg-slate-900 disabled:text-slate-600"
                  >
                    {statusLabels[status] || status}
                    {order.status === 'Pending' && status === 'Shipped' ? ' (Cần Confirmed trước)' : ''}
                  </option>
                ))}
              </select>
              {order.status === 'Pending' && (
                <p className="text-slate-400 text-xs mt-2 font-sans">
                  Lưu ý: Đơn hàng đang chờ xử lý phải chuyển sang <strong className="text-neon-cyan">Confirmed</strong> trước khi chuyển sang <strong className="text-neon-emerald">Shipped</strong>.
                </p>
              )}
              {isShipped && (
                <p className="text-amber-400 text-xs mt-2 flex items-center gap-1 font-sans">
                  <AlertTriangle size={14} /> Đơn hàng đã giao thành công không thể đổi trạng thái.
                </p>
              )}
              {isCancelled && (
                <p className="text-rose-400 text-xs mt-2 flex items-center gap-1 font-sans">
                  <AlertTriangle size={14} /> Đơn hàng đã hủy không thể đổi trạng thái.
                </p>
              )}
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || newStatus === order.status || isShipped || isCancelled} 
              className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold text-dark-base bg-neon-cyan hover:bg-highlight shadow-neon-cyan transition-all disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'ĐANG LƯU...' : 'LƯU TRẠNG THÁI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderStatusModal;