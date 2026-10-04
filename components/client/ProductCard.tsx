import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, GitCompare, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCompare } from '../../contexts/CompareContext';
import { useAuth } from '../../contexts/AuthContext';
import { API_HOST } from '../../services/api';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useCompare();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(product.id, 1);
  };
  
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToWishlist(product.id);
  };

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCompare(product);
  };

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const isOutOfStock = product.stock === 0;
  
  const imageUrl = product.mainImage 
    ? `${API_HOST}${product.mainImage}` 
    : `https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80`;

  return (
    <Link 
      to={`/product/${product.id}`} 
      className="group relative flex flex-col bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800/90 hover:border-neon-cyan/50 hover:shadow-[0_8px_30px_rgba(0,240,255,0.15)] transition-all duration-300 overflow-hidden transform hover:-translate-y-1.5"
    >
      {/* Top Floating Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-slate-900/90 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full">
            <AlertCircle size={12} /> Hết hàng
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-emerald-500/15 text-neon-emerald border border-neon-emerald/30 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 size={12} /> Sẵn hàng
          </span>
        )}
      </div>

      {/* Quick Action Buttons (Wishlist & Compare) Top Right */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handleAddToWishlist} 
          className={`p-2 rounded-xl glass-panel transition-all duration-300 ${
            inWishlist 
              ? 'bg-rose-500/20 text-neon-rose border-rose-500/40 shadow-sm' 
              : 'text-slate-400 hover:text-neon-rose hover:border-rose-500/30'
          }`} 
          title="Thêm vào danh sách yêu thích"
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        <button 
          onClick={handleAddToCompare} 
          className={`p-2 rounded-xl glass-panel transition-all duration-300 ${
            inCompare 
              ? 'bg-cyan-500/20 text-neon-cyan border-cyan-500/40 shadow-sm' 
              : 'text-slate-400 hover:text-neon-cyan hover:border-cyan-500/30'
          }`} 
          title="So sánh linh kiện"
        >
          <GitCompare size={16} />
        </button>
      </div>

      {/* Product Image Frame */}
      <div className="relative pt-[85%] w-full overflow-hidden bg-gradient-to-b from-slate-900/80 to-slate-950/60 p-6 flex items-center justify-center">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Content Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between bg-slate-900/50">
        <div>
          {/* Brand or Category Tag */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
            <span className="uppercase tracking-wider text-neon-cyan font-semibold">Linh Kiện Cao Cấp</span>
            <span className="text-slate-400">Kho: {product.stock}</span>
          </div>

          {/* Product Name */}
          <h3 
            className="text-sm font-semibold text-slate-100 group-hover:text-neon-cyan transition-colors line-clamp-2 leading-snug min-h-[2.5rem]" 
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-mono font-extrabold text-white tracking-tight">
              {parseFloat(product.price).toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-bold text-neon-cyan font-mono">₫</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold font-mono tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ${
              isOutOfStock 
                ? 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                : 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan hover:text-dark-base hover:shadow-neon-cyan active:scale-95'
            }`}
          >
            <ShoppingCart size={15} />
            <span>{isOutOfStock ? 'TẠM HẾT HÀNG' : 'THÊM VÀO GIỎ'}</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;