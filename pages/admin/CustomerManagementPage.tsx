import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../services/api';
import { User } from '../../types';
import { Trash2, Search, Users, RotateCcw, Mail, Phone, MapPin } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';

const CustomerManagementPage: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ data: User[] }>('/customer');
      setCustomers(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách khách hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        await api.delete(`/customer/${id}`);
        setCustomers(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        alert('Xóa khách hàng thất bại. Vui lòng thử lại.');
      }
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      customer.email.toLowerCase().includes(lowerCaseSearchTerm) ||
      (customer.phone && customer.phone.includes(lowerCaseSearchTerm))
    );
  }, [customers, searchTerm]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="text-neon-rose" size={26} />
            <span>Quản Lý Tài Khoản Khách Hàng</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Danh sách người dùng đã đăng ký thành viên trên hệ thống
          </p>
        </div>
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
                  <th scope="col" className="px-5 py-3.5">Họ và Tên</th>
                  <th scope="col" className="px-5 py-3.5">Email</th>
                  <th scope="col" className="px-5 py-3.5">Số Điện Thoại</th>
                  <th scope="col" className="px-5 py-3.5">Địa Chỉ</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                {currentCustomers.length > 0 ? currentCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-850 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500">#{customer.id}</td>
                    <td className="px-5 py-3.5 font-bold text-white font-sans text-sm">{customer.name}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">{customer.email}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">{customer.phone || 'Chưa cập nhật'}</td>
                    <td className="px-5 py-3.5 text-slate-400 max-w-xs truncate">{customer.address || 'Chưa cập nhật'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button 
                        onClick={() => handleDelete(customer.id)} 
                        className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Xóa tài khoản"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500">
                      Không tìm thấy khách hàng nào.
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
    </div>
  );
};

export default CustomerManagementPage;