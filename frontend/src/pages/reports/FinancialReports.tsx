import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, BarChart3, TrendingUp, Layers, 
  Download, Filter, ArrowDownRight, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const mockChartData = [
  { name: 'يناير', revenue: 400000, material_cost: 150000, labor_cost: 80000, profit: 170000 },
  { name: 'فبراير', revenue: 300000, material_cost: 139800, labor_cost: 70000, profit: 90200 },
  { name: 'مارس', revenue: 500000, material_cost: 180000, labor_cost: 95000, profit: 225000 },
  { name: 'أبريل', revenue: 450000, material_cost: 160000, labor_cost: 85000, profit: 205000 },
  { name: 'مايو', revenue: 600000, material_cost: 200000, labor_cost: 100000, profit: 300000 },
  { name: 'يونيو', revenue: 550000, material_cost: 190000, labor_cost: 90000, profit: 270000 },
];

const mockOrders = [
  { id: '1', order_number: 'ORD-2026-101', date: '2026-06-15', revenue: 150000, material_cost: 45000, labor_cost: 20000, profit: 85000, margin: 56.6 },
  { id: '2', order_number: 'ORD-2026-102', date: '2026-06-18', revenue: 85000, material_cost: 30000, labor_cost: 15000, profit: 40000, margin: 47.0 },
  { id: '3', order_number: 'ORD-2026-103', date: '2026-06-20', revenue: 320000, material_cost: 110000, labor_cost: 60000, profit: 150000, margin: 46.8 },
  { id: '4', order_number: 'ORD-2026-104', date: '2026-06-25', revenue: 45000, material_cost: 12000, labor_cost: 8000, profit: 25000, margin: 55.5 },
];

export const FinancialReports = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-[var(--color-text-muted)] animate-pulse">جاري إعداد التقرير المالي...</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)]">التقارير المالية والأرباح</h1>
          <p className="text-[var(--color-text-muted)] mt-1">نظرة شاملة على الإيرادات، التكاليف، وهوامش الربح الحقيقية.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-[var(--color-border)] text-[var(--color-text-muted)] gap-2" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
            <Filter className="w-4 h-4" /> فلاتر متقدمة
          </Button>
          <Button variant="outline" className="gap-2 border-[var(--color-border)]" onClick={() => toast.success('جاري تصدير التقرير كملف Excel...')}>
            <FileText className="w-4 h-4" /> تصدير Excel
          </Button>
          <Button className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] text-white border-0 gap-2" onClick={() => toast.success('تم تصدير التقرير كملف PDF بنجاح')}>
            <Download className="w-4 h-4" /> تصدير PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary-500)]/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] rounded-xl">
                  <DollarSign size={24} />
                </div>
                <Badge variant="outline" className="bg-[var(--color-success)]/10 text-[var(--color-success)] border-0 flex items-center gap-1 font-bold">
                  <TrendingUp className="w-3 h-3" /> +12.5%
                </Badge>
              </div>
              <p className="text-[var(--color-text-muted)] text-sm font-semibold mb-1">إجمالي الإيرادات (المبيعات)</p>
              <h3 className="text-3xl font-bold text-[var(--color-text-main)]">2,800,000 <span className="text-sm font-normal text-[var(--color-text-muted)]">د.ج</span></h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-danger)]/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl">
                  <Layers size={24} />
                </div>
                <Badge variant="outline" className="bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-0 flex items-center gap-1 font-bold">
                  <TrendingUp className="w-3 h-3" /> +5.2%
                </Badge>
              </div>
              <p className="text-[var(--color-text-muted)] text-sm font-semibold mb-1">تكلفة المواد والآلات (BOM)</p>
              <h3 className="text-3xl font-bold text-[var(--color-danger)]">-1,190,000 <span className="text-sm font-normal opacity-70">د.ج</span></h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-success)]/30 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-xl">
                  <BarChart3 size={24} />
                </div>
              </div>
              <p className="text-[var(--color-text-muted)] text-sm font-semibold mb-1">صافي الربح الحقيقي</p>
              <h3 className="text-3xl font-bold text-[var(--color-success)]">1,610,000 <span className="text-sm font-normal opacity-70">د.ج</span></h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary-500)]/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[var(--color-warning)]/10 text-[var(--color-warning)] rounded-xl">
                  <TrendingUp size={24} />
                </div>
              </div>
              <p className="text-[var(--color-text-muted)] text-sm font-semibold mb-1">متوسط هامش الربح</p>
              <h3 className="text-3xl font-bold text-[var(--color-text-main)]">57.5%</h3>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardHeader>
            <CardTitle className="text-lg">الإيرادات مقابل صافي الربح (6 أشهر)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-sidebar)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-text-main)' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="var(--color-primary-500)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" name="صافي الربح" stroke="var(--color-success)" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardHeader>
            <CardTitle className="text-lg">تحليل التكاليف (المواد vs الآلات/العمالة)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-sidebar)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-text-main)' }}
                    cursor={{ fill: 'var(--color-bg-hover)' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="material_cost" name="تكلفة المواد" stackId="a" fill="var(--color-danger)" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="labor_cost" name="تكلفة التشغيل" stackId="a" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Profit Table */}
      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-main)]/50">
          <h2 className="text-lg font-bold text-[var(--color-text-main)]">تفاصيل أرباح الطلبات المسلمة حديثاً</h2>
          <Button variant="outline" size="sm" className="h-8 text-xs border-[var(--color-border)]" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>عرض الكل</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[var(--color-bg-main)]/30 border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[var(--color-text-muted)] text-sm">رقم الطلب</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-text-muted)] text-sm">تاريخ التسليم</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-text-muted)] text-sm text-left">قيمة الطلب</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-text-muted)] text-sm text-left">التكاليف</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-text-muted)] text-sm text-left">صافي الربح</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-text-muted)] text-sm text-left">الهامش</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {mockOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[var(--color-bg-hover)] transition-colors group cursor-pointer">
                  <td className="px-6 py-4 font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary-400)] transition-colors">{order.order_number}</td>
                  <td className="px-6 py-4 text-[var(--color-text-muted)] text-sm">
                    {new Date(order.date).toLocaleDateString('ar-DZ')}
                  </td>
                  <td className="px-6 py-4 font-bold text-[var(--color-text-main)] text-left">
                    {order.revenue.toLocaleString()} د.ج
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="text-[var(--color-danger)] text-sm font-semibold flex items-center justify-end gap-1">
                      <ArrowDownRight className="w-3 h-3" />
                      {(order.material_cost + order.labor_cost).toLocaleString()} د.ج
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[var(--color-success)] text-left text-lg">
                    {order.profit.toLocaleString()} د.ج
                  </td>
                  <td className="px-6 py-4 text-left">
                    <Badge variant="outline" className="bg-[var(--color-success)]/10 text-[var(--color-success)] border-0">
                      {order.margin}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
