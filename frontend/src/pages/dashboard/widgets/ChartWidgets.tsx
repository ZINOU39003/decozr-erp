import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { mockOrders as orders, mockMachines as machines, mockCustomers as customers, mockInvoices as invoices } from '../../../data/mockDatabase';

// Process data for charts
const last6Months = Array.from({ length: 6 }).map((_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - (5 - i));
  return d;
});

const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const revenueData = last6Months.map(date => {
  const m = date.getMonth();
  const y = date.getFullYear();
  const monthOrders = orders.filter(o => {
    const od = new Date(o.date);
    return od.getMonth() === m && od.getFullYear() === y;
  });
  return {
    name: monthNames[m],
    revenue: monthOrders.reduce((sum, o) => sum + o.revenue, 0),
    profit: monthOrders.reduce((sum, o) => sum + o.profit, 0),
    expenses: monthOrders.reduce((sum, o) => sum + o.cost, 0),
    count: monthOrders.length
  };
});

const machineStatusData = [
  { name: 'تعمل', value: machines.filter(m => m.status === 'running').length, color: 'var(--color-success)' },
  { name: 'متوقفة', value: machines.filter(m => m.status === 'stopped').length, color: 'var(--color-danger)' },
  { name: 'صيانة', value: machines.filter(m => m.status === 'maintenance').length, color: 'var(--color-warning)' },
  { name: 'خاملة', value: machines.filter(m => m.status === 'idle').length, color: 'var(--color-text-muted)' },
].filter(d => d.value > 0);

const customerTypesData = [
  { name: 'شركات', value: customers.filter(c => c.type === 'شركة').length, color: 'var(--color-primary-500)' },
  { name: 'أفراد', value: customers.filter(c => c.type === 'فرد').length, color: 'var(--color-indigo-400)' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-bg-sidebar)] border border-[var(--color-border)] p-3 rounded-lg shadow-xl">
        <p className="font-bold text-[var(--color-text-main)] mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-semibold">
            {entry.name}: {entry.value.toLocaleString()} {entry.name.includes('إيرادات') || entry.name.includes('أرباح') ? 'د.ج' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ChartsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      
      {/* 1. Revenue Line Chart */}
      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <CardHeader className="border-b border-[var(--color-border)] pb-4">
          <CardTitle className="text-sm font-bold text-[var(--color-text-main)]">الإيرادات (آخر 6 أشهر)</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} tickFormatter={(val) => `${val/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" name="الإيرادات" stroke="var(--color-primary-500)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-primary-500)' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 2. Orders Bar Chart */}
      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <CardHeader className="border-b border-[var(--color-border)] pb-4">
          <CardTitle className="text-sm font-bold text-[var(--color-text-main)]">عدد الطلبات المنجزة</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-bg-hover)' }} />
              <Bar dataKey="count" name="عدد الطلبات" fill="var(--color-indigo-500)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. Production Area Chart */}
      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <CardHeader className="border-b border-[var(--color-border)] pb-4">
          <CardTitle className="text-sm font-bold text-[var(--color-text-main)]">الإنتاج والأرباح</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} tickFormatter={(val) => `${val/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="profit" name="الأرباح" stroke="var(--color-success)" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 4. Machine Status Donut Chart */}
      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <CardHeader className="border-b border-[var(--color-border)] pb-4">
          <CardTitle className="text-sm font-bold text-[var(--color-text-main)]">حالة الآلات</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={machineStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {machineStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-muted)' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 5. Expenses Stacked Bar */}
      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <CardHeader className="border-b border-[var(--color-border)] pb-4">
          <CardTitle className="text-sm font-bold text-[var(--color-text-main)]">تحليل المصروفات والإيرادات</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} tickFormatter={(val) => `${val/1000}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-bg-hover)' }} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="expenses" name="المصروفات" stackId="a" fill="var(--color-danger)" radius={[0, 0, 4, 4]} />
              <Bar dataKey="profit" name="الأرباح" stackId="a" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 6. Customers Pie Chart */}
      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <CardHeader className="border-b border-[var(--color-border)] pb-4">
          <CardTitle className="text-sm font-bold text-[var(--color-text-main)]">تصنيف العملاء</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={customerTypesData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {customerTypesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
};
