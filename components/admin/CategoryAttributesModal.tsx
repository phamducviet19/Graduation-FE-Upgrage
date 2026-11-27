import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { Category, ProductAttribute } from '../../types';
import { X, SlidersHorizontal, PlusCircle, Trash2, Edit, Check, AlertCircle, CheckCircle2 } from 'lucide-react';
import Spinner from '../common/Spinner';
import ConfirmModal from '../common/ConfirmModal';

interface CategoryAttributesModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

const dataTypeLabels: Record<ProductAttribute['data_type'], string> = {
  text: 'Văn bản (text)',
  number: 'Số (number)',
  boolean: 'Có / Không (boolean)',
};

const CategoryAttributesModal: React.FC<CategoryAttributesModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add form state
  const [name, setName] = useState('');
  const [dataType, setDataType] = useState<ProductAttribute['data_type']>('text');
  const [unit, setUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDataType, setEditDataType] = useState<ProductAttribute['data_type']>('text');
  const [editUnit, setEditUnit] = useState('');
  const [attrToDelete, setAttrToDelete] = useState<ProductAttribute | null>(null);

  const fetchAttributes = useCallback(async () => {
    if (!category) return;
    setLoading(true);
    try {
      const res = await api.get<{ data: ProductAttribute[] }>(`/attribute?category_id=${category.id}`);
      const list = Array.isArray(res?.data) ? res.data : [];
      setAttributes(list.sort((a, b) => a.id - b.id));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Không thể tải danh sách thuộc tính.' });
      setAttributes([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (isOpen && category) {
      setMessage(null);
      setName('');
      setDataType('text');
      setUnit('');
      setEditingId(null);
      setAttrToDelete(null);
      fetchAttributes();
    }
  }, [isOpen, category, fetchAttributes]);

  if (!isOpen || !category) return null;

  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tên thuộc tính.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      await api.post('/attribute', [
        {
          name: trimmedName,
          category_id: category.id,
          data_type: dataType,
          unit: unit.trim() || null,
        },
      ]);
      setName('');
      setDataType('text');
      setUnit('');
      setMessage({ type: 'success', text: `Đã thêm thuộc tính "${trimmedName}".` });
      await fetchAttributes();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Thêm thuộc tính thất bại.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (attr: ProductAttribute) => {
    setEditingId(attr.id);
    setEditName(attr.name);
    setEditDataType(attr.data_type);
    setEditUnit(attr.unit || '');
    setMessage(null);
  };

  const handleSaveEdit = async (id: number) => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setMessage({ type: 'error', text: 'Tên thuộc tính không được để trống.' });
      return;
    }
    try {
      await api.put(`/attribute/${id}`, {
        name: trimmedName,
        category_id: category.id,
        data_type: editDataType,
        unit: editUnit.trim() || null,
      });
      setEditingId(null);
      setMessage({ type: 'success', text: 'Cập nhật thuộc tính thành công.' });
      await fetchAttributes();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Cập nhật thuộc tính thất bại.' });
    }
  };

  const confirmDelete = async () => {
    if (!attrToDelete) return;
    try {
      await api.delete(`/attribute/${attrToDelete.id}`);
      setMessage({ type: 'success', text: `Đã xóa thuộc tính "${attrToDelete.name}".` });
      setAttributes((prev) => prev.filter((item) => item.id !== attrToDelete.id));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Xóa thuộc tính thất bại.' });
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 text-slate-200 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col p-6 sm:p-8"
        style={{ maxWidth: '48rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-5 pb-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <SlidersHorizontal className="text-neon-cyan" size={22} />
              <span>Thuộc Tính Danh Mục</span>
              <span className="text-neon-cyan font-mono">#{category.id}</span>
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Danh mục: <strong className="text-white">{category.name}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto pr-1 space-y-6">
          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                message.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Add Attribute Form */}
          <form
            onSubmit={handleAddAttribute}
            className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4"
          >
            <h3 className="text-xs font-mono font-bold text-neon-cyan uppercase tracking-wider flex items-center gap-1.5">
              <PlusCircle size={14} />
              <span>Thêm Thuộc Tính Mới</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Tên thuộc tính <span className="text-neon-rose">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Socket, Dung lượng..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Kiểu dữ liệu <span className="text-neon-rose">*</span>
                </label>
                <select
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value as ProductAttribute['data_type'])}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-neon-cyan"
                >
                  <option value="text">Văn bản (text)</option>
                  <option value="number">Số (number)</option>
                  <option value="boolean">Có / Không (boolean)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Đơn vị (tùy chọn)
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="VD: GB, GHz, W..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 bg-neon-cyan text-dark-base font-mono font-bold text-xs px-4 py-2 rounded-xl shadow-neon-cyan hover:bg-highlight transition-all disabled:opacity-50"
              >
                <PlusCircle size={14} />
                <span>{isSubmitting ? 'Đang thêm...' : 'Thêm thuộc tính'}</span>
              </button>
            </div>
          </form>

          {/* Existing Attributes List */}
          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
              Danh Sách Thuộc Tính ({attributes.length})
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : attributes.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/50 rounded-2xl border border-slate-800 text-xs text-slate-400">
                Danh mục này chưa có thuộc tính nào. Hãy thêm thuộc tính ở form phía trên.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="text-[11px] uppercase bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 w-16">ID</th>
                      <th scope="col" className="px-4 py-3">Tên Thuộc Tính</th>
                      <th scope="col" className="px-4 py-3">Kiểu Dữ Liệu</th>
                      <th scope="col" className="px-4 py-3">Đơn Vị</th>
                      <th scope="col" className="px-4 py-3 text-right w-28">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {attributes.map((attr) => (
                      <tr key={attr.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500">#{attr.id}</td>
                        <td className="px-4 py-3 font-medium text-white">
                          {editingId === attr.id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-neon-cyan"
                            />
                          ) : (
                            attr.name
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">
                          {editingId === attr.id ? (
                            <select
                              value={editDataType}
                              onChange={(e) => setEditDataType(e.target.value as ProductAttribute['data_type'])}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-neon-cyan"
                            >
                              <option value="text">text</option>
                              <option value="number">number</option>
                              <option value="boolean">boolean</option>
                            </select>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px]">
                              {dataTypeLabels[attr.data_type] || attr.data_type}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-400">
                          {editingId === attr.id ? (
                            <input
                              type="text"
                              value={editUnit}
                              onChange={(e) => setEditUnit(e.target.value)}
                              placeholder="—"
                              className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-neon-cyan"
                            />
                          ) : (
                            attr.unit || '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {editingId === attr.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(attr.id)}
                                  className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                  title="Lưu"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                  title="Hủy"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEdit(attr)}
                                  className="p-1.5 rounded-lg bg-slate-800 text-neon-cyan hover:bg-slate-700 transition-colors"
                                  title="Sửa thuộc tính"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAttrToDelete(attr)}
                                  className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
                                  title="Xóa thuộc tính"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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

  return (
    <>
      {typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent}
      <ConfirmModal
        isOpen={attrToDelete !== null}
        onClose={() => setAttrToDelete(null)}
        onConfirm={confirmDelete}
        title="Xóa thuộc tính"
        message={`Bạn có chắc chắn muốn xóa thuộc tính "${attrToDelete?.name ?? ''}"? Dữ liệu thông số liên quan trên sản phẩm có thể bị ảnh hưởng.`}
        confirmText="Xác nhận xóa"
      />
    </>
  );
};

export default CategoryAttributesModal;
