import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Info,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getNotifications,
  markNotificationRead,
  markNotificationsReadAll,
} from '../../services/api';

function typeIcon(type: string) {
  switch (type) {
    case 'new_order':
    case 'alert':
      return <AlertTriangle className="w-5 h-5 text-[var(--color-danger)]" />;
    case 'order_status':
    case 'success':
      return <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />;
    case 'whatsapp_pending':
    case 'message':
      return <MessageSquare className="w-5 h-5 text-[var(--color-primary-500)]" />;
    default:
      return <Info className="w-5 h-5 text-[var(--color-info)]" />;
  }
}

export const NotificationCenter = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => getNotifications({ limit: 50 }),
    refetchInterval: 20000,
  });

  const items = useMemo(() => {
    const raw = (data as any)?.data ?? (Array.isArray(data) ? data : []);
    return raw as any[];
  }, [data]);

  const markAll = useMutation({
    mutationFn: markNotificationsReadAll,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOne = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const filtered = items.filter((n) => filter === 'all' || !n.is_read);

  const openNotif = (n: any) => {
    if (!n.is_read) markOne.mutate(n.id);
    const meta = n.metadata || {};
    if (meta.whatsapp_link) {
      window.open(meta.whatsapp_link, '_blank', 'noopener,noreferrer');
      return;
    }
    if (meta.link) navigate(meta.link);
    else if (meta.order_id) navigate(`/orders/${meta.order_id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[var(--color-primary-500)]" />
            مركز الإشعارات
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            طلبات جديدة، تحديثات الحالة، وتذكيرات واتساب العملاء
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
            <CheckCircle2 className="w-4 h-4" /> تحديد الكل كمقروء
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
          >
            <Filter className="w-4 h-4" /> {filter === 'all' ? 'غير المقروءة فقط' : 'عرض الكل'}
          </Button>
        </div>
      </div>

      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <CardContent className="p-0">
          {isLoading && (
            <p className="p-8 text-center text-[var(--color-text-muted)] animate-pulse">جاري التحميل...</p>
          )}
          {!isLoading && filtered.length === 0 && (
            <p className="p-8 text-center text-[var(--color-text-muted)]">لا إشعارات حالياً</p>
          )}
          <div className="divide-y divide-[var(--color-border)]">
            <AnimatePresence>
              {filtered.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 flex items-start gap-4 hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer ${
                    !notif.is_read ? 'bg-[var(--color-primary-500)]/5' : ''
                  }`}
                  onClick={() => openNotif(notif)}
                >
                  <div className="p-2 rounded-full bg-[var(--color-bg-main)] border border-[var(--color-border)] shrink-0">
                    {typeIcon(notif.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h4 className={`font-bold text-[var(--color-text-main)] ${notif.is_read ? 'opacity-80' : ''}`}>
                        {notif.title_ar}
                      </h4>
                      <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                        {notif.created_at
                          ? new Date(notif.created_at).toLocaleString('ar-DZ')
                          : ''}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        !notif.is_read
                          ? 'text-[var(--color-text-main)] font-medium'
                          : 'text-[var(--color-text-muted)]'
                      }`}
                    >
                      {notif.body_ar}
                    </p>
                    {(notif.metadata?.whatsapp_link || notif.metadata?.link) && (
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--color-primary-600)] mt-2 font-bold">
                        <ExternalLink className="w-3 h-3" /> فتح
                      </span>
                    )}
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary-500)] self-center" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
