import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Product } from '../../types';
import ProductCard from '../../components/client/ProductCard';
import Spinner from '../../components/common/Spinner';
import HeroSlider from '../../components/client/HeroSlider';
import { 
  Sparkles, Wrench, GitCompare, Cpu, Monitor, HardDrive, 
  Layers, Disc, Fan, Flame, ArrowRight, Zap, CheckCircle2 
} from 'lucide-react';

const categoriesList = [
  { name: 'Vi Xử Lý (CPU)', icon: Cpu, desc: 'Intel & AMD Ryzen mới nhất', query: 'CPU', color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/30' },
  { name: 'Card Đồ Họa (VGA)', icon: Monitor, desc: 'RTX 40-Series & RX 7000', query: 'VGA', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30' },
  { name: 'Bo Mạch Chủ', icon: Layers, desc: 'Z790, B760, X670, B650', query: 'Mainboard', color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30' },
  { name: 'Bộ Nhớ RAM', icon: Disc, desc: 'DDR4 & DDR5 Bus cao', query: 'RAM', color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30' },
  { name: 'Ổ Cứng SSD', icon: HardDrive, desc: 'NVMe Gen 4 & Gen 5 siêu tốc', query: 'SSD', color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30' },
  { name: 'Tản Nhiệt PC', icon: Fan, desc: 'Tản nước AIO & tản tháp khí', query: 'Cooler', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30' },
];

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get<any>('/product');
        const allProducts = Array.isArray(response) 
          ? response 
          : (response?.data && Array.isArray(response.data) ? response.data : []);

        setFeaturedProducts(allProducts.slice(0, 8));
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách sản phẩm nổi bật.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="space-y-16">
      {/* 1. Main Hero Slider */}
      <HeroSlider />

      {/* 2. Three Main Pillars (Interactive Feature Cards) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: AI Build */}
        <Link 
          to="/pcbuild/ai" 
          className="group relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-900/30 via-slate-900 to-slate-900/90 border border-purple-500/30 hover:border-neon-purple hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none"></div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-neon-purple mb-5 shadow-sm">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-neon-purple uppercase bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              Công nghệ độc quyền
            </span>
            <h3 className="text-xl font-bold text-white mt-3 mb-2 group-hover:text-neon-purple transition-colors">
              Trợ Lý Ráp Máy AI
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Nhập số tiền bạn có & thể loại game muốn chơi. Thuật toán AI sẽ tự cân đối cấu hình không lo nghẽn cổ chai.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-neon-purple tracking-wide group-hover:translate-x-1 transition-transform">
            <span>BẮT ĐẦU RÁP BẰNG AI</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        {/* Card 2: Custom PC Builder */}
        <Link 
          to="/pcbuilds" 
          className="group relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900/90 border border-cyan-500/30 hover:border-neon-cyan hover:shadow-neon-cyan transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none"></div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-neon-cyan mb-5 shadow-sm">
              <Wrench size={24} />
            </div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-neon-cyan uppercase bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              Chuyên gia tự chọn
            </span>
            <h3 className="text-xl font-bold text-white mt-3 mb-2 group-hover:text-neon-cyan transition-colors">
              Tự Ráp PC Chuẩn Socket
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tùy biến từng linh kiện CPU, VGA, Nguồn với bộ lọc tự động kiểm tra công suất điện năng và chuẩn socket.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-neon-cyan tracking-wide group-hover:translate-x-1 transition-transform">
            <span>TRÌNH BUILD MÁY TÍNH</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        {/* Card 3: Component Comparison */}
        <Link 
          to="/compare" 
          className="group relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900/90 border border-emerald-500/30 hover:border-neon-emerald hover:shadow-neon-emerald transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none"></div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-neon-emerald mb-5 shadow-sm">
              <GitCompare size={24} />
            </div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-neon-emerald uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Phân tích thông số
            </span>
            <h3 className="text-xl font-bold text-white mt-3 mb-2 group-hover:text-neon-emerald transition-colors">
              So Sánh Đối Đầu
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Đặt 2 linh kiện cạnh nhau để soi rõ xung nhịp, VRAM, điện năng tiêu thụ và tỉ lệ hiệu năng trên giá thành (P/P).
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-neon-emerald tracking-wide group-hover:translate-x-1 transition-transform">
            <span>SO SÁNH LINH KIỆN</span>
            <ArrowRight size={14} />
          </div>
        </Link>
      </section>

      {/* 3. Component Categories Showcase */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-neon-cyan uppercase tracking-widest">
              <Zap size={14} />
              <span>Hệ sinh thái linh kiện</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Khám Phá Theo Danh Mục
            </h2>
          </div>
          <Link 
            to="/products" 
            className="text-xs font-bold font-mono text-slate-300 hover:text-neon-cyan flex items-center gap-1.5 transition-colors"
          >
            <span>TẤT CẢ DANH MỤC</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoriesList.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={`/products?category=${encodeURIComponent(cat.query)}`}
                className={`group p-4 rounded-2xl bg-gradient-to-b ${cat.color} bg-slate-900/60 backdrop-blur-md border hover:scale-105 transition-all duration-300 flex flex-col items-center text-center`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-white group-hover:text-neon-cyan transition-colors mb-3">
                  <Icon size={24} />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  {cat.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Hardware Products */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-neon-cyan uppercase tracking-widest">
              <Flame size={14} className="text-rose-500" />
              <span>Top Bán Chạy & Được Đánh Giá Cao</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Linh Kiện Tuyển Chọn
            </h2>
          </div>
          <Link 
            to="/products" 
            className="text-xs font-bold font-mono text-neon-cyan hover:underline flex items-center gap-1"
          >
            <span>XEM TẤT CẢ SẢN PHẨM</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        )}
        
        {error && (
          <div className="text-center p-8 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
            {error}
          </div>
        )}
        
        {!loading && !error && featuredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && !error && featuredProducts.length === 0 && (
          <div className="text-center py-16 text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
            Chưa có sản phẩm nào trong kho dữ liệu hiện tại.
          </div>
        )}
      </section>

      {/* 5. AI Copilot Promo Banner */}
      <section className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-neon-cyan/30 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/60">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-neon-cyan uppercase bg-neon-cyan/10 border border-neon-cyan/30 px-3 py-1 rounded-full mb-4">
            <Sparkles size={14} />
            <span>Trợ lý ảo thông minh 24/7</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            Bạn băn khoăn không biết cấu hình nào chơi mượt game yêu thích?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
            Hỏi ngay <strong>PC AI Assistant</strong> ở góc màn hình. Trợ lý AI có thể tư vấn chi tiết thông số, kiểm tra socket bo mạch, so sánh card đồ họa và đưa ra cấu hình theo từng mức giá cụ thể.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <CheckCircle2 size={14} className="text-neon-emerald" />
              <span>Phân tích theo ngân sách</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <CheckCircle2 size={14} className="text-neon-emerald" />
              <span>Kiểm tra nghẽn CPU & GPU</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;