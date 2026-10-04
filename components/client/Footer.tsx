import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, MapPin, Phone, Mail, ShieldCheck, Truck, RefreshCw, Headphones, ArrowRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-base border-t border-dark-border text-slate-400 relative overflow-hidden mt-16">
      {/* Glow decorative accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent"></div>

      {/* Trust Badges Banner */}
      <div className="border-b border-dark-border/60 bg-slate-900/40 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan flex-shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Giao hàng hỏa tốc</h4>
                <p className="text-xs text-slate-400">Nội thành 2h & toàn quốc</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-neon-emerald/10 border border-neon-emerald/30 flex items-center justify-center text-neon-emerald flex-shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Chính Hãng</h4>
                <p className="text-xs text-slate-400">Bảo hành lên đến 36 tháng</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center text-neon-purple flex-shrink-0">
                <RefreshCw size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Đổi mới 30 ngày</h4>
                <p className="text-xs text-slate-400">Lỗi nhà sản xuất 1 đổi 1</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-neon-rose/10 border border-neon-rose/30 flex items-center justify-center text-neon-rose flex-shrink-0">
                <Headphones size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Hỗ trợ kỹ thuật 24/7</h4>
                <p className="text-xs text-slate-400">AI Copilot & chuyên viên PC</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-neon-cyan">
                <div className="w-full h-full bg-dark-base rounded-[11px] flex items-center justify-center">
                  <Cpu className="text-neon-cyan" size={22} />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-wider text-white">CYBER</span>
                <span className="font-extrabold text-2xl tracking-wider gradient-text-cyan">PC</span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Hệ sinh thái linh kiện PC & giải pháp AI Build máy tính hàng đầu. Tối ưu từng đồng ngân sách của bạn với độ tương thích tuyệt đối.
            </p>
            <div className="pt-2">
              <p className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-2">Đăng ký nhận ưu đãi & tin công nghệ</p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan flex-1"
                />
                <button
                  type="submit"
                  className="bg-neon-cyan text-dark-base font-bold px-4 py-2 rounded-xl text-sm hover:bg-highlight transition-all duration-300 shadow-neon-cyan flex items-center gap-1"
                >
                  Gửi <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Sản Phẩm</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/products?category=cpu" className="hover:text-neon-cyan transition-colors">Bộ vi xử lý (CPU)</Link></li>
              <li><Link to="/products?category=vga" className="hover:text-neon-cyan transition-colors">Card màn hình (VGA)</Link></li>
              <li><Link to="/products?category=ram" className="hover:text-neon-cyan transition-colors">Bộ nhớ RAM</Link></li>
              <li><Link to="/products?category=mainboard" className="hover:text-neon-cyan transition-colors">Bo mạch chủ (Mainboard)</Link></li>
              <li><Link to="/products?category=ssd" className="hover:text-neon-cyan transition-colors">Ổ cứng SSD NVMe</Link></li>
              <li><Link to="/products?category=psu" className="hover:text-neon-cyan transition-colors">Nguồn máy tính (PSU)</Link></li>
            </ul>
          </div>

          {/* Công cụ & Tính năng */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Tính Năng</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/pcbuild/ai" className="hover:text-neon-purple transition-colors flex items-center gap-1.5 text-neon-purple font-medium">
                  ✨ AI Build PC thông minh
                </Link>
              </li>
              <li><Link to="/pcbuilds" className="hover:text-neon-cyan transition-colors">Trình ráp PC tùy chọn</Link></li>
              <li><Link to="/compare" className="hover:text-neon-cyan transition-colors">So sánh đối đầu linh kiện</Link></li>
              <li><Link to="/wishlist" className="hover:text-neon-cyan transition-colors">Linh kiện đã thích</Link></li>
              <li><Link to="/profile" className="hover:text-neon-cyan transition-colors">Tra cứu đơn hàng</Link></li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Liên Hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-neon-cyan" />
                <span className="text-slate-300">55 Giải Phóng, Hai Bà Trưng, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="flex-shrink-0 text-neon-cyan" />
                <a href="tel:0326283095" className="text-slate-300 hover:text-neon-cyan transition-colors font-mono">0326 283 095</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="flex-shrink-0 text-neon-cyan" />
                <a href="mailto:pdviet19@gmail.com" className="text-slate-300 hover:text-neon-cyan transition-colors">pdviet19@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dark-border/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 CYBERPC Store. All rights reserved. Built with cutting-edge tech.</p>
          <div className="flex space-x-6">
            <span className="hover:text-slate-200 cursor-pointer">Chính sách bảo hành</span>
            <span className="hover:text-slate-200 cursor-pointer">Chính sách thanh toán</span>
            <span className="hover:text-slate-200 cursor-pointer">Bảo mật thông tin</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
