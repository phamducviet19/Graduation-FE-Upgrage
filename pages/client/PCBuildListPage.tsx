import React, { useEffect, useState } from 'react';
import { usePCBuild } from '../../contexts/PCBuildContext';
import { Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Trash2, Edit, PlusCircle, Wrench, Sparkles, ArrowRight, Calendar } from 'lucide-react';

const PCBuildListPage: React.FC = () => {
  const { builds, loading, deleteBuild, fetchBuilds } = usePCBuild();

  useEffect(() => {
    fetchBuilds();
  }, [fetchBuilds]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [buildToDelete, setBuildToDelete] = useState<number | null>(null);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(builds.length / itemsPerPage);
  const paginatedBuilds = builds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const calculateTotal = (build: any) => {
    if (!build.PcBuildDetails) return 0;
    return build.PcBuildDetails.reduce((acc: number, detail: any) => acc + parseFloat(detail.Product.price), 0);
  };

  const confirmDelete = async () => {
    if (buildToDelete === null) return;
    await deleteBuild(buildToDelete);
  };

  const handleDelete = (id: number) => {
    setBuildToDelete(id);
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="text-neon-cyan" size={26} />
            <span>Cấu Hình PC Của Tôi</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Danh sách các bộ máy tính bạn đã tự ráp hoặc tạo bằng AI
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link 
            to="/pcbuild/ai"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-neon-purple to-pink-500 text-white font-mono font-bold text-xs px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 transition-all"
          >
            <Sparkles size={16} />
            <span>Ráp Bằng AI</span>
          </Link>

          <Link 
            to="/pcbuild/new"
            className="inline-flex items-center gap-2 bg-neon-cyan text-dark-base font-mono font-bold text-xs px-5 py-2.5 rounded-xl shadow-neon-cyan hover:bg-highlight hover:scale-105 transition-all"
          >
            <PlusCircle size={16} />
            <span>Tự Ráp Thủ Công</span>
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      )}

      {!loading && builds.length === 0 && (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl p-8 bg-slate-950/40">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <Wrench size={30} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Chưa Có Cấu Hình Nào</h3>
          <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
            Bắt đầu tạo bộ máy tính trong mơ ngay hôm nay với sự hỗ trợ của AI hoặc tự chọn từng linh kiện.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/pcbuild/ai" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-neon-purple font-mono text-xs font-bold hover:bg-purple-500/25 transition-colors"
            >
              <Sparkles size={14}/>
              <span>Thử Trình Ráp AI</span>
            </Link>
          </div>
        </div>
      )}

      {!loading && builds.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedBuilds.map(build => (
              <div 
                key={build.id} 
                className="p-5 border border-slate-800/90 rounded-2xl bg-slate-950/80 hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-bold text-white group-hover:text-neon-cyan transition-colors">
                      {build.name}
                    </h2>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <Link 
                        to={`/pcbuild/${build.id}`} 
                        className="p-2 text-slate-400 hover:text-neon-cyan hover:bg-slate-900 rounded-xl transition-colors border border-transparent hover:border-slate-800" 
                        title="Chỉnh sửa cấu hình"
                      >
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(build.id)} 
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors" 
                        title="Xóa cấu hình"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 mt-2">
                    <Calendar size={13} />
                    <span>Ngày tạo: {new Date(build.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Tổng linh kiện</span>
                    <p className="text-lg font-mono font-black text-neon-cyan">
                      {calculateTotal(build).toLocaleString('vi-VN')} ₫
                    </p>
                  </div>

                  <Link
                    to={`/pcbuild/${build.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-mono font-bold text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <span>Chi tiết</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <ConfirmModal
        isOpen={buildToDelete !== null}
        onClose={() => setBuildToDelete(null)}
        onConfirm={confirmDelete}
        title="Xóa cấu hình PC"
        message="Bạn có chắc chắn muốn xóa bản lưu cấu hình này? Thao tác này không thể hoàn tác."
        confirmText="Xác nhận xóa"
      />
    </div>
  );
};

export default PCBuildListPage;
