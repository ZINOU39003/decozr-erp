import React from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Clock, Calendar as CalendarIcon, CheckCircle2, AlertTriangle, Cpu, Server, Database, Bot, Zap, Plus, 
  FileText, Users, Factory, Box, CreditCard, PenTool, LayoutDashboard, Map as MapIcon, Award, Package, MoreVertical,
  Flag, ChevronLeft, Power, BarChart2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { unlockDocumentUi, useUIStore } from '../../../store/uiStore';
import { Badge } from '../../../components/ui/Badge';
import { mockOrders as orders, mockMachines as machines, mockEmployees as employees, mockMaterials as materials, mockCustomers as customers, mockInvoices as invoices, mockPayments as payments } from '../../../data/mockDatabase';

// 1 & 11. Activity Feed / Timeline
export const ActivityFeed = () => {
  const activities = [
    { time: '09:15', text: `بدأ القص لطلب ORD-2401`, type: 'info' },
    { time: '10:10', text: `تمت الطباعة لطلب ORD-2402`, type: 'success' },
    { time: '11:40', text: `تم إصدار فاتورة لشركة الريان`, type: 'warning' },
    { time: '12:00', text: `استلم العميل طلب ORD-2399`, type: 'success' },
    { time: '13:05', text: `توقف ليزر 02 للصيانة`, type: 'danger' },
  ];

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] h-full">
      <CardHeader className="border-b border-[var(--color-border)] pb-4">
        <CardTitle className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--color-primary-500)]" />
          Timeline (النشاط الأخير)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--color-border)] before:to-transparent">
          {activities.map((act, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-[var(--color-bg-card)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                act.type === 'success' ? 'bg-[var(--color-success)]' :
                act.type === 'warning' ? 'bg-[var(--color-warning)]' :
                act.type === 'danger' ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-primary-500)]'
              }`}></div>
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-main)] shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-[var(--color-text-main)]">{act.text}</span>
                  <time className="text-[10px] text-[var(--color-text-muted)] font-mono bg-[var(--color-bg-card)] px-2 py-0.5 rounded">{act.time}</time>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// 2. Live Orders Table
export const LiveOrdersTable = () => {
  const activeOrders = orders.filter(o => o.status !== 'ready').slice(0, 5);
  
  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] h-full flex flex-col">
      <CardHeader className="border-b border-[var(--color-border)] pb-4 flex flex-row justify-between items-center shrink-0">
        <CardTitle className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--color-primary-500)]" />
          آخر الطلبات (Live Orders)
        </CardTitle>
        <Button variant="outline" size="sm" className="h-7 text-xs border-[var(--color-border)]" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>عرض الكل</Button>
      </CardHeader>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-right">
          <thead className="bg-[var(--color-bg-main)]/50 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)]">الطلب</th>
              <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)]">العميل</th>
              <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)]">المرحلة</th>
              <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Priority</th>
              <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] w-32">Progress</th>
              <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {activeOrders.map(order => (
              <tr key={order.id} className="hover:bg-[var(--color-bg-hover)] transition-colors group">
                <td className="px-4 py-3 font-bold text-[var(--color-text-main)] text-sm">{order.id}</td>
                <td className="px-4 py-3 text-[var(--color-text-main)] text-sm truncate max-w-[120px]">{order.customer_name}</td>
                <td className="px-4 py-3 text-xs">
                  <Badge className="bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] border-0">
                    {order.status === 'in_design' ? 'التصميم' : order.status === 'in_cutting' ? 'القص' : order.status === 'in_assembly' ? 'التجميع' : order.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Flag className={`w-3 h-3 ${order.priority === 'high' ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]'}`} />
                    <span className={order.priority === 'high' ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]'}>
                      {order.priority === 'high' ? 'عالي' : 'عادي'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[var(--color-bg-main)] rounded-full h-2 overflow-hidden border border-[var(--color-border)]">
                      <div className="bg-[var(--color-primary-500)] h-2 rounded-full transition-all duration-1000" style={{ width: `${order.progress}%` }}></div>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono min-w-[24px]">{order.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-[var(--color-text-muted)] hover:text-[var(--color-primary-500)] opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// 3. Machines Cards
export const MachineCards = () => {
  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] h-full">
      <CardHeader className="border-b border-[var(--color-border)] pb-4">
        <CardTitle className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Factory className="w-4 h-4 text-[var(--color-text-main)]" />
          الآلات
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {machines.slice(0, 4).map(m => (
          <div key={m.id} className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-main)] flex flex-col gap-3 hover:border-[var(--color-primary-500)]/30 transition-colors">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-[var(--color-text-main)]">{m.name}</span>
              {m.status === 'running' ? (
                <div className="flex items-center gap-1.5 bg-[var(--color-success)]/10 px-2 py-0.5 rounded-full">
                  <span className="flex w-2 h-2 bg-[var(--color-success)] rounded-full animate-pulse" />
                  <span className="text-[10px] text-[var(--color-success)] font-bold">تعمل</span>
                </div>
              ) : m.status === 'maintenance' ? (
                <div className="flex items-center gap-1.5 bg-[var(--color-warning)]/10 px-2 py-0.5 rounded-full">
                  <span className="flex w-2 h-2 bg-[var(--color-warning)] rounded-full" />
                  <span className="text-[10px] text-[var(--color-warning)] font-bold">صيانة</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-[var(--color-danger)]/10 px-2 py-0.5 rounded-full">
                  <span className="flex w-2 h-2 bg-[var(--color-danger)] rounded-full" />
                  <span className="text-[10px] text-[var(--color-danger)] font-bold">متوقفة</span>
                </div>
              )}
            </div>
            {m.status === 'running' && (
              <div className="flex items-center gap-2">
                <div className="w-full bg-[var(--color-bg-card)] rounded-full h-1 overflow-hidden">
                  <div className="bg-[var(--color-success)] h-1 rounded-full" style={{ width: `${m.efficiency}%` }}></div>
                </div>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{m.efficiency}%</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// 4. Notifications Center
export const NotificationsWidget = () => {
  const notifs = [
    { text: `مادة MDF قاربت على النفاد`, type: 'danger', time: 'منذ 5 د' },
    { text: `الطلب ORD-2410 متأخر`, type: 'danger', time: 'منذ 15 د' },
    { text: `الليزر 01 يحتاج صيانة دورية`, type: 'warning', time: 'منذ 1 س' },
    { text: `تم تحصيل دفعة من شركة الريان`, type: 'success', time: 'منذ 2 س' },
    { text: `وصل طلب جديد (أكريليك)`, type: 'success', time: 'منذ 3 س' },
  ];

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] h-full">
      <CardHeader className="border-b border-[var(--color-border)] pb-4 flex flex-row justify-between items-center">
        <CardTitle className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[var(--color-text-main)]" />
          مركز التنبيهات
        </CardTitle>
        <span className="flex items-center justify-center bg-[var(--color-danger)] text-white text-[10px] font-bold w-5 h-5 rounded-full animate-bounce">
          3
        </span>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {notifs.map((n, i) => (
          <div key={i} className={`p-3 rounded-lg border-l-4 ${
            n.type === 'danger' ? 'border-[var(--color-danger)] bg-[var(--color-danger)]/5' : 
            n.type === 'warning' ? 'border-[var(--color-warning)] bg-[var(--color-warning)]/5' : 
            'border-[var(--color-success)] bg-[var(--color-success)]/5'
          } flex items-start justify-between gap-3`}>
            <div className="flex items-center gap-2">
              {n.type === 'danger' ? <AlertTriangle className="w-4 h-4 text-[var(--color-danger)]" /> : 
               n.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-[var(--color-warning)]" /> :
               <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />}
              <span className="text-xs font-semibold text-[var(--color-text-main)]">{n.text}</span>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">{n.time}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// 5. Quick Actions
export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'طلب', path: '/orders/create', icon: Plus, color: 'text-[var(--color-primary-500)]', bg: 'bg-[var(--color-primary-500)]/10', border: 'border-[var(--color-primary-500)]/30' },
    { label: 'عميل', path: '/customers/new', icon: Users, color: 'text-[var(--color-blue-500)]', bg: 'bg-[var(--color-blue-500)]/10', border: 'border-[var(--color-blue-500)]/30' },
    { label: 'تصميم', path: '/designs', icon: PenTool, color: 'text-[var(--color-indigo-500)]', bg: 'bg-[var(--color-indigo-500)]/10', border: 'border-[var(--color-indigo-500)]/30' },
    { label: 'فاتورة', path: '/invoices', icon: FileText, color: 'text-[var(--color-emerald-500)]', bg: 'bg-[var(--color-emerald-500)]/10', border: 'border-[var(--color-emerald-500)]/30' },
    { label: 'دفعة', type: 'CREATE_PAYMENT' as const, icon: CreditCard, color: 'text-[var(--color-success)]', bg: 'bg-[var(--color-success)]/10', border: 'border-[var(--color-success)]/30' },
    { label: 'مورد', type: 'CREATE_SUPPLIER' as const, icon: Box, color: 'text-[var(--color-amber-500)]', bg: 'bg-[var(--color-amber-500)]/10', border: 'border-[var(--color-amber-500)]/30' },
    { label: 'مادة', type: 'CREATE_MATERIAL' as const, icon: Package, color: 'text-[var(--color-orange-500)]', bg: 'bg-[var(--color-orange-500)]/10', border: 'border-[var(--color-orange-500)]/30' },
    { label: 'آلة', type: 'CREATE_MACHINE' as const, icon: Factory, color: 'text-[var(--color-danger)]', bg: 'bg-[var(--color-danger)]/10', border: 'border-[var(--color-danger)]/30' },
  ];

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <CardContent className="p-4 grid grid-cols-4 md:grid-cols-8 gap-3">
        {actions.map((act, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              unlockDocumentUi();
              if ('path' in act && act.path) {
                navigate(act.path);
                return;
              }
              if ('type' in act && act.type) {
                useUIStore.getState().modal.openModal(act.type);
              }
            }}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border ${act.border} bg-[var(--color-bg-main)] hover:shadow-md transition-all gap-2`}
          >
            <div className={`p-2 rounded-full ${act.bg}`}>
              <act.icon className={`w-4 h-4 ${act.color}`} />
            </div>
            <span className="text-[10px] font-bold text-[var(--color-text-main)]">+ {act.label}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

// 6. Mini Kanban
export const MiniKanban = () => {
  const stages = [
    { name: 'جديد', count: 3, color: 'bg-[var(--color-info)]' },
    { name: 'قص', count: 5, color: 'bg-[var(--color-warning)]' },
    { name: 'طباعة', count: 2, color: 'bg-[var(--color-indigo-500)]' },
    { name: 'تجميع', count: 4, color: 'bg-[var(--color-orange-500)]' },
    { name: 'جاهز', count: 7, color: 'bg-[var(--color-success)]' },
  ];

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] h-full">
      <CardHeader className="border-b border-[var(--color-border)] pb-4">
        <CardTitle className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-[var(--color-text-main)]" />
          مخطط الإنتاج (Kanban)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex justify-between gap-2 overflow-x-auto custom-scrollbar">
        {stages.map((stage, i) => (
          <div key={i} className="flex flex-col items-center gap-2 min-w-[50px]">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm ${stage.color}`}>
              {stage.count}
            </div>
            <span className="text-[10px] font-bold text-[var(--color-text-main)]">{stage.name}</span>
            {i < stages.length - 1 && (
              <div className="h-0.5 w-full bg-[var(--color-border)] mt-2 relative">
                <div className="absolute right-0 -top-1 w-2 h-2 border-t border-l border-[var(--color-border)] rotate-45 transform translate-x-1"></div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// 12. AI Assistant
export const AiWidget = () => {
  return (
    <Card className="border-[var(--color-primary-500)]/30 bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-primary-900)]/20 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--color-primary-500)]/20 blur-2xl rounded-full" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Bot className="w-5 h-5 text-[var(--color-primary-400)] animate-pulse" />
          DecoZR AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-[var(--color-bg-card)]/50 p-3 rounded-lg border border-[var(--color-primary-500)]/20 backdrop-blur-sm">
          <p className="text-xs text-[var(--color-text-main)] mb-3 leading-relaxed">
            لديك <span className="font-bold text-[var(--color-danger)]">3 طلبات متأخرة</span> بسبب ضغط العمل على آلات الليزر. ننصح بزيادة تشغيل الليزر ساعة إضافية اليوم.
          </p>
          <Button size="sm" className="w-full bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] text-white text-xs gap-2 shadow-[0_0_15px_rgba(var(--color-primary-500-rgb),0.3)]" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
            <Zap className="w-3 h-3" /> تطبيق التوصية
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// 13. Factory Status Widget
export const FactoryStatusWidget = () => {
  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <CardHeader className="border-b border-[var(--color-border)] pb-4">
        <CardTitle className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <ActivityFeedIcon className="w-4 h-4 text-[var(--color-text-main)]" />
          الوضع الحالي للمصنع
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 p-2 bg-[var(--color-bg-main)] rounded border border-[var(--color-border)] text-center">
          <span className="text-[10px] text-[var(--color-text-muted)]">الآلات</span>
          <span className="font-bold text-[var(--color-text-main)]">13/15</span>
          <span className="text-[10px] text-[var(--color-success)]">تعمل</span>
        </div>
        <div className="flex flex-col gap-1 p-2 bg-[var(--color-bg-main)] rounded border border-[var(--color-border)] text-center">
          <span className="text-[10px] text-[var(--color-text-muted)]">الموظفون</span>
          <span className="font-bold text-[var(--color-text-main)]">56/60</span>
          <span className="text-[10px] text-[var(--color-primary-500)]">حاضر</span>
        </div>
        <div className="flex flex-col gap-1 p-2 bg-[var(--color-bg-main)] rounded border border-[var(--color-border)] text-center">
          <span className="text-[10px] text-[var(--color-text-muted)]">الإنتاج</span>
          <span className="font-bold text-[var(--color-text-main)]">78%</span>
          <div className="w-full bg-[var(--color-bg-card)] h-1 rounded mt-1"><div className="bg-[var(--color-primary-500)] h-1 rounded" style={{width: '78%'}}></div></div>
        </div>
        <div className="flex flex-col gap-1 p-2 bg-[var(--color-bg-main)] rounded border border-[var(--color-border)] text-center">
          <span className="text-[10px] text-[var(--color-text-muted)]">الطاقة</span>
          <span className="font-bold text-[var(--color-text-main)]">91%</span>
          <div className="w-full bg-[var(--color-bg-card)] h-1 rounded mt-1"><div className="bg-[var(--color-warning)] h-1 rounded" style={{width: '91%'}}></div></div>
        </div>
      </CardContent>
    </Card>
  );
};

function ActivityFeedIcon(props: any) {
  return <BarChart2 {...props} />;
}

// 9. Inventory Alerts (المواد الناقصة)
export const InventoryAlerts = () => {
  const alerts = [
    { name: 'أكريليك 3 ملم', count: 10, type: 'warning' },
    { name: 'PVC 5 ملم', count: 4, type: 'warning' },
    { name: 'MDF 18 ملم', count: 1, type: 'danger' },
  ];
  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] h-full">
      <CardHeader className="border-b border-[var(--color-border)] pb-4">
        <CardTitle className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Box className="w-4 h-4 text-[var(--color-text-main)]" />
          المواد الناقصة
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {alerts.map((a, i) => (
          <div key={i} className="flex justify-between items-center text-xs p-2 rounded bg-[var(--color-bg-main)] border border-[var(--color-border)]">
            <span className="font-bold text-[var(--color-text-main)]">{a.name}</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${a.type === 'danger' ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]'}`}>{a.count}</span>
              {a.type === 'danger' ? <AlertTriangle className="w-3 h-3 text-[var(--color-danger)] animate-pulse" /> : <AlertTriangle className="w-3 h-3 text-[var(--color-warning)]" />}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// 10. Today's Orders / Schedule
export const TodaySchedule = () => {
  const today = [
    { num: 'ORD-2401', progress: 80 },
    { num: 'ORD-2402', progress: 45 },
    { num: 'ORD-2403', progress: 20 },
  ];
  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] h-full">
      <CardHeader className="border-b border-[var(--color-border)] pb-4">
        <CardTitle className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[var(--color-text-main)]" />
          أوامر اليوم
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {today.map((o, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[var(--color-text-main)]">{o.num}</span>
              <span className="text-[var(--color-text-muted)] font-mono">{o.progress}%</span>
            </div>
            <div className="w-full bg-[var(--color-bg-main)] rounded-full h-1.5 border border-[var(--color-border)] overflow-hidden">
              <div className="bg-[var(--color-primary-500)] h-full rounded-full transition-all" style={{ width: `${o.progress}%` }}></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// We will keep EmployeeCards, BestCustomers, BestEmployees, FactoryMap, FinancialWidget, SystemSpeedWidget etc 
// below if they are still needed or we can swap them based on layout. Since Dashboard calls them, we must export them.

// 7. EmployeeCards
export const EmployeeCards = () => {
  const emps = [
    { name: 'محمد', status: 'working' },
    { name: 'يوسف', status: 'break' },
    { name: 'علي', status: 'vacation' },
  ];
  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] h-full">
      <CardHeader className="border-b border-[var(--color-border)] pb-4">
        <CardTitle className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--color-text-main)]" />
          الموظفون
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {emps.map((e, i) => (
          <div key={i} className="flex justify-between items-center text-xs p-2.5 rounded bg-[var(--color-bg-main)] border border-[var(--color-border)]">
            <span className="font-bold text-[var(--color-text-main)]">{e.name}</span>
            <div className="flex items-center gap-2">
              <Badge className={`border-0 ${
                e.status === 'working' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' :
                e.status === 'break' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' :
                'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
              }`}>
                {e.status === 'working' ? 'يعمل' : e.status === 'break' ? 'استراحة' : 'إجازة'}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// 8. BestCustomers
export const BestCustomers = () => {
  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] h-full">
      <CardHeader className="border-b border-[var(--color-border)] pb-4">
        <CardTitle className="text-sm font-bold text-[var(--color-text-main)]">أفضل العملاء</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Placeholder if user wants it later, but not explicitly in layout now */}
      </CardContent>
    </Card>
  );
};
export const BestEmployees = () => <div></div>;
export const FactoryMap = () => <div></div>;
export const SystemSpeedWidget = () => <div></div>;
export const FinancialWidget = () => <div></div>;
