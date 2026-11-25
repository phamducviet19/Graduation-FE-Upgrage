import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { Product, Category, Brand, ProductSaveData } from '../../types';
import { PlusCircle, Edit, Trash2, Search, Package, Layers, Tag, RotateCcw } from 'lucide-react';
import ProductFormModal from '../../components/admin/ProductFormModal';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import ConfirmModal from '../../components/common/ConfirmModal';

interface ProductsByCategoryProps {
  category: Category;
  refreshTrigger: number;
  searchTerm: string;
  brandFilter: string;
  onEdit: (product: Product) => void;
}

const ProductsByCategory: React.FC<ProductsByCategoryProps> = ({ 
  category, 
  refreshTrigger, 
  searchTerm, 
  brandFilter, 
  onEdit 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Product[]>(`/product/category/${category.id}`);
      setProducts(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error(`Failed to fetch products for ${category.name}`, error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category.id, category.name]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshTrigger]);

  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (productToDelete === null) return;
    try {
      await api.delete(`/product/${productToDelete}`);
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productToDelete));
    } catch (error: any) {
      console.error('Failed to delete product', error);
      alert(`Xóa sản phẩm thất bại:\n${error.message || 'Lỗi server'}`);
    }
  };

  const handleDelete = (productId: number) => {
    setProductToDelete(productId);
  };

  const filteredProducts = products.filter(product => {
    const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const brandMatch = brandFilter ? product.brand_id.toString() === brandFilter : true;
    return searchMatch && brandMatch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, brandFilter]);

  if (!loading && filteredProducts.length === 0 && (searchTerm || brandFilter)) {
    return null; // Don't show empty category card if filtering
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-800/90 shadow-xl overflow-hidden mb-8">
      {/* Category header */}
      <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan"></span>
          <span>{category.name}</span>
          <span className="text-xs font-mono text-slate-500 font-normal">
            ({filteredProducts.length} linh kiện)
          </span>
        </h2>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <p className="text-xs font-mono text-slate-500 py-6 text-center">Chưa có sản phẩm nào trong danh mục này.</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-xs font-mono text-slate-500 py-6 text-center">Không có sản phẩm nào khớp với bộ lọc.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="text-[11px] uppercase bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">ID</th>
                    <th scope="col" className="px-5 py-3.5">Tên Linh Kiện</th>
                    <th scope="col" className="px-5 py-3.5">Đơn Giá</th>
                    <th scope="col" className="px-5 py-3.5">Kho Hàng</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                  {currentProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-850 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-500">#{product.id}</td>
                      <th scope="row" className="px-5 py-3.5 font-semibold text-white whitespace-nowrap">
                        {product.name}
                      </th>
                      <td className="px-5 py-3.5 font-mono font-bold text-neon-cyan">
                        {parseFloat(product.price).toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        {product.stock > 0 ? (
                          <span className="text-neon-emerald font-semibold">{product.stock} cái</span>
                        ) : (
                          <span className="text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded">Hết hàng</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => onEdit(product)} 
                            className="p-1.5 rounded-lg bg-slate-800 text-neon-cyan hover:bg-slate-700 transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)} 
                            className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Xóa linh kiện"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 pt-2">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={productToDelete !== null}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDelete}
        title="Xóa linh kiện"
        message="Bạn có chắc chắn muốn xóa linh kiện này khỏi hệ thống? Thao tác này không thể hoàn tác."
        confirmText="Xác nhận xóa"
      />
    </div>
  );
};

const ProductManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          api.get<Category[]>('/category'),
          api.get<Brand[]>('/brand')
        ]);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
        setBrands(Array.isArray(brandsRes) ? brandsRes : []);
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách danh mục & thương hiệu.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  const handleSaveProduct = async (productData: ProductSaveData, images: { image1: File | null; image2: File | null; image3: File | null }) => {
    try {
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('stock', productData.stock.toString());
      formData.append('brand_id', productData.brand_id.toString());
      formData.append('category_id', productData.category_id.toString());
      formData.append('attributes', JSON.stringify(productData.attributes));

      if (images.image1) formData.append('images', images.image1);
      if (images.image2) formData.append('images', images.image2);
      if (images.image3) formData.append('images', images.image3);

      if (productToEdit) {
        await api.put(`/product/${productToEdit.id}`, formData);
      } else {
        await api.post('/product', formData);
      }
      
      handleCloseModal();
      setRefreshTrigger(t => t + 1);
    } catch (err: any) {
      console.error("Failed to save product:", err);
      alert(`Lưu sản phẩm thất bại:\n${err.message || 'Lỗi hệ thống'}`);
      throw err;
    }
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setBrandFilter('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-72">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-center">
        {error}
      </div>
    );
  }

  const displayedCategories = categoryFilter
    ? categories.filter(c => c.id.toString() === categoryFilter)
    : categories;

  return (
    <div className="space-y-8">
      {/* Top action bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Package className="text-neon-cyan" size={26} />
            <span>Quản Lý Linh Kiện & Sản Phẩm</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Thêm mới, sửa thông số kỹ thuật và quản lý tồn kho linh kiện
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Tìm theo tên linh kiện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-all"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-neon-cyan cursor-pointer"
          >
            <option value="" className="bg-slate-950">Tất cả danh mục</option>
            {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-slate-950">{cat.name}</option>)}
          </select>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-neon-cyan cursor-pointer"
          >
            <option value="" className="bg-slate-950">Tất cả thương hiệu</option>
            {brands.map(brand => <option key={brand.id} value={brand.id} className="bg-slate-950">{brand.name}</option>)}
          </select>

          {(searchTerm || categoryFilter || brandFilter) && (
            <button 
              onClick={handleClearFilters} 
              className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw size={15} />
            </button>
          )}

          <button 
            onClick={handleOpenAddModal} 
            className="flex items-center gap-1.5 bg-neon-cyan text-dark-base font-mono font-bold text-xs px-4 py-2 rounded-xl shadow-neon-cyan hover:bg-highlight transition-all"
          >
            <PlusCircle size={15} />
            <span>Thêm Linh Kiện Mới</span>
          </button>
        </div>
      </div>

      {/* Categories loop */}
      {displayedCategories.length > 0 ? (
        displayedCategories.map(category => (
          <ProductsByCategory 
            key={category.id} 
            category={category} 
            refreshTrigger={refreshTrigger} 
            searchTerm={searchTerm}
            brandFilter={brandFilter}
            onEdit={handleOpenEditModal}
          />
        ))
      ) : (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 text-sm">
          Không tìm thấy danh mục linh kiện nào.
        </div>
      )}

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        brands={brands}
        categories={categories}
        productToEdit={productToEdit}
      />
    </div>
  );
};

export default ProductManagementPage;