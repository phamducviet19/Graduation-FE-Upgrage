import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../services/api';
import { ImportReceipt, Supplier } from '../../types';
import { PlusCircle, Trash2, Eye, Search, Inbox, RotateCcw } from 'lucide-react';
import ImportFormModal from '../../components/admin/ImportFormModal';
import ImportDetailModal from '../../components/admin/ImportDetailModal';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';

const ImportManagementPage: React.FC = () => {
  const [imports, setImports] = useState<ImportReceipt[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedImport, setSelectedImport] = useState<ImportReceipt | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 400);
    return () => clearTimeout(handler);
  }, [inputValue]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const supplierData = await api.get<any>('/supplier');
        const supplierList = Array.isArray(supplierData?.data)
          ? supplierData.data
          : (Array.isArray(supplierData) ? supplierData : []);
        setSuppliers(supplierList);
      } catch (err) {
        console.error("Failed to fetch suppliers", err);
      }
    };
    fetchSuppliers();
  }, []);

  const fetchImports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<ImportReceipt[]>('/import');
      setImports(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách phiếu nhập kho.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImports();
  }, [fetchImports, refreshTrigger]);

  const filteredImports = useMemo(() => {
    return imports.filter(item => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      const matchesSearch = searchTerm
        ? item.Supplier?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.id.toString().includes(lowerCaseSearchTerm)
        : true;

      const importDate = new Date(item.import_date);
      const matchesStartDate = startDate ? importDate >= new Date(startDate) : true;
      const matchesEndDate = endDate ? importDate <= new Date(new Date(endDate).setUTCHours(23, 59, 59, 999)) : true;

      return matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [imports, searchTerm, startDate, endDate]);

  const totalPages = Math.ceil(filteredImports.length / itemsPerPage);
  const currentImports = filteredImports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  const handleOpenAddModal = () => {
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
  };

  const handleOpenDetailModal = (importReceipt: ImportReceipt) => {
    setSelectedImport(importReceipt);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedImport(null);
  };

  const handleSuccess = () => {
    handleCloseFormModal();
    setRefreshTrigger(t => t + 1);
  };

  const handleSaveImport = async (importData: {
    supplier_id: number;
    import_date: string;
    details: { product_id: number; quantity: number; unit_price: string }[];
  }) => {
    try {
      await api.post('/import', importData);
      alert('Tạo phiếu nhập kho thành công!');
      handleSuccess();
    } catch (err: any) {
      console.error("Lưu phiếu nhập kho thất bại:", err);
      alert(`Tạo phiếu nhập kho thất bại:\n${err.message || 'Lỗi server'}`);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phiếu nhập kho này? Tồn kho các sản phẩm liên quan sẽ bị trừ lại.')) {
      try {
        await api.delete(`/import/${id}`);
        setRefreshTrigger(t => t + 1);
      } catch (err: any) {
        alert(`Xóa thất bại:\n${err.message || 'Lỗi server'}`);
      }
    }
  };

  const resetFilters = () => {
    setInputValue('');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Inbox className="text-neon-cyan" size={26} />
            <span>Quản Lý Nhập Kho Linh Kiện</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Theo dõi hóa đơn nhập hàng từ nhà phân phối và cập nhật số lượng tồn kho
          </p>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 bg-neon-cyan text-dark-base font-mono font-bold text-xs px-4 py-2.5 rounded-xl shadow-neon-cyan hover:bg-highlight transition-all"
        >
          <PlusCircle size={15} />
          <span>Tạo Phiếu Nhập Hàng</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-800/90 shadow-xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Tìm theo nhà cung cấp, mã phiếu..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-neon-cyan"
            title="Từ ngày"
          />
          <span className="text-slate-500 font-mono">-</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-neon-cyan"
            title="Đến ngày"
          />
        </div>

        {(inputValue || startDate || endDate) && (
          <button 
            onClick={resetFilters} 
            className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl"
            title="Xóa bộ lọc"
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
                  <th scope="col" className="px-5 py-3.5">Mã Phiếu</th>
                  <th scope="col" className="px-5 py-3.5">Nhà Cung Cấp</th>
                  <th scope="col" className="px-5 py-3.5">Ngày Nhập</th>
                  <th scope="col" className="px-5 py-3.5">Tổng Tiền</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/50 font-mono">
                {currentImports.length > 0 ? currentImports.map(item => (
                  <tr key={item.id} className="hover:bg-slate-850 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">#{item.id}</td>
                    <td className="px-5 py-3.5 font-sans font-semibold text-white text-sm">
                      {item.Supplier?.name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(item.import_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-3.5 font-black text-neon-cyan">
                      {parseFloat(item.total_amount).toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenDetailModal(item)} 
                          className="p-1.5 rounded-lg bg-slate-800 text-neon-cyan hover:bg-slate-700 transition-colors"
                          title="Xem chi tiết phiếu nhập"
                        >
                          <Eye size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Xóa phiếu nhập"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500 font-sans">
                      Không tìm thấy phiếu nhập hàng nào.
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

      {/* Modals */}
      <ImportFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSaveImport}
        onSuccess={handleSuccess}
        suppliers={suppliers}
      />

      {selectedImport && (
        <ImportDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          receipt={selectedImport}
        />
      )}
    </div>
  );
};

export default ImportManagementPage;