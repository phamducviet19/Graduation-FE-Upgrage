import React, { useState, useEffect } from 'react';
import { Brand, Category, Product, ProductAttribute, AttributeValuePayload, ProductSaveData } from '../../types';
import { X } from 'lucide-react';
import api, { API_HOST } from '../../services/api';
import Spinner from '../common/Spinner';

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  stock: string;
  brand_id: string;
  category_id: string;
}

type ImageFiles = { 
  image1: File | null; 
  image2: File | null; 
  image3: File | null 
};

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: ProductSaveData, images: ImageFiles) => Promise<void>;
  brands: Brand[];
  categories: Category[];
  productToEdit?: Product | null;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  brands,
  categories,
  productToEdit,
}) => {
  const initialFormState: ProductFormData = {
    name: '',
    description: '',
    price: '',
    stock: '0',
    brand_id: '',
    category_id: '',
  };
  
  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData | 'image1', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [images, setImages] = useState<ImageFiles>({ image1: null, image2: null, image3: null });
  const [imagePreviews, setImagePreviews] = useState<{ image1: string | null; image2: string | null; image3: string | null }>({ image1: null, image2: null, image3: null });

  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string | boolean | null>>({});
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  
  // NEW STATE: Store the fully fetched product to ensure validation has access to complete data.
  const [detailedProductForEditing, setDetailedProductForEditing] = useState<Product | null>(null);

  const imageFields = [
    { name: 'image1' as const, label: 'Main Image (Required)' },
    { name: 'image2' as const, label: 'Image 2' },
    { name: 'image3' as const, label: 'Image 3' }
  ];

  useEffect(() => {
    const fetchAndSetProductDetails = async (product: Product) => {
        setIsDetailsLoading(true);
        try {
            const detailedProduct = await api.get<Product>(`/product/${product.id}`);
            
            // UPDATE: Store the complete product object
            setDetailedProductForEditing(detailedProduct);

            setFormData({
                name: detailedProduct.name,
                description: detailedProduct.description,
                price: String(detailedProduct.price),
                stock: String(detailedProduct.stock),
                brand_id: String(detailedProduct.brand_id),
                category_id: String(detailedProduct.category_id),
            });
            
            const mainImageUrl = detailedProduct.mainImage;
            const allImageUrls = (detailedProduct.images as string[]) || [];
            const otherImageUrls = allImageUrls.filter(url => url !== mainImageUrl);

            setImagePreviews({
                image1: mainImageUrl ? `${API_HOST}${mainImageUrl}` : null,
                image2: otherImageUrls[0] ? `${API_HOST}${otherImageUrls[0]}` : null,
                image3: otherImageUrls[1] ? `${API_HOST}${otherImageUrls[1]}` : null,
            });

            setImages({ image1: null, image2: null, image3: null });

        } catch (error) {
            console.error("Failed to fetch product details for editing:", error);
            alert("Could not load full product details. Some information might be missing.");
            setDetailedProductForEditing(product); // Fallback to potentially incomplete data
            setFormData({
                name: product.name,
                description: product.description,
                price: String(product.price),
                stock: String(product.stock),
                brand_id: String(product.brand_id),
                category_id: String(product.category_id),
            });
        } finally {
            setIsDetailsLoading(false);
        }
    };

    if (isOpen) {
        if (productToEdit) {
            fetchAndSetProductDetails(productToEdit);
        } else {
            setFormData(initialFormState);
            setAttributes([]);
            setAttributeValues({});
            setImages({ image1: null, image2: null, image3: null });
            setImagePreviews({ image1: null, image2: null, image3: null });
            setIsDetailsLoading(false);
            // UPDATE: Reset detailed product for new product form
            setDetailedProductForEditing(null);
        }
        setErrors({});
    }
  }, [productToEdit, isOpen]);


  useEffect(() => {
    if (!isOpen) return;

    const fetchAttributes = async () => {
        if (formData.category_id) {
            setIsLoadingAttributes(true);
            try {
                const response = await api.get<{ data: ProductAttribute[] }>(`/attribute/category/${formData.category_id}`);
                const fetchedAttributes = Array.isArray(response?.data) ? response.data : [];
                setAttributes(fetchedAttributes);

                // UPDATE: Use detailedProductForEditing for populating attribute values
                if (detailedProductForEditing && String(detailedProductForEditing.category_id) === formData.category_id) {
                    const initialValues = fetchedAttributes.reduce((acc, attr) => {
                        const existingValue = detailedProductForEditing.ProductAttributeValues.find(v => v.attribute_id === attr.id);
                        if (existingValue) {
                            let value: string | boolean | null = null;
                            if (existingValue.value_text !== null) value = existingValue.value_text;
                            else if (existingValue.value_number !== null) value = existingValue.value_number;
                            else if (existingValue.value_boolean !== null) value = existingValue.value_boolean;
                            
                            if (value !== null) {
                                acc[attr.id] = value;
                            }
                        }
                        return acc;
                    }, {} as Record<string, string | boolean | null>);
                    setAttributeValues(initialValues);
                } else {
                    setAttributeValues({});
                }
            } catch (error: any) {
                if (error?.message?.toLowerCase().includes('no attributes found')) {
                    setAttributes([]);
                } else {
                    console.error('Failed to fetch attributes', error);
                    setAttributes([]);
                }
            } finally {
                setIsLoadingAttributes(false);
            }
        } else {
            setAttributes([]);
            setAttributeValues({});
        }
    };

    fetchAttributes();
  }, [formData.category_id, isOpen, detailedProductForEditing]); // UPDATE: Add detailedProductForEditing dependency
  
  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData | 'image1', string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên sản phẩm';
    if (!formData.description.trim()) newErrors.description = 'Vui lòng nhập mô tả sản phẩm';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Giá bán phải là số lớn hơn 0';
    }
    if (formData.stock === '' || isNaN(Number(formData.stock)) || Number(formData.stock) < 0 || !Number.isInteger(Number(formData.stock))) {
      newErrors.stock = 'Số lượng kho phải là số nguyên không âm';
    }
    if (!formData.brand_id) newErrors.brand_id = 'Vui lòng chọn thương hiệu';
    if (!formData.category_id) newErrors.category_id = 'Vui lòng chọn danh mục';

    if (!detailedProductForEditing?.mainImage && !images.image1) {
        newErrors.image1 = 'Vui lòng chọn ảnh đại diện sản phẩm';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setImages(prev => ({ ...prev, [name]: file as File }));
      setImagePreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  const handleAttributeChange = (attributeId: string, value: string | boolean | null) => {
    setAttributeValues(prev => ({
        ...prev,
        [attributeId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);

    const attributesPayload: AttributeValuePayload[] = attributes
      .map(attr => {
          const value = attributeValues[String(attr.id)];
          
          const hasValue = (attr.data_type === 'boolean' && typeof value === 'boolean') || 
                         (value !== undefined && value !== null && value !== '');

          if (!hasValue) {
            return null;
          }

          const payload: AttributeValuePayload = { 
              attribute_id: attr.id,
              value_text: null,
              value_number: null,
              value_boolean: null,
          };

          switch (attr.data_type) {
              case 'number':
                  if (!isNaN(Number(value))) {
                      payload.value_number = String(value);
                  } else {
                      return null;
                  }
                  break;
              case 'boolean':
                  payload.value_boolean = value as boolean;
                  break;
              case 'text':
              default:
                  payload.value_text = String(value);
                  break;
          }
          return payload;
      })
      .filter((p): p is AttributeValuePayload => p !== null);

    const saveData: ProductSaveData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: Number(formData.stock),
        brand_id: Number(formData.brand_id),
        category_id: Number(formData.category_id),
        attributes: attributesPayload,
    };

    try {
      await onSave(saveData, images);
    } catch (error) {
        // Error is alerted by the parent component (ProductManagementPage)
        console.error("Failed to save product from modal", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderAttributeInput = (attribute: ProductAttribute) => {
    const attributeId = String(attribute.id);
    const value = attributeValues[attributeId];
    const commonClasses = "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500";

    switch (attribute.data_type) {
      case 'number':
        return <input type="number" id={`attr_${attribute.id}`} name={`attr_${attribute.id}`} value={value as string || ''} onChange={e => handleAttributeChange(attributeId, e.target.value)} className={commonClasses} />;
      case 'boolean':
        return (
          <select id={`attr_${attribute.id}`} name={`attr_${attribute.id}`} value={value === null || value === undefined ? '' : String(value)} onChange={e => handleAttributeChange(attributeId, e.target.value === '' ? null : e.target.value === 'true')} className={commonClasses}>
            <option value="">-- Chọn giá trị --</option>
            <option value="true">Có</option>
            <option value="false">Không</option>
          </select>
        );
      case 'text':
      default:
        return <input type="text" id={`attr_${attribute.id}`} name={`attr_${attribute.id}`} value={value as string || ''} onChange={e => handleAttributeChange(attributeId, e.target.value)} className={commonClasses} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">{productToEdit ? 'Chỉnh Sửa Linh Kiện' : 'Thêm Linh Kiện Mới'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" aria-label="Đóng modal">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="flex-grow overflow-y-auto pr-2 space-y-5">
          {isDetailsLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner />
            </div>
          ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label htmlFor="name" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">Tên sản phẩm <span className="text-neon-rose">*</span></label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-neon-cyan" required />
                    {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                    <label htmlFor="price" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">Giá bán (₫) <span className="text-neon-rose">*</span></label>
                    <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-neon-cyan" min="0" required />
                    {errors.price && <p className="text-rose-400 text-xs mt-1">{errors.price}</p>}
                    </div>
                    <div>
                    <label htmlFor="stock" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">Số lượng tồn kho <span className="text-neon-rose">*</span></label>
                    <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-neon-cyan" min="0" required />
                    {errors.stock && <p className="text-rose-400 text-xs mt-1">{errors.stock}</p>}
                    </div>
                    <div>
                    <label htmlFor="category_id" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">Danh mục linh kiện <span className="text-neon-rose">*</span></label>
                    <select name="category_id" id="category_id" value={formData.category_id} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-neon-cyan" required>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name}</option>)}
                    </select>
                    {errors.category_id && <p className="text-rose-400 text-xs mt-1">{errors.category_id}</p>}
                    </div>
                    <div className="md:col-span-2">
                    <label htmlFor="brand_id" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">Thương hiệu (Hãng) <span className="text-neon-rose">*</span></label>
                    <select name="brand_id" id="brand_id" value={formData.brand_id} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-neon-cyan" required>
                        <option value="">-- Chọn thương hiệu --</option>
                        {brands.map(brand => <option key={brand.id} value={brand.id} className="bg-slate-900">{brand.name}</option>)}
                    </select>
                    {errors.brand_id && <p className="text-rose-400 text-xs mt-1">{errors.brand_id}</p>}
                    </div>
                    <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">Mô tả sản phẩm <span className="text-neon-rose">*</span></label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-neon-cyan" required></textarea>
                    {errors.description && <p className="text-rose-400 text-xs mt-1">{errors.description}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">Hình ảnh sản phẩm</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {imageFields.map(field => (
                            <div key={field.name} className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80">
                                <label htmlFor={field.name} className="block text-[11px] font-mono text-slate-400 mb-1">{field.label}</label>
                                <input type="file" name={field.name} id={field.name} onChange={handleImageChange} accept="image/*" className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-neon-cyan hover:file:bg-cyan-500/30"/>
                                {imagePreviews[field.name] && <img src={imagePreviews[field.name]} alt={`Xem trước ${field.name}`} className="mt-2 w-full h-20 object-contain bg-slate-900 rounded-xl border border-slate-800 p-1"/>}
                                {field.name === 'image1' && errors.image1 && <p className="text-rose-400 text-xs mt-1">{errors.image1}</p>}
                            </div>
                        ))}
                        </div>
                    </div>
                </div>

                { (isLoadingAttributes || attributes.length > 0) && (
                    <div className="mt-6 pt-5 border-t border-slate-800">
                        <h3 className="text-xs font-mono font-bold text-neon-cyan uppercase tracking-wider mb-3">
                            Thông số kỹ thuật cho danh mục {categories.find(c => c.id.toString() === formData.category_id)?.name}
                        </h3>
                        {isLoadingAttributes ? (
                            <p className="text-xs font-mono text-slate-400">Đang tải thông số kỹ thuật...</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {attributes.map(attr => (
                                    <div key={attr.id}>
                                        <label htmlFor={`attr_${attr.id}`} className="block text-xs font-mono text-slate-300 mb-1">
                                            {attr.name} {attr.unit && `(${attr.unit})`}
                                        </label>
                                        {renderAttributeInput(attr)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3 flex-shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors">Hủy bỏ</button>
            <button type="submit" disabled={isSubmitting || isDetailsLoading} className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold text-dark-base bg-neon-cyan hover:bg-highlight shadow-neon-cyan transition-all disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed">
              {isSubmitting ? 'ĐANG LƯU...' : 'LƯU SẢN PHẨM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;