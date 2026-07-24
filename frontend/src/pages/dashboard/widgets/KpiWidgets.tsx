import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Clock, Factory, AlertTriangle, Users, 
  FileText, Box, Activity, CheckCircle, Plus
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { mockOrders as orders, mockInvoices as invoices, mockMachines as machines, mockEmployees as employees, mockMaterials as materials } from '../../../data/mockDatabase';
import { useNavigate } from 'react-router-dom';

// Utility for CountUp animation
const CountUp = ({ end, suffix = '', prefix = '' }: { end: number, suffix?: string, prefix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Small Sparkline Component — stable data (Math.random every render freezes the page)
const Sparkline = ({ color }: { color: string }) => {
  const data = useMemo(
    () => Array.from({ length: 10 }).map((_, i) => ({ value: 30 + ((i * 17) % 70) })),
    [],
  );
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const KpiGrid = () => {
  // Compute real stats from dataset
  const todayRevenue = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).reduce((sum, o) => sum + o.revenue, 0) || 45000;
  const monthRevenue = orders.filter(o => new Date(o.date).getMonth() === new Date().getMonth()).reduce((sum, o) => sum + o.revenue, 0) || 1200000;
  const monthProfit = orders.filter(o => new Date(o.date).getMonth() === new Date().getMonth()).reduce((sum, o) => sum + o.profit, 0) || 600000;
  
  const newOrders = orders.filter(o => o.status === 'received').length;
  const inProgressOrders = orders.filter(o => ['in_design', 'in_cutting', 'in_assembly'].includes(o.status)).length;
  const delayedOrders = orders.filter(o => o.isDelayed).length;
  
  const runningMachines = machines.filter(m => m.status === 'running').length;
  const stoppedMachines = machines.filter(m => m.status !== 'running').length;
  
  const presentEmployees = employees.filter(e => e.status !== 'absent').length;
  const unpaidInvoices = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').length;
  const lowStock = materials.filter(m => m.stock <= m.minStock).length;

  const navigate = useNavigate();

  const kpis = [
    { title: 'الإيرادات (اليوم)', value: todayRevenue, suffix: ' د.ج', icon: DollarSign, color: 'var(--color-primary-500)', trend: '+12%', bg: 'bg-[var(--color-primary-500)]/10', link: '/reports' },
    { title: 'الإيرادات (الشهر)', value: monthRevenue, suffix: ' د.ج', icon: TrendingUp, color: 'var(--color-success)', trend: '+5%', bg: 'bg-[var(--color-success)]/10', link: '/reports' },
    { title: 'الربح الصافي', value: monthProfit, suffix: ' د.ج', icon: Activity, color: 'var(--color-emerald-500)', trend: '+8%', bg: 'bg-[var(--color-emerald-500)]/10', link: '/reports' },
    { title: 'طلبات جديدة', value: newOrders, icon: ShoppingCart, color: 'var(--color-info)', trend: '+2', bg: 'bg-[var(--color-info)]/10', link: '/orders' },
    { title: 'قيد التنفيذ', value: inProgressOrders, icon: Factory, color: 'var(--color-warning)', trend: '-1', bg: 'bg-[var(--color-warning)]/10', link: '/production' },
    { title: 'طلبات متأخرة', value: delayedOrders, icon: Clock, color: 'var(--color-danger)', trend: '+3', bg: 'bg-[var(--color-danger)]/10', link: '/orders' },
    { title: 'آلات تعمل', value: runningMachines, suffix: `/${machines.length}`, icon: CheckCircle, color: 'var(--color-success)', trend: '92% OEE', bg: 'bg-[var(--color-success)]/10', link: '/machines' },
    { title: 'آلات متوقفة', value: stoppedMachines, icon: AlertTriangle, color: 'var(--color-danger)', trend: '-1', bg: 'bg-[var(--color-danger)]/10', link: '/machines' },
    { title: 'حضور الموظفين', value: presentEmployees, suffix: `/${employees.length}`, icon: Users, color: 'var(--color-primary-400)', trend: '95%', bg: 'bg-[var(--color-primary-500)]/10', link: '/employees' },
    { title: 'فواتير غير محصلة', value: unpaidInvoices, icon: FileText, color: 'var(--color-orange-500)', trend: '15 فاتورة', bg: 'bg-[var(--color-orange-500)]/10', link: '/invoices' },
    { title: 'مخزون منخفض', value: lowStock, icon: Box, color: 'var(--color-amber-500)', trend: '4 مواد', bg: 'bg-[var(--color-amber-500)]/10', link: '/inventory' },
    { title: 'نسبة الإنتاج', value: 85, suffix: '%', icon: Activity, color: 'var(--color-indigo-500)', trend: '+2%', bg: 'bg-[var(--color-indigo-500)]/10', link: '/production' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="h-full"
          onClick={() => navigate(kpi.link)}
        >
          <Card className="h-full border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary-500)]/50 transition-all cursor-pointer overflow-hidden relative group">
            <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-20 transition-transform group-hover:scale-150 ${kpi.bg}`} />
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
                <div className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-[var(--color-bg-main)] text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)] transition-colors">
                  {kpi.trend}
                </div>
              </div>
              
              <div className="mt-3">
                <h4 className="text-[10px] text-[var(--color-text-muted)] font-semibold mb-1">{kpi.title}</h4>
                <div className="text-xl font-bold text-[var(--color-text-main)] flex items-baseline gap-1">
                  <CountUp end={kpi.value} />
                  {kpi.suffix && <span className="text-[10px] text-[var(--color-text-muted)] font-normal">{kpi.suffix}</span>}
                </div>
              </div>
              
              <div className="mt-2 flex justify-between items-end opacity-50 group-hover:opacity-100 transition-opacity">
                <Sparkline color={kpi.color} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
