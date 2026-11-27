import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../../types';
import api, { API_HOST } from '../../services/api';
import Spinner from '../common/Spinner';
import { X, Search, Check, AlertCircle } from 'lucide-react';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  categoryId: number;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectProduct, 
  categoryId 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && categoryId) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const response = await api.get<any>('/product');
          const allProducts = Array.isArray(response) 
            ? response 
            : (response?.data && Array.isArray(response.data) ? response.data : []);
          
          const categoryProducts = allProducts.filter((p: Product) => p.category_id === categoryId);
          setProducts(categoryProducts);
        } catch (error) {
          console.error(`Failed to fetch products for category ${categoryId}`, error);
          setProducts([]);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [isOpen, categoryId]);
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-slate-950/95 border border-slate-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-800 flex-shrink-0 bg-slate-900/60">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên linh kiện..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-all"
              autoFocus
            />
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors ml-4" 
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 flex-grow bg-slate-950">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all cursor-pointer group" 
                  onClick={() => onSelectProduct(product)}
                >
                  <div>
                    <div className="w-full aspect-square flex items-center justify-center bg-slate-950 rounded-xl mb-3 border border-slate-850 overflow-hidden">
                      <img 
                        src={product.mainImage ? `${API_HOST}${product.mainImage}` : `https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=200&q=80`} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="font-semibold text-xs sm:text-sm text-slate-100 group-hover:text-neon-cyan transition-colors line-clamp-2">
                      {product.name}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-white">
                        {parseFloat(product.price).toLocaleString('vi-VN')}
                      </span>
                      <span className="text-[10px] text-neon-cyan font-mono ml-1">₫</span>
                    </div>

                    <button className="px-3 py-1 bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 rounded-lg text-xs font-mono font-bold group-hover:bg-neon-cyan group-hover:text-dark-base transition-colors flex items-center gap-1">
                      <Check size={12} />
                      <span>Chọn</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <AlertCircle size={36} className="mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-mono">Không tìm thấy linh kiện nào cho danh mục này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;