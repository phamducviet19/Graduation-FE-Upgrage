import React, { useState, useEffect } from 'react';
import { Supplier, Product } from '../../types';
import { X, Plus, Trash2, Inbox } from 'lucide-react';
import api from '../../services/api';

type ImportDetailData = {
  product_id: string;
  quantity: string;
  unit_price: string;
};

type ImportFormData = {
  supplier_id: string;
  import_date: string;
  details: ImportDetailData[];
};

interface ImportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (importData: { supplier_id: number; import_date: string; details: {product_id: number; quantity: number; unit_price: string}[] }) => Promise<void>;
  suppliers: Supplier[];
}

const ImportFormModal: React.FC<ImportFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  suppliers,
}) => {
  const initialFormState: ImportFormData = {
    supplier_id: '',
    import_date: new Date().toISOString().split('T')[0],
    details: [{ product_id: '', quantity: '1', unit_price: '' }],
  };

  const [formData, setFormData] = useState<ImportFormData>(initialFormState);
  const [products, setProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (isOpen) {
        try {
          const response = await api.get<Product[]>('/product');
          setProducts(Array.isArray(response) ? response : []);
        } catch (error) {
          console.error("Lỗi khi tải danh sách sản phẩm", error);
        }
      }
    };
    fetchProducts();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: any = { details: [] };
    if (!formData.supplier_id) newErrors.supplier_id = 'Vui lòng chọn nhà cung cấp';
    if (!formData.import_date) newErrors.import_date = 'Vui lòng chọn ngày nhập kho';
    if (formData.details.length === 0) {
      newErrors.general = 'Cần thêm ít nhất một sản phẩm vào phiếu nhập.';
    }

    let detailsAreValid = true;
    formData.details.forEach((detail, index) => {
      const detailErrors: any = {};
      if (!detail.product_id) {
        detailErrors.product_id = 'Vui lòng chọn sản phẩm';
        detailsAreValid = false;
      }
      if (!detail.quantity || isNaN(Number(detail.quantity)) || Number(detail.quantity) <= 0 || !Number.isInteger(Number(detail.quantity))) {
        detailErrors.quantity = 'Số lượng phải là số nguyên > 0';
        detailsAreValid = false;
      }
      if (!detail.unit_price || isNaN(Number(detail.unit_price)) || Number(detail.unit_price) <= 0) {
        detailErrors.unit_price = 'Đơn giá phải lớn hơn 0';
        detailsAreValid = false;
      }
      if (Object.keys(detailErrors).length > 0) {
        newErrors.details[index] = detailErrors;
      }
    });

    setErrors(newErrors);
    return !newErrors.supplier_id && !newErrors.import_date && !newErrors.general && detailsAreValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newDetails = [...formData.details];
    newDetails[index] = { ...newDetails[index], [name]: value };
    setFormData(prev => ({ ...prev, details: newDetails }));
  };

  const addDetailRow = () => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, { product_id: '', quantity: '1', unit_price: '' }],
    }));
  };

  const removeDetailRow = (index: number) => {
    if (formData.details.length <= 1) {
      alert('Phiếu nhập phải có ít nhất 1 dòng linh kiện.');
      return;
    }
    const newDetails = formData.details.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, details: newDetails }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formattedData = {
        supplier_id: Number(formData.supplier_id),
        import_date: formData.import_date,
        details: formData.details.map(d => ({
          product_id: Number(d.product_id),
          quantity: Number(d.quantity),
          unit_price: d.unit_price,
        })),
      };
      await onSave(formattedData);
    } catch (error) {
      console.error("Lỗi lưu phiếu nhập", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = formData.details.reduce((acc, detail) => {
    const quantity = Number(detail.quantity) || 0;
    const unitPrice = Number(detail.unit_price) || 0;
    return acc + (quantity * unitPrice);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Inbox className="text-neon-cyan" size={22} />
            <span>Tạo Phiếu Nhập Kho Mới</span>
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" 
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>
        <form id="importForm" onSubmit={handleSubmit} noValidate className="flex-grow overflow-y-auto pr-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="supplier_id" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Nhà cung cấp <span className="text-neon-rose">*</span>
              </label>
              <select 
                name="supplier_id" 
                id="supplier_id" 
                value={formData.supplier_id} 
                onChange={handleChange} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-neon-cyan" 
                required
              >
                <option value="">-- Chọn nhà cung cấp --</option>
                {suppliers.map(sup => <option key={sup.id} value={sup.id} className="bg-slate-900">{sup.name}</option>)}
              </select>
              {errors.supplier_id && <p className="text-rose-400 text-xs mt-1">{errors.supplier_id}</p>}
            </div>
            <div>
              <label htmlFor="import_date" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Ngày nhập kho <span className="text-neon-rose">*</span>
              </label>
              <input 
                type="date" 
                name="import_date" 
                id="import_date" 
                value={formData.import_date} 
                onChange={handleChange} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-neon-cyan" 
                required 
              />
              {errors.import_date && <p className="text-rose-400 text-xs mt-1">{errors.import_date}</p>}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
              Danh Sách Linh Kiện Nhập Kho
            </h3>
            <div className="space-y-3">
              {formData.details.map((detail, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-start bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
                  <div className="col-span-12 sm:col-span-6">
                    <label htmlFor={`product_id_${index}`} className="block text-[11px] font-mono text-slate-400 mb-1">Linh kiện</label>
                    <select 
                      name="product_id" 
                      id={`product_id_${index}`} 
                      value={detail.product_id} 
                      onChange={e => handleDetailChange(index, e)} 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-neon-cyan" 
                      required
                    >
                      <option value="">-- Chọn linh kiện --</option>
                      {products.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>)}
                    </select>
                    {errors.details?.[index]?.product_id && <p className="text-rose-400 text-xs mt-1">{errors.details[index].product_id}</p>}
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor={`quantity_${index}`} className="block text-[11px] font-mono text-slate-400 mb-1">Số lượng</label>
                    <input 
                      type="number" 
                      name="quantity" 
                      id={`quantity_${index}`} 
                      value={detail.quantity} 
                      onChange={e => handleDetailChange(index, e)} 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 text-center focus:outline-none focus:border-neon-cyan" 
                      min="1" 
                      required 
                    />
                    {errors.details?.[index]?.quantity && <p className="text-rose-400 text-xs mt-1">{errors.details[index].quantity}</p>}
                  </div>
                  <div className="col-span-5 sm:col-span-3">
                    <label htmlFor={`unit_price_${index}`} className="block text-[11px] font-mono text-slate-400 mb-1">Đơn giá nhập (₫)</label>
                    <input 
                      type="number" 
                      name="unit_price" 
                      id={`unit_price_${index}`} 
                      value={detail.unit_price} 
                      onChange={e => handleDetailChange(index, e)} 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-neon-cyan" 
                      step="1000" 
                      min="0" 
                      placeholder="VD: 500000"
                      required 
                    />
                    {errors.details?.[index]?.unit_price && <p className="text-rose-400 text-xs mt-1">{errors.details[index].unit_price}</p>}
                  </div>
                  <div className="col-span-1 flex items-end justify-center pt-6">
                    <button 
                      type="button" 
                      onClick={() => removeDetailRow(index)} 
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors" 
                      aria-label="Xóa dòng"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              onClick={addDetailRow} 
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neon-cyan hover:underline p-1"
            >
              <Plus size={15} /> Thêm dòng linh kiện
            </button>
            {errors.general && <p className="text-rose-400 text-xs mt-2">{errors.general}</p>}
          </div>
        </form>
        
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center flex-shrink-0">
          <div>
            <span className="text-xs text-slate-400 font-mono">Tổng tiền phiếu nhập: </span>
            <span className="text-lg font-mono font-black text-neon-emerald ml-1">{Math.round(totalAmount).toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              form="importForm" 
              disabled={isSubmitting} 
              className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold text-dark-base bg-neon-cyan hover:bg-highlight shadow-neon-cyan transition-all disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'ĐANG LƯU...' : 'LƯU PHIẾU NHẬP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportFormModal;