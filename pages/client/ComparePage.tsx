import React, { useState } from 'react';
import { useCompare } from '../../contexts/CompareContext';
import { Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import { Trash2, Sparkles, AlertCircle, ShoppingCart, GitCompare, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CompareItem, Product } from '../../types';
import { API_HOST } from '../../services/api';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';

const ComparePage: React.FC = () => {
  const { groupedCompareList, loading, removeFromCompare } = useCompare();
  const { addToCart } = useCart();
  const [analyzing, setAnalyzing] = useState<Record<string, boolean>>({});
  const [analyses, setAnalyses] = useState<Record<string, string>>({});

  // Helper function to render Markdown-like text (Bold, Lists, and Tables)
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
    let currentTableLines: string[] = [];

    const flushList = () => {
      if (currentListItems.length > 0) {
        renderedContent.push(
          <ul key={`ul-${renderedContent.length}`} className="mb-4 space-y-1.5 text-slate-300">
            {currentListItems}
          </ul>
        );
        currentListItems = [];
      }
    };

    const flushTable = () => {
      if (currentTableLines.length > 0) {
        const rows = currentTableLines.map(line => {
          let content = line.trim();
          if (content.startsWith('|')) content = content.substring(1);
          if (content.endsWith('|')) content = content.substring(0, content.length - 1);
          return content.split('|').map(c => c.trim());
        });

        if (rows.length < 2) {
          renderedContent.push(
            <div key={`table-${renderedContent.length}`} className="mb-4 overflow-x-auto bg-slate-950 rounded-xl border border-slate-800 p-3">
              <pre className="font-mono text-xs text-slate-300 whitespace-pre">
                {currentTableLines.join('\n')}
              </pre>
            </div>
          );
        } else {
          const headerRow = rows[0];
          const isSeparator = rows[1].some(cell => cell.includes('-')); 
          const bodyRows = isSeparator ? rows.slice(2) : rows.slice(1);

          renderedContent.push(
            <div key={`table-${renderedContent.length}`} className="mb-6 overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
              <table className="w-full text-xs sm:text-sm text-left text-slate-200">
                <thead className="text-xs uppercase bg-slate-950/90 text-neon-cyan border-b border-slate-800 font-mono">
                  <tr>
                    {headerRow.map((header, i) => (
                      <th key={i} scope="col" className="px-5 py-3.5 font-bold whitespace-nowrap border-r last:border-r-0 border-slate-800">
                        {parseBold(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                  {bodyRows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-slate-850 transition-colors">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-5 py-3.5 border-r last:border-r-0 border-slate-800/80">
                          {parseBold(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        currentTableLines = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('|')) {
        flushList();
        currentTableLines.push(line);
        return;
      }
      flushTable();

      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const content = trimmedLine.substring(2);
        currentListItems.push(
          <li key={`li-${index}`} className="ml-5 list-disc marker:text-neon-cyan text-slate-200 leading-relaxed">
            {parseBold(content)}
          </li>
        );
        return;
      }
      flushList();

      if (trimmedLine === '') {
        renderedContent.push(<div key={`br-${index}`} className="h-2" />);
      } else {
        renderedContent.push(
          <p key={`p-${index}`} className="mb-2 leading-relaxed text-slate-300">
            {parseBold(line)}
          </p>
        );
      }
    });

    flushList();
    flushTable();

    return <div>{renderedContent}</div>;
  };

  const handleAnalyze = async (categoryName: string) => {
    setAnalyzing(prev => ({ ...prev, [categoryName]: true }));
    
    try {
      const response = await api.post<any>('/compare/ai', {});
      const botResponseText = response.comparison || response.message || response.response || (typeof response === 'string' ? response : "Không thể lấy dữ liệu so sánh lúc này.");
      
      setAnalyses(prev => ({ ...prev, [categoryName]: botResponseText }));
    } catch (error) {
      console.error("Comparison failed", error);
      alert("Không thể thực hiện so sánh lúc này. Vui lòng thử lại sau.");
    } finally {
      setAnalyzing(prev => ({ ...prev, [categoryName]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (Object.keys(groupedCompareList).length === 0) {
    return (
      <div className="text-center bg-slate-900/60 border border-slate-800 p-12 sm:p-16 rounded-3xl max-w-lg mx-auto shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto mb-6">
          <GitCompare size={36} />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Danh sách so sánh đang trống</h1>
        <p className="text-sm text-slate-400 mb-8">
          Chọn 2 hoặc nhiều linh kiện cùng loại từ danh mục sản phẩm để AI đối đầu phân tích ưu nhược điểm.
        </p>
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 bg-neon-cyan text-dark-base font-extrabold px-6 py-3.5 rounded-xl shadow-neon-cyan hover:bg-highlight hover:scale-105 transition-all text-xs tracking-wider"
        >
          <span>CHỌN LINH KIỆN ĐỂ SO SÁNH</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <GitCompare className="text-neon-cyan" size={28} />
            <span>So Sánh Đối Đầu Linh Kiện</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Phân tích thông số & tổng hợp AI để bạn chọn linh kiện chuẩn xác nhất
          </p>
        </div>
      </div>

      {Object.entries(groupedCompareList).map(([categoryName, products]: [string, CompareItem[]]) => (
        <div key={categoryName} className="bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800/90 overflow-hidden">
          
          {/* Header section with AI Analyze Button */}
          <div className="bg-slate-950/80 p-5 sm:p-6 border-b border-slate-800 flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.7)]"></span>
              <span>{categoryName}</span>
              <span className="text-xs font-mono text-slate-400 font-normal">({products.length} sản phẩm)</span>
            </h2>

            <button 
              onClick={() => handleAnalyze(categoryName)}
              disabled={analyzing[categoryName]}
              className="flex items-center gap-2 bg-gradient-to-r from-neon-purple to-neon-cyan text-dark-base px-6 py-2.5 rounded-xl font-mono font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {analyzing[categoryName] ? (
                <>
                  <Spinner /> <span>AI ĐANG PHÂN TÍCH...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} /> <span>AI PHÂN TÍCH ĐỐI ĐẦU</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6">
            {/* Products Grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${products.length > 3 ? 3 : products.length} gap-6 mb-8`}>
              {products.map(product => (
                <div key={product.id} className="relative group bg-slate-950/90 rounded-2xl border border-slate-800 p-5 hover:border-neon-cyan/40 transition-all flex flex-col justify-between">
                  <button 
                    onClick={() => removeFromCompare(product.id)} 
                    className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 bg-slate-900 p-2 rounded-xl transition-colors z-10 border border-slate-800"
                    title="Xóa khỏi so sánh"
                  >
                    <Trash2 size={15} />
                  </button>
                  
                  <div>
                    <div className="w-full aspect-square max-h-48 flex items-center justify-center mb-4 bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 overflow-hidden">
                      <img 
                        src={product.mainImage ? `${API_HOST}${product.mainImage}` : `https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=200&q=80`} 
                        alt={product.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <Link to={`/product/${product.id}`} className="block">
                      <h3 className="font-bold text-slate-100 text-sm mb-2 hover:text-neon-cyan line-clamp-2 h-10 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-xl font-mono font-black text-white mb-4">
                      {parseFloat(product.price).toLocaleString('vi-VN')} <span className="text-neon-cyan text-sm">₫</span>
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => addToCart(product.id, 1)}
                    disabled={product.stock === 0}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-slate-200 hover:text-neon-cyan hover:border-neon-cyan/40 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={14} />
                    <span>{product.stock > 0 ? 'THÊM VÀO GIỎ' : 'HẾT HÀNG'}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* AI Analysis Result */}
            {analyses[categoryName] && (
              <div className="bg-slate-950/90 rounded-2xl p-6 sm:p-8 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.1)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-neon-purple shadow-neon-purple">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white tracking-wide">KẾT QUẢ ĐÁNH GIÁ CHUYÊN SÂU TỪ AI</h3>
                    <p className="text-xs text-slate-400 font-mono">Dựa trên dữ liệu xung nhịp, benchmark và giá trị đầu tư</p>
                  </div>
                </div>
                <div className="text-sm leading-relaxed">
                  {renderFormattedText(analyses[categoryName])}
                </div>
              </div>
            )}
            
            {!analyses[categoryName] && !analyzing[categoryName] && (
              <div className="text-center py-10 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800/80">
                <AlertCircle className="mx-auto text-slate-500 mb-2" size={28} />
                <p className="text-xs font-mono text-slate-400">
                  Bấm nút <strong className="text-neon-cyan">"AI PHÂN TÍCH ĐỐI ĐẦU"</strong> phía trên để nhận báo cáo so sánh chi tiết.
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComparePage;