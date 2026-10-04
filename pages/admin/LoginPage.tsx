import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Cpu, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Glow Ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md p-8 sm:p-10 space-y-8 bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800/90 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-neon-cyan mb-1">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Cpu className="text-neon-cyan" size={24} />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Đăng Nhập <span className="gradient-text-cyan">QUẢN TRỊ</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Hệ thống điều khiển & quản trị cửa hàng CYBERPC
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-xl text-xs font-mono">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-neon-cyan" />
                <span>Email quản trị</span>
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock size={13} className="text-neon-purple" />
                <span>Mật khẩu</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-purple"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-mono font-extrabold tracking-wider bg-neon-cyan text-dark-base hover:bg-highlight shadow-neon-cyan transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              <span>{isLoading ? 'ĐANG XÁC THỰC...' : 'TRUY CẬP HỆ THỐNG'}</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-500 pt-2">
            <ShieldCheck size={14} className="text-neon-emerald" />
            <span>Khu vực bảo mật dành riêng cho Quản trị viên</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;