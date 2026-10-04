import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, ShoppingBag, ArrowRight, MapPin, Calendar, Package } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';
import { Order } from '../../types';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  
  const orderIdParam = searchParams.get('orderId');

  useEffect(() => {
    const initSuccessPage = async () => {
      if (!orderIdParam) {
        setLoading(false);
        return;
      }

      try {
        // 1. Clear the cart locally since payment was successful
        await clearCart();

        // 2. Fetch the order details to display the receipt
        const response = await api.get<{ data: Order[] }>('/order');
        const orders = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
        const foundOrder = orders.find(o => o.id === Number(orderIdParam));

        if (foundOrder) {
          setOrder(foundOrder);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    initSuccessPage();
  }, [orderIdParam, clearCart]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader className="w-14 h-14 text-neon-cyan animate-spin mb-4" />
        <h2 className="text-lg font-semibold text-slate-200">Đang hoàn tất đơn hàng của bạn...</h2>
      </div>
    );
  }

  if (!orderIdParam) {
    return (
      <div className="text-center py-20 bg-slate-900/80 border border-slate-800 rounded-3xl max-w-xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-rose-500 mb-3">Yêu cầu không hợp lệ</h2>
        <p className="text-sm text-slate-400 mb-6">Không tìm thấy mã đơn hàng cần xác nhận.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-neon-cyan text-dark-base font-bold px-6 py-2.5 rounded-xl shadow-neon-cyan hover:bg-highlight transition-all text-xs">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 p-8 md:p-12 rounded-3xl shadow-2xl text-center">
        
        {/* Success badge */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-neon-emerald shadow-neon-emerald">
            <CheckCircle className="w-12 h-12" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Thanh Toán Thành Công!</h1>
        <p className="text-slate-400 mb-8 text-base max-w-lg mx-auto">
          Cảm ơn bạn đã tin tưởng mua sắm. Đơn hàng <span className="font-bold text-neon-cyan font-mono">#{orderIdParam}</span> của bạn đã được xác nhận.
        </p>

        {order && (
          <div className="bg-slate-950/70 p-6 rounded-2xl mb-8 text-left border border-slate-800/90 max-w-xl mx-auto space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Thông tin đơn hàng</span>
              <span className="font-mono text-xs text-neon-cyan font-bold">#{order.id}</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-slate-500 mr-2.5 mt-0.5 flex-shrink-0" />
                  <div>
                     <p className="text-[11px] text-slate-400 uppercase font-semibold">Ngày đặt hàng</p>
                     <p className="text-sm font-mono text-slate-200 mt-0.5">{new Date(order.order_date).toLocaleString('vi-VN')}</p>
                  </div>
               </div>
               <div className="flex items-start">
                  <Package className="w-5 h-5 text-neon-emerald mr-2.5 mt-0.5 flex-shrink-0" />
                  <div>
                     <p className="text-[11px] text-slate-400 uppercase font-semibold">Tổng tiền thanh toán</p>
                     <p className="text-base font-mono font-black text-neon-emerald mt-0.5">
                       {parseFloat(order.total_amount).toLocaleString('vi-VN')} ₫
                     </p>
                  </div>
               </div>
            </div>
            
            <div className="flex items-start pt-2 border-t border-slate-800/80">
                <MapPin className="w-5 h-5 text-slate-500 mr-2.5 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-[11px] text-slate-400 uppercase font-semibold">Địa chỉ nhận hàng</p>
                    <p className="text-sm text-slate-200 mt-0.5">{order.shipping_address}</p>
                </div>
            </div>

            {order.notes && (
                <div className="mt-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
                    " {order.notes} "
                </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/profile" 
            className="flex items-center justify-center gap-2 bg-neon-cyan text-dark-base font-extrabold px-8 py-3.5 rounded-xl shadow-neon-cyan hover:bg-highlight hover:scale-[1.02] active:scale-95 transition-all text-xs font-mono tracking-wider"
          >
            <span>THEO DÕI ĐƠN HÀNG</span>
            <ArrowRight size={16} />
          </Link>
          <Link 
            to="/products" 
            className="flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-600 font-semibold px-8 py-3.5 rounded-xl transition-all text-xs font-mono tracking-wider"
          >
            <ShoppingBag size={16} />
            <span>TIẾP TỤC MUA SẮM</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;