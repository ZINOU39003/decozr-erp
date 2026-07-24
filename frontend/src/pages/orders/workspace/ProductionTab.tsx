import React from 'react';
import { toast } from 'sonner';
import { Cpu, Clock, User, AlertTriangle, PlayCircle, Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getShortageReport, startProduction } from '../../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { usePermission } from '../../../lib/permissions';

const STATUS_AR: Record<string, string> = {
  pending: 'في الانتظار',
  in_progress: 'قيد العمل',
  completed: 'مكتمل',
  paused: 'متوقف',
};

export const ProductionTab = ({ order }: { order: any }) => {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canStartProduction =
    hasPermission('manage_production') || hasPermission('dispatch_production');
  const jobs = order.machineJobs || [];

  const { data: shortage } = useQuery({
    queryKey: ['orders', order.id, 'shortage'],
    queryFn: () => getShortageReport(order.id),
    enabled: !!order?.id && !order.inventory_deducted,
  });

  const startMutation = useMutation({
    mutationFn: () => startProduction(order.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', order.id] });
      queryClient.invalidateQueries({ queryKey: ['orders', order.id, 'workspace'] });
      toast.success('تم بدء الإنتاج وخصم المواد وتوليد مهام الآلات');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'فشل بدء الإنتاج';
      toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
    },
  });

  const done = jobs.filter((j: any) => j.status === 'completed').length;
  const progress = jobs.length ? Math.round((done / jobs.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>مراحل الإنتاج ومهام الآلات</CardTitle>
            {!order.inventory_deducted && canStartProduction && (
              <Button
                size="sm"
                className="bg-[var(--color-primary-600)] text-white gap-2"
                disabled={startMutation.isPending}
                onClick={() => startMutation.mutate()}
              >
                {startMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4" />
                )}
                بدء الإنتاج
              </Button>
            )}
            {!order.inventory_deducted && !canStartProduction && (
              <Badge variant="secondary">بانتظار توجيه المتابعة</Badge>
            )}
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-10 text-[var(--color-text-muted)] space-y-2">
                <p>لا توجد مهام آلات بعد.</p>
                <p className="text-sm">اضغط «بدء الإنتاج» لخصم المخزون وتوليد المهام من BOM.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>التقدم</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--color-bg-main)] rounded-full overflow-hidden border border-[var(--color-border)]">
                    <div
                      className="h-full bg-[var(--color-primary-500)] rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {jobs.map((job: any) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)]/50"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="font-bold flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-[var(--color-primary-400)]" />
                          {job.machine?.name_ar || 'آلة'}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-[var(--color-text-muted)]">
                          <span>المرحلة: {job.production_stage}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {job.estimated_minutes || 0} د
                          </span>
                          {job.worker && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {job.worker.full_name_ar}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">{STATUS_AR[job.status] || job.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {shortage?.has_shortage && (
          <Card className="border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-[var(--color-warning)]">
                <AlertTriangle className="w-5 h-5" />
                نقص مواد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(shortage.shortages || []).map((s: any, i: number) => (
                <div key={i} className="flex justify-between gap-2">
                  <span>{s.material}</span>
                  <span className="text-[var(--color-danger)]">
                    نقص {s.shortage} {s.unit}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {order.qr_code_token && (
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardHeader>
              <CardTitle className="text-base">واجهة العامل</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={`/w/${order.qr_code_token}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[var(--color-primary-400)] underline break-all"
              >
                /w/{order.qr_code_token}
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
