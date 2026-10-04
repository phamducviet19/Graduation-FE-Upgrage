import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Heart, GitCompare, User as UserIcon, LogOut, Menu, X, 
  Cpu, Wrench, Search, Sparkles, Shield, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCompare } from '../../contexts/CompareContext';
import { usePCBuild } from '../../contexts/PCBuildContext';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();
  const { builds } = usePCBuild();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-1.5 px-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 ${
      isActive 
        ? 'text-neon-cyan bg-neon-cyan/10 shadow-[0_0_12px_rgba(0,240,255,0.25)] border border-neon-cyan/30' 
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  const iconActionClass = (isActive: boolean, activeColor = 'text-neon-cyan') =>
    `relative p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center ${
      isActive
        ? `bg-slate-800 border-slate-700 ${activeColor} shadow-md`
        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800/80'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-dark-base/85 backdrop-blur-xl border-b border-dark-border/80 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-neon-cyan group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-dark-base rounded-[11px] flex items-center justify-center">
                <Cpu className="text-neon-cyan group-hover:rotate-12 transition-transform duration-300" size={22} />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-wider text-white">CYBER</span>
                <span className="font-extrabold text-2xl tracking-wider gradient-text-cyan">PC</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-neon-cyan/15 text-neon-cyan px-1.5 py-0.5 rounded border border-neon-cyan/30">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wider font-mono -mt-1">NEXT-GEN HARDWARE</span>
            </div>
          </Link>

          {/* Quick Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 font-medium">
            <NavLink to="/" className={navLinkClass}>
              Trang chủ
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              Sản phẩm
            </NavLink>
            <NavLink to="/pcbuilds" className={navLinkClass}>
              <Wrench size={16} className="text-neon-cyan" />
              <span>Xây dựng PC</span>
              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded font-mono font-bold">HOT</span>
            </NavLink>
            <NavLink to="/pcbuild/ai" className={navLinkClass}>
              <Sparkles size={16} className="text-neon-purple animate-pulse" />
              <span className="bg-gradient-to-r from-neon-purple to-neon-rose bg-clip-text text-transparent font-bold">
                Tư vấn AI
              </span>
            </NavLink>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative group">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm linh kiện RTX 4090, Intel Core i7, RAM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan focus:outline-none transition-all duration-300 group-hover:border-slate-700"
              />
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-neon-cyan transition-colors" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Compare Products */}
            <NavLink 
              to="/compare" 
              className={({ isActive }) => iconActionClass(isActive, 'text-neon-cyan')} 
              aria-label="Compare Products"
              title="So sánh linh kiện"
            >
              <GitCompare size={20} />
              {compareList.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-dark-base font-bold text-xs shadow-neon-cyan">
                  {compareList.length}
                </span>
              )}
            </NavLink>

            {/* Wishlist */}
            <NavLink 
              to="/wishlist" 
              className={({ isActive }) => iconActionClass(isActive, 'text-neon-rose')} 
              aria-label="Your Wishlist"
              title="Danh sách yêu thích"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neon-rose text-white font-bold text-xs shadow-md">
                  {wishlist.length}
                </span>
              )}
            </NavLink>

            {/* Shopping Cart */}
            <NavLink 
              to="/cart" 
              className={({ isActive }) => iconActionClass(isActive, 'text-neon-emerald')} 
              aria-label="Shopping Cart"
              title="Giỏ hàng"
            >
              <ShoppingCart size={20} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neon-emerald text-dark-base font-extrabold text-xs shadow-neon-emerald">
                  {totalCartItems}
                </span>
              )}
            </NavLink>

            {/* User Profile / Auth State */}
            <div className="hidden sm:block border-l border-slate-800 ml-1 pl-3">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                    className={`flex items-center gap-2.5 py-1.5 px-3 rounded-xl border transition-all duration-300 ${
                      isUserMenuOpen 
                        ? 'bg-slate-800 border-neon-cyan/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-neon-cyan/40 flex items-center justify-center text-neon-cyan">
                      <UserIcon size={16} />
                    </div>
                    <div className="text-left hidden md:block">
                      <div className="text-xs font-bold text-slate-100 leading-tight">
                        {user?.name ? user.name.split(' ')[0] : 'User'}
                      </div>
                      <div className="text-[10px] text-neon-cyan font-mono uppercase">
                        {user?.role || 'Member'}
                      </div>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180 text-neon-cyan' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-[#0F172A] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_25px_rgba(0,240,255,0.1)] p-1.5 z-50 border border-slate-700 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200">
                      {/* User Account Info Header */}
                      <div className="px-3.5 py-3 bg-slate-950/80 rounded-xl mb-1.5 border border-slate-800">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-medium text-slate-400">Đăng nhập với</span>
                          <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/15 text-neon-cyan border border-cyan-500/30">
                            {user?.role || 'Member'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-white truncate" title={user?.email || user?.name}>
                          {user?.email || user?.name}
                        </p>
                      </div>

                      {/* Navigation Links */}
                      <div className="space-y-0.5">
                        <Link 
                          to="/profile" 
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-150 group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="w-7 h-7 rounded-lg bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-slate-400 group-hover:text-neon-cyan group-hover:border-neon-cyan/40 group-hover:bg-cyan-500/10 transition-all">
                            <UserIcon size={14} />
                          </div>
                          <span>Tài khoản & Đơn hàng</span>
                        </Link>
                        <Link 
                          to="/pcbuilds" 
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-150 group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="w-7 h-7 rounded-lg bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-slate-400 group-hover:text-neon-cyan group-hover:border-neon-cyan/40 group-hover:bg-cyan-500/10 transition-all">
                            <Wrench size={14} />
                          </div>
                          <span>Cấu hình PC đã lưu</span>
                        </Link>
                        {user?.role === 'admin' && (
                          <Link 
                            to="/admin" 
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-neon-purple hover:bg-purple-500/15 transition-all duration-150 group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-neon-purple/30 flex items-center justify-center text-neon-purple group-hover:bg-purple-500/25 transition-all">
                              <Shield size={14} />
                            </div>
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-800 my-1"></div>

                      {/* Logout Action */}
                      <button 
                        onClick={handleLogout} 
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-all duration-150 group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:text-rose-300 group-hover:bg-rose-500/20 transition-all">
                          <LogOut size={14} />
                        </div>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link 
                    to="/login" 
                    className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2 text-xs font-bold text-dark-base bg-neon-cyan hover:bg-highlight rounded-xl shadow-neon-cyan transition-all duration-300 hover:scale-105"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="lg:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm linh kiện, GPU, CPU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-sm text-slate-100 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:border-neon-cyan focus:outline-none"
            />
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </form>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden bg-slate-900/98 backdrop-blur-2xl border-t border-slate-800/90 animate-in slide-in-from-top-4 duration-200 shadow-2xl">
          <div className="px-4 py-3 space-y-1.5">
            <NavLink to="/" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Trang chủ</NavLink>
            <NavLink to="/products" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Sản phẩm</NavLink>
            <NavLink to="/pcbuilds" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
              <Wrench size={16} className="text-neon-cyan" />
              <span>Xây dựng PC</span>
            </NavLink>
            <NavLink to="/pcbuild/ai" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
              <Sparkles size={16} className="text-neon-purple" />
              <span>Tư vấn AI</span>
            </NavLink>
            <NavLink to="/compare" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
              <GitCompare size={16} />
              <span>So sánh linh kiện</span>
            </NavLink>
          </div>
          
          <div className="p-4 border-t border-slate-800/80">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                    <UserIcon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{user?.name}</p>
                    <p className="text-[10px] text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <Link to="/profile" className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800" onClick={() => setIsMenuOpen(false)}>
                  Tài khoản của tôi
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block px-3 py-2 rounded-lg text-sm text-neon-purple hover:bg-neon-purple/10" onClick={() => setIsMenuOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-neon-rose hover:bg-neon-rose/10">
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" className="text-center py-2.5 text-sm font-semibold bg-slate-900 border border-slate-800 rounded-xl text-slate-200" onClick={() => setIsMenuOpen(false)}>
                  Đăng nhập
                </Link>
                <Link to="/register" className="text-center py-2.5 text-sm font-bold bg-neon-cyan rounded-xl text-dark-base shadow-neon-cyan" onClick={() => setIsMenuOpen(false)}>
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;