import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-[#080C14] text-slate-100 overflow-hidden font-sans selection:bg-neon-cyan/20 selection:text-neon-cyan">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top ambient glow bar */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent pointer-events-none z-30"></div>
        
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 sm:p-8 bg-gradient-to-b from-[#080C14] to-[#0B0F19]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;