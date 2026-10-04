import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, ShoppingCart, RefreshCcw, HelpCircle } from 'lucide-react';

const PaymentFailedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 p-8 md:p-12 rounded-3xl shadow-2xl text-center">
        
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-neon-rose shadow-md">
            <XCircle className="w-12 h-12" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Thanh Toán Thất Bại</h1>
        <p className="text-slate-400 mb-6 text-sm max-w-md mx-auto leading-relaxed">
          Hệ thống không thể xử lý thanh toán cho đơn hàng <span className="font-bold text-white font-mono">#{orderIdParam}</span>.
        </p>
        
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-8 max-w-md mx-auto text-left">
            <p className="text-xs text-rose-300 leading-relaxed">
                Đừng lo lắng, tài khoản của bạn chưa bị trừ tiền. Tình trạng này có thể do gián đoạn kết nối, quá thời gian chờ thanh toán hoặc thẻ chưa kích hoạt tính năng thanh toán online.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/checkout" 
            className="flex items-center justify-center gap-2 bg-neon-cyan text-dark-base font-extrabold px-6 py-3.5 rounded-xl shadow-neon-cyan hover:bg-highlight hover:scale-[1.02] active:scale-95 transition-all text-xs font-mono tracking-wider"
          >
            <RefreshCcw size={16} /> <span>THỬ THANH TOÁN LẠI</span>
          </Link>
          <Link 
            to="/cart" 
            className="flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-600 font-semibold px-6 py-3.5 rounded-xl transition-all text-xs font-mono tracking-wider"
          >
            <ShoppingCart size={16} /> <span>QUAY LẠI GIỎ HÀNG</span>
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-800">
             <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
                <HelpCircle size={15}/>
                Bạn cần hỗ trợ? <a href="mailto:pdviet19@gmail.com" className="text-neon-cyan hover:underline font-mono">Liên hệ hỗ trợ kỹ thuật</a>
             </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;