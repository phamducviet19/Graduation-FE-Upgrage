import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color = 'bg-cyan-500' }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-800/90 shadow-xl flex items-center justify-between hover:border-slate-700 transition-all duration-300 group">
      <div>
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">{title}</h3>
        <p className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight group-hover:text-neon-cyan transition-colors">
          {value}
        </p>
      </div>

      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center p-3 shadow-lg ${color} bg-opacity-20 border border-current border-opacity-30`}>
        {icon}
      </div>
    </div>
  );
};

export default Card;