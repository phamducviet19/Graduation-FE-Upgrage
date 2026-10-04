import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Tag, List, Users, ShoppingCart, 
  Truck, Inbox, Cpu, CreditCard, ExternalLink, ShieldAlert 
} from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Bảng Điều Khiển', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Quản Lý Sản Phẩm', icon: Package },
  { to: '/admin/categories', label: 'Danh Mục Linh Kiện', icon: List },
  { to: '/admin/brands', label: 'Thương Hiệu (Hãng)', icon: Tag },
  { to: '/admin/orders', label: 'Đơn Đặt Hàng', icon: ShoppingCart },
  { to: '/admin/payments', label: 'Lịch Sử Giao Dịch', icon: CreditCard },
  { to: '/admin/customers', label: 'Khách Hàng', icon: Users },
  { to: '/admin/suppliers', label: 'Nhà Cung Cấp', icon: Truck },
  { to: '/admin/imports', label: 'Nhập Kho Hàng', icon: Inbox },
];

const Sidebar: React.FC = () => {
  const linkClasses = "flex items-center px-4 py-2.5 text-xs font-mono font-semibold text-slate-400 hover:text-white hover:bg-slate-900/90 rounded-xl transition-all duration-200 group border border-transparent";
  const activeLinkClasses = "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 !text-neon-cyan !border-neon-cyan/30 shadow-[0_0_15px_rgba(0,240,255,0.15)] font-bold";

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex-shrink-0 flex flex-col justify-between shadow-2xl relative z-20">
      {/* Top Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-neon-cyan">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Cpu className="text-neon-cyan" size={20} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-white">CYBER</span>
                <span className="font-extrabold text-base tracking-wider gradient-text-cyan">ADMIN</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase block -mt-0.5">
                COMMAND CENTER v2.5
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-3 py-1 mb-1">
            Hệ Thống Quản Trị
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
              >
                <Icon className="w-4 h-4 mr-3 group-hover:text-neon-cyan transition-colors" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Return Store Button */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all group"
        >
          <span className="flex items-center gap-2">
            <ExternalLink size={14} className="text-neon-cyan" />
            <span>Xem Cửa Hàng Client</span>
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Store</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;