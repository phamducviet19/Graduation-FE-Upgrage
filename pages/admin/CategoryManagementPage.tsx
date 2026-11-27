import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../services/api';
import { Category } from '../../types';
import { PlusCircle, Edit, Trash2, Search, List, RotateCcw, SlidersHorizontal } from 'lucide-react';
import SimpleFormModal from '../../components/admin/SimpleFormModal';
import CategoryAttributesModal from '../../components/admin/CategoryAttributesModal';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import ConfirmModal from '../../components/common/ConfirmModal';

const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [categoryForAttributes, setCategoryForAttributes] = useState<Category | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Category[]>('/category');
      setCategories(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách danh mục.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, refreshTrigger]);

  const handleOpenAddModal = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (category: Category) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoryToEdit(null);
  };
  
  const handleSaveCategory = async (name: string) => {
    try {
      const payload = { name };
      if (categoryToEdit) {
        await api.put(`/category/${categoryToEdit.id}`, payload);
      } else {
        await api.post('/category', payload);
      }
      handleCloseModal();
      setRefreshTrigger(t => t + 1);
    } catch (err: any) {
      alert(`Lỗi khi lưu danh mục:\n${err.message || 'Lỗi server'}`);
    }
  };

  const confirmDelete = async () => {
    if (categoryToDelete === null) return;
    try {
      await api.delete(`/category/${categoryToDelete}`);
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete));
    } catch (err: any) {
      alert(`Xóa danh mục thất bại:\n${err.message || 'Vui lòng thử lại.'}`);
    }
  };

  const handleDelete = (id: number) => {
    setCategoryToDelete(id);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentCategories = filteredCategories.slice(
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
            <List className="text-neon-cyan" size={26} />
            <span>Danh Mục Linh Kiện Máy Tính</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Phân loại CPU, VGA, Mainboard, RAM, SSD, Nguồn, Tản nhiệt, Case
          </p>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 bg-neon-cyan text-dark-base font-mono font-bold text-xs px-4 py-2.5 rounded-xl shadow-neon-cyan hover:bg-highlight transition-all"
        >
          <PlusCircle size={15} />
          <span>Thêm Danh Mục Mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-800/90 shadow-xl flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
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
                  <th scope="col" className="px-5 py-3.5">Tên Danh Mục</th>
                  <th scope="col" className="px-5 py-3.5 text-right w-48">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                {currentCategories.length > 0 ? currentCategories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-850 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500">#{cat.id}</td>
                    <th scope="row" className="px-5 py-3.5 font-bold text-white font-sans text-sm">
                      {cat.name}
                    </th>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setCategoryForAttributes(cat)} 
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 text-neon-cyan border border-neon-cyan/30 hover:bg-cyan-500/20 transition-colors font-mono text-[11px] font-semibold"
                          title="Xem & thêm thuộc tính"
                        >
                          <SlidersHorizontal size={13} />
                          <span>Thuộc tính</span>
                        </button>
                        <button 
                          onClick={() => handleOpenEditModal(cat)} 
                          className="p-1.5 rounded-lg bg-slate-800 text-neon-cyan hover:bg-slate-700 transition-colors"
                          title="Sửa danh mục"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)} 
                          className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Xóa danh mục"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="text-center py-10 text-slate-500">
                      Không tìm thấy danh mục nào.
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
        onSave={handleSaveCategory}
        title={categoryToEdit ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"}
        initialValue={categoryToEdit ? categoryToEdit.name : ""}
      />

      <CategoryAttributesModal
        isOpen={categoryForAttributes !== null}
        onClose={() => setCategoryForAttributes(null)}
        category={categoryForAttributes}
      />

      <ConfirmModal
        isOpen={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDelete}
        title="Xóa danh mục"
        message="Bạn có chắc chắn muốn xóa danh mục này? Các linh kiện thuộc danh mục này có thể bị ảnh hưởng."
        confirmText="Xác nhận xóa"
      />
    </div>
  );
};

export default CategoryManagementPage;