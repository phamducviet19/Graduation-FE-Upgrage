import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';

interface Item {
  id: number;
  name: string;
}

interface SimpleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  itemToEdit?: Item | null;
  initialValue?: string;
  title: string;
  label?: string;
}

const SimpleFormModal: React.FC<SimpleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  initialValue,
  title,
  label = 'Tên',
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialValue !== undefined ? initialValue : (itemToEdit ? itemToEdit.name : ''));
      setError('');
    }
  }, [itemToEdit, initialValue, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    if (!name.trim()) {
      setError(`Vui lòng nhập ${label.toLowerCase()}`);
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave(name);
    } catch (error) {
      console.error(`Lỗi khi lưu ${label}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag className="text-neon-cyan" size={20} />
            <span>{title}</span>
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" 
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                {label} <span className="text-neon-rose">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Nhập ${label.toLowerCase()}...`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
                autoFocus
                required
              />
              {error && <p className="text-rose-400 text-xs mt-1.5">{error}</p>}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold text-dark-base bg-neon-cyan hover:bg-highlight shadow-neon-cyan transition-all disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'ĐANG LƯU...' : 'LƯU LẠI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleFormModal;