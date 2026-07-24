import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockOrders, mockDesigns } from '../../data/mockDatabase';
import { Activity, Clock, PackageCheck, Eye, Search, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const PortalProduction = () => {
  const customerId = 'CUST-0001';
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');

  const activeOrders = mockOrders.filter(o => 
    o.customer_id === customerId && 
    !['مستلم', 'منتهي', 'ملغى'].includes(o.status)
  ).map(o => ({
    ...o,
    designName: mockDesigns.find(d => d.id === o.design_id)?.name || 'تصميم مخصص'
  }));

  const filteredOrders = activeOrders.filter(o => 
    o.id.includes(searchTerm) || o.designName.includes(searchTerm) || o.status.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'قيد التصميم': return 'text-[var(--color-indigo-500)] border-[var(--color-indigo-500)] bg-[var(--color-indigo-500)]/10';
      case 'جاهز للقص': return 'text-[var(--color-warning)] border-[var(--color-warning)] bg-[var(--color-warning)]/10';
      case 'قيد القص': return 'text-[var(--color-warning)] border-[var(--color-warning)] bg-[var(--color-warning)]/20';
      case 'قيد التجميع': return 'text-[var(--color-blue-500)] border-[var(--color-blue-500)] bg-[var(--color-blue-500)]/10';
      case 'جاهز للتسليم': return 'text-[var(--color-success)] border-[var(--color-success)] bg-[var(--color-success)]/10';
      default: return 'text-[var(--color-text-muted)] border-[var(--color-border)] bg-[var(--color-bg-main)]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-main)]">تتبع الإنتاج</h1>
          <p className="text-sm text-[var(--color-text-muted)]">متابعة حية لمراحل تصنيع طلباتك النشطة.</p>
        </div>
      </div>

      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <CardContent className="p-6">
          <div className="relative w-full max-w-md mb-8">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text" 
              placeholder="ابحث عن طلب قيد الإنتاج..." 
              className="w-full h-10 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-xl pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--color-primary-500)] transition-colors"
            />
          </div>

          <div className="space-y-6">
            <AnimatePresence>
              {filteredOrders.map(order => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={order.id} 
                  className="border border-[var(--color-border)] rounded-2xl p-6 bg-[var(--color-bg-main)] hover:border-[var(--color-primary-500)] transition-colors group"
                >
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-[var(--color-text-main)]">الطلب {order.id}</h3>
                        <Badge className={`border ${getStatusColor(order.status)}`}>{order.status}</Badge>
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)]">{order.designName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-[var(--color-border)] text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]" onClick={() => navigate(`/portal/orders/${order.id}`)}>
                        <Eye className="w-4 h-4 ml-2" /> عرض التفاصيل
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative mb-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-bold text-[var(--color-text-main)]">نسبة الإنجاز</span>
                      <span className="text-sm font-bold text-[var(--color-primary-500)]">{order.progress || 25}%</span>
                    </div>
                    <div className="w-full h-3 bg-[var(--color-bg-card)] rounded-full overflow-hidden border border-[var(--color-border)]">
                      <div 
                        className="h-full bg-gradient-to-l from-[var(--color-primary-400)] to-[var(--color-primary-600)] relative"
                        style={{ width: `${order.progress || 25}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Stages */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {['التصميم', 'القص', 'التجميع', 'التغليف', 'التسليم'].map((stage, idx) => {
                      const stageThreshold = (idx + 1) * 20;
                      const isCompleted = (order.progress || 0) >= stageThreshold;
                      const isCurrent = (order.progress || 0) > (idx * 20) && (order.progress || 0) < stageThreshold;
                      
                      return (
                        <div key={idx} className={`p-4 rounded-xl border ${
                          isCompleted ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]/20' :
                          isCurrent ? 'bg-[var(--color-primary-500)]/10 border-[var(--color-primary-500)]' :
                          'bg-[var(--color-bg-card)] border-[var(--color-border)] opacity-50'
                        } flex flex-col items-center justify-center text-center gap-2 transition-all`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-[var(--color-success)]" />
                          ) : isCurrent ? (
                            <Activity className="w-6 h-6 text-[var(--color-primary-500)] animate-pulse" />
                          ) : (
                            <Clock className="w-6 h-6 text-[var(--color-text-muted)]" />
                          )}
                          <span className={`text-xs font-bold ${
                            isCompleted ? 'text-[var(--color-success)]' :
                            isCurrent ? 'text-[var(--color-primary-500)]' :
                            'text-[var(--color-text-muted)]'
                          }`}>{stage}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredOrders.length === 0 && (
              <div className="py-12 text-center text-[var(--color-text-muted)] bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border)] flex flex-col items-center justify-center">
                <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-bold">لا توجد طلبات قيد الإنتاج حالياً.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


