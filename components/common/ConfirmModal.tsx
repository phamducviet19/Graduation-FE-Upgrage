import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa',
  message = 'Bạn có chắc chắn muốn xóa mục này? Thao tác này không thể hoàn tác.',
  confirmText = 'Xác nhận xóa',
  cancelText = 'Hủy bỏ',
  type = 'danger',
  isLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Lỗi khi thực hiện xác nhận:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  const loading = isLoading || internalLoading;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex justify-center items-center p-4"
      onClick={loading ? undefined : onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-7"
        style={{ maxWidth: '28rem' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-neon-rose shrink-0">
            {type === 'danger' ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
          </div>
          <button 
            type="button"
            onClick={onClose} 
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50" 
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold text-white tracking-wide">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={loading}
            className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={handleConfirm}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-white transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
              type === 'danger' 
                ? 'bg-rose-600 hover:bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.35)]' 
                : 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
            }`}
          >
            {loading ? 'ĐANG XỬ LÝ...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default ConfirmModal;
