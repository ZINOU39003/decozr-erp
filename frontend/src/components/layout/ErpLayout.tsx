import React, { useEffect, Component, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { OfflineBanner } from '../global/OfflineBanner';
import { unlockDocumentUi, useUIStore } from '../../store/uiStore';
import { Button } from '../ui/Button';

class PageErrorBoundary extends Component<
  { children: ReactNode; resetKey: string },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 space-y-3" dir="rtl">
          <p className="font-bold text-lg">تعذر عرض هذه الصفحة</p>
          <p className="text-sm opacity-80">{this.state.error.message}</p>
          <Button
            className="bg-[#0F766E] text-white"
            onClick={() => {
              unlockDocumentUi();
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            إعادة تحميل الصفحة
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const ErpLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isErpSidebarOpen = useUIStore((s) => s.isErpSidebarOpen);
  const setErpSidebarOpen = useUIStore((s) => s.setErpSidebarOpen);

  useEffect(() => {
    setErpSidebarOpen(false);
    unlockDocumentUi();
  }, [location.pathname, setErpSidebarOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setErpSidebarOpen(false);
        unlockDocumentUi();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setErpSidebarOpen]);

  useEffect(() => {
    if (!isErpSidebarOpen) {
      unlockDocumentUi();
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      unlockDocumentUi();
    };
  }, [isErpSidebarOpen]);

  useEffect(() => {
    return () => unlockDocumentUi();
  }, []);

  return (
    <div
      className="min-h-screen bg-[#F6F8FB] dark:bg-[var(--color-bg-main)] flex overflow-x-hidden"
      dir="rtl"
      data-erp-shell
    >
      <OfflineBanner />

      {isErpSidebarOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className="fixed inset-0 bg-black/45 z-[60] lg:hidden backdrop-blur-[2px] border-0 cursor-pointer"
          onClick={() => {
            setErpSidebarOpen(false);
            unlockDocumentUi();
          }}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-[70] w-64 transform transition-transform duration-300 ease-out lg:translate-x-0 shadow-xl lg:shadow-none ${
          isErpSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar
          onNavigate={() => {
            setErpSidebarOpen(false);
            unlockDocumentUi();
          }}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 lg:pr-64">
        <TopBar />
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full pb-10 animate-fade-in">
            <PageErrorBoundary resetKey={location.pathname}>{children}</PageErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
};
