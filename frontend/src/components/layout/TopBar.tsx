import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Bell,
  MessageSquare,
  Plus,
  Sun,
  Moon,
  Menu,
  Inbox,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/uiStore';
import { getAdminPortalInbox } from '../../services/api';
import { AnimatePresence, motion } from 'framer-motion';

export function TopBar() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const toggleErpSidebar = useUIStore((s) => s.toggleErpSidebar);
  const theme = useUIStore((s) => s.theme);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);

  const inboxQ = useQuery({
    queryKey: ['admin', 'portal', 'inbox'],
    queryFn: getAdminPortalInbox,
    refetchInterval: 45000,
    retry: 0,
  });
  const pending =
    (inboxQ.data?.counts?.pending_payments || 0) +
    (inboxQ.data?.counts?.custom_requests_new || 0);

  const initials =
    (currentUser?.full_name || currentUser?.full_name_ar || 'أد')
      .split(/\s+/)
      .slice(0, 2)
      .map((p: string) => p[0])
      .join('') || 'أد';

  return (
    <header className="sticky top-0 z-30 border-b border-[#E6ECF2] bg-white/90 dark:bg-[var(--color-bg-card)]/90 backdrop-blur-md">
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={toggleErpSidebar}
            className="lg:hidden p-2 rounded-xl text-[#64748B] hover:bg-[#F1F5F9]"
            aria-label="القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0 hidden sm:block">
            <p className="font-black text-[#15202b] dark:text-[var(--color-text-main)] truncate text-sm">
              لوحة الورشة
            </p>
            <p className="text-[11px] text-[#64748B]">DecoZR ERP</p>
          </div>
          <div className="relative flex-1 max-w-md hidden md:block mr-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              readOnly
              onFocus={() => navigate('/orders')}
              placeholder="ابحث عن طلب، عميل، فاتورة..."
              className="w-full h-11 rounded-2xl bg-[#F6F8FB] border border-[#E6ECF2] pr-10 pl-4 text-sm focus:outline-none focus:border-[#0F766E] cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            className="hidden sm:inline-flex gap-1.5 bg-[#0F766E] text-white h-10 rounded-xl"
            onClick={() => navigate('/orders/create')}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">طلب جديد</span>
          </Button>

          <button
            type="button"
            onClick={() => navigate('/admin/portal')}
            className="p-2.5 rounded-xl text-[#64748B] hover:bg-[#F1F5F9] relative"
            title="بوابة العملاء"
          >
            <Inbox className="w-5 h-5" />
            {pending > 0 && (
              <span className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                {pending > 9 ? '9+' : pending}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotif(!showNotif)}
              className="p-2.5 rounded-xl text-[#64748B] hover:bg-[#F1F5F9] relative"
              title="الإشعارات"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="fixed sm:absolute left-3 right-3 sm:left-0 sm:right-auto sm:mt-2 top-[4.25rem] sm:top-auto w-auto sm:w-80 bg-white border border-[#E6ECF2] rounded-2xl shadow-xl overflow-hidden z-[60]"
                >
                  <div className="p-3 border-b border-[#EEF2F6] bg-[#F6F8FB] font-bold text-sm">
                    تنبيهات البوابة
                  </div>
                  <div className="p-3 space-y-2 text-sm">
                    <p className="text-[#64748B]">
                      مدفوعات بانتظار الاعتماد:{' '}
                      <strong>{inboxQ.data?.counts?.pending_payments || 0}</strong>
                    </p>
                    <p className="text-[#64748B]">
                      تصاميم خاصة جديدة:{' '}
                      <strong>{inboxQ.data?.counts?.custom_requests_new || 0}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="w-full p-2.5 text-xs font-bold text-[#0F766E] hover:bg-[#F6F8FB]"
                    onClick={() => {
                      setShowNotif(false);
                      navigate('/admin/portal');
                    }}
                  >
                    فتح بوابة العملاء
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/portal')}
            className="hidden sm:inline-flex p-2.5 rounded-xl text-[#64748B] hover:bg-[#F1F5F9]"
            title="رسائل العملاء"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={toggleDarkMode}
            className="hidden sm:inline-flex p-2.5 rounded-xl text-[#64748B] hover:bg-[#F1F5F9]"
            title="الوضع الليلي"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 p-1 pr-1.5 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
