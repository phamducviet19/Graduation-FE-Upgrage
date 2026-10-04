import React from 'react';
import { Category, Brand } from '../../types';
import { Search, X, RotateCcw, Filter, Tag, Layers, DollarSign } from 'lucide-react';

interface FilterSidebarProps {
  categories: Category[];
  brands: Brand[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  brandFilter: string;
  setBrandFilter: (value: string) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  clearFilters: () => void;
  className?: string;
  onClose?: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  brands,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  brandFilter,
  setBrandFilter,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  clearFilters,
  className,
  onClose
}) => {
  const baseInputClass = "w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all duration-200";

  return (
    <aside className={`bg-slate-900/85 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/90 shadow-2xl ${className}`}>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-neon-cyan" />
          <h2 className="text-base font-extrabold text-white tracking-wide uppercase">Bộ Lọc Linh Kiện</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white p-1">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label htmlFor="search-sidebar" className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            Tìm kiếm từ khóa
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            <input
              type="text"
              id="search-sidebar"
              placeholder="RTX 4060, Intel i5..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`${baseInputClass} pl-10`}
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <label htmlFor="category" className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            <Layers size={13} className="text-neon-cyan" />
            <span>Danh Mục</span>
          </label>
          <select
            id="category"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className={`${baseInputClass} cursor-pointer`}
          >
            <option value="" className="bg-slate-900 text-slate-300">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-100">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Brands */}
        <div>
          <label htmlFor="brand" className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            <Tag size={13} className="text-neon-purple" />
            <span>Thương Hiệu (Hãng)</span>
          </label>
          <select
            id="brand"
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className={`${baseInputClass} cursor-pointer`}
          >
            <option value="" className="bg-slate-900 text-slate-300">Tất cả thương hiệu</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id} className="bg-slate-900 text-slate-100">
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            <DollarSign size={13} className="text-neon-emerald" />
            <span>Khoảng Giá (VNĐ)</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Tối thiểu"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className={`${baseInputClass} text-center`}
              aria-label="Minimum price"
            />
            <span className="text-slate-500 font-mono">-</span>
            <input
              type="number"
              placeholder="Tối đa"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className={`${baseInputClass} text-center`}
              aria-label="Maximum price"
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="pt-2">
          <button 
            onClick={clearFilters}
            className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all duration-300 font-mono text-xs font-bold flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            <span>Đặt Lại Bộ Lọc</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;