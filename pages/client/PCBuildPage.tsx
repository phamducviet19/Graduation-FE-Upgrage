import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePCBuild } from '../../contexts/PCBuildContext';
import { useCart } from '../../contexts/CartContext';
import { Product, PcBuild, Category, ProductImage, AIBuildResponse } from '../../types';
import api, { API_HOST } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import ProductSelectionModal from '../../components/client/ProductSelectionModal';
import { 
  Trash2, ShoppingCart, Loader, Sparkles, AlertTriangle, 
  Info, Cpu, Layers, HardDrive, Disc, Fan, Monitor, Zap, CheckCircle2 
} from 'lucide-react';

const PCBuildPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { createBuild, updateBuild, getBuildById, loading: contextLoading } = usePCBuild();
  const { addToCart } = useCart();
  
  const isNewBuild = id === 'new';
  const aiBuildData: AIBuildResponse | undefined = location.state?.aiBuildData;

  const [build, setBuild] = useState<PcBuild | null>(null);
  const [buildName, setBuildName] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<Record<number, Product | null>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategoryId, setModalCategoryId] = useState<number | null>(null);

  // Helper to render Markdown-like text from AI explanation
  const renderFormattedText = (text: string) => {
    const parseBold = (str: string) => {
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-bold text-neon-cyan">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    const lines = text.split('\n');
    const renderedContent: React.ReactNode[] = [];
    let currentListItems: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const content = trimmedLine.substring(2);
        currentListItems.push(
          <li key={`li-${index}`} className="ml-4 list-disc marker:text-neon-cyan text-slate-300">
            {parseBold(content)}
          </li>
        );
      } else {
        if (currentListItems.length > 0) {
          renderedContent.push(
            <ul key={`ul-${index}`} className="mb-3 space-y-1 text-slate-300">
              {currentListItems}
            </ul>
          );
          currentListItems = [];
        }

        if (trimmedLine === '') {
          renderedContent.push(<div key={`br-${index}`} className="h-1.5" />);
        } else {
          renderedContent.push(
            <p key={`p-${index}`} className="mb-1.5 leading-relaxed text-slate-300">
              {parseBold(line)}
            </p>
          );
        }
      }
    });

    if (currentListItems.length > 0) {
      renderedContent.push(
        <ul key={`ul-end`} className="mb-3 space-y-1 text-slate-300">
          {currentListItems}
        </ul>
      );
    }

    return <div>{renderedContent}</div>;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoriesRes = await api.get<any>('/category');
        const categoriesData = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes?.data && Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        setCategories(categoriesData);

        if (isNewBuild) {
          if (aiBuildData && aiBuildData.build && aiBuildData.build.products) {
            setBuildName(aiBuildData.analysis ? `AI Build: ${aiBuildData.analysis.purpose} (${aiBuildData.analysis.budget.toLocaleString('vi-VN')}đ)` : 'AI Optimized Build');
            const initialSelected: Record<number, Product | null> = {};
            
            categoriesData.forEach((cat: Category) => {
              const matchedProduct = aiBuildData.build.products.find(
                (p) => p.category.toLowerCase() === cat.name.toLowerCase()
              );
              initialSelected[cat.id] = matchedProduct && matchedProduct.product ? matchedProduct.product : null;
            });
            setSelectedComponents(initialSelected);
          } else {
            setBuildName('Cấu Hình PC Mới');
            const initialSelected: Record<number, Product | null> = {};
            categoriesData.forEach((cat: Category) => {
              initialSelected[cat.id] = null;
            });
            setSelectedComponents(initialSelected);
          }
        } else if (id) {
          const buildData = await getBuildById(parseInt(id, 10));
          if (buildData) {
            setBuild(buildData);
            setBuildName(buildData.name);
            const initialSelected: Record<number, Product | null> = {};
            categoriesData.forEach((cat: Category) => {
              initialSelected[cat.id] = null;
            });
            if (Array.isArray(buildData.PcBuildDetails)) {
              buildData.PcBuildDetails.forEach(detail => {
                if (detail.Product && detail.Product.category_id) {
                  initialSelected[detail.Product.category_id] = detail.Product;
                }
              });
            }
            setSelectedComponents(initialSelected);
          } else {
            setError('Không tìm thấy cấu hình này.');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Không thể tải dữ liệu cấu hình.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isNewBuild, aiBuildData]);

  const handleOpenModal = (categoryId: number) => {
    setModalCategoryId(categoryId);
    setIsModalOpen(true);
  };

  const handleSelectProduct = (product: Product) => {
    if (modalCategoryId) {
      setSelectedComponents(prev => ({
        ...prev,
        [modalCategoryId]: product
      }));
    }
    setIsModalOpen(false);
  };

  const handleRemoveComponent = (categoryId: number) => {
    setSelectedComponents(prev => ({
      ...prev,
      [categoryId]: null
    }));
  };

  const handleSaveBuild = async () => {
    if (!buildName.trim()) {
      alert('Vui lòng đặt tên cho cấu hình PC này.');
      return;
    }

    const items = Object.entries(selectedComponents)
      .filter(([_, product]) => product !== null)
      .map(([_, product]) => (product as Product).id);

    if (items.length === 0) {
      alert('Vui lòng chọn ít nhất 1 linh kiện trước khi lưu.');
      return;
    }

    try {
      if (isNewBuild) {
        await createBuild(buildName, items);
      } else if (build) {
        await updateBuild(build.id, buildName, items);
      }
      navigate('/pcbuilds');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu cấu hình.');
    }
  };

  const handleAddAllToCart = async () => {
    const products = Object.values(selectedComponents).filter((p): p is Product => p !== null);
    
    if (products.length === 0) {
      alert('Không có linh kiện nào để thêm vào giỏ hàng.');
      return;
    }

    setIsAddingToCart(true);
    try {
      for (const product of products) {
        await addToCart(product.id, 1);
      }
      alert('Đã thêm toàn bộ linh kiện đã chọn vào giỏ hàng!');
    } catch (error) {
      console.error('Error adding components to cart', error);
      alert('Một số linh kiện không thể thêm vào giỏ hàng. Vui lòng kiểm tra lại.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getImageUrl = (product: Product) => {
    const buildUrl = (path: string) => {
      if (!path) return `https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=150&q=80`;
      if (path.startsWith('http')) return path;
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `${API_HOST}${cleanPath}`;
    };

    if (product.mainImage) {
      return buildUrl(product.mainImage);
    }
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImg = product.images[0];
      if (typeof firstImg === 'string') {
        return buildUrl(firstImg);
      } else {
        const images = product.images as ProductImage[];
        const mainImg = images.find(img => img.is_main);
        const targetImg = mainImg || images[0];
        if (targetImg && targetImg.image_url) {
          return buildUrl(targetImg.image_url);
        }
      }
    }
    
    return `https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=150&q=80`;
  };

  const total = Object.values(selectedComponents)
    .filter((p): p is Product => p !== null)
    .reduce((acc, product) => acc + parseFloat(product.price), 0);

  if (loading) return <div className="flex justify-center items-center h-96"><Spinner /></div>;
  if (error) return <p className="text-center text-rose-500 text-xl py-10">{error}</p>;

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Builder Interface */}
        <div className={`flex-1 space-y-6 ${aiBuildData ? 'lg:w-2/3' : 'w-full'}`}>
          <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800/90">
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                  <span>{isNewBuild ? 'Xây Dựng Cấu Hình PC' : 'Chỉnh Sửa Cấu Hình PC'}</span>
                  {aiBuildData && (
                    <span className="text-xs font-mono font-bold bg-purple-500/20 text-neon-purple border border-purple-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles size={13} /> Tối ưu bởi AI
                    </span>
                  )}
                </h1>
                <input
                  type="text"
                  value={buildName}
                  onChange={e => setBuildName(e.target.value)}
                  placeholder="Đặt tên cấu hình (VD: Gaming 2K Master)..."
                  className="text-base sm:text-lg mt-2 px-4 py-2 w-full md:w-96 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div className="text-right w-full md:w-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90">
                <p className="text-xs font-mono text-slate-400 uppercase">Ước Tính Tổng Tiền</p>
                <p className="text-2xl sm:text-3xl font-mono font-black text-neon-cyan">
                  {total.toLocaleString('vi-VN')} <span className="text-sm">₫</span>
                </p>
              </div>
            </div>

            {/* Components Slot List */}
            <div className="space-y-3.5">
              {categories.length === 0 ? (
                <p className="text-center text-slate-400 py-10">Không tìm thấy danh mục linh kiện.</p>
              ) : (
                categories.map((category) => {
                  const selected = selectedComponents[category.id];
                  let reason = null;
                  if (aiBuildData && selected) {
                    const aiItem = aiBuildData.build.products.find(p => p.product.id === selected.id);
                    if (aiItem) reason = aiItem.reason;
                  }

                  return (
                    <div 
                      key={category.id} 
                      className={`flex flex-col rounded-2xl p-4 transition-all border ${
                        selected 
                          ? 'bg-slate-950/90 border-slate-800 hover:border-slate-700' 
                          : 'bg-slate-950/40 border-dashed border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-4 flex-1 overflow-hidden">
                          <div className="font-bold text-xs sm:text-sm text-slate-300 w-28 md:w-36 shrink-0 truncate uppercase font-mono tracking-wider">
                            {category.name}
                          </div>

                          {selected ? (
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="hidden sm:flex w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 shrink-0 aspect-square items-center justify-center overflow-hidden">
                                <img 
                                  src={getImageUrl(selected)} 
                                  alt={selected.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-semibold text-xs sm:text-sm text-white truncate">{selected.name}</p>
                                <p className="text-xs font-mono font-bold text-neon-cyan mt-0.5">
                                  {parseFloat(selected.price).toLocaleString('vi-VN')} ₫
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">Chưa chọn linh kiện này</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {selected && (
                            <button 
                              onClick={() => handleRemoveComponent(category.id)} 
                              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors" 
                              title="Bỏ linh kiện này"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleOpenModal(category.id)} 
                            className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all whitespace-nowrap ${
                              selected 
                                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700' 
                                : 'bg-neon-cyan text-dark-base hover:bg-highlight shadow-neon-cyan'
                            }`}
                          >
                            {selected ? 'Đổi linh kiện' : '+ Chọn linh kiện'}
                          </button>
                        </div>
                      </div>

                      {reason && (
                        <div className="mt-2.5 text-xs text-purple-200 bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/30 flex items-start gap-2">
                          <Sparkles size={14} className="text-neon-purple mt-0.5 shrink-0" />
                          <span className="italic leading-relaxed">AI Đánh Giá: {reason}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap justify-end gap-3.5">
              <button
                onClick={handleAddAllToCart}
                disabled={isAddingToCart || contextLoading}
                className="flex items-center gap-2 bg-slate-950 border border-neon-cyan/40 text-neon-cyan font-mono font-bold text-xs px-6 py-3 rounded-xl hover:bg-neon-cyan hover:text-dark-base shadow-neon-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? <Loader size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                <span>THÊM TOÀN BỘ VÀO GIỎ HÀNG</span>
              </button>
              
              <button
                onClick={handleSaveBuild}
                disabled={contextLoading || isAddingToCart}
                className="bg-neon-cyan text-dark-base font-mono font-extrabold text-xs px-6 py-3 rounded-xl hover:bg-highlight shadow-neon-cyan transition-all disabled:bg-slate-800 disabled:text-slate-500"
              >
                {contextLoading ? 'ĐANG LƯU...' : 'LƯU BỘ CẤU HÌNH'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: AI Terminal Insights */}
        {aiBuildData && (
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-purple-500/30 sticky top-24 space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-neon-purple">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">BÁO CÁO PHÂN TÍCH AI</h2>
                  <p className="text-[10px] text-slate-400 font-mono">Dữ liệu phân bổ cấu hình chuẩn</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Mục Tiêu Ngân Sách</p>
                  <p className="font-mono font-bold text-sm text-white mt-0.5">
                    {aiBuildData.analysis.budget.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Mục Đích Sử Dụng</p>
                  <p className="font-semibold text-xs text-white mt-0.5">
                    {aiBuildData.analysis.purpose} — {aiBuildData.analysis.mainUse}
                  </p>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Trạng Thái Ngân Sách</p>
                  <p className={`font-mono font-bold text-xs mt-0.5 ${
                    aiBuildData.build.budgetStatus.includes('Dư') ? 'text-neon-emerald' : 'text-amber-400'
                  }`}>
                    {aiBuildData.build.budgetStatus}
                  </p>
                </div>
              </div>

              {aiBuildData.warnings && aiBuildData.warnings.length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono uppercase">
                    <AlertTriangle size={15} />
                    <span>Lưu ý kỹ thuật</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
                    {aiBuildData.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2">
                <h3 className="font-bold text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Giải thích của AI
                </h3>
                <div className="text-xs leading-relaxed max-h-64 overflow-y-auto pr-1">
                  {renderFormattedText(aiBuildData.explanation)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {modalCategoryId !== null && (
        <ProductSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectProduct={handleSelectProduct}
          categoryId={modalCategoryId}
        />
      )}
    </>
  );
};

export default PCBuildPage;
