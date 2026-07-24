import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package, Clock, ArrowRight, CheckCircle2, Printer, Save, Download, MessageSquare, Send, Sparkles,
} from 'lucide-react';
import {
  getOrderWorkspace,
  getOrderById,
  changeOrderStatus,
  finishOrderDesign,
  getOrderMessages,
  postOrderMessage,
  getOrderTimeline,
} from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Input } from '../../components/ui/Input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStatusConfig } from './OrdersList';
import { ActivityTimeline } from '../../components/shared/ActivityTimeline';
import { usePermission } from '../../lib/permissions';

import { OverviewTab } from './workspace/OverviewTab';
import { ProductionTab } from './workspace/ProductionTab';
import {
  ItemsTab, MaterialsTab, MachinesTab, EmployeesTab, NotesTab, FinanceTab, FilesTab, TasksTab,
} from './workspace/PlaceholderTabs';

const WORKFLOW_STAGES = [
  'received',
  'pending_review',
  'pending_approval',
  'in_design',
  'design_ready',
  'in_cutting',
  'in_printing',
  'in_assembly',
  'ready',
  'delivered',
] as const;

const STAGE_LABELS: Record<string, string> = {
  received: 'استلام',
  pending_review: 'مراجعة',
  pending_approval: 'موافقة',
  in_design: 'تصميم',
  design_ready: 'تصميم جاهز',
  in_cutting: 'قص',
  in_printing: 'طباعة',
  in_assembly: 'تجميع',
  ready: 'جاهز',
  delivered: 'تسليم',
};

const unwrap = (raw: any) => (raw?.data !== undefined && !Array.isArray(raw) && typeof raw.data === 'object' && !raw.order ? raw.data : raw);

export const OrderWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState('');
  const { hasPermission } = usePermission();
  const canFinishDesign = hasPermission('finish_design');
  const canDispatch = hasPermission('dispatch_production');
  const canEditStatus = hasPermission('edit_orders') || canDispatch;
  // Designer must not jump stages to cutting/printing themselves
  const isDesignerOnly = canFinishDesign && !canDispatch && !hasPermission('manage_production');

  const workflowStages = [...WORKFLOW_STAGES];

  const { data: workspacePayload, isLoading: wsLoading, isError: wsError } = useQuery({
    queryKey: ['orders', id, 'workspace'],
    queryFn: () => getOrderWorkspace(id!),
    enabled: !!id,
    retry: 1,
  });

  const { data: fallbackOrder, isLoading: orderLoading } = useQuery({
    queryKey: ['orders', id],
    queryFn: () => getOrderById(id!),
    enabled: !!id && (wsError || (!wsLoading && !workspacePayload)),
  });

  const { data: messagesRaw, isLoading: messagesLoading } = useQuery({
    queryKey: ['orders', id, 'messages'],
    queryFn: () => getOrderMessages(id!),
    enabled: !!id,
  });

  const { data: timelineRaw } = useQuery({
    queryKey: ['orders', id, 'timeline'],
    queryFn: () => getOrderTimeline(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => changeOrderStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      queryClient.invalidateQueries({ queryKey: ['orders', id, 'workspace'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id, 'timeline'] });
      toast.success('تم تحديث حالة الطلب');
    },
    onError: () => toast.error('حدث خطأ أثناء التحديث'),
  });

  const finishDesignMutation = useMutation({
    mutationFn: () => finishOrderDesign(id!),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(res?.message_ar || 'تم إنهاء التصميم وإبلاغ المتابعة');
      if (res?.route?.reason_ar) {
        toast.message('اقتراح التوجيه', { description: res.route.reason_ar });
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر إنهاء التصميم');
    },
  });

  const messageMutation = useMutation({
    mutationFn: (body_ar: string) => postOrderMessage(id!, body_ar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', id, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id, 'timeline'] });
      setMessageText('');
      toast.success('تم إرسال الرسالة');
    },
    onError: () => toast.error('فشل إرسال الرسالة'),
  });

  const workspace = workspacePayload ? unwrap(workspacePayload) : null;
  const orderFromWs = workspace?.order || (workspace?.id ? workspace : null);
  const order = orderFromWs || unwrap(fallbackOrder);
  const summary = workspace?.summary;

  const messages = useMemo(() => {
    if (Array.isArray(messagesRaw)) return messagesRaw;
    if (Array.isArray((messagesRaw as any)?.data)) return (messagesRaw as any).data;
    if (Array.isArray(order?.messages)) return order.messages;
    return [];
  }, [messagesRaw, order]);

  const timelineEvents = useMemo(() => {
    const raw = timelineRaw ?? workspace?.timeline;
    const list = Array.isArray(raw) ? raw : Array.isArray((raw as any)?.data) ? (raw as any).data : [];
    return list.map((ev: any, i: number) => ({
      id: ev.meta?.message_id || ev.meta?.activity_id || ev.meta?.history_id || String(i),
      type: (ev.type === 'payment' ? 'payment' : ev.type === 'message' ? 'message' : ev.type === 'status_change' ? 'system' : 'order') as
        | 'order'
        | 'invoice'
        | 'payment'
        | 'message'
        | 'system',
      title: ev.title_ar || ev.title || 'حدث',
      description: ev.body_ar || ev.description || '',
      timestamp: ev.at || ev.created_at || new Date().toISOString(),
      user: ev.meta?.user_name || ev.user?.full_name_ar || 'النظام',
    }));
  }, [timelineRaw, workspace]);

  const loading = wsLoading || (!order && orderLoading);

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 animate-pulse">
        <div className="h-40 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)]" />
        <div className="h-[600px] bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)]" />
      </div>
    );
  }

  if (!order) return <div className="p-8 text-center text-[var(--color-text-muted)]">لم يتم العثور على الطلب.</div>;

  const status = order.status || order.currentStage?.slug || 'received';
  const currentStageIndex = workflowStages.indexOf(status as any) >= 0 ? workflowStages.indexOf(status as any) : 0;
  const statusConfig = getStatusConfig(status);
  const revenue = summary?.total ?? order.total ?? order.revenue ?? 0;
  const paid = summary?.paid ?? order.paid_amount ?? order.paid ?? 0;
  const remaining = summary?.remaining ?? (revenue - paid);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/orders')}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] -ml-2"
        >
          <ArrowRight className="w-4 h-4 ml-2" /> العودة لإدارة الطلبات
        </Button>
        <div className="flex gap-2">
          {canFinishDesign && ['in_design', 'pending_approval', 'pending_review', 'received'].includes(status) && (
            <Button
              size="sm"
              className="bg-[#0F766E] text-white gap-2"
              disabled={finishDesignMutation.isPending}
              onClick={() => finishDesignMutation.mutate()}
            >
              <Sparkles className="w-4 h-4" /> إنهاء التصميم وإبلاغ المتابعة
            </Button>
          )}
          {status === 'design_ready' && (
            <Badge className="bg-emerald-50 text-emerald-700 border-0 self-center">
              بانتظار توجيه مسؤول المتابعة
            </Badge>
          )}
          {canDispatch && (
            <Button
              variant="outline"
              size="sm"
              className="border-[var(--color-border)]"
              onClick={() => navigate('/follow-up')}
            >
              مركز المتابعة
            </Button>
          )}
          <Button variant="outline" size="sm" className="border-[var(--color-border)]" onClick={() => toast.success('جاري إعداد الطباعة...')}>
            <Printer className="w-4 h-4 ml-2" /> طباعة
          </Button>
          <Button variant="outline" size="sm" className="border-[var(--color-border)]" onClick={() => toast.success('جاري تحميل ملف PDF...')}>
            <Download className="w-4 h-4 ml-2" /> PDF
          </Button>
          <Button size="sm" className="bg-[var(--color-primary-600)] text-white" onClick={() => toast.success('تم حفظ التغييرات بنجاح')}>
            <Save className="w-4 h-4 ml-2" /> حفظ التغييرات
          </Button>
        </div>
      </div>

      <Card className="border-[var(--color-border)] bg-gradient-to-l from-[var(--color-bg-card)] to-[var(--color-bg-main)] overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[var(--color-primary-600)]/10 text-[var(--color-primary-500)] rounded-xl flex items-center justify-center shrink-0 border border-[var(--color-primary-500)]/20 shadow-inner">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-bold text-[var(--color-text-main)]">{order.order_number || 'ORD'}</h1>
                    <Badge className={`bg-${statusConfig.color}/10 text-${statusConfig.color} border-0 text-sm px-3 py-1`}>
                      {STAGE_LABELS[status] || statusConfig.label}
                    </Badge>
                    {order.priority === 'high' && (
                      <Badge variant="danger" className="animate-pulse">
                        أولوية قصوى
                      </Badge>
                    )}
                  </div>
                  <p className="text-[var(--color-text-muted)] flex items-center gap-2 text-base">
                    <span className="font-medium text-[var(--color-text-main)]">{order.customer?.name_ar || order.customer?.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] inline-block" />
                    {order.items?.[0]?.design?.name_ar || order.design?.name_ar || order.design?.name || 'تصميم'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-2xl font-bold text-[var(--color-text-main)]">{Number(revenue).toLocaleString()} د.ج</div>
                <div className="flex gap-4 text-sm">
                  <span className="text-[var(--color-success)]">مدفوع: {Number(paid).toLocaleString()}</span>
                  {remaining > 0 && <span className="text-[var(--color-warning)]">متبقي: {Number(remaining).toLocaleString()}</span>}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between relative pb-8">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-[var(--color-bg-main)] -translate-y-1/2 z-0 rounded-full border border-[var(--color-border)]" />
                <div
                  className="absolute top-1/2 right-0 h-1 bg-[var(--color-primary-500)] -translate-y-1/2 z-0 rounded-full shadow-[0_0_10px_var(--color-primary-500)] transition-all duration-1000"
                  style={{ width: `${(currentStageIndex / (workflowStages.length - 1)) * 100}%` }}
                />

                {workflowStages.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  const designerBlocked =
                    isDesignerOnly &&
                    ['in_cutting', 'in_printing', 'in_assembly', 'ready', 'delivered'].includes(stage);
                  return (
                    <div
                      key={stage}
                      className={`relative z-10 flex flex-col items-center gap-2 ${
                        designerBlocked || !canEditStatus ? 'cursor-default opacity-80' : 'cursor-pointer'
                      }`}
                      onClick={() => {
                        if (designerBlocked) {
                          toast.message('المصمم لا يطلق أمر القص/الطباعة — استخدم «إنهاء التصميم» لإبلاغ المتابعة');
                          return;
                        }
                        if (!canEditStatus && !canFinishDesign) return;
                        if (isDesignerOnly && stage !== 'in_design' && stage !== 'design_ready') {
                          toast.message('انتقل عبر إنهاء التصميم فقط');
                          return;
                        }
                        statusMutation.mutate(stage);
                      }}
                      title={STAGE_LABELS[stage]}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isCompleted
                            ? 'bg-[var(--color-primary-500)] border-[var(--color-primary-500)] text-white'
                            : isCurrent
                              ? 'bg-[var(--color-bg-main)] border-[var(--color-primary-500)] text-[var(--color-primary-500)] shadow-[0_0_10px_var(--color-primary-500)]/30'
                              : 'bg-[var(--color-bg-main)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-[var(--color-primary-500)]' : 'bg-transparent'}`} />
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          isCurrent
                            ? 'text-[var(--color-primary-400)]'
                            : isCompleted
                              ? 'text-[var(--color-text-main)]'
                              : 'text-[var(--color-text-muted)]'
                        } absolute top-8 whitespace-nowrap`}
                      >
                        {STAGE_LABELS[stage]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col xl:flex-row gap-6 h-full mt-4">
        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-w-0">
          <TabsList className="w-full justify-start border-b border-[var(--color-border)] rounded-none bg-transparent p-0 h-auto space-x-0 space-x-reverse overflow-x-auto custom-scrollbar flex-nowrap">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary-500)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-primary-400)] px-4 py-3 whitespace-nowrap font-bold text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="items" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary-500)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-primary-400)] px-4 py-3 whitespace-nowrap font-bold text-sm">
              Items
            </TabsTrigger>
            <TabsTrigger value="production" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary-500)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-primary-400)] px-4 py-3 whitespace-nowrap font-bold text-sm">
              Production
            </TabsTrigger>
            <TabsTrigger value="materials" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary-500)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-primary-400)] px-4 py-3 whitespace-nowrap font-bold text-sm">
              Materials
            </TabsTrigger>
            <TabsTrigger value="machines" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary-500)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-primary-400)] px-4 py-3 whitespace-nowrap font-bold text-sm">
              Machines
            </TabsTrigger>
            <TabsTrigger value="employees" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary-500)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-primary-400)] px-4 py-3 whitespace-nowrap font-bold text-sm">
              Employees
            </TabsTrigger>
            <TabsTrigger value="finance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary-500)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-primary-400)] px-4 py-3 whitespace-nowrap font-bold text-sm">
              Finance
            </TabsTrigger>
            <TabsTrigger value="files" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary-500)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-primary-400)] px-4 py-3 whitespace-nowrap font-bold text-sm">
              Files
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary-500)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-primary-400)] px-4 py-3 whitespace-nowrap font-bold text-sm">
              Messages
            </TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary-500)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-primary-400)] px-4 py-3 whitespace-nowrap font-bold text-sm">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary-500)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-primary-400)] px-4 py-3 whitespace-nowrap font-bold text-sm">
              Tasks
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 flex-1">
            <TabsContent value="overview" className="m-0 focus-visible:ring-0">
              <OverviewTab
                order={order}
                onOrderChange={() => {
                  queryClient.invalidateQueries({ queryKey: ['orders', id] });
                  queryClient.invalidateQueries({ queryKey: ['orders', id, 'workspace'] });
                }}
              />
            </TabsContent>
            <TabsContent value="items" className="m-0 focus-visible:ring-0">
              <ItemsTab order={order} />
            </TabsContent>
            <TabsContent value="production" className="m-0 focus-visible:ring-0">
              <ProductionTab order={order} />
            </TabsContent>
            <TabsContent value="materials" className="m-0 focus-visible:ring-0">
              <MaterialsTab order={order} />
            </TabsContent>
            <TabsContent value="machines" className="m-0 focus-visible:ring-0">
              <MachinesTab order={order} />
            </TabsContent>
            <TabsContent value="employees" className="m-0 focus-visible:ring-0">
              <EmployeesTab order={order} />
            </TabsContent>
            <TabsContent value="finance" className="m-0 focus-visible:ring-0">
              <FinanceTab order={order} />
            </TabsContent>
            <TabsContent value="files" className="m-0 focus-visible:ring-0">
              <FilesTab order={order} />
            </TabsContent>
            <TabsContent value="messages" className="m-0 focus-visible:ring-0">
              <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" /> الرسائل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {messagesLoading ? (
                    <p className="text-[var(--color-text-muted)] animate-pulse">جاري التحميل...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-[var(--color-text-muted)] text-center py-8">لا توجد رسائل بعد</p>
                  ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto">
                      {messages.map((m: any) => (
                        <div key={m.id} className="p-3 rounded-lg bg-[var(--color-bg-main)] border border-[var(--color-border)]">
                          <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
                            <span className="font-bold text-[var(--color-text-main)]">
                              {m.user?.full_name_ar || m.user?.name || 'مستخدم'}
                            </span>
                            <span>{m.created_at ? new Date(m.created_at).toLocaleString('ar-DZ') : ''}</span>
                          </div>
                          <p className="text-sm text-[var(--color-text-main)] whitespace-pre-wrap">{m.body_ar}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!messageText.trim()) return;
                      messageMutation.mutate(messageText.trim());
                    }}
                  >
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="اكتب رسالة..."
                      className="bg-[var(--color-bg-main)] border-[var(--color-border)]"
                    />
                    <Button type="submit" disabled={messageMutation.isPending} className="bg-[var(--color-primary-600)] text-white gap-2">
                      <Send className="w-4 h-4" /> إرسال
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="timeline" className="m-0 focus-visible:ring-0">
              <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
                <CardHeader>
                  <CardTitle>السجل الزمني</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline activities={timelineEvents} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tasks" className="m-0 focus-visible:ring-0">
              <div className="space-y-6">
                <TasksTab order={order} />
                <NotesTab order={order} />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="w-full xl:w-80 space-y-6 flex-shrink-0 animate-fade-in">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardHeader className="pb-3 border-b border-[var(--color-border)]">
              <CardTitle className="text-base">فريق العمل</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {(order.assigned_employees || order.productionTasks || []).length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">لا يوجد موظفون معيّنون</p>
              ) : (
                (order.assigned_employees || []).map((emp: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-bg-main)] border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-text-main)]">
                      {(emp.name || emp.full_name_ar || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[var(--color-text-main)]">{emp.name || emp.full_name_ar}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{emp.role || ''}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardHeader className="pb-3 border-b border-[var(--color-border)]">
              <CardTitle className="text-base">تاريخ التسليم</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-center space-y-2">
              <Clock className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2" />
              <p className="text-xl font-bold text-[var(--color-text-main)]">
                {order.promised_date || order.due_date
                  ? new Date(order.promised_date || order.due_date).toLocaleDateString('ar-DZ')
                  : '—'}
              </p>
            </CardContent>
          </Card>

          {order.qr_code_token && (
            <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
              <CardHeader className="pb-3 border-b border-[var(--color-border)]">
                <CardTitle className="text-base">QR العامل</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <a
                  href={`/w/${order.qr_code_token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[var(--color-primary-400)] underline break-all"
                >
                  فتح /w/{order.qr_code_token.slice(0, 8)}…
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
