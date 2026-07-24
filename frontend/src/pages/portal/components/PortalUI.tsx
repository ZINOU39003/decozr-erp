import React from 'react';
import { cn } from '../../../lib/utils';

export function PortalSection({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-[#E6ECF2] bg-white shadow-[0_1px_2px_rgba(15,40,50,0.04)]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#EEF2F6]">
        <h2 className="text-base font-bold text-[#15202b]">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PortalKpiCard({
  label,
  value,
  icon,
  tone = 'teal',
  delta,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone?: 'teal' | 'amber' | 'rose' | 'sky' | 'violet' | 'emerald';
  delta?: string;
  onClick?: () => void;
}) {
  const tones: Record<string, string> = {
    teal: 'bg-[#0F766E]/10 text-[#0F766E]',
    amber: 'bg-[#F59E0B]/12 text-[#D97706]',
    rose: 'bg-[#EF4444]/10 text-[#EF4444]',
    sky: 'bg-[#0EA5E9]/12 text-[#0284C7]',
    violet: 'bg-[#8B5CF6]/12 text-[#7C3AED]',
    emerald: 'bg-[#22C55E]/12 text-[#16A34A]',
  };
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-[#E6ECF2] bg-white p-4 text-right shadow-[0_1px_2px_rgba(15,40,50,0.04)] transition-all',
        onClick && 'hover:border-[#0F766E]/35 hover:shadow-md cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', tones[tone])}>
          {icon}
        </div>
        {delta && (
          <span className="text-[11px] font-bold text-[#16A34A] bg-[#22C55E]/10 px-2 py-0.5 rounded-full">
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-black text-[#15202b] tracking-tight">{value}</p>
      <p className="text-xs font-semibold text-[#64748B] mt-1">{label}</p>
    </Comp>
  );
}

export function PortalStatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    received: { label: 'مستلم', cls: 'bg-slate-100 text-slate-700' },
    pending_review: { label: 'مراجعة', cls: 'bg-sky-50 text-sky-700' },
    pending_approval: { label: 'موافقة', cls: 'bg-violet-50 text-violet-700' },
    in_design: { label: 'تصميم', cls: 'bg-indigo-50 text-indigo-700' },
    in_cutting: { label: 'قص', cls: 'bg-amber-50 text-amber-700' },
    in_printing: { label: 'طباعة', cls: 'bg-orange-50 text-orange-700' },
    in_assembly: { label: 'إنتاج', cls: 'bg-teal-50 text-teal-700' },
    ready: { label: 'جاهز', cls: 'bg-emerald-50 text-emerald-700' },
    delivered: { label: 'مكتمل', cls: 'bg-green-50 text-green-700' },
  };
  const item = map[status] || { label: status, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={cn('inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold', item.cls)}>
      {item.label}
    </span>
  );
}

export function PortalProgress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-full">
      <div className="flex justify-between text-[11px] font-bold mb-1.5">
        <span className="text-[#64748B]">التقدم</span>
        <span className="text-[#0F766E]">{v}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-[#E8EEF3] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-l from-[#0F766E] to-[#14B8A6] transition-all duration-500"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
