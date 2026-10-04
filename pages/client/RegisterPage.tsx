import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    
    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
        role: 'client'
      });
      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng sang Đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-all";

  return (
    <div className="flex items-center justify-center min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg p-8 sm:p-10 space-y-7 bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800/90 relative z-10">
        
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
            Tạo Tài Khoản Mới
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Tham gia cộng đồng PC Master Race & nhận ưu đãi độc quyền
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-neon-emerald text-xs flex items-center gap-2.5">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Họ và tên
            </label>
            <input 
              name="name" 
              type="text" 
              required 
              placeholder="Nguyễn Văn A" 
              value={formData.name} 
              onChange={handleChange} 
              className={inputClass} 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input 
                name="email" 
                type="email" 
                autoComplete="email" 
                required 
                placeholder="name@example.com" 
                value={formData.email} 
                onChange={handleChange} 
                className={inputClass} 
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Số điện thoại
              </label>
              <input 
                name="phone" 
                type="tel" 
                required 
                placeholder="0987654321" 
                value={formData.phone} 
                onChange={handleChange} 
                className={inputClass} 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Địa chỉ nhận hàng mặc định
            </label>
            <input 
              name="address" 
              type="text" 
              required 
              placeholder="Số nhà, đường, quận/huyện, TP..." 
              value={formData.address} 
              onChange={handleChange} 
              className={inputClass} 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <input 
                name="password" 
                type="password" 
                autoComplete="new-password" 
                required 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={handleChange} 
                className={inputClass} 
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Xác nhận mật khẩu
              </label>
              <input 
                name="confirmPassword" 
                type="password" 
                autoComplete="new-password" 
                required 
                placeholder="••••••••" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                className={inputClass} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !!success} 
            className="w-full mt-2 py-3.5 px-4 rounded-xl text-xs font-mono font-extrabold tracking-wider bg-neon-cyan text-dark-base hover:bg-highlight shadow-neon-cyan transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed hover:scale-[1.02]"
          >
            {isLoading ? 'ĐANG TẠO TÀI KHOẢN...' : (
              <>
                <span>HOÀN TẤT ĐĂNG KÝ</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-neon-cyan hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;