import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Sparkles, ArrowRight, Cpu, Target, Wallet, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AIBuildResponse } from '../../types';

const suggestions = [
  "Build dàn PC gaming tầm 15 triệu chơi mượt LOL, Valorant và GTA V, ưu tiên card NVIDIA.",
  "Dàn máy đồ họa 25 đến 30 triệu dùng Premiere, After Effects và Blender 3D, RAM 32GB.",
  "Case máy tính văn phòng, kế toán mượt mà, chip i5 đời mới, giá khoảng 9 triệu.",
  "Dàn PC Gaming High-end cấu hình khủng RTX 4070 Ti Super chiến game 4K, ngân sách 50 triệu."
];

const AIBuildPage: React.FC = () => {
  const [request, setRequest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) {
      setError('Vui lòng nhập yêu cầu hoặc ngân sách ráp PC của bạn.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post<AIBuildResponse>('/pcbuild/suggest', { request });
      
      if (response && response.success) {
        // Navigate to the builder page with the AI data
        navigate('/pcbuild/new', { state: { aiBuildData: response } });
      } else {
        throw new Error('AI không thể tạo cấu hình phù hợp với yêu cầu này. Hãy thử mô tả cụ thể hơn.');
      }
    } catch (err: any) {
      console.error('AI Build Error:', err);
      setError(err.message || 'Lỗi kết nối tới hệ thống AI. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-4xl mx-auto space-y-12">
      {/* Title Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-neon-purple text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          <Sparkles size={14} className="animate-spin" />
          <span>CYBER AI ALGORITHM v2.5</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          AI PC <span className="bg-gradient-to-r from-neon-purple via-pink-500 to-neon-cyan bg-clip-text text-transparent">BUILD STUDIO</span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Mô tả ngân sách và mục đích sử dụng (tựa game, phần mềm làm việc). Thuật toán AI sẽ tự động phân bổ linh kiện tối ưu, tương thích 100% và không nghẽn cổ chai.
        </p>
      </div>

      {/* Main AI Input Form */}
      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSuggest} className="relative z-10 space-y-6">
          <div>
            <label htmlFor="request" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Zap size={14} className="text-neon-purple" />
              <span>Mô tả bộ PC bạn mong muốn:</span>
            </label>
            <textarea
              id="request"
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple resize-none transition-all leading-relaxed"
              placeholder="Ví dụ: Tôi muốn build case trắng tầm 20 triệu để livestream và chơi Cyberpunk 2077, có tản nhiệt nước AIO..."
              value={request}
              onChange={(e) => setRequest(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertTriangle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl font-mono font-extrabold text-sm sm:text-base tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
              isLoading 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                : 'bg-gradient-to-r from-neon-purple to-neon-cyan text-dark-base shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:scale-[1.01] hover:brightness-110 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <Sparkles size={18} className="animate-spin" />
                <span>AI ĐANG TÍNH TOÁN & PHÂN BỔ LINH KIỆN...</span>
              </>
            ) : (
              <>
                <span>TẠO CẤU HÌNH TỐI ƯU NGAY</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Suggested Prompts */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span>Gợi ý yêu cầu phổ biến</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setRequest(s)}
              className="text-left p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-purple-500/40 text-slate-300 hover:text-white text-xs sm:text-sm transition-all duration-200 group flex items-start justify-between gap-3"
            >
              <span className="leading-relaxed">"{s}"</span>
              <ArrowRight size={14} className="text-slate-500 group-hover:text-neon-purple group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </div>

      {/* 3 Pillars Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-neon-cyan mx-auto mb-3 shadow-neon-cyan">
            <Target size={22} />
          </div>
          <h4 className="font-bold text-white text-sm">Khớp Đúng Nhu Cầu</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Lựa chọn CPU & Card đồ họa tối ưu theo đúng tựa game hoặc phần mềm đồ họa bạn chỉ định.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-neon-emerald mx-auto mb-3 shadow-neon-emerald">
            <Wallet size={22} />
          </div>
          <h4 className="font-bold text-white text-sm">Tối Ưu Từng Đồng</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Phân bổ tỉ lệ ngân sách hợp lý (không bị tình trạng VGA quá yếu trong khi CPU quá đắt).
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-neon-purple mx-auto mb-3 shadow-neon-purple">
            <Cpu size={22} />
          </div>
          <h4 className="font-bold text-white text-sm">Tương Thích 100%</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tự động đối chiếu socket CPU với Mainboard, chuẩn RAM DDR4/DDR5 và công suất nguồn PSU.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIBuildPage;
