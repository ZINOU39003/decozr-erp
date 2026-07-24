import React, { useMemo } from 'react';
import { Activity, AlertTriangle, Cpu, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { getCapacityForecast, getMachines } from '../../services/api';

const unwrapList = (raw: unknown): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) return (raw as any).data;
  return [];
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export const ProductionCapacity = () => {
  const from = todayISO();

  const { data: forecastRaw, isLoading: forecastLoading } = useQuery({
    queryKey: ['capacity-forecast', from, 7],
    queryFn: () => getCapacityForecast(from, 7),
  });

  const { data: machinesRaw, isLoading: machinesLoading } = useQuery({
    queryKey: ['machines'],
    queryFn: getMachines,
  });

  const forecast = unwrapList(forecastRaw);
  const machines = unwrapList(machinesRaw);
  const loading = forecastLoading || machinesLoading;

  const todayRows = useMemo(
    () => forecast.filter((r) => r.date === from),
    [forecast, from]
  );

  const overloads = useMemo(() => forecast.filter((r) => r.overload), [forecast]);

  const avgLoad = useMemo(() => {
    if (todayRows.length === 0) return 0;
    const loads = todayRows.map((r) => {
      if (!r.available_min) return r.required_min > 0 ? 100 : 0;
      return Math.min(100, Math.round((r.required_min / r.available_min) * 100));
    });
    return Math.round(loads.reduce((a, b) => a + b, 0) / loads.length);
  }, [todayRows]);

  const scheduledJobs = useMemo(
    () => todayRows.reduce((sum, r) => sum + (r.required_min > 0 ? 1 : 0), 0),
    [todayRows]
  );

  const days = useMemo(() => {
    const set = new Set(forecast.map((r) => r.date));
    return Array.from(set).sort();
  }, [forecast]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] flex items-center gap-2">
            <Activity className="w-6 h-6 text-[var(--color-primary-500)]" />
            الطاقة الإنتاجية والجدولة
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">توقعات الحمل على الآلات لـ 7 أيام</p>
        </div>
        <Button variant="outline" className="border-[var(--color-border)] gap-2">
          <Calendar className="w-4 h-4" /> من {from}
        </Button>
      </div>

      {overloads.length > 0 && (
        <Card className="border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--color-danger)] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[var(--color-danger)] mb-1">تحذيرات تجاوز الطاقة ({overloads.length})</p>
              <ul className="text-sm text-[var(--color-text-main)] space-y-1 max-h-32 overflow-y-auto">
                {overloads.slice(0, 8).map((o, i) => (
                  <li key={`${o.machine_id}-${o.date}-${i}`}>
                    {o.date} — {o.machine_name_ar || o.machine_code}: مطلوب {o.required_min} د / متاح {o.available_min} د
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-6 text-center">
            <p className="text-[var(--color-text-muted)] text-sm font-medium mb-2">إجمالي الآلات المتاحة</p>
            <h3 className="text-3xl font-bold text-[var(--color-text-main)]">{machines.length}</h3>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-6 text-center">
            <p className="text-[var(--color-text-muted)] text-sm font-medium mb-2">متوسط العبء اليوم</p>
            <h3 className="text-3xl font-bold text-[var(--color-warning)]">{avgLoad}%</h3>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-6 text-center">
            <p className="text-[var(--color-text-muted)] text-sm font-medium mb-2">آلات بتحميل اليوم</p>
            <h3 className="text-3xl font-bold text-[var(--color-success)]">{scheduledJobs}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] flex-1 overflow-hidden">
        <CardHeader className="border-b border-[var(--color-border)] pb-4">
          <CardTitle>توقعات الطاقة (7 أيام)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-[var(--color-text-muted)] animate-pulse">جاري التحميل...</div>
          ) : machines.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-text-muted)]">لا توجد آلات</div>
          ) : (
            <div className="min-w-[800px]">
              <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg-main)]/50">
                <div className="w-64 p-4 font-bold text-[var(--color-text-muted)] border-l border-[var(--color-border)] shrink-0">
                  الآلة
                </div>
                <div className="flex-1 flex relative">
                  {days.map((day) => (
                    <div
                      key={day}
                      className="flex-1 p-2 text-center text-xs font-medium text-[var(--color-text-muted)] border-l border-[var(--color-border)]/30"
                    >
                      {day.slice(5)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-[var(--color-border)]">
                {machines.map((machine: any) => {
                  const machineForecast = forecast.filter((r) => r.machine_id === machine.id);
                  const today = machineForecast.find((r) => r.date === from);
                  const load =
                    today && today.available_min
                      ? Math.min(100, Math.round((today.required_min / today.available_min) * 100))
                      : today?.required_min
                        ? 100
                        : 0;

                  return (
                    <div key={machine.id} className="flex hover:bg-[var(--color-bg-hover)] transition-colors">
                      <div className="w-64 p-4 border-l border-[var(--color-border)] shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] rounded-lg">
                            <Cpu className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[var(--color-text-main)] text-sm">
                              {machine.name_ar || machine.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-[var(--color-text-muted)]">
                                {machine.machine_type || machine.type || machine.code}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                  load > 80
                                    ? 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]'
                                    : load > 40
                                      ? 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]'
                                      : 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                                }`}
                              >
                                عبء {load}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 flex relative min-h-[72px]">
                        {days.map((day) => {
                          const row = machineForecast.find((r) => r.date === day);
                          const pct =
                            row && row.available_min
                              ? Math.min(100, Math.round((row.required_min / row.available_min) * 100))
                              : row?.required_min
                                ? 100
                                : 0;
                          return (
                            <div
                              key={day}
                              className={`flex-1 border-l border-[var(--color-border)]/20 p-2 flex flex-col items-center justify-center gap-1 ${
                                row?.overload ? 'bg-[var(--color-danger)]/10' : ''
                              }`}
                            >
                              <span className="text-xs font-bold text-[var(--color-text-main)]">{pct}%</span>
                              {row?.overload && (
                                <Badge variant="danger" className="text-[9px] px-1 py-0">
                                  تجاوز
                                </Badge>
                              )}
                              <span className="text-[10px] text-[var(--color-text-muted)]">
                                {row ? `${row.required_min}/${row.available_min}` : '—'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
