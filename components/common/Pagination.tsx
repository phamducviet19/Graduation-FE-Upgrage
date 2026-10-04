import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-3 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-neon-cyan hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-slate-800 shadow-sm"
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} />
      </button>
      
      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
        Trang <span className="text-neon-cyan font-bold">{currentPage}</span> / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-neon-cyan hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-slate-800 shadow-sm"
        aria-label="Next Page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;