import React from 'react';
import { Order } from '../../types';
import { X, User, ShoppingBag, MapPin, Calendar, FileText } from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-800 text-slate-200 rounded-3xl shadow-2xl w-full max-w-3xl p-6 sm:p-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="text-neon-cyan" size={22} />
              <span>Chi Tiết Đơn Hàng</span>
              <span className="font-mono text-neon-cyan font-bold">#{order.id}</span>
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">Thời gian đặt: {new Date(order.order_date).toLocaleString('vi-VN')}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" 
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto pr-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <h3 className="text-xs font-mono font-bold text-neon-cyan uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <User size={14} />
                <span>Thông Tin Khách Hàng</span>
              </h3>
              <p className="text-xs text-slate-300"><span className="text-slate-500">Họ và tên:</span> <strong className="text-white">{order.User?.name || 'Khách vãng lai'}</strong></p>
              <p className="text-xs text-slate-300"><span className="text-slate-500">Email:</span> <span className="font-mono text-slate-200">{order.User?.email}</span></p>
              <p className="text-xs text-slate-300"><span className="text-slate-500">Điện thoại:</span> <span className="font-mono text-slate-200">{order.User?.phone || 'Chưa cập nhật'}</span></p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <h3 className="text-xs font-mono font-bold text-neon-purple uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Calendar size={14} />
                <span>Tóm Tắt Đơn Hàng</span>
              </h3>
              <p className="text-xs text-slate-300"><span className="text-slate-500">Trạng thái:</span> <span className="font-bold text-white">{order.status}</span></p>
              <p className="text-xs text-slate-300"><span className="text-slate-500">Tổng thanh toán:</span> <strong className="font-mono text-neon-emerald text-sm">{parseFloat(order.total_amount).toLocaleString('vi-VN')} ₫</strong></p>
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-1.5">
            <h3 className="text-xs font-mono font-bold text-neon-cyan uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <MapPin size={14} />
              <span>Địa Chỉ Giao Hàng</span>
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{order.shipping_address}</p>
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
                    <th scope="col" className="px-5 py-3">Linh Kiện</th>
                    <th scope="col" className="px-5 py-3 text-center">Số Lượng</th>
                    <th scope="col" className="px-5 py-3 text-right">Đơn Giá</th>
                    <th scope="col" className="px-5 py-3 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {order.OrderDetails?.map(detail => (
                    <tr key={detail.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="px-5 py-3.5 font-sans font-medium text-slate-100">{detail.Product.name}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-white">{detail.quantity}</td>
                      <td className="px-5 py-3.5 text-right text-slate-400">{parseFloat(detail.price).toLocaleString('vi-VN')} ₫</td>
                      <td className="px-5 py-3.5 text-right font-bold text-neon-cyan">{(detail.quantity * parseFloat(detail.price)).toLocaleString('vi-VN')} ₫</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end flex-shrink-0">
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
};

export default OrderDetailModal;