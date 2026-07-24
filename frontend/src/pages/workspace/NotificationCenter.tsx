import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bell, AlertTriangle, CheckCircle2, MessageSquare, Info, Filter, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mockNotifications = [
  { id: '1', type: 'alert', title: 'نقص في المخزون', message: 'مادة "أكريليك شفاف 3مم" وصلت للحد الأدنى.', time: 'منذ 10 دقائق', read: false },
  { id: '2', type: 'success', title: 'اكتمل الإنتاج', message: 'الطلب ORD-2026-105 جاهز للتسليم.', time: 'منذ ساعة', read: false },
  { id: '3', type: 'message', title: 'رسالة جديدة', message: 'العميل "شركة الرؤية" استفسر عن حالة الطلب.', time: 'منذ ساعتين', read: true },
  { id: '4', type: 'info', title: 'تحديث النظام', message: 'تم تحديث نظام الصلاحيات بنجاح.', time: 'أمس', read: true },
];

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-[var(--color-danger)]" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-[var(--color-primary-500)]" />;
      default: return <Info className="w-5 h-5 text-[var(--color-info)]" />;
    }
  };

  const filtered = notifications.filter(n => filter === 'all' || (filter === 'unread' && !n.read));

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[var(--color-primary-500)]" />
            مركز الإشعارات
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">تتبع كافة أحداث وتنبيهات النظام في الوقت الفعلي</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={markAllAsRead}>
            <CheckCircle2 className="w-4 h-4" /> تحديد الكل كمقروء
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}>
            <Filter className="w-4 h-4" /> {filter === 'all' ? 'غير المقروءة فقط' : 'عرض الكل'}
          </Button>
        </div>
      </div>

      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <CardContent className="p-0">
          <div className="divide-y divide-[var(--color-border)]">
            <AnimatePresence>
              {filtered.map(notif => (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 flex items-start gap-4 hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer ${!notif.read ? 'bg-[var(--color-primary-500)]/5' : ''}`}
                  onClick={() => setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                >
                  <div className={`p-2 rounded-full bg-[var(--color-bg-main)] border border-[var(--color-border)] shrink-0`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-bold text-[var(--color-text-main)] ${!notif.read ? '' : 'opacity-80'}`}>{notif.title}</h4>
                      <span className="text-xs text-[var(--color-text-muted)]">{notif.time}</span>
                    </div>
                    <p className={`text-sm ${!notif.read ? 'text-[var(--color-text-main)] font-medium' : 'text-[var(--color-text-muted)]'}`}>
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary-500)] self-center"></div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-[var(--color-text-muted)]">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>لا توجد إشعارات جديدة.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
