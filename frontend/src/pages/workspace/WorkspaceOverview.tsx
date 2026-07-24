import React from 'react';
import { toast } from 'sonner';
import { 
  Layout, Clock, Activity, AlertTriangle, FileText, Settings, 
  CheckCircle2, Box, Users, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const WorkspaceOverview = () => {
  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] flex items-center gap-2">
            <Layout className="w-6 h-6 text-[var(--color-primary-500)]" />
            مساحة العمل المجمعة
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">نظرة سريعة على أهم الإشعارات، المهام، والطلبات الخاصة بك</p>
        </div>
        <Button className="gap-2 bg-[var(--color-primary-600)] text-white shadow-[0_0_15px_var(--color-primary-500)]/20" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
          <Plus className="w-4 h-4" /> تخصيص مساحة العمل
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Urgent Tasks */}
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] lg:col-span-2">
          <CardHeader className="border-b border-[var(--color-border)] pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" />
              المهام العاجلة
            </CardTitle>
            <Badge variant="warning">3 مهام</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--color-border)]">
              {[
                { title: 'تأكيد طلبية الأكريليك من المورد', time: 'منذ ساعتين', type: 'مخزون' },
                { title: 'صيانة وقائية لآلة الليزر', time: 'مستحق اليوم', type: 'صيانة' },
                { title: 'مراجعة تسعيرة الطلب ORD-2401', time: 'غداً', type: 'مبيعات' }
              ].map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 hover:bg-[var(--color-bg-hover)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-warning)]"></div>
                    <div>
                      <p className="font-bold text-[var(--color-text-main)] text-sm">{task.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{task.time}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{task.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardHeader className="border-b border-[var(--color-border)] pb-4">
            <CardTitle className="text-lg">الوصول السريع</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-[var(--color-border)] hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-500)]" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
              <FileText className="w-6 h-6" />
              <span>طلب جديد</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-[var(--color-border)] hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-500)]" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
              <Box className="w-6 h-6" />
              <span>جرد المخزون</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-[var(--color-border)] hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-500)]" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
              <Activity className="w-6 h-6" />
              <span>الإنتاج</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-[var(--color-border)] hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-500)]" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
              <Users className="w-6 h-6" />
              <span>العملاء</span>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] lg:col-span-3">
          <CardHeader className="border-b border-[var(--color-border)] pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--color-primary-500)]" />
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative border-r-2 border-[var(--color-border)] pr-6 space-y-8">
              {[
                { time: '10:45 ص', text: 'تم استلام الدفعة الأولى للطلب ORD-2401', user: 'أحمد محمود', icon: CheckCircle2, color: 'success' },
                { time: '09:30 ص', text: 'بدء إنتاج طلبية الدروع الزجاجية', user: 'خالد يوسف', icon: Activity, color: 'primary-500' },
                { time: '08:15 ص', text: 'تسجيل دخول للنظام', user: 'أنت', icon: Settings, color: 'text-muted' },
              ].map((log, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -right-[33px] p-1 bg-[var(--color-bg-card)] border-2 border-[var(--color-border)] rounded-full text-[var(--color-${log.color})]`}>
                    <log.icon className="w-4 h-4" />
                  </div>
                  <div className="bg-[var(--color-bg-main)]/50 rounded-lg p-4 border border-[var(--color-border)] hover:border-[var(--color-primary-500)]/30 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-[var(--color-text-main)] text-sm">{log.text}</p>
                      <span className="text-xs text-[var(--color-text-muted)] font-medium bg-[var(--color-bg-card)] px-2 py-0.5 rounded border border-[var(--color-border)]">
                        {log.time}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">بواسطة: {log.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
