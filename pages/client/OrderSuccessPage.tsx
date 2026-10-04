import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';

const OrderSuccessPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 p-8 sm:p-12 rounded-3xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-neon-emerald shadow-neon-emerald">
            <CheckCircle className="w-12 h-12" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Cảm Ơn Bạn Đã Đặt Hàng!</h1>
        <p className="text-slate-400 mb-8 text-sm max-w-md mx-auto leading-relaxed">
          Đơn hàng của bạn đã được tiếp nhận thành công. Bạn có thể theo dõi hành trình và cập nhật trạng thái trong tài khoản.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/profile" className="flex items-center justify-center gap-2 bg-neon-cyan text-dark-base font-extrabold px-6 py-3.5 rounded-xl shadow-neon-cyan hover:bg-highlight hover:scale-[1.02] active:scale-95 transition-all text-xs font-mono tracking-wider">
            <span>XEM ĐƠN HÀNG CỦA TÔI</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/products" className="flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-600 font-semibold px-6 py-3.5 rounded-xl transition-all text-xs font-mono tracking-wider">
            <ShoppingBag size={16} />
            <span>TIẾP TỤC MUA SẮM</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;