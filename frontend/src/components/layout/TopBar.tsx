import React, { useEffect, useRef, useState } from 'react';
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
import { getAdminPortalInbox, getNotifications } from '../../services/api';
import { playWorkshopAlert } from '../../lib/workshopAlertSound';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

export function TopBar() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const toggleErpSidebar = useUIStore((s) => s.toggleErpSidebar);
  const theme = useUIStore((s) => s.theme);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const seenIds = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  const inboxQ = useQuery({
    queryKey: ['admin', 'portal', 'inbox'],
    queryFn: getAdminPortalInbox,
    refetchInterval: 45000,
    retry: 0,
  });

  const notifQ = useQuery({
    queryKey: ['notifications', 'topbar'],
    queryFn: () => getNotifications({ limit: 15 }),
    refetchInterval: 15000,
    retry: 0,
  });

  const notifications = ((notifQ.data as any)?.data ?? []) as any[];
  const unread = Number((notifQ.data as any)?.meta?.unread ?? notifications.filter((n) => !n.is_read).length);
  const pending =
    (inboxQ.data?.counts?.pending_payments || 0) +
    (inboxQ.data?.counts?.custom_requests_new || 0);

  useEffect(() => {
    if (!notifications.length) return;
    if (!primed.current) {
      notifications.forEach((n) => seenIds.current.add(n.id));
      primed.current = true;
      return;
    }
    const fresh = notifications.filter((n) => !seenIds.current.has(n.id));
    fresh.forEach((n) => seenIds.current.add(n.id));
    const alertWorthy = fresh.filter(
      (n) =>
        n.notification_type === 'new_order' ||
        n.metadata?.play_sound ||
        n.notification_type === 'custom_design' ||
        n.notification_type === 'payment',
    );
    if (alertWorthy.length) {
      playWorkshopAlert();
      const first = alertWorthy[0];
      toast.message(first.title_ar, {
        description: first.body_ar,
        action: {
          label: 'عرض',
          onClick: () => navigate(first.metadata?.link || '/notifications'),
        },
      });
    }
  }, [notifications, navigate]);

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
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="fixed sm:absolute left-3 right-3 sm:left-0 sm:right-auto sm:mt-2 top-[4.25rem] sm:top-auto w-auto sm:w-96 bg-white border border-[#E6ECF2] rounded-2xl shadow-xl overflow-hidden z-[60]"
                >
                  <div className="p-3 border-b border-[#EEF2F6] bg-[#F6F8FB] font-bold text-sm flex justify-between">
                    <span>الإشعارات</span>
                    <span className="text-[#0F766E]">{unread} غير مقروء</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#EEF2F6]">
                    {notifications.length === 0 && (
                      <p className="p-4 text-sm text-[#64748B]">لا إشعارات</p>
                    )}
                    {notifications.slice(0, 8).map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        className={`w-full text-right p-3 text-sm hover:bg-[#F6F8FB] ${
                          !n.is_read ? 'bg-[#0F766E]/5' : ''
                        }`}
                        onClick={() => {
                          setShowNotif(false);
                          if (n.metadata?.whatsapp_link) {
                            window.open(n.metadata.whatsapp_link, '_blank');
                          } else {
                            navigate(n.metadata?.link || '/notifications');
                          }
                        }}
                      >
                        <p className="font-bold text-[#15202b] truncate">{n.title_ar}</p>
                        <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2">{n.body_ar}</p>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="w-full p-2.5 text-xs font-bold text-[#0F766E] hover:bg-[#F6F8FB]"
                    onClick={() => {
                      setShowNotif(false);
                      navigate('/notifications');
                    }}
                  >
                    مركز الإشعارات
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

          <div className="mr-1 w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center text-sm font-black">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
