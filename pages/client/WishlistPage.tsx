import React, { useState } from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import { Trash2, ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { API_HOST } from '../../services/api';

const WishlistPage: React.FC = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(wishlist.length / itemsPerPage);
  const paginatedWishlist = wishlist.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center bg-slate-900/60 border border-slate-800 p-12 sm:p-16 rounded-3xl max-w-lg mx-auto shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto mb-6">
          <Heart size={36} />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Danh sách yêu thích đang trống</h1>
        <p className="text-sm text-slate-400 mb-8">
          Bạn chưa lưu linh kiện nào vào danh sách. Hãy nhấn biểu tượng trái tim ở linh kiện bạn yêu thích nhé!
        </p>
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 bg-neon-cyan text-dark-base font-extrabold px-6 py-3.5 rounded-xl shadow-neon-cyan hover:bg-highlight hover:scale-105 transition-all text-xs tracking-wider"
        >
          <span>KHÁM PHÁ LINH KIỆN</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Heart className="text-neon-rose" size={26} fill="currentColor" />
            <span>Linh Kiện Đã Lưu</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Đang lưu <strong className="text-neon-cyan">{wishlist.length}</strong> sản phẩm yêu thích
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {paginatedWishlist.map(item => (
          <div 
            key={item.product_id} 
            className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 border border-slate-800/90 rounded-2xl bg-slate-950/80 hover:border-slate-700 transition-colors gap-4"
          >
            <div className="flex items-center gap-4 flex-grow w-full sm:w-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 aspect-square overflow-hidden">
                <img 
                  src={item.Product.mainImage ? `${API_HOST}${item.Product.mainImage}` : `https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=200&q=80`} 
                  alt={item.Product.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-grow">
                <Link 
                  to={`/product/${item.Product.id}`} 
                  className="font-bold text-sm text-slate-100 hover:text-neon-cyan transition-colors line-clamp-1"
                >
                  {item.Product.name}
                </Link>
                <p className="text-sm font-mono font-bold text-neon-cyan mt-1">
                  {parseFloat(item.Product.price).toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button 
                onClick={() => addToCart(item.product_id, 1)} 
                disabled={item.Product.stock === 0}
                className="px-4 py-2.5 text-xs font-mono font-bold bg-neon-cyan text-dark-base rounded-xl hover:bg-highlight shadow-neon-cyan disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
              >
                <ShoppingCart size={14}/>
                <span>{item.Product.stock > 0 ? 'THÊM VÀO GIỎ' : 'HẾT HÀNG'}</span>
              </button>
              <button 
                onClick={() => removeFromWishlist(item.product_id)} 
                className="p-2.5 text-slate-500 hover:text-neon-rose hover:bg-rose-500/10 rounded-xl border border-slate-800 transition-colors"
                title="Xóa khỏi danh sách"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default WishlistPage;