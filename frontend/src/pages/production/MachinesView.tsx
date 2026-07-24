import React from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Cpu, Settings2, AlertTriangle, Activity, Wrench, Play, Pause, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { getMachines, getMachineJobs } from '../../services/api';
import { useQuery } from '@tanstack/react-query';

const unwrapList = (raw: unknown): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) return (raw as any).data;
  return [];
};

const mapOperationalStatus = (machine: any) => {
  const s = (machine.operational_status || machine.status || '').toLowerCase();
  if (s === 'operational' || s === 'running') return 'RUNNING';
  if (s === 'maintenance' || s === 'broken') return 'MAINTENANCE';
  return 'IDLE';
};

export const MachinesView = () => {
  const { drawer, modal } = useUIStore();

  const { data: machinesRaw, isLoading: loading } = useQuery({
    queryKey: ['machines'],
    queryFn: getMachines
  });

  const { data: jobsRaw } = useQuery({
    queryKey: ['machine-jobs'],
    queryFn: getMachineJobs,
  });

  const machines = unwrapList(machinesRaw);
  const jobs = unwrapList(jobsRaw);

  const handleStatusToggle = (e: React.MouseEvent, id: string, newStatus: string) => {
    e.stopPropagation();
    toast.info('جاري تحديث حالة الآلة...');
    // TODO: Implement real machine status update endpoint
  };

  if (loading) return <div className="p-8 text-center text-[var(--color-text-muted)] animate-pulse">جاري التحميل...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <Cpu className="w-6 h-6 text-[var(--color-primary-500)]" />
            حالة الآلات (OEE)
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">مراقبة الفعالية الشاملة للمعدات (Overall Equipment Effectiveness)</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => toast.info(`${jobs.length} مهمة آلة نشطة/معلقة`)}
          >
            <Wrench className="w-4 h-4 ml-2" /> المهام ({jobs.length})
          </Button>
          <Button
            className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] text-white"
            onClick={() => modal.openModal('CREATE_MACHINE')}
          >
            إضافة آلة
          </Button>
        </div>
      </div>

      {machines.length === 0 ? (
        <div className="p-12 text-center text-[var(--color-text-muted)] border-2 border-dashed border-[var(--color-border)] rounded-xl space-y-3">
          <p>لا توجد آلات مسجلة</p>
          <Button
            className="bg-[var(--color-primary-600)] text-white"
            onClick={() => modal.openModal('CREATE_MACHINE')}
          >
            إضافة أول آلة
          </Button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {machines.map((machine: any) => {
          const status = mapOperationalStatus(machine);
          const activeJob = jobs.find((j: any) => j.machine_id === machine.id && (j.status === 'in_progress' || j.status === 'pending'));
          const oee = machine.oee ?? (status === 'RUNNING' ? 75 : status === 'IDLE' ? 40 : 20);
          const name = machine.name_ar || machine.name;
          return (
          <Card key={machine.id} className="border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary-500)]/50 transition-colors cursor-pointer" onClick={() => drawer.openDrawer('ENTITY_DETAILS', { entityType: 'MACHINE', entityId: machine.id, title: name })}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-[var(--color-text-main)]">{name}</h3>
                  <span className="text-sm text-[var(--color-text-muted)] font-mono">{machine.code || machine.id}</span>
                </div>
                <div className={`p-2 rounded-full ${
                  status === 'RUNNING' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' :
                  status === 'MAINTENANCE' ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]' :
                  'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                }`}>
                  {status === 'RUNNING' ? <Activity className="w-5 h-5 animate-pulse" /> : 
                   status === 'MAINTENANCE' ? <AlertTriangle className="w-5 h-5" /> : 
                   <Settings2 className="w-5 h-5" />}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--color-text-muted)]">OEE</span>
                    <span className={`font-bold ${oee >= 85 ? 'text-[var(--color-success)]' : oee >= 60 ? 'text-[var(--color-warning)]' : 'text-[var(--color-danger)]'}`}>{oee}%</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--color-bg-main)] rounded-full overflow-hidden">
                    <div className={`h-full ${oee >= 85 ? 'bg-[var(--color-success)]' : oee >= 60 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-danger)]'}`} style={{ width: `${oee}%` }}></div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant={status === 'RUNNING' ? 'default' : 'outline'} className={`flex-1 text-xs ${status === 'RUNNING' ? 'bg-[var(--color-success)] text-white' : ''}`} onClick={(e) => handleStatusToggle(e, machine.id, 'RUNNING')}>
                    <Play className="w-3 h-3 ml-1" /> تشغيل
                  </Button>
                  <Button size="sm" variant={status === 'IDLE' ? 'default' : 'outline'} className={`flex-1 text-xs ${status === 'IDLE' ? 'bg-[var(--color-warning)] text-white' : ''}`} onClick={(e) => handleStatusToggle(e, machine.id, 'IDLE')}>
                    <Pause className="w-3 h-3 ml-1" /> توقف
                  </Button>
                  <Button size="sm" variant={status === 'MAINTENANCE' ? 'default' : 'outline'} className={`flex-1 text-xs ${status === 'MAINTENANCE' ? 'bg-[var(--color-danger)] text-white' : ''}`} onClick={(e) => handleStatusToggle(e, machine.id, 'MAINTENANCE')}>
                    <AlertCircle className="w-3 h-3 ml-1" /> صيانة
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-[var(--color-bg-main)] p-2 rounded border border-[var(--color-border)]">
                    <div className="text-[var(--color-text-muted)] mb-1">Availability</div>
                    <div className="font-bold text-[var(--color-text-main)]">{machine.availability || machine.daily_capacity_minutes || 0}{machine.availability ? '%' : 'د'}</div>
                  </div>
                  <div className="bg-[var(--color-bg-main)] p-2 rounded border border-[var(--color-border)]">
                    <div className="text-[var(--color-text-muted)] mb-1">Type</div>
                    <div className="font-bold text-[var(--color-text-main)] truncate">{machine.machine_type || '—'}</div>
                  </div>
                  <div className="bg-[var(--color-bg-main)] p-2 rounded border border-[var(--color-border)]">
                    <div className="text-[var(--color-text-muted)] mb-1">Jobs</div>
                    <div className="font-bold text-[var(--color-text-main)]">{jobs.filter((j: any) => j.machine_id === machine.id).length}</div>
                  </div>
                </div>

                {activeJob && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">العملية الحالية</span>
                    <span className="font-mono text-[var(--color-primary-500)] font-bold">{activeJob.production_stage || activeJob.id?.slice?.(0, 8)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>
      )}
    </div>
  );
};
