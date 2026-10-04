import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../services/api';
import { Brand } from '../../types';
import { PlusCircle, Edit, Trash2, Search, Tag, RotateCcw } from 'lucide-react';
import SimpleFormModal from '../../components/admin/SimpleFormModal';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';

const BrandManagementPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Brand[]>('/brand');
      setBrands(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách thương hiệu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands, refreshTrigger]);
  
  const handleOpenAddModal = () => {
    setBrandToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand: Brand) => {
    setBrandToEdit(brand);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setBrandToEdit(null);
  };
  
  const handleSaveBrand = async (name: string) => {
    try {
      const payload = { name };
      if (brandToEdit) {
        await api.put(`/brand/${brandToEdit.id}`, payload);
      } else {
        await api.post('/brand', payload);
      }
      handleCloseModal();
      setRefreshTrigger(t => t + 1);
    } catch (err: any) {
      alert(`Lỗi khi lưu thương hiệu:\n${err.message || 'Lỗi server'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) {
      try {
        await api.delete(`/brand/${id}`);
        setBrands(prev => prev.filter(b => b.id !== id));
      } catch (err) {
        alert('Xóa thương hiệu thất bại. Vui lòng thử lại.');
      }
    }
  };

  const filteredBrands = useMemo(() => {
    return brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [brands, searchTerm]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const currentBrands = filteredBrands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Tag className="text-neon-purple" size={26} />
            <span>Thương Hiệu & Hãng Sản Xuất</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Quản lý các đối tác phần cứng: ASUS, MSI, Gigabyte, Intel, AMD, Corsair...
          </p>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 bg-neon-cyan text-dark-base font-mono font-bold text-xs px-4 py-2.5 rounded-xl shadow-neon-cyan hover:bg-highlight transition-all"
        >
          <PlusCircle size={15} />
          <span>Thêm Thương Hiệu Mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-800/90 shadow-xl flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Tìm kiếm thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-all"
          />
        </div>
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl"
            title="Xóa tìm kiếm"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-center text-xs">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-800/90 shadow-2xl p-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[11px] uppercase bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-5 py-3.5 w-24">ID</th>
                  <th scope="col" className="px-5 py-3.5">Tên Thương Hiệu</th>
                  <th scope="col" className="px-5 py-3.5 text-right w-32">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                {currentBrands.length > 0 ? currentBrands.map(brand => (
                  <tr key={brand.id} className="hover:bg-slate-850 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500">#{brand.id}</td>
                    <th scope="row" className="px-5 py-3.5 font-bold text-white font-sans text-sm">
                      {brand.name}
                    </th>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(brand)} 
                          className="p-1.5 rounded-lg bg-slate-800 text-neon-cyan hover:bg-slate-700 transition-colors"
                          title="Sửa thương hiệu"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(brand.id)} 
                          className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Xóa thương hiệu"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="text-center py-10 text-slate-500">
                      Không tìm thấy thương hiệu nào.
                    </td>
                  </tr>
                )}
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
        </div>
      )}

      <SimpleFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveBrand}
        title={brandToEdit ? "Sửa Thương Hiệu" : "Thêm Thương Hiệu Mới"}
        initialValue={brandToEdit ? brandToEdit.name : ""}
      />
    </div>
  );
};

export default BrandManagementPage;