import React from 'react';
import { ImportReceipt } from '../../types';
import { X, Truck, Calendar, Inbox } from 'lucide-react';

interface ImportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt?: ImportReceipt | null;
  importReceipt?: ImportReceipt | null;
}

const ImportDetailModal: React.FC<ImportDetailModalProps> = ({ isOpen, onClose, receipt, importReceipt }) => {
  const currentReceipt = receipt || importReceipt;
  if (!isOpen || !currentReceipt) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-800 text-slate-200 rounded-3xl shadow-2xl w-full max-w-3xl p-6 sm:p-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Inbox className="text-neon-cyan" size={22} />
              <span>Chi Tiết Phiếu Nhập Kho</span>
              <span className="font-mono text-neon-cyan font-bold">#{currentReceipt.id}</span>
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">Ngày nhập: {new Date(currentReceipt.import_date).toLocaleDateString('vi-VN')}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" 
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto pr-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <h3 className="text-xs font-mono font-bold text-neon-cyan uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Truck size={14} />
                <span>Nhà Cung Cấp</span>
              </h3>
              <p className="text-xs text-slate-300"><span className="text-slate-500">Tên NCC:</span> <strong className="text-white">{currentReceipt.Supplier?.name}</strong></p>
              <p className="text-xs text-slate-300"><span className="text-slate-500">Mã NCC:</span> <span className="font-mono text-slate-200">#{currentReceipt.supplier_id}</span></p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <h3 className="text-xs font-mono font-bold text-neon-purple uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Calendar size={14} />
                <span>Tóm Tắt Phiếu Nhập</span>
              </h3>
              <p className="text-xs text-slate-300"><span className="text-slate-500">Ngày nhập:</span> <span className="font-mono text-slate-200">{new Date(currentReceipt.import_date).toLocaleDateString('vi-VN')}</span></p>
              <p className="text-xs text-slate-300"><span className="text-slate-500">Tổng tiền nhập:</span> <strong className="font-mono text-neon-emerald text-sm">{parseFloat(currentReceipt.total_amount).toLocaleString('vi-VN')} ₫</strong></p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
              Danh Sách Linh Kiện Nhập Kho ({currentReceipt.ImportDetails?.length || 0})
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase font-mono bg-slate-950 border-b border-slate-800">
                  <tr>
                    <th scope="col" className="px-5 py-3">Linh Kiện</th>
                    <th scope="col" className="px-5 py-3 text-center">Số Lượng</th>
                    <th scope="col" className="px-5 py-3 text-right">Đơn Giá Nhập</th>
                    <th scope="col" className="px-5 py-3 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {currentReceipt.ImportDetails?.map(detail => (
                    <tr key={detail.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="px-5 py-3.5 font-sans font-medium text-slate-100">{detail.Product?.name || `Linh kiện #${detail.product_id}`}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-white">{detail.quantity}</td>
                      <td className="px-5 py-3.5 text-right text-slate-400">{parseFloat(detail.unit_price).toLocaleString('vi-VN')} ₫</td>
                      <td className="px-5 py-3.5 text-right font-bold text-neon-cyan">{(detail.quantity * parseFloat(detail.unit_price)).toLocaleString('vi-VN')} ₫</td>
                    </tr>
                  ))}
                  {(!currentReceipt.ImportDetails || currentReceipt.ImportDetails.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-500 font-sans">
                        Không có chi tiết sản phẩm cho phiếu nhập này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end flex-shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportDetailModal;