import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User as UserIcon, Shield, Server, Bell } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/90 px-6 py-3.5 flex justify-between items-center shadow-lg relative z-10">
      {/* Left: Server Status & Quick Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Server size={13} className="text-neon-cyan" />
          <span className="w-2 h-2 rounded-full bg-neon-emerald animate-pulse"></span>
          <span className="text-[11px] font-mono text-slate-300">Server: <strong className="text-white">Active</strong></span>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden md:block">
          Hệ thống quản trị bán hàng & kiểm soát kho linh kiện PC
        </div>
      </div>

      {/* Right: Admin Account Profile & Logout */}
      <div className="flex items-center space-x-4">
        {/* Admin profile chip */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 py-1.5 px-3.5 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-neon-cyan">
            <UserIcon size={16} />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-white leading-tight">
              {user?.name || 'Administrator'}
            </div>
            <div className="text-[10px] text-neon-purple font-mono uppercase flex items-center gap-1">
              <Shield size={10} />
              <span>{user?.role || 'Admin'}</span>
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 border border-slate-800 text-rose-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 rounded-xl transition-all duration-200 text-xs font-mono font-bold"
          title="Đăng xuất khỏi hệ thống quản trị"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Thoát</span>
        </button>
      </div>
    </header>
  );
};

export default Header;