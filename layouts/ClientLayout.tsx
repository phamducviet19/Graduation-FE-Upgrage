import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/client/Header';
import Footer from '../components/client/Footer';
import Chatbot from '../components/client/Chatbot';

const ClientLayout: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return (
    <div className="flex flex-col min-h-screen bg-ambient-cyber text-text-primary relative selection:bg-neon-cyan/20 selection:text-neon-cyan">
      {/* Ambient Top Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-cyan/60 to-transparent pointer-events-none z-50"></div>
      
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default ClientLayout;

