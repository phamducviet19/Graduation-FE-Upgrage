import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Loader, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';
import { Order } from '../../types';

const PaymentReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { fetchCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<'success' | 'failed' | 'pending' | 'error'>('pending');

  const orderIdParam = searchParams.get('orderId');
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');

  useEffect(() => {
    const verifyOrder = async () => {
      // 1. Check for explicit failure code from URL
      if (vnpResponseCode && vnpResponseCode !== '00') {
        setStatus('failed');
        setLoading(false);
        return;
      }

      // 2. If no orderId, we can't verify anything
      if (!orderIdParam) {
        setStatus('error');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<{ data: Order[] }>('/order');
        const orders = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
        const foundOrder = orders.find(o => o.id === Number(orderIdParam));

        if (foundOrder) {
          setOrder(foundOrder);
          
          if (foundOrder.status === 'Confirmed' || foundOrder.status === 'Shipped') {
             setStatus('success');
             fetchCart();
          } else if (foundOrder.status === 'Cancelled') {
             setStatus('failed');
          } else {
             if (vnpResponseCode === '00') {
                setStatus('success');
                fetchCart();
             } else {
                setStatus('pending');
             }
          }
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error("Lỗi xác thực giao dịch:", error);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [orderIdParam, vnpResponseCode, fetchCart]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader className="w-14 h-14 text-neon-cyan animate-spin mb-5" />
          <h2 className="text-xl font-bold text-white">Đang kiểm tra kết quả thanh toán...</h2>
          <p className="text-sm text-slate-400 mt-2">Vui lòng chờ trong giây lát trong khi chúng tôi xác nhận giao dịch.</p>
        </div>
      );
    }

    switch (status) {
      case 'success':
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-neon-emerald shadow-neon-emerald">
                <CheckCircle className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-3">Thanh Toán Thành Công!</h1>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Cảm ơn bạn đã mua hàng. Đơn hàng <span className="font-bold text-neon-cyan font-mono">#{orderIdParam}</span> đã được ghi nhận và đang chuẩn bị xử lý.
            </p>
            
            {order && (
                <div className="bg-slate-950/70 p-6 rounded-2xl mb-8 text-left inline-block w-full max-w-md border border-slate-800/90 shadow-sm space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                        <span className="text-xs text-slate-400 uppercase font-semibold">Tổng tiền thanh toán</span>
                        <span className="text-xl font-black font-mono text-neon-emerald">{parseFloat(order.total_amount).toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div>
                            <p className="text-slate-400 uppercase font-semibold">Địa chỉ giao hàng:</p>
                            <p className="text-slate-200 mt-0.5 font-medium">{order.shipping_address}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 uppercase font-semibold">Thời gian:</p>
                            <p className="text-slate-300 font-mono mt-0.5">{new Date(order.order_date).toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/profile" className="flex items-center justify-center gap-2 bg-neon-cyan text-dark-base font-extrabold px-6 py-3.5 rounded-xl shadow-neon-cyan hover:bg-highlight hover:scale-[1.02] active:scale-95 transition-all text-xs font-mono tracking-wider">
                <span>XEM CHI TIẾT ĐƠN HÀNG</span> <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-600 font-semibold px-6 py-3.5 rounded-xl transition-all text-xs font-mono tracking-wider">
                <ShoppingBag size={16} /> <span>TIẾP TỤC MUA SẮM</span>
              </Link>
            </div>
          </>
        );

      case 'failed':
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-neon-rose shadow-md">
                <XCircle className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-3">Thanh Toán Thất Bại</h1>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Giao dịch thanh toán chưa thể hoàn tất. Tài khoản của bạn chưa bị trừ tiền. Bạn có thể kiểm tra lại giỏ hàng hoặc thử thanh toán lại.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link to="/cart" className="flex items-center justify-center gap-2 bg-neon-cyan text-dark-base font-extrabold px-6 py-3.5 rounded-xl shadow-neon-cyan hover:bg-highlight hover:scale-[1.02] active:scale-95 transition-all text-xs font-mono tracking-wider">
                QUAY LẠI GIỎ HÀNG
              </Link>
              <Link to="/checkout" className="flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-600 font-semibold px-6 py-3.5 rounded-xl transition-all text-xs font-mono tracking-wider">
                THỬ THANH TOÁN LẠI
              </Link>
            </div>
          </>
        );

      case 'pending':
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                <AlertCircle className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-3">Đang Chờ Xác Nhận Thanh Toán</h1>
            <p className="text-slate-400 mb-6 max-w-md mx-auto text-sm leading-relaxed">
              Đơn hàng <span className="font-bold text-neon-cyan font-mono">#{orderIdParam}</span> đã được ghi nhận. Hệ thống đang chờ phản hồi xác nhận tiền về từ cổng thanh toán.
            </p>
            <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 max-w-md mx-auto mb-8">
                <p className="text-xs text-amber-300">
                    Vui lòng kiểm tra email hoặc danh sách đơn hàng sau vài phút. Khi hệ thống nhận được phản hồi tiền đã về, trạng thái sẽ tự động cập nhật.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/profile" className="flex items-center justify-center gap-2 bg-neon-cyan text-dark-base font-extrabold px-6 py-3.5 rounded-xl shadow-neon-cyan hover:bg-highlight hover:scale-[1.02] active:scale-95 transition-all text-xs font-mono tracking-wider">
                KIỂM TRA TRONG HỒ SƠ
              </Link>
              <Link to="/" className="flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-600 font-semibold px-6 py-3.5 rounded-xl transition-all text-xs font-mono tracking-wider">
                VỀ TRANG CHỦ
              </Link>
            </div>
          </>
        );

      default: // error
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <AlertCircle className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-3">Không Thể Xác Thực</h1>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Không thể tìm thấy dữ liệu đơn hàng tương ứng. Liên kết có thể không hợp lệ hoặc bạn không có quyền truy cập đơn hàng này.
            </p>
             <div className="flex justify-center gap-4">
              <Link to="/profile" className="flex items-center justify-center gap-2 bg-neon-cyan text-dark-base font-extrabold px-6 py-3.5 rounded-xl shadow-neon-cyan hover:bg-highlight hover:scale-[1.02] active:scale-95 transition-all text-xs font-mono tracking-wider">
                XEM ĐƠN HÀNG CỦA TÔI
              </Link>
            </div>
          </>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 p-8 md:p-12 rounded-3xl shadow-2xl text-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentReturnPage;
