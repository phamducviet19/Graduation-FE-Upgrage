import React from 'react';
import { createPortal } from 'react-dom';
import { Order, OrderStatus } from '../../types';
import { X, ShoppingBag, MapPin, Calendar, FileText, XCircle } from 'lucide-react';

interface ClientOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onCancelOrder?: (order: Order) => void;
}

const statusBadgeStyles: Record<OrderStatus, string> = {
  Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Confirmed: 'bg-cyan-500/15 text-neon-cyan border-neon-cyan/30',
  Shipped: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Cancelled: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

const statusLabels: Record<OrderStatus, string> = {
  Pending: 'Pending (Chờ xử lý)',
  Confirmed: 'Confirmed (Đã xác nhận)',
  Shipped: 'Shipped (Đang giao hàng)',
  Cancelled: 'Cancelled (Đã hủy)',
};

const ClientOrderDetailModal: React.FC<ClientOrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onCancelOrder,
}) => {
  if (!isOpen || !order) return null;

  const canCancel = order.status === 'Pending' || order.status === 'Confirmed';

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 text-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 sm:p-8"
        style={{ maxWidth: '42rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-4 mb-6 pb-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="text-neon-cyan" size={22} />
                <span>Chi Tiết Đơn Hàng</span>
                <span className="font-mono text-neon-cyan font-bold">#{order.id}</span>
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusBadgeStyles[order.status]}`}
              >
                {statusLabels[order.status] || order.status}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1.5 flex items-center gap-1.5">
              <Calendar size={13} />
              <span>Ngày đặt: {new Date(order.order_date).toLocaleString('vi-VN')}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 space-y-5">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-1.5">
            <h3 className="text-xs font-mono font-bold text-neon-cyan uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <MapPin size={14} />
              <span>Địa Chỉ Giao Hàng</span>
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {order.shipping_address || 'Chưa cập nhật'}
            </p>
          </div>

          {order.notes && (
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-1">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <FileText size={14} />
                <span>Ghi Chú Đơn Hàng</span>
              </h3>
              <p className="text-xs italic text-slate-300">"{order.notes}"</p>
            </div>
          )}

          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
              Danh Sách Linh Kiện ({order.OrderDetails?.length || 0})
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase font-mono bg-slate-950 border-b border-slate-800">
                  <tr>
                    <th scope="col" className="px-4 py-3">Linh Kiện</th>
                    <th scope="col" className="px-4 py-3 text-center">SL</th>
                    <th scope="col" className="px-4 py-3 text-right">Đơn Giá</th>
                    <th scope="col" className="px-4 py-3 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {order.OrderDetails?.map((detail) => (
                    <tr key={detail.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="px-4 py-3 font-sans font-medium text-slate-100">
                        {detail.Product?.name || 'Sản phẩm'}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-white">
                        {detail.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400">
                        {parseFloat(detail.price).toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-neon-cyan">
                        {(detail.quantity * parseFloat(detail.price)).toLocaleString('vi-VN')} ₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-sm font-semibold text-slate-300">Tổng thanh toán</span>
            <span className="text-xl font-mono font-extrabold text-neon-cyan">
              {parseFloat(order.total_amount).toLocaleString('vi-VN')} ₫
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap justify-end gap-3 flex-shrink-0">
          {canCancel && onCancelOrder && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onCancelOrder(order);
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
            >
              <XCircle size={15} />
              <span>Hủy đơn hàng</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default ClientOrderDetailModal;
