import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Cpu, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { User } from '../../types';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleLoginSuccess = (user: User) => {
    if (user.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login(email, password);
      handleLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md p-8 sm:p-10 space-y-8 bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800/90 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-neon-cyan">
              <div className="w-full h-full bg-dark-base rounded-[15px] flex items-center justify-center">
                <Cpu className="text-neon-cyan" size={26} />
              </div>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Đăng Nhập <span className="gradient-text-cyan">CYBERPC</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Quản lý đơn hàng & cấu hình máy tính cá nhân
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              Email đăng ký
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Mật khẩu
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl text-xs font-mono font-extrabold tracking-wider bg-neon-cyan text-dark-base hover:bg-highlight shadow-neon-cyan transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed hover:scale-[1.02]"
          >
            {isLoading ? (
              <span>ĐANG XÁC THỰC...</span>
            ) : (
              <>
                <span>ĐĂNG NHẬP NGAY</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800">
          Chưa có tài khoản thành viên?{' '}
          <Link to="/register" className="font-bold text-neon-cyan hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
