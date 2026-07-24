import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Bell, Menu, Moon, Sun, MessageSquare } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getPortalNotifications } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export const CustomerTopBar = () => {
  const navigate = useNavigate();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const theme = useUIStore((s) => s.theme);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);
  const currentUser = useAuthStore((s) => s.currentUser);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data } = useQuery({
    queryKey: ['portal', 'notifications'],
    queryFn: getPortalNotifications,
    refetchInterval: 30000,
  });

  const list = Array.isArray(data?.data) ? data.data.slice(0, 5) : [];
  const unread = data?.unread ?? 0;
  const firstName = (currentUser?.full_name || currentUser?.full_name_ar || 'عميل').split(/\s+/)[0];
  const initials =
    (currentUser?.full_name || currentUser?.full_name_ar || 'ع')
      .split(/\s+/)
      .slice(0, 2)
      .map((p: string) => p[0])
      .join('') || 'ع';

  const nowLabel = new Date().toLocaleString('ar-DZ', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="sticky top-0 z-30 border-b border-[#E6ECF2] bg-white/90 backdrop-blur-md">
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl text-[#64748B] hover:bg-[#F1F5F9]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0 hidden sm:block">
            <p className="font-black text-[#15202b] truncate">مرحباً، {firstName} 👋</p>
            <p className="text-[11px] text-[#64748B]">آخر تحديث · {nowLabel}</p>
          </div>
          <div className="relative flex-1 max-w-xl hidden md:block mr-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              readOnly
              onFocus={() => navigate('/portal/orders')}
              placeholder="ابحث عن طلب، مشروع، فاتورة..."
              className="w-full h-11 rounded-2xl bg-[#F6F8FB] border border-[#E6ECF2] pr-10 pl-4 text-sm focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              setShowNotifications(false);
              navigate('/portal/messages');
            }}
            className="p-2.5 rounded-xl text-[#64748B] hover:bg-[#F1F5F9]"
            title="الرسائل"
            aria-label="الرسائل"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl text-[#64748B] hover:bg-[#F1F5F9] relative"
              title="الإشعارات"
              aria-label="الإشعارات"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 rounded-full bg-[#0F766E] text-white text-[10px] font-black flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="fixed sm:absolute left-3 right-3 sm:left-0 sm:right-auto sm:mt-2 top-[4.25rem] sm:top-auto w-auto sm:w-80 max-w-[min(20rem,calc(100vw-1.5rem))] bg-white border border-[#E6ECF2] rounded-2xl shadow-xl overflow-hidden z-[60]"
                >
                  <div className="p-3 border-b border-[#EEF2F6] flex justify-between items-center bg-[#F6F8FB]">
                    <span className="font-bold text-sm">الإشعارات</span>
                    {unread > 0 && (
                      <span className="text-[10px] font-bold text-[#0F766E] bg-[#0F766E]/10 px-2 py-0.5 rounded-full">
                        {unread} جديدة
                      </span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {list.length === 0 && (
                      <p className="p-6 text-center text-xs text-[#64748B]">لا إشعارات حالياً</p>
                    )}
                    {list.map((n: any) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/portal/notifications');
                        }}
                        className="w-full text-right p-3 border-b border-[#F1F5F9] hover:bg-[#F8FAFC]"
                      >
                        <p className="text-xs font-bold text-[#15202b] mb-0.5">{n.title_ar}</p>
                        <p className="text-[11px] text-[#64748B] line-clamp-1">{n.body_ar}</p>
                      </button>
                    ))}
                  </div>
                  <button
                    className="w-full p-2.5 text-xs font-bold text-[#0F766E] hover:bg-[#F6F8FB]"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/portal/notifications');
                    }}
                  >
                    عرض كل الإشعارات
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggleDarkMode}
            className="hidden sm:inline-flex p-2.5 rounded-xl text-[#64748B] hover:bg-[#F1F5F9]"
            title="الوضع الليلي"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => {
              setShowNotifications(false);
              navigate('/portal/profile');
            }}
            className="flex items-center gap-2 p-1 pr-1.5 rounded-2xl hover:bg-[#F1F5F9] border border-transparent hover:border-[#E6ECF2]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
            <div className="hidden lg:block text-right pl-1">
              <p className="text-xs font-bold text-[#15202b] leading-none">
                {currentUser?.full_name || 'عميل'}
              </p>
              <p className="text-[10px] text-[#64748B] mt-1">بوابة العميل</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
