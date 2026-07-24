import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, Cpu, Activity, Filter, Wrench } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import { getMachineJobs, getMachines } from '../../services/api';

const unwrapList = (raw: unknown): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) return (raw as any).data;
  return [];
};

const toDateKey = (d: Date) => d.toISOString().slice(0, 10);

const jobStartHour = (job: any): number => {
  const ref = job.started_at || job.scheduled_at || job.createdAt || job.created_at;
  if (!ref) return 8;
  const h = new Date(ref).getHours() + new Date(ref).getMinutes() / 60;
  return Math.max(8, Math.min(18, h));
};

const jobDurationHours = (job: any): number => {
  const mins = job.estimated_minutes || job.actual_minutes || 60;
  return Math.max(0.5, Math.min(10, mins / 60));
};

export const ProductionCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const hours = Array.from({ length: 11 }, (_, i) => i + 8);
  const dayKey = toDateKey(currentDate);

  const { data: machinesRaw, isLoading: machinesLoading } = useQuery({
    queryKey: ['machines'],
    queryFn: getMachines,
  });

  const { data: jobsRaw, isLoading: jobsLoading } = useQuery({
    queryKey: ['machine-jobs'],
    queryFn: getMachineJobs,
  });

  const machines = unwrapList(machinesRaw);
  const jobs = unwrapList(jobsRaw);
  const loading = machinesLoading || jobsLoading;

  const dayJobs = useMemo(() => {
    return jobs.filter((j) => {
      const ref = j.started_at || j.scheduled_at || j.createdAt || j.created_at;
      if (!ref) return false;
      return toDateKey(new Date(ref)) === dayKey;
    });
  }, [jobs, dayKey]);

  const jobsByMachine = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const j of dayJobs) {
      const mid = j.machine_id || j.machine?.id;
      if (!mid) continue;
      if (!map.has(mid)) map.set(mid, []);
      map.get(mid)!.push(j);
    }
    return map;
  }, [dayJobs]);

  const shiftDay = (delta: number) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  };

  const getJobStyle = (job: any) => {
    const startHour = jobStartHour(job);
    const durationHours = jobDurationHours(job);
    const startOffset = (startHour - 8) * (100 / 11);
    const width = durationHours * (100 / 11);

    let colorClass = 'bg-[var(--color-primary-500)]/20 text-[var(--color-primary-400)] border border-[var(--color-primary-500)]/30';
    if (job.status === 'completed')
      colorClass = 'bg-[var(--color-success)]/20 text-[var(--color-success)] border border-[var(--color-success)]/30';
    if (job.status === 'in_progress')
      colorClass = 'bg-[var(--color-warning)] text-white shadow-lg shadow-[var(--color-warning)]/20';
    if (job.status === 'pending' || job.status === 'scheduled')
      colorClass = 'bg-[var(--color-primary-500)]/20 text-[var(--color-primary-400)] border border-[var(--color-primary-500)]/30';
    if (job.status === 'paused' || job.status === 'cancelled')
      colorClass = 'bg-[var(--color-danger)]/20 text-[var(--color-danger)] border border-[var(--color-danger)]/30';

    return { left: `${startOffset}%`, width: `${width}%`, className: colorClass };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Activity className="w-3 h-3" />;
      case 'completed':
        return <Clock className="w-3 h-3" />;
      case 'paused':
      case 'cancelled':
        return <Wrench className="w-3 h-3" />;
      default:
        return <CalendarIcon className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)]">التقويم الموحد (Global Calendar)</h1>
          <p className="text-[var(--color-text-muted)] mt-1">مهام الآلات مجمّعة حسب التاريخ والجهاز</p>
        </div>

        <div className="flex items-center gap-4 bg-[var(--color-bg-card)] p-1.5 rounded-lg border border-[var(--color-border)]">
          <button
            className="p-2 hover:bg-[var(--color-bg-hover)] rounded-md transition-colors text-[var(--color-text-muted)] hover:text-white"
            onClick={() => shiftDay(-1)}
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div className="flex items-center gap-2 font-bold px-4">
            <CalendarIcon className="w-4 h-4 text-[var(--color-primary-400)]" />
            <span>
              {currentDate.toLocaleDateString('ar-DZ', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <button
            className="p-2 hover:bg-[var(--color-bg-hover)] rounded-md transition-colors text-[var(--color-text-muted)] hover:text-white"
            onClick={() => shiftDay(1)}
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      <Card className="flex-1 border-[var(--color-border)] bg-[var(--color-bg-card)] flex flex-col overflow-hidden">
        <CardContent className="p-0 flex-1 flex flex-col overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-[var(--color-text-muted)] animate-pulse">جاري التحميل...</div>
          ) : machines.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-text-muted)]">لا توجد آلات</div>
          ) : (
            <div className="min-w-[800px] flex-1 flex flex-col">
              <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg-main)]/50">
                <div className="w-48 shrink-0 p-4 border-r border-[var(--color-border)] flex items-center justify-between">
                  <span className="font-bold text-[var(--color-text-muted)]">الآلة</span>
                  <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
                </div>
                <div className="flex-1 flex relative">
                  {hours.map((hour) => (
                    <div key={hour} className="flex-1 border-r border-[var(--color-border)]/50 p-2 text-center relative">
                      <span className="text-xs font-bold text-[var(--color-text-muted)]">{hour}:00</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--color-bg-main)]/20">
                {machines.map((machine: any, idx: number) => {
                  const resourceJobs = jobsByMachine.get(machine.id) || [];
                  return (
                    <div
                      key={machine.id}
                      className="flex border-b border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]/30 transition-colors group min-h-[72px]"
                    >
                      <div className="w-48 shrink-0 p-4 border-r border-[var(--color-border)] bg-[var(--color-bg-card)] group-hover:bg-[var(--color-bg-hover)] transition-colors flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-500)]/20 flex items-center justify-center">
                          <Cpu className="w-4 h-4 text-[var(--color-primary-400)]" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-[var(--color-text-main)] block">
                            {machine.name_ar || machine.name}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-muted)]">{machine.code}</span>
                        </div>
                      </div>

                      <div className="flex-1 relative z-10 min-w-[800px]">
                        <div className="absolute inset-0 flex pointer-events-none">
                          {hours.map((hour) => (
                            <div key={hour} className="flex-1 border-r border-[var(--color-border)]/30 border-dashed h-full" />
                          ))}
                        </div>

                        {resourceJobs.map((job: any) => {
                          const style = getJobStyle(job);
                          return (
                            <motion.div
                              key={job.id}
                              initial={{ opacity: 0, scaleX: 0 }}
                              animate={{ opacity: 1, scaleX: 1 }}
                              transition={{ duration: 0.4, delay: idx * 0.05 }}
                              style={{ left: style.left, width: style.width, transformOrigin: 'left' }}
                              className={`absolute top-3 bottom-3 rounded-md p-2 flex flex-col justify-center overflow-hidden cursor-pointer hover:brightness-110 transition-all ${style.className}`}
                            >
                              <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5 truncate">
                                {getStatusIcon(job.status)}
                                <span>{job.order?.order_number || job.order_id?.slice?.(0, 8) || job.id?.slice?.(0, 8)}</span>
                              </div>
                              <span className="text-[10px] truncate opacity-90">
                                {job.production_stage || job.notes || 'مهمة إنتاج'}
                              </span>
                            </motion.div>
                          );
                        })}

                        {resourceJobs.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[var(--color-text-muted)] opacity-40">
                            لا مهام لهذا اليوم
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4 items-center justify-center bg-[var(--color-bg-card)] p-4 rounded-xl border border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--color-success)]/40 border border-[var(--color-success)]" />
          <span className="text-xs text-[var(--color-text-muted)]">مكتمل</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--color-warning)]" />
          <span className="text-xs text-[var(--color-text-main)] font-medium">قيد التنفيذ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--color-primary-500)]/40 border border-[var(--color-primary-500)]" />
          <span className="text-xs text-[var(--color-text-muted)]">مجدول / معلق</span>
        </div>
        <Badge variant="outline" className="text-xs border-[var(--color-border)] text-[var(--color-text-muted)]">
          {dayJobs.length} مهمة اليوم
        </Badge>
      </div>
    </div>
  );
};
