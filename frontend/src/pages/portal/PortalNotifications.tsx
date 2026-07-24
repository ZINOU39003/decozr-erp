import React, { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  CreditCard,
  Layers,
  Loader2,
  Package,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getPortalNotifications,
  markPortalNotificationRead,
  markPortalNotificationsRead,
} from '../../services/api';
import { Button } from '../../components/ui/Button';

function iconFor(type?: string) {
  if (type === 'welcome' || type === 'tip') return Sparkles;
  if (type?.includes('invoice') || type?.includes('payment')) return CreditCard;
  if (type?.includes('order')) return Package;
  if (type?.includes('catalog')) return Layers;
  return Bell;
}

function toneFor(type?: string) {
  if (type === 'welcome' || type === 'tip')
    return 'bg-[var(--color-primary-500)]/15 text-[var(--color-primary-400)]';
  if (type?.includes('invoice') || type?.includes('payment'))
    return 'bg-emerald-500/15 text-emerald-400';
  if (type?.includes('order')) return 'bg-sky-500/15 text-sky-400';
  return 'bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]';
}

export const PortalNotifications = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal', 'notifications'],
    queryFn: getPortalNotifications,
  });

  const list = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);
  const unread = data?.unread ?? list.filter((n: any) => !n.is_read).length;

  const markOne = useMutation({
    mutationFn: (id: string) => markPortalNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal', 'notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: markPortalNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'notifications'] });
      toast.success('تم تحديد الكل كمقروء');
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 md:p-8 shadow-sm">
        <div className="absolute -left-8 top-0 w-36 h-36 rounded-full bg-[var(--color-primary-500)]/12 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[var(--color-primary-600)] text-sm font-bold mb-2">
              <Bell className="w-4 h-4" /> مركز التنبيهات
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--color-text-main)]">الإشعارات</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              تحديثات طلباتك، الفواتير، والرسائل من الورشة في مكان واحد.
            </p>
          </div>
          {unread > 0 && (
            <Button
              variant="outline"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
              className="gap-2 shrink-0"
            >
              {markAll.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
        {unread > 0 && (
          <div className="relative mt-4 inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--color-primary-500)]/20 text-[var(--color-primary-300)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-400)] animate-pulse" />
            {unread} غير مقروء
          </div>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-6 text-[var(--color-danger)] text-sm">
          تعذر تحميل الإشعارات. حاول لاحقاً.
        </div>
      )}

      {!isLoading && !isError && list.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[var(--color-border)] py-16 text-center text-[var(--color-text-muted)]">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-bold text-[var(--color-text-main)]">لا إشعارات حالياً</p>
          <p className="text-sm mt-1">ستظهر هنا تنبيهات الطلبات والفواتير</p>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {list.map((n: any, idx: number) => {
            const Icon = iconFor(n.notification_type);
            return (
              <motion.button
                key={n.id}
                type="button"
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.25) }}
                onClick={() => {
                  if (!n.is_read) markOne.mutate(n.id);
                  if (n.notification_type === 'tip') navigate('/portal/catalog');
                }}
                className={`w-full text-right rounded-2xl border p-4 md:p-5 transition-all ${
                  n.is_read
                    ? 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-hover)]'
                    : 'border-[var(--color-primary-500)]/30 bg-[var(--color-primary-500)]/8 hover:bg-[var(--color-primary-500)]/12 shadow-[0_0_0_1px_rgba(234,179,8,0.08)]'
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${toneFor(
                      n.notification_type
                    )}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-sm md:text-base leading-snug">
                        {n.title_ar}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-[var(--color-primary-500)]" />
                        )}
                        <span className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">
                          {new Date(n.created_at).toLocaleString('ar-DZ', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`text-sm mt-1.5 leading-relaxed ${
                        n.is_read
                          ? 'text-[var(--color-text-muted)]'
                          : 'text-[var(--color-text-main)]'
                      }`}
                    >
                      {n.body_ar}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
