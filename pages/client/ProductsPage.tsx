import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Product, Category, Brand } from '../../types';
import ProductCard from '../../components/client/ProductCard';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import FilterSidebar from '../../components/client/FilterSidebar';
import { SlidersHorizontal, ArrowUpDown, Layers, PackageX } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Listen to searchParams updates (e.g. from Header or Homepage)
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      setSearchTerm(urlSearch);
    }
    const urlCategory = searchParams.get('category');
    if (urlCategory && categories.length > 0) {
      const matched = categories.find(c => c.name.toLowerCase().includes(urlCategory.toLowerCase()));
      if (matched) {
        setCategoryFilter(matched.id.toString());
      }
    }
  }, [searchParams, categories]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          api.get<any>('/product'),
          api.get<any>('/category'),
          api.get<any>('/brand'),
        ]);

        const getArray = (res: any) => (Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []));

        setProducts(getArray(productsRes));
        setCategories(getArray(categoriesRes));
        setBrands(getArray(brandsRes));
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const clearFilters = () => {
    setSearchTerm('');
    setBrandFilter('');
    setCategoryFilter('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
    setSearchParams({});
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const brandMatch = brandFilter ? product.brand_id.toString() === brandFilter : true;
      const categoryMatch = categoryFilter ? product.category_id.toString() === categoryFilter : true;
      const minPriceMatch = minPrice ? parseFloat(product.price) >= parseFloat(minPrice) : true;
      const maxPriceMatch = maxPrice ? parseFloat(product.price) <= parseFloat(maxPrice) : true;
      return searchMatch && brandMatch && categoryMatch && minPriceMatch && maxPriceMatch;
    });

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    return result;
  }, [products, searchTerm, brandFilter, categoryFilter, minPrice, maxPrice, sortBy]);

  // Pagination Logic (9 sản phẩm mỗi trang: lưới 3x3)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, brandFilter, categoryFilter, minPrice, maxPrice, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const filterSidebarProps = {
    categories,
    brands,
    searchTerm, setSearchTerm,
    categoryFilter, setCategoryFilter,
    brandFilter, setBrandFilter,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    clearFilters
  };

  const hasActiveFilters = Boolean(searchTerm || brandFilter || categoryFilter || minPrice || maxPrice);

  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Kho Linh Kiện Máy Tính
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Phân phối chính hãng linh kiện cao cấp cho Game thủ & Dân thiết kế đồ họa
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300">
              <ArrowUpDown size={14} className="text-neon-cyan" />
              <span>Sắp xếp:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="default" className="bg-slate-900">Mặc định</option>
                <option value="price-asc" className="bg-slate-900">Giá: Thấp đến Cao</option>
                <option value="price-desc" className="bg-slate-900">Giá: Cao xuống Thấp</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="md:hidden flex items-center gap-2 px-3 py-2 bg-neon-cyan text-dark-base rounded-xl font-bold text-xs"
            >
              <SlidersHorizontal size={14} />
              <span>Lọc ({filteredProducts.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Backdrop */}
        {isFilterOpen && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden" 
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        {/* Sidebar */}
        <FilterSidebar 
          {...filterSidebarProps}
          onClose={() => setIsFilterOpen(false)}
          className={`
            md:w-1/4 md:relative md:translate-x-0 md:block
            fixed top-0 left-0 h-full w-4/5 max-w-xs z-50 transform transition-transform duration-300 ease-in-out
            ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        />

        {/* Product Grid */}
        <div className="md:w-3/4 flex-1">
          {/* Active Filter Bar Info */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>Hiển thị <strong className="text-neon-cyan">{filteredProducts.length}</strong> sản phẩm</span>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-neon-rose hover:underline"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>

          {loading && (
            <div className="flex justify-center items-center h-72">
              <Spinner />
            </div>
          )}
          
          {error && (
            <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-center">
              {error}
            </div>
          )}

          {!loading && !error && (
            filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </>
            ) : (
              <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
                  <PackageX size={32} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Không tìm thấy linh kiện phù hợp</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
                  Vui lòng thử tìm với từ khóa khác hoặc điều chỉnh lại tầm giá và thương hiệu.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 bg-neon-cyan text-dark-base rounded-xl font-bold text-xs shadow-neon-cyan hover:bg-highlight transition-all"
                >
                  Xóa bộ lọc để xem tất cả
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;