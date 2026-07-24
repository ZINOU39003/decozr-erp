import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CustomerSidebar } from './CustomerSidebar';
import { CustomerTopBar } from './CustomerTopBar';
import { useUIStore, unlockDocumentUi } from '../../store/uiStore';

export const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  useEffect(() => {
    setSidebarOpen(false);
    unlockDocumentUi();
  }, [location.pathname, setSidebarOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSidebarOpen]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex overflow-x-hidden" data-portal-shell>
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className="fixed inset-0 bg-black/45 z-40 lg:hidden backdrop-blur-[2px] border-0 cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-64 transform transition-transform duration-300 ease-out lg:translate-x-0 shadow-xl lg:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <CustomerSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:pr-64">
        <CustomerTopBar />
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto w-full animate-fade-in pb-10">{children}</div>
        </div>
      </main>
    </div>
  );
};
