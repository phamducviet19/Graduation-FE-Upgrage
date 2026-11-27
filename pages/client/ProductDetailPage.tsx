import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { API_HOST } from '../../services/api';
import { Product, ProductAttributeValue } from '../../types';
import Spinner from '../../components/common/Spinner';
import { 
  ShoppingCart, Heart, ArrowLeft, ShieldCheck, Truck, 
  RotateCcw, CheckCircle2, AlertCircle, Wrench, Share2 
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const inWishlist = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Không tìm thấy ID sản phẩm.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await api.get<Product>(`/product/${id}`);
        setProduct(data);
        const placeholder = `https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80`;
        setActiveImage(data.mainImage ? `${API_HOST}${data.mainImage}` : placeholder);
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      addToCart(product.id, quantity);
    }
  };

  const handleAddToWishlist = () => {
    if (product) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      addToWishlist(product.id);
    }
  };

  const getAttributeValue = (attrValue: ProductAttributeValue) => {
    if (attrValue.value_text) return attrValue.value_text;
    if (attrValue.value_number) return parseFloat(attrValue.value_number).toString();
    if (attrValue.value_boolean !== null) return attrValue.value_boolean ? 'Có' : 'Không';
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
        <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white mb-2">{error || 'Không tìm thấy sản phẩm.'}</h3>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 px-6 py-2.5 bg-neon-cyan text-dark-base rounded-xl font-bold text-xs shadow-neon-cyan"
        >
          Quay lại danh sách sản phẩm
        </button>
      </div>
    );
  }

  const images = (product.images as string[] || []).map(url => `${API_HOST}${url}`);
  const placeholder = `https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80`;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-mono font-bold text-slate-400 hover:text-neon-cyan transition-colors gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft size={14} />
          <span>QUAY LẠI</span>
        </button>

        <div className="text-xs font-mono text-slate-500 hidden sm:block">
          Mã linh kiện: <span className="text-slate-300">#CP-{product.id}</span>
        </div>
      </div>

      {/* Main Product Showcase */}
      <div className="bg-slate-900/70 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-slate-800/90 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-slate-950/80 rounded-3xl flex items-center justify-center border border-slate-800 relative overflow-hidden group">
              <img 
                src={activeImage || placeholder} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                {isOutOfStock ? (
                  <span className="text-xs font-mono font-bold bg-slate-900/90 text-slate-400 border border-slate-700 px-3 py-1 rounded-full">
                    Hết hàng
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold bg-emerald-500/15 text-neon-emerald border border-neon-emerald/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 size={13} /> Sẵn sàng giao ngay
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail selector */}
            {images.length > 0 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button 
                    key={index} 
                    onClick={() => setActiveImage(img)} 
                    className={`w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 border-2 transition-all flex items-center justify-center shrink-0 aspect-square ${
                      activeImage === img ? 'border-neon-cyan shadow-neon-cyan scale-105' : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Purchase */}
          <div className="flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <span className="text-xs font-mono font-bold text-neon-cyan uppercase tracking-wider bg-neon-cyan/10 border border-neon-cyan/30 px-3 py-1 rounded-full">
                  Linh Kiện Cao Cấp
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Price Banner */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight">
                  {parseFloat(product.price).toLocaleString('vi-VN')}
                </span>
                <span className="text-lg font-mono font-bold text-neon-cyan">₫</span>
                <span className="text-xs font-mono text-slate-400 ml-auto bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  Kho: <strong className="text-slate-200">{product.stock}</strong> cái
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
                  {product.description}
                </p>
              )}

              {/* Quantity & Actions */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Số lượng mua:
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                      className="px-3.5 py-2.5 text-base font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      -
                    </button>
                    <input 
                      type="text" 
                      value={quantity} 
                      readOnly 
                      className="w-12 text-center text-sm font-mono font-bold bg-transparent text-white focus:outline-none"
                    />
                    <button 
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} 
                      className="px-3.5 py-2.5 text-base font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 py-3 px-6 rounded-xl font-bold font-mono text-xs tracking-wider flex items-center justify-center gap-2 bg-neon-cyan text-dark-base hover:bg-highlight shadow-neon-cyan disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all"
                  >
                    <ShoppingCart size={16} />
                    <span>{isOutOfStock ? 'HÀNG TẠM HẾT' : 'THÊM VÀO GIỎ HÀNG'}</span>
                  </button>

                  <button 
                    onClick={handleAddToWishlist} 
                    className={`p-3 rounded-xl border transition-all ${
                      inWishlist 
                        ? 'bg-rose-500/20 text-neon-rose border-rose-500/40 shadow-sm' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-neon-rose hover:border-slate-700'
                    }`}
                    title="Lưu vào yêu thích"
                  >
                    <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {/* Service Badges */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <ShieldCheck size={16} className="text-neon-emerald" />
                  <span>Bảo hành chính hãng 36 tháng</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <Truck size={16} className="text-neon-cyan" />
                  <span>Giao hàng hỏa tốc trong 2h</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Specifications Table */}
        {product.ProductAttributeValues && product.ProductAttributeValues.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-800">
            <h3 className="text-lg font-extrabold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-cyan"></span>
              Thông Số Kỹ Thuật Chi Tiết
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.ProductAttributeValues.map((attrVal) => (
                <div 
                  key={attrVal.id} 
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <span className="text-xs font-mono font-medium text-slate-400">
                    {attrVal.ProductAttribute.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                    {getAttributeValue(attrVal)} {attrVal.ProductAttribute.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;