import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Wrench, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

const slides = [
  {
    url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cmdifGVufDB8fDB8fHww&ixlib=rb-4.1.0&q=80&w=3000',
    tag: 'LINH KIỆN CAO CẤP THẾ HỆ MỚI',
    tagColor: 'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10',
    title: 'XÂY DỰNG DÀN PC MƠ ƯỚC CỦA BẠN',
    highlightTitle: 'DÀN PC MƠ ƯỚC',
    subtitle: 'Kho linh kiện chính hãng thế hệ mới nhất. Trải nghiệm hiệu năng không giới hạn cho Game thủ và Chuyên gia đồ họa.',
    primaryCta: 'Khám Phá Linh Kiện',
    primaryLink: '/products',
    secondaryCta: 'Tự Ráp PC Ngay',
    secondaryLink: '/pcbuilds',
  },
  {
    url: 'https://images.unsplash.com/photo-1626218174358-7769486c4b79?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FtaW5nJTIwcGN8ZW58MHx8MHx8fDA%3D&ixlib=rb-4.1.0&q=80&w=3000',
    tag: 'TÍCH HỢP TRÍ TUỆ NHÂN TẠO',
    tagColor: 'text-neon-purple border-neon-purple/40 bg-neon-purple/10',
    title: 'AI BUILD PC - TỐI ƯU CẤU HÌNH TRONG 3 GIÂY',
    highlightTitle: 'TỐI ƯU CẤU HÌNH TRONG 3 GIÂY',
    subtitle: 'Chỉ cần chọn ngân sách & tựa game yêu thích, thuật toán AI sẽ tự động phân bổ linh kiện mạnh nhất, không nghẽn cổ chai.',
    primaryCta: 'Trải Nghiệm AI Build',
    primaryLink: '/pcbuild/ai',
    secondaryCta: 'Xem Danh Sách PC',
    secondaryLink: '/pcbuilds',
  },
  {
    url: 'https://plus.unsplash.com/premium_photo-1682141878168-5dace8e1785d?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z2FtaW5nJTIwcGN8ZW58MHx8MHx8fDA%3D&ixlib=rb-4.1.0&q=80&w=3000',
    tag: 'SO SÁNH HIỆU NĂNG TRỰC QUAN',
    tagColor: 'text-neon-emerald border-neon-emerald/40 bg-neon-emerald/10',
    title: 'ĐỐI ĐẦU LINH KIỆN - CHỌN ĐÚNG KHÔNG ĐẮT',
    highlightTitle: 'CHỌN ĐÚNG KHÔNG ĐẮT',
    subtitle: 'So sánh từng thông số xung nhịp, VRAM, TDP, điểm benchmark giữa 2 VGA hoặc CPU trước khi quyết định chi tiền.',
    primaryCta: 'So Sánh Linh Kiện',
    primaryLink: '/compare',
    secondaryCta: 'Xem Sản Phẩm Hot',
    secondaryLink: '/products',
  }
];

const HeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };
  
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const current = slides[currentIndex];

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group mb-12">
      {/* Background Images with smooth fade/zoom */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div
            style={{ backgroundImage: `url(${slide.url})` }}
            className={`w-full h-full bg-center bg-cover transform transition-transform duration-[8000ms] ${
              idx === currentIndex ? 'scale-105' : 'scale-100'
            }`}
          />
          {/* Cyber Dark Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-base via-dark-base/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-dark-base via-transparent to-black/40"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        </div>
      ))}

      {/* Content Container */}
      <div className="relative z-20 h-full flex flex-col justify-center px-8 sm:px-14 lg:px-20 max-w-3xl">
        {/* Badge Tag */}
        <div className="mb-4 inline-flex items-center gap-2">
          <span className={`text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full border ${current.tagColor}`}>
            {current.tag}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400 font-mono">
            <Zap size={13} className="text-yellow-400" />
            100% Khả năng tương thích
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight mb-4 drop-shadow-lg">
          {current.title}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 mb-8 max-w-xl leading-relaxed drop-shadow">
          {current.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to={current.primaryLink}
            className="flex items-center gap-2 bg-neon-cyan text-dark-base font-extrabold px-6 py-3.5 rounded-xl shadow-neon-cyan hover:bg-highlight hover:scale-105 transition-all duration-300 text-sm tracking-wide"
          >
            <span>{current.primaryCta}</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            to={current.secondaryLink}
            className="flex items-center gap-2 glass-panel text-white font-bold px-6 py-3.5 rounded-xl border border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/80 transition-all duration-300 text-sm"
          >
            <Wrench size={16} className="text-neon-cyan" />
            <span>{current.secondaryCta}</span>
          </Link>
        </div>
      </div>

      {/* Navigation Controls: Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-xl glass-panel text-slate-300 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-xl glass-panel text-slate-300 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next Slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 right-8 sm:right-14 z-30 flex items-center gap-2.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-2 rounded-full transition-all duration-500 ${
              idx === currentIndex
                ? 'w-8 bg-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.7)]'
                : 'w-2 bg-slate-600 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;