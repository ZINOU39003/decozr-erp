import React from 'react';
import { PackageSearch, AlertTriangle, ArrowRightLeft, Boxes, FileDown, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { getMaterials } from '../../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUIStore } from '../../store/uiStore';
export const InventoryDashboard = () => {
  const navigate = useNavigate();
  const { modal } = useUIStore();
  
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: getMaterials
  });
  
  const lowStockMaterials = materials.filter((m: any) => m.stock <= m.minStock).slice(0, 5);
  const totalValue = materials.reduce((acc: number, m: any) => acc + (m.stock * (m.unit_price || 1250)), 0);


  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] flex items-center gap-2">
            <Boxes className="w-6 h-6 text-[var(--color-primary-500)]" />
            لوحة تحكم المخزون
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">مراقبة شاملة لمستودع المواد الخام والقصاصات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[var(--color-border)] gap-2" onClick={() => toast.info('جاري فتح سجل حركات المخزون...')}>
            <ArrowRightLeft className="w-4 h-4" /> حركة مخزون
          </Button>
          <Button className="bg-[var(--color-primary-600)] text-white gap-2" onClick={() => modal.openModal('CREATE_MATERIAL')}>
            <Plus className="w-4 h-4" /> مادة جديدة
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary-500)]/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[var(--color-text-muted)] text-sm font-medium mb-2">إجمالي المواد</p>
                  <h3 className="text-3xl font-bold text-[var(--color-text-main)]">{materials.length}</h3>
                </div>
                <div className="p-3 bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] rounded-lg">
                  <Boxes className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-danger)]/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[var(--color-text-muted)] text-sm font-medium mb-2">تنبيهات النواقص</p>
                  <h3 className="text-3xl font-bold text-[var(--color-danger)]">{materials.filter(m => m.stock <= m.minStock).length}</h3>
                </div>
                <div className="p-3 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-success)]/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[var(--color-text-muted)] text-sm font-medium mb-2">قيمة المخزون المقدرة</p>
                  <h3 className="text-3xl font-bold text-[var(--color-text-main)]">{totalValue.toLocaleString()} <span className="text-sm font-normal text-[var(--color-text-muted)]">د.ج</span></h3>
                </div>
                <div className="p-3 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-lg">
                  <PackageSearch className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* Low Stock Alerts */}
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] xl:col-span-1">
          <CardHeader className="border-b border-[var(--color-border)]">
            <CardTitle className="text-lg flex items-center gap-2 text-[var(--color-danger)]">
              <AlertTriangle className="w-5 h-5" />
              مواد على وشك النفاذ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--color-border)]">
              {lowStockMaterials.map((m, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-[var(--color-bg-hover)] transition-colors">
                  <div>
                    <h4 className="font-bold text-[var(--color-text-main)] text-sm">{m.name}</h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">الحد الأدنى: {m.minStock} {m.unit}</p>
                  </div>
                  <div className="text-left">
                    <Badge variant="danger" className="font-bold">{m.stock} {m.unit}</Badge>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-[var(--color-primary-500)] mt-1 w-full block" onClick={() => navigate('/inventory/purchases')}>طلب شراء</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[var(--color-border)] text-center">
              <Button variant="ghost" className="text-sm text-[var(--color-text-muted)] w-full" onClick={() => navigate('/inventory/materials')}>عرض كل النواقص</Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-border)] pb-4">
            <CardTitle className="text-lg">آخر حركات المخزون</CardTitle>
            <Button variant="outline" size="sm" className="border-[var(--color-border)] gap-2" onClick={() => toast.success('جاري تصدير تقرير الحركات...')}>
              <FileDown className="w-4 h-4" /> تقرير الحركات
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-[var(--color-bg-main)]/50 text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                  <tr>
                    <th className="p-4 font-medium">المرجع</th>
                    <th className="p-4 font-medium">المادة</th>
                    <th className="p-4 font-medium">النوع</th>
                    <th className="p-4 font-medium">الكمية</th>
                    <th className="p-4 font-medium">التاريخ</th>
                    <th className="p-4 font-medium">بواسطة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {[1,2,3,4,5].map((_, i) => (
                    <tr key={i} className="hover:bg-[var(--color-bg-hover)] transition-colors">
                      <td className="p-4 font-mono text-[var(--color-text-muted)]">TRX-{202400+i}</td>
                      <td className="p-4 font-medium text-[var(--color-text-main)]">{materials[i]?.name}</td>
                      <td className="p-4">
                        <Badge variant={i%2===0 ? 'success' : 'warning'}>{i%2===0 ? 'إدخال' : 'صرف'}</Badge>
                      </td>
                      <td className={`p-4 font-bold ${i%2===0 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                        {i%2===0 ? '+' : '-'}{Math.floor(Math.random()*50)+10}
                      </td>
                      <td className="p-4 text-[var(--color-text-muted)]">اليوم, 10:{20+i} ص</td>
                      <td className="p-4 text-[var(--color-text-main)]">أحمد محمد</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
