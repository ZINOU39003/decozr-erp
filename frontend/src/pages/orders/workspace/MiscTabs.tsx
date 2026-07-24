import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  File, FileArchive, Download, Send, UploadCloud, Printer, CheckCircle2, Circle, MessageSquare
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';

// --- FINANCE TAB ---
export const FinanceTab = ({ order }: { order: any }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
    <div className="lg:col-span-2 space-y-6">
      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <CardHeader>
          <CardTitle>المالية (Invoices, Payments, Profit)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] text-center">
              <p className="text-sm text-[var(--color-text-muted)] mb-1">الإجمالي</p>
              <p className="text-2xl font-bold">{(order.revenue || 0).toLocaleString()} د.ج</p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 text-center">
              <p className="text-sm text-[var(--color-text-muted)] mb-1">المدفوع</p>
              <p className="text-2xl font-bold text-[var(--color-success)]">{(order.paid || 0).toLocaleString()} د.ج</p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 text-center">
              <p className="text-sm text-[var(--color-text-muted)] mb-1">المتبقي</p>
              <p className="text-2xl font-bold text-[var(--color-warning)]">{(order.remaining || 0).toLocaleString()} د.ج</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button className="flex-1 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] text-white shadow-[0_0_15px_var(--color-primary-500)]/20" onClick={() => toast.info('إضافة دفعة جديدة')}>
              إضافة دفعة
            </Button>
            <Button variant="outline" className="flex-1 border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]" onClick={() => toast.success('جاري إنشاء الفاتورة...')}>
              إنشاء فاتورة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// --- FILES TAB ---
export const FilesTab = ({ order }: { order: any }) => (
  <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] animate-fade-in">
    <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--color-border)] pb-4">
      <CardTitle>الملفات (Images, PDF, AI, DXF)</CardTitle>
      <Button className="gap-2 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] text-white shadow-lg" onClick={() => toast.info('اختر ملفاً للرفع')}>
        <UploadCloud className="w-4 h-4" /> رفع ملف
      </Button>
    </CardHeader>
    <CardContent className="pt-6 space-y-4">
      {order.files?.map((f: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-main)] hover:bg-[var(--color-bg-hover)] transition-colors">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${idx === 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              {idx === 0 ? <File className="w-6 h-6" /> : <FileArchive className="w-6 h-6" />}
            </div>
            <div>
              <h4 className={`font-bold ${idx === 1 ? 'text-emerald-500' : 'text-[var(--color-text-main)]'}`}>{f.name}</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">بواسطة {f.uploader} • {f.size}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]" onClick={() => toast.info(`معاينة ${f.name}`)}>معاينة</Button>
            <Button variant="outline" size="sm" className="border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]" onClick={() => toast.success(`جاري تحميل ${f.name}...`)}><Download className="w-4 h-4" /></Button>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

// --- TASKS TAB ---
export const TasksTab = ({ order }: { order: any }) => {
  const [tasks, setTasks] = useState(order.tasks || []);

  const toggleTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] max-w-2xl animate-fade-in">
      <CardHeader>
        <CardTitle>قائمة المهام (Checklist)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((t: any, i: number) => (
            <div 
              key={i} 
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${t.completed ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]/30' : 'bg-[var(--color-bg-main)] border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'}`}
              onClick={() => toggleTask(i)}
            >
              {t.completed ? <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" /> : <Circle className="w-5 h-5 text-[var(--color-text-muted)]" />}
              <span className={`flex-1 font-medium ${t.completed ? 'text-[var(--color-success)] line-through opacity-70' : 'text-[var(--color-text-main)]'}`}>{t.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// --- TIMELINE TAB ---
export const TimelineTab = ({ order }: { order: any }) => (
  <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] max-w-3xl animate-fade-in">
    <CardHeader>
      <CardTitle>السجل الزمني (Timeline & History)</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="relative border-r-2 border-[var(--color-border)] pr-6 space-y-8 mt-4">
        {order.timeline?.map((t: any, i: number) => (
          <div key={i} className="relative">
            <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-[var(--color-primary-500)] border-4 border-[var(--color-bg-card)] shadow-[0_0_0_2px_var(--color-primary-500)]"></div>
            <div>
              <span className="text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-bg-main)] px-2 py-1 rounded border border-[var(--color-border)] mb-2 inline-block">اليوم {t.time}</span>
              <p className="text-[var(--color-text-main)] font-medium bg-[var(--color-bg-main)]/50 p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
                {t.event}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// --- CHAT TAB ---
export const ChatTab = ({ order }: { order: any }) => (
  <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] h-[600px] flex flex-col animate-fade-in">
    <CardHeader className="border-b border-[var(--color-border)]">
      <CardTitle className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[var(--color-primary-500)]" />
        محادثة الطلب
      </CardTitle>
    </CardHeader>
    <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-[var(--color-bg-main)]/30">
      {order.chat?.map((msg: any, i: number) => (
        <div key={i} className={`flex flex-col gap-1 ${msg.type === 'system' ? 'items-center my-6' : 'items-start'}`}>
          {msg.type === 'system' ? (
            <Badge variant="outline" className="bg-[var(--color-bg-main)] text-[var(--color-text-muted)] border-[var(--color-border)]">
              {msg.time} - {msg.text}
            </Badge>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-[var(--color-primary-500)]/20 text-[var(--color-primary-400)] flex items-center justify-center text-xs font-bold border border-[var(--color-primary-500)]/30">
                  {msg.sender.charAt(0)}
                </div>
                <span className="text-sm font-bold">{msg.sender}</span>
                <span className="text-xs text-[var(--color-text-muted)] mr-2">{msg.time}</span>
              </div>
              <div className="bg-[var(--color-bg-main)] border border-[var(--color-border)] p-4 rounded-xl rounded-tr-none text-sm text-[var(--color-text-main)] max-w-[80%] shadow-sm">
                {msg.text}
              </div>
            </>
          )}
        </div>
      ))}
    </CardContent>
    <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-card)] mt-auto">
      <div className="flex gap-2">
        <Input placeholder="اكتب رسالة أو ملاحظة (@لذكر شخص)..." className="bg-[var(--color-bg-main)] border-[var(--color-border)] h-12" />
        <Button className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] text-white px-6 h-12 shadow-lg shadow-[var(--color-primary-500)]/20" onClick={() => toast.success('تم إرسال الرسالة')}>
          <Send className="w-5 h-5 rtl:-scale-x-100" />
        </Button>
      </div>
    </div>
  </Card>
);
