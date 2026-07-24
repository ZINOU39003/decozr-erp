import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, XCircle, Clock, FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const mockApprovals = [
  { id: 'APP-001', type: 'DISCOUNT', requester: 'أحمد محمد', role: 'Sales', details: 'طلب خصم 15% للعميل "شركة الرؤية" على الطلب ORD-2026-101', amount: '15,000 د.ج', date: 'منذ ساعتين', status: 'pending', priority: 'high' },
  { id: 'APP-002', type: 'PURCHASE', requester: 'سارة أحمد', role: 'Warehouse', details: 'طلب شراء مواد خام (أكريليك شفاف 3مم) بكمية 50 لوح', amount: '125,000 د.ج', date: 'منذ 3 ساعات', status: 'pending', priority: 'medium' },
  { id: 'APP-003', type: 'LEAVE', requester: 'خالد عبد الله', role: 'Designer', details: 'طلب إجازة سنوية لمدة 5 أيام تبدأ من 2026-08-01', amount: '-', date: 'منذ 5 ساعات', status: 'pending', priority: 'low' },
  { id: 'APP-004', type: 'REFUND', requester: 'محمد علي', role: 'Support', details: 'طلب إرجاع مبلغ للعميل "مؤسسة الإبداع" بسبب عيب مصنعي', amount: '8,500 د.ج', date: 'أمس', status: 'approved', priority: 'high' },
];

export const ApprovalCenter = () => {
  const [approvals, setApprovals] = useState(mockApprovals);
  const [filter, setFilter] = useState('pending');

  const filteredApprovals = approvals.filter(a => filter === 'all' || a.status === filter);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
    if (action === 'approved') {
      toast.success('تمت الموافقة بنجاح');
    } else {
      toast.error('تم رفض الطلب');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[var(--color-primary-500)]" />
            مركز الموافقات (Approval Center)
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">إدارة الموافقات الإدارية والمالية من مكان واحد</p>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')} className={filter === 'pending' ? 'bg-[var(--color-primary-600)] text-white' : ''}>قيد الانتظار ({approvals.filter(a => a.status === 'pending').length})</Button>
          <Button variant={filter === 'approved' ? 'default' : 'outline'} onClick={() => setFilter('approved')} className={filter === 'approved' ? 'bg-[var(--color-success)] text-white' : ''}>تمت الموافقة</Button>
          <Button variant={filter === 'rejected' ? 'default' : 'outline'} onClick={() => setFilter('rejected')} className={filter === 'rejected' ? 'bg-[var(--color-danger)] text-white' : ''}>مرفوضة</Button>
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>الكل</Button>
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {filteredApprovals.map(approval => (
            <motion.div key={approval.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
              <Card className={`border-[var(--color-border)] bg-[var(--color-bg-card)] ${approval.status === 'pending' ? 'hover:border-[var(--color-primary-500)]/50' : ''} transition-colors`}>
                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
                  <div className="p-4 rounded-full bg-[var(--color-bg-main)] border border-[var(--color-border)] shrink-0">
                    {approval.type === 'DISCOUNT' ? <AlertTriangle className="w-8 h-8 text-[var(--color-warning)]" /> :
                     approval.type === 'PURCHASE' ? <FileText className="w-8 h-8 text-[var(--color-primary-500)]" /> :
                     approval.type === 'LEAVE' ? <Clock className="w-8 h-8 text-[var(--color-info)]" /> :
                     <ArrowRight className="w-8 h-8 text-[var(--color-danger)]" />}
                  </div>
                  
                  <div className="flex-1 space-y-2 text-center md:text-right">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="font-bold text-lg text-[var(--color-text-main)]">{approval.requester}</span>
                      <span className="text-xs px-2 py-1 bg-[var(--color-bg-main)] rounded text-[var(--color-text-muted)] border border-[var(--color-border)]">{approval.role}</span>
                      {approval.priority === 'high' && <span className="text-xs px-2 py-1 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded font-bold">عاجل</span>}
                    </div>
                    <p className="text-[var(--color-text-muted)]">{approval.details}</p>
                    <div className="flex gap-4 text-sm justify-center md:justify-start">
                      <span className="text-[var(--color-text-main)] font-mono font-bold bg-[var(--color-bg-main)] px-2 rounded">القيمة: {approval.amount}</span>
                      <span className="text-[var(--color-text-muted)] flex items-center gap-1"><Clock className="w-3 h-3"/> {approval.date}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col md:flex-row gap-2">
                    {approval.status === 'pending' ? (
                      <>
                        <Button className="bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-white gap-2" onClick={() => handleAction(approval.id, 'approved')}>
                          <CheckCircle2 className="w-4 h-4" /> موافقة
                        </Button>
                        <Button variant="outline" className="border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white gap-2" onClick={() => handleAction(approval.id, 'rejected')}>
                          <XCircle className="w-4 h-4" /> رفض
                        </Button>
                      </>
                    ) : (
                      <div className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${approval.status === 'approved' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'}`}>
                        {approval.status === 'approved' ? <><CheckCircle2 className="w-5 h-5"/> تمت الموافقة</> : <><XCircle className="w-5 h-5"/> مرفوض</>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredApprovals.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>لا توجد طلبات مطابقة للفلتر المحدد.</p>
          </div>
        )}
      </div>
    </div>
  );
};
