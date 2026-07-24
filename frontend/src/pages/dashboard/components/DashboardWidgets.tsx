import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, Package, Activity, AlertCircle, 
  Cpu, Users, Scissors, CheckCircle, FileText, Calendar, Clock,
  Plus, PenTool, Box, CreditCard, User, Hammer, Bell, ArrowRight, UserCircle, Truck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

// 1. Top Alerts
export const TopAlerts = () => {
  const [alerts, setAlerts] = React.useState([
    { id: 1, type: 'error', icon: Box, text: 'بقي لوحان أكريليك فقط.', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { id: 2, type: 'warning', icon: Clock, text: 'طلب ORD-2410 متأخر ساعتين.', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 3, type: 'success', icon: Cpu, text: 'آلة الليزر 2 أصبحت متاحة.', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { id: 4, type: 'info', icon: CreditCard, text: 'دفعة جديدة بقيمة 120,000 دج.', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {alerts.map(alert => (
        <motion.div 
          key={alert.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between p-3 rounded-lg border ${alert.bg} ${alert.border}`}
        >
          <div className="flex items-center gap-3">
            <alert.icon className={`w-5 h-5 ${alert.color}`} />
            <span className={`text-sm font-medium ${alert.color}`}>{alert.text}</span>
          </div>
          <button 
            onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
            className="text-[var(--color-text-muted)] hover:text-white"
          >
            ×
          </button>
        </motion.div>
      ))}
    </div>
  );
};

// 2. Active Orders
export const ActiveOrders = () => {
  const navigate = useNavigate();
  const orders = [
    { id: '2401', progress: 80, stage: 'قص', assignee: 'محمد', time: '11:40' },
    { id: '2402', progress: 50, stage: 'طباعة', assignee: 'يوسف', time: '10:15' },
    { id: '2403', progress: 20, stage: 'تجميع', assignee: 'أحمد', time: '09:00' },
  ];

  return (
    <Card className="h-full border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary-500)]/50 transition-colors cursor-pointer" onClick={() => navigate('/orders')}>
      <CardHeader>
        <CardTitle className="text-lg">الطلبات الجارية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {orders.map((order, idx) => (
          <div key={idx} className="group">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-[var(--color-primary-400)] group-hover:text-[var(--color-primary-300)] transition-colors">ORD-{order.id}</span>
              <span className="text-sm font-medium">{order.progress}%</span>
            </div>
            <div className="w-full h-2 bg-[var(--color-bg-main)] rounded-full overflow-hidden border border-[var(--color-border)] mb-2">
              <motion.div 
                className="h-full bg-[var(--color-primary-500)] shadow-[0_0_10px_var(--color-primary-500)]" 
                initial={{ width: 0 }} 
                animate={{ width: `${order.progress}%` }} 
                transition={{ duration: 1 }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {order.stage}</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {order.assignee}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.time}</span>
            </div>
            {idx < orders.length - 1 && <div className="border-b border-[var(--color-border)]/50 mt-4"></div>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// 3. Today's Schedule (Calendar)
export const TodaySchedule = () => {
  const navigate = useNavigate();
  const schedule = [
    { time: '08:00', task: 'قص', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { time: '10:30', task: 'طباعة', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { time: '13:00', task: 'تركيب', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { time: '15:00', task: 'تسليم', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <Card className="h-full border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary-500)]/50 transition-colors cursor-pointer" onClick={() => navigate('/calendar')}>
      <CardHeader>
        <CardTitle className="text-lg">جدول اليوم</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedule.map((item, idx) => (
          <div key={idx} className="flex gap-4 items-start group">
            <div className="w-12 text-right shrink-0">
              <span className="text-xs font-bold text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)] transition-colors">{item.time}</span>
            </div>
            <div className="relative pb-4">
              {idx !== schedule.length - 1 && <div className="absolute top-6 bottom-0 right-1.5 w-px bg-[var(--color-border)]"></div>}
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.bg} border-2 border-[var(--color-bg-card)] ring-1 ring-[var(--color-border)] z-10`}></div>
                <div className={`text-sm font-medium px-3 py-1 rounded-md ${item.bg} ${item.color}`}>
                  {item.task}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// 4. Machine Status Grid
export const MachineStatusGrid = () => {
  const navigate = useNavigate();
  const machines = [
    { name: 'Laser 1', status: 'يعمل', color: 'text-emerald-500', bg: 'bg-emerald-500/10', indicator: 'bg-emerald-500', extra: '78%' },
    { name: 'Laser 2', status: 'صيانة', color: 'text-red-500', bg: 'bg-red-500/10', indicator: 'bg-red-500', extra: '' },
    { name: 'UV', status: 'يعمل', color: 'text-emerald-500', bg: 'bg-emerald-500/10', indicator: 'bg-emerald-500', extra: '' },
    { name: 'CNC', status: 'انتظار', color: 'text-amber-500', bg: 'bg-amber-500/10', indicator: 'bg-amber-500', extra: '' },
  ];

  return (
    <Card className="h-full border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary-500)]/50 transition-colors cursor-pointer" onClick={() => navigate('/machines')}>
      <CardHeader>
        <CardTitle className="text-lg">حالة الآلات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {machines.map((machine, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)]/50 flex flex-col items-center justify-center text-center group hover:bg-[var(--color-bg-hover)] transition-colors">
              <Cpu className={`w-8 h-8 mb-2 ${machine.color}`} />
              <h4 className="font-bold mb-1">{machine.name}</h4>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${machine.indicator} animate-pulse`}></span>
                <span className="text-sm text-[var(--color-text-muted)]">{machine.status}</span>
              </div>
              {machine.extra && <span className="text-xs font-bold mt-2">{machine.extra}</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// 5. Activity Feed
export const ActivityFeed = () => {
  const navigate = useNavigate();
  const activities = [
    { time: 'منذ دقيقة', user: 'محمد', action: 'أنشأ طلباً جديداً' },
    { time: 'منذ 8 دقائق', user: 'أحمد', action: 'رفع تصميم' },
    { time: 'منذ 13 دقيقة', user: 'النظام', action: 'تم إصدار فاتورة' },
    { time: 'منذ ساعة', user: 'يوسف', action: 'استلام خامات' },
  ];

  return (
    <Card className="h-full border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary-500)]/50 transition-colors cursor-pointer">
      <CardHeader>
        <CardTitle className="text-lg">أحدث النشاطات</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((act, idx) => (
          <div key={idx} className="flex flex-col border-b border-[var(--color-border)]/50 pb-3 last:border-0 last:pb-0">
            <span className="text-xs text-[var(--color-primary-400)] font-medium mb-1">{act.time}</span>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-[var(--color-text-main)]">{act.user}</span>
              <span className="text-[var(--color-text-muted)]">{act.action}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// 6. Quick Statistics
export const QuickStatistics = () => {
  const stats = [
    { label: 'أفضل عميل', value: 'شركة الإبداع', sub: '820 ألف', icon: Users },
    { label: 'أفضل موزع', value: 'شركة الريان', sub: '', icon: Truck },
    { label: 'أفضل موظف', value: 'محمد', sub: '', icon: UserCircle },
    { label: 'أفضل آلة', value: 'Laser 01', sub: '', icon: Cpu },
  ];

  return (
    <Card className="h-full border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <CardHeader>
        <CardTitle className="text-lg">إحصائيات سريعة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-main)]/50 border border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--color-primary-500)]/10 rounded-md text-[var(--color-primary-400)]">
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
                <p className="text-sm font-bold">{stat.value}</p>
              </div>
            </div>
            {stat.sub && <span className="text-xs font-bold text-[var(--color-success)]">{stat.sub}</span>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// 8. Daily Completion
export const DailyCompletion = () => {
  return (
    <Card className="h-full border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <CardHeader>
        <CardTitle className="text-lg">خطة اليوم</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end mb-4">
          <span className="text-3xl font-bold text-white">78%</span>
          <span className="text-sm text-[var(--color-text-muted)]">18 / 23 طلب</span>
        </div>
        <div className="w-full h-3 bg-[var(--color-bg-main)] rounded-full overflow-hidden border border-[var(--color-border)] mb-3">
          <motion.div 
            className="h-full bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-400)]" 
            initial={{ width: 0 }} 
            animate={{ width: '78%' }} 
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-sm text-[var(--color-primary-400)] font-medium">تبقى 5 طلبات</p>
      </CardContent>
    </Card>
  );
};

// 9. Top Customers
export const TopCustomers = () => {
  const navigate = useNavigate();
  const customers = [
    { name: 'شركة الإبداع', total: '420k', trend: 'up' },
    { name: 'بيت الديكور', total: '320k', trend: 'neutral' },
    { name: 'ريان', total: '290k', trend: 'down' },
  ];

  return (
    <Card className="h-full border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary-500)]/50 transition-colors cursor-pointer" onClick={() => navigate('/customers')}>
      <CardHeader>
        <CardTitle className="text-lg">أفضل العملاء</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customers.map((c, idx) => (
          <div key={idx} className="flex justify-between items-center p-2 border-b border-[var(--color-border)]/50 last:border-0">
            <span className="font-medium text-sm">{c.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-[var(--color-text-muted)]">{c.total}</span>
              {c.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
              {c.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
              {c.trend === 'neutral' && <div className="w-4 h-1 bg-zinc-500 rounded-full"></div>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// 10. Quick Actions Grid
export const QuickActionsGrid = () => {
  const navigate = useNavigate();
  const actions = [
    { name: 'طلب', icon: Plus, path: '/orders/create' },
    { name: 'عميل', icon: User, path: '/customers' },
    { name: 'تصميم', icon: PenTool, path: '/designs' },
    { name: 'إنتاج', icon: Activity, path: '/production' },
    { name: 'مخزون', icon: Box, path: '/inventory' },
    { name: 'فاتورة', icon: FileText, path: '/invoices' },
    { name: 'دفعة', icon: CreditCard, path: '/payments' },
    { name: 'جدولة', icon: Calendar, path: '/calendar' },
  ];

  return (
    <Card className="h-full border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <CardHeader>
        <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {actions.map((act, idx) => (
            <button 
              key={idx}
              onClick={() => navigate(act.path)}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--color-bg-main)] border border-[var(--color-border)] hover:bg-[var(--color-primary-500)]/20 hover:border-[var(--color-primary-500)]/50 hover:text-[var(--color-primary-400)] transition-all group"
            >
              <act.icon className="w-6 h-6 mb-2 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-400)] transition-colors" />
              <span className="text-xs font-bold text-[var(--color-text-main)]">{act.name}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// 11. Bottom Beautiful Cards
export const BottomCards = () => {
  const navigate = useNavigate();
  const cards = [
    { title: 'المبيعات اليوم', value: '125%', trend: 'up', path: '/reports' },
    { title: 'الإنتاج', value: '87%', trend: 'up', path: '/production' },
    { title: 'التسليم', value: '95%', trend: 'neutral', path: '/orders' },
    { title: 'الأرباح', value: '23%', trend: 'up', path: '/reports' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {cards.map((c, idx) => (
        <motion.div 
          key={idx}
          whileHover={{ y: -5 }}
          onClick={() => navigate(c.path)}
          className="p-4 rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-main)] hover:border-[var(--color-primary-500)]/50 transition-all cursor-pointer flex justify-between items-center group"
        >
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">{c.title}</p>
            <p className="text-xl font-bold group-hover:text-[var(--color-primary-400)] transition-colors">{c.value}</p>
          </div>
          <div className="p-2 rounded-full bg-[var(--color-bg-main)]">
            {c.trend === 'up' && <TrendingUp className="w-5 h-5 text-emerald-500" />}
            {c.trend === 'neutral' && <CheckCircle className="w-5 h-5 text-blue-500" />}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Export RevenueChart to be used in Dashboard
export const RevenueChart = () => {
  const navigate = useNavigate();
  return (
    <Card className="h-full border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary-500)]/50 transition-colors cursor-pointer" onClick={() => navigate('/reports')}>
      <CardHeader>
        <CardTitle className="text-lg">الإيرادات آخر 7 أيام</CardTitle>
      </CardHeader>
      <CardContent className="h-64 flex items-end justify-between gap-2 pt-4">
        {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
          <div key={i} className="w-full relative group">
            <motion.div 
              className="absolute bottom-0 w-full bg-[var(--color-primary-600)] rounded-t-md hover:bg-[var(--color-primary-500)] transition-colors"
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 1, delay: i * 0.1 }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
