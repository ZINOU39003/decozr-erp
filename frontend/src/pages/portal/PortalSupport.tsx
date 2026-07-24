import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { mockPortalTickets } from '../../data/mockDatabase';
import { Search, Plus, LifeBuoy, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PortalSupport = () => {
  const customerId = 'CUST-0001';
  
  const [tickets] = useState(() => mockPortalTickets.filter((t: any) => t.customer_id === customerId));
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTicket, setActiveTicket] = useState<string | null>(null);

  const filteredTickets = tickets.filter((t: any) => t.subject.includes(searchTerm) || t.id.includes(searchTerm));
  const selectedTicket = tickets.find((t: any) => t.id === activeTicket);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-main)]">تذاكر الدعم الفني</h1>
          <p className="text-sm text-[var(--color-text-muted)]">تواصل مع فريق الدعم لحل المشاكل والاستفسارات.</p>
        </div>
        <Button className="bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] shadow-lg shadow-[var(--color-primary-500)]/20" onClick={() => toast.info('سيتم فتح نموذج الدعم')}>
          <Plus className="w-4 h-4 mr-2" />
          تذكرة جديدة
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {!activeTicket ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
              <CardContent className="p-0">
                <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-main)]/50">
                  <div className="relative w-full max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      type="text" 
                      placeholder="ابحث برقم التذكرة أو الموضوع..." 
                      className="w-full h-10 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--color-primary-500)] transition-colors"
                    />
                  </div>
                </div>
                
                <div className="divide-y divide-[var(--color-border)]">
                  {filteredTickets.map((t: any) => (
                    <div 
                      key={t.id} 
                      onClick={() => setActiveTicket(t.id)}
                      className="p-4 hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] flex items-center justify-center shrink-0">
                          <LifeBuoy className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--color-text-main)]">{t.subject}</h3>
                          <p className="text-sm text-[var(--color-text-muted)] mt-1 flex items-center gap-2">
                            <span className="font-mono">{t.id}</span>
                            <span>•</span>
                            آخر تحديث: {new Date(t.last_reply).toLocaleDateString('ar-DZ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`border-0 ${
                          t.priority === 'قصوى' ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]' :
                          t.priority === 'عاجلة' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' :
                          'bg-[var(--color-info)]/10 text-[var(--color-info)]'
                        }`}>
                          {t.priority}
                        </Badge>
                        <Badge className={`border-0 ${
                          t.status === 'مغلقة' ? 'bg-[var(--color-text-muted)]/10 text-[var(--color-text-muted)]' :
                          t.status === 'قيد المعالجة' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' :
                          'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                        }`}>
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {filteredTickets.length === 0 && (
                    <div className="p-12 text-center text-[var(--color-text-muted)]">
                      لا توجد تذاكر مطابقة لبحثك.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="details" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] min-h-[600px] flex flex-col">
              <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-main)]/50 flex items-center gap-4">
                <Button variant="ghost" className="p-2 text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]" onClick={() => setActiveTicket(null)}>
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <div>
                  <h2 className="font-bold text-[var(--color-text-main)]">{selectedTicket?.subject}</h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">تذكرة رقم {selectedTicket?.id}</p>
                </div>
                <div className="mr-auto flex gap-2">
                  <Badge className="bg-[var(--color-text-muted)]/10 text-[var(--color-text-muted)] border-0">إغلاق التذكرة</Badge>
                </div>
              </div>
              
              <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Initial Message */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary-500)] text-white flex items-center justify-center font-bold">
                    أ
                  </div>
                  <div className="flex-1 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-2xl rounded-tr-none p-4">
                    <p className="text-sm text-[var(--color-text-main)] leading-relaxed">مرحباً، أواجه مشكلة في الطلب الخاص بي وأحتاج للمساعدة في التعديل على التصميم قبل بدء الإنتاج.</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-2">{new Date(selectedTicket!.created_at).toLocaleDateString('ar-DZ')} {new Date(selectedTicket!.created_at).toLocaleTimeString('ar-DZ')}</p>
                  </div>
                </div>
                
                {/* Reply */}
                {selectedTicket?.status !== 'مفتوحة' && (
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-indigo-500)] text-white flex items-center justify-center font-bold shadow-md">
                      DZ
                    </div>
                    <div className="flex-1 bg-[var(--color-primary-500)] text-white rounded-2xl rounded-tl-none p-4">
                      <p className="text-sm leading-relaxed">أهلاً بك، تم إيقاف عملية الإنتاج مؤقتاً لتعديل التصميم. يرجى إرفاق التعديلات المطلوبة أو سنقوم بالتواصل معك قريباً.</p>
                      <p className="text-[10px] text-white/70 mt-2">{new Date(selectedTicket!.last_reply).toLocaleDateString('ar-DZ')} {new Date(selectedTicket!.last_reply).toLocaleTimeString('ar-DZ')}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedTicket?.status !== 'مغلقة' && (
                <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-main)] flex gap-2">
                  <textarea 
                    placeholder="اكتب ردك هنا..." 
                    className="flex-1 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)] transition-colors resize-none h-14"
                  />
                  <Button className="h-14 px-6 rounded-xl bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)]" onClick={() => toast.success('تم إرسال الرد بنجاح')}>
                    إرسال
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
