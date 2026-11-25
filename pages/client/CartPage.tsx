import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { API_HOST } from '../../services/api';

const CartPage: React.FC = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();

  const total = cart.reduce((acc, item) => acc + parseFloat(item.Product.price) * item.quantity, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center bg-slate-900/60 border border-slate-800 p-12 sm:p-16 rounded-3xl max-w-lg mx-auto shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto mb-6">
          <ShoppingBag size={36} />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Giỏ hàng của bạn đang trống</h1>
        <p className="text-sm text-slate-400 mb-8">
          Chưa có linh kiện nào được thêm vào giỏ. Hãy dạo quanh kho sản phẩm và chọn linh kiện ưng ý nhé!
        </p>
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 bg-neon-cyan text-dark-base font-extrabold px-6 py-3.5 rounded-xl shadow-neon-cyan hover:bg-highlight hover:scale-105 transition-all text-xs tracking-wider"
        >
          <span>KHÁM PHÁ LINH KIỆN NGAY</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Giỏ Hàng Công Nghệ
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Đang có <span className="text-neon-cyan font-bold">{cart.length}</span> sản phẩm trong giỏ
          </p>
        </div>
        <button 
          onClick={clearCart} 
          className="text-xs font-mono text-rose-400 hover:text-rose-300 hover:underline transition-colors"
        >
          Xóa toàn bộ giỏ hàng
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products List */}
        <div className="lg:col-span-2 bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/90 shadow-2xl divide-y divide-slate-800/80">
          {cart.map(item => (
            <div key={item.product_id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Product Info */}
              <div className="flex items-center gap-4 flex-grow w-full sm:w-auto">
                <div className="w-20 h-20 rounded-2xl bg-slate-950 p-2 border border-slate-800 flex items-center justify-center shrink-0 aspect-square overflow-hidden">
                  <img 
                    src={item.Product.mainImage ? `${API_HOST}${item.Product.mainImage}` : `https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=200&q=80`} 
                    alt={item.Product.name} 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div>
                  <Link 
                    to={`/product/${item.Product.id}`} 
                    className="font-bold text-sm text-slate-100 hover:text-neon-cyan transition-colors line-clamp-2"
                  >
                    {item.Product.name}
                  </Link>
                  <p className="text-xs font-mono text-neon-cyan mt-1">
                    {parseFloat(item.Product.price).toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              </div>

              {/* Quantity Counter & Total Line */}
              <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6">
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))} 
                    className="px-3 py-1.5 font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-mono font-bold text-white">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.product_id, Math.min(item.Product.stock, item.quantity + 1))} 
                    className="px-3 py-1.5 font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="text-right min-w-[100px]">
                  <p className="font-mono font-bold text-sm text-white">
                    {(parseFloat(item.Product.price) * item.quantity).toLocaleString('vi-VN')} ₫
                  </p>
                </div>

                <button 
                  onClick={() => removeFromCart(item.product_id)} 
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Xóa linh kiện này"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Checkout Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-slate-800/90 shadow-2xl sticky top-28 space-y-5">
            <h2 className="text-base font-extrabold text-white tracking-wide uppercase pb-4 border-b border-slate-800">
              Tổng Kết Đơn Hàng
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400 font-mono">
                <span>Tạm tính</span>
                <span className="text-white font-bold">{total.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-slate-400 font-mono">
                <span>Phí vận chuyển</span>
                <span className="text-neon-emerald font-bold">Miễn phí 100%</span>
              </div>
              <div className="flex justify-between text-slate-400 font-mono">
                <span>Lắp ráp & Cài Win</span>
                <span className="text-neon-emerald font-bold">Miễn phí</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-300">Tổng thanh toán:</span>
              <span className="text-2xl font-mono font-black text-neon-cyan">
                {total.toLocaleString('vi-VN')} ₫
              </span>
            </div>

            <Link 
              to="/checkout" 
              className="w-full py-3.5 px-6 rounded-xl font-mono font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 bg-neon-cyan text-dark-base hover:bg-highlight shadow-neon-cyan transition-all duration-300 hover:scale-[1.02]"
            >
              <span>TIẾN HÀNH ĐẶT HÀNG</span>
              <ArrowRight size={16} />
            </Link>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400 text-center">
              <ShieldCheck size={14} className="text-neon-emerald" />
              <span>Bảo mật giao dịch chuẩn mã hóa SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;