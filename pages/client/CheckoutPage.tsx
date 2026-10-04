import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowLeft, CreditCard, ShoppingBag } from 'lucide-react';
import api from '../../services/api';

const CheckoutPage: React.FC = () => {
  const { cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.address) {
      setShippingAddress(user.address);
    }
  }, [user]);

  const total = cart.reduce((acc, item) => acc + parseFloat(item.Product.price) * item.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError('Vui lòng nhập địa chỉ nhận hàng.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      // Step 1: Create the order
      const responseData: any = await api.post('/order', {
        shipping_address: shippingAddress,
        notes: notes,
      });

      const createdOrder = responseData.order; 

      if (!createdOrder || !createdOrder.id) {
        throw new Error('Không thể tạo đơn hàng. Vui lòng thử lại sau.');
      }

      // Step 2: Request payment URL
      const amountToSend = Math.round(parseFloat(createdOrder.total_amount));

      const paymentData = {
        orderId: createdOrder.id,
        amount: amountToSend
      };

      const paymentResponse = await api.post<{ paymentUrl: string }>('/payment/create', paymentData);

      // Step 3: Redirect to payment gateway
      if (paymentResponse.paymentUrl) {
        window.location.href = paymentResponse.paymentUrl;
      } else {
        throw new Error('Không thể khởi tạo liên kết thanh toán.');
      }

    } catch (err: any) {
      console.error("Lỗi đặt hàng:", err);
      setError(err.response?.data?.message || err.message || 'Đặt hàng không thành công. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  if (cart.length === 0 && !isLoading) {
    return <Navigate to="/products" replace />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header breadcrumb & title */}
      <div>
        <Link 
          to="/cart" 
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-neon-cyan transition-colors mb-2"
        >
          <ArrowLeft size={14} />
          <span>Quay lại giỏ hàng</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>Thanh toán đơn hàng</span>
          <CreditCard className="text-neon-cyan" size={26} />
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Vui lòng kiểm tra địa chỉ nhận hàng và thông tin đơn hàng trước khi tiến hành thanh toán
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Shipping & Delivery Info */}
        <div className="lg:col-span-3 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2 pb-3 border-b border-slate-800">
            <Truck className="text-neon-cyan" size={20} />
            <span>Thông tin giao hàng</span>
          </h2>

          <form onSubmit={handlePlaceOrder}>
            <div className="space-y-5">
              <div>
                <label htmlFor="shipping_address" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Địa chỉ nhận hàng <span className="text-neon-rose">*</span>
                </label>
                <textarea
                  id="shipping_address"
                  rows={4}
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                  placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  required
                ></textarea>
              </div>

              <div>
                <label htmlFor="notes" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Ghi chú đơn hàng <span className="text-slate-500 text-xs font-normal">(Tùy chọn)</span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                  placeholder="Ví dụ: Giờ giao hàng thuận tiện, chỉ dẫn tòa nhà..."
                ></textarea>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium rounded-xl">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-neon-cyan text-dark-base font-extrabold px-6 py-4 rounded-xl shadow-neon-cyan hover:bg-highlight hover:scale-[1.01] active:scale-95 transition-all text-xs font-mono tracking-wider disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                <span>{isLoading ? 'ĐANG KHỞI TẠO THANH TOÁN...' : 'TIẾN HÀNH THANH TOÁN CỔNG TRỰC TUYẾN'}</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400 pt-1">
                <ShieldCheck size={14} className="text-neon-emerald" />
                <span>Thanh toán an toàn bảo mật qua VNPay / ATM / Thẻ tín dụng</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-slate-800/90 shadow-2xl sticky top-28 space-y-5">
            <h2 className="text-base font-extrabold text-white tracking-wide uppercase pb-4 border-b border-slate-800 flex items-center gap-2">
              <ShoppingBag className="text-neon-cyan" size={18} />
              <span>Đơn hàng của bạn</span>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full ml-auto">
                {cart.length} món
              </span>
            </h2>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.product_id} className="flex justify-between items-start gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex-1">
                    <p className="font-bold text-slate-200 line-clamp-2">{item.Product.name}</p>
                    <p className="text-slate-400 font-mono mt-1">Số lượng: <strong className="text-neon-cyan">{item.quantity}</strong></p>
                  </div>
                  <p className="font-mono font-bold text-white whitespace-nowrap">
                    {(item.quantity * parseFloat(item.Product.price)).toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-800 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Tạm tính</span>
                <span className="text-slate-200 font-bold">{total.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Vận chuyển</span>
                <span className="text-neon-emerald font-bold">Miễn phí toàn quốc</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-4 border-t border-slate-800">
              <span className="text-sm font-bold text-slate-200">Tổng thanh toán:</span>
              <span className="text-2xl font-mono font-black text-neon-cyan">
                {total.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
