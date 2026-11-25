import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../services/api';
import { Supplier } from '../../types';
import { PlusCircle, Edit, Trash2, Search, Truck, RotateCcw } from 'lucide-react';
import SupplierFormModal from '../../components/admin/SupplierFormModal';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import ConfirmModal from '../../components/common/ConfirmModal';

const SupplierManagementPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 400);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ data: Supplier[] }>('/supplier');
      setSuppliers(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách nhà cung cấp.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers, refreshTrigger]);

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      supplier.email.toLowerCase().includes(lowerCaseSearchTerm) ||
      (supplier.phone && supplier.phone.includes(lowerCaseSearchTerm))
    );
  }, [suppliers, searchTerm]);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const currentSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenAddModal = () => {
    setSupplierToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSupplierToEdit(null);
  };

  const handleSaveSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    try {
      if (supplierToEdit) {
        await api.put(`/supplier/${supplierToEdit.id}`, supplierData);
      } else {
        await api.post('/supplier', supplierData);
      }
      handleCloseModal();
      setRefreshTrigger(t => t + 1);
    } catch (err: any) {
      alert(`Lưu nhà cung cấp thất bại:\n${err.message || 'Lỗi server'}`);
    }
  };

  const confirmDelete = async () => {
    if (supplierToDelete === null) return;
    try {
      await api.delete(`/supplier/${supplierToDelete}`);
      setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete));
    } catch (err: any) {
      alert(`Xóa nhà cung cấp thất bại:\n${err.message || 'Vui lòng thử lại.'}`);
    }
  };

  const handleDelete = (id: number) => {
    setSupplierToDelete(id);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Truck className="text-neon-cyan" size={26} />
            <span>Quản Lý Nhà Cung Cấp</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Đối tác cung ứng linh kiện, nhà phân phối chính hãng
          </p>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 bg-neon-cyan text-dark-base font-mono font-bold text-xs px-4 py-2.5 rounded-xl shadow-neon-cyan hover:bg-highlight transition-all"
        >
          <PlusCircle size={15} />
          <span>Thêm Nhà Cung Cấp</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-800/90 shadow-xl flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-all"
          />
        </div>
        {inputValue && (
          <button 
            onClick={() => { setInputValue(''); setSearchTerm(''); }} 
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
                  <th scope="col" className="px-5 py-3.5">ID</th>
                  <th scope="col" className="px-5 py-3.5">Tên Nhà Cung Cấp</th>
                  <th scope="col" className="px-5 py-3.5">Email</th>
                  <th scope="col" className="px-5 py-3.5">Số Điện Thoại</th>
                  <th scope="col" className="px-5 py-3.5">Địa Chỉ</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                {currentSuppliers.length > 0 ? currentSuppliers.map(supplier => (
                  <tr key={supplier.id} className="hover:bg-slate-850 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500">#{supplier.id}</td>
                    <td className="px-5 py-3.5 font-bold text-white font-sans text-sm">{supplier.name}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">{supplier.email}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">{supplier.phone}</td>
                    <td className="px-5 py-3.5 text-slate-400 max-w-xs truncate">{supplier.address}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(supplier)} 
                          className="p-1.5 rounded-lg bg-slate-800 text-neon-cyan hover:bg-slate-700 transition-colors"
                          title="Sửa thông tin"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(supplier.id)} 
                          className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Xóa nhà cung cấp"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500">
                      Không tìm thấy nhà cung cấp nào.
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

      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSupplier}
        supplierToEdit={supplierToEdit}
      />

      <ConfirmModal
        isOpen={supplierToDelete !== null}
        onClose={() => setSupplierToDelete(null)}
        onConfirm={confirmDelete}
        title="Xóa nhà cung cấp"
        message="Bạn có chắc chắn muốn xóa nhà cung cấp này? Thao tác này không thể hoàn tác."
        confirmText="Xác nhận xóa"
      />
    </div>
  );
};

export default SupplierManagementPage;