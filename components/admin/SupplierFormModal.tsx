import React, { useState, useEffect } from 'react';
import { Supplier } from '../../types';
import { X } from 'lucide-react';

type SupplierFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  supplierToEdit?: Supplier | null;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  supplierToEdit,
}) => {
  const initialFormState: SupplierFormData = {
    name: '',
    email: '',
    phone: '',
    address: '',
  };

  const [formData, setFormData] = useState<SupplierFormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof SupplierFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (supplierToEdit) {
        setFormData({
          name: supplierToEdit.name,
          email: supplierToEdit.email,
          phone: supplierToEdit.phone,
          address: supplierToEdit.address,
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
    }
  }, [supplierToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SupplierFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{9,15}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number is invalid';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });
    } catch (error) {
      console.error("Failed to save supplier", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 max-h-full overflow-y-auto animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">{supplierToEdit ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" aria-label="Đóng modal">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">Tên nhà cung cấp <span className="text-neon-rose">*</span></label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-neon-cyan" required />
              {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">Email liên hệ <span className="text-neon-rose">*</span></label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-neon-cyan" required />
              {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">Số điện thoại <span className="text-neon-rose">*</span></label>
              <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-neon-cyan" required />
              {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="address" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">Địa chỉ trụ sở / kho <span className="text-neon-rose">*</span></label>
              <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-neon-cyan" required></textarea>
              {errors.address && <p className="text-rose-400 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors">Hủy bỏ</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold text-dark-base bg-neon-cyan hover:bg-highlight shadow-neon-cyan transition-all disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed">
              {isSubmitting ? 'ĐANG LƯU...' : 'LƯU NHÀ CUNG CẤP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierFormModal;