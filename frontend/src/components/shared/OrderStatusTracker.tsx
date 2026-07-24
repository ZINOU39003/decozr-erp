import React from 'react';
import { Check } from 'lucide-react';

export const ORDER_STAGES = [
  { key: 'received', label: 'استلام' },
  { key: 'in_design', label: 'تصميم', aliases: ['pending_review', 'pending_approval', 'design_ready'] },
  { key: 'in_production', label: 'إنتاج', aliases: ['in_cutting', 'in_printing', 'in_assembly'] },
  { key: 'ready', label: 'جاهز' },
  { key: 'delivered', label: 'تسليم', aliases: ['completed'] },
] as const;

function stageIndex(status: string): number {
  const s = String(status || '').toLowerCase();
  for (let i = 0; i < ORDER_STAGES.length; i++) {
    const st = ORDER_STAGES[i];
    if (st.key === s) return i;
    if ('aliases' in st && (st as any).aliases?.includes(s)) return i;
  }
  if (s === 'cancelled' || s === 'rejected') return -1;
  return 0;
}

/** Visual colored stage tracker for workshop + portal */
export function OrderStatusTracker({
  status,
  compact = false,
}: {
  status: string;
  compact?: boolean;
}) {
  const idx = stageIndex(status);
  if (idx < 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-bold">
        الطلب ملغى / مرفوض
      </div>
    );
  }

  return (
    <div className={`w-full ${compact ? 'py-1' : 'py-2'}`} dir="rtl">
      <div className="flex items-center justify-between gap-1">
        {ORDER_STAGES.map((stage, i) => {
          const done = i < idx;
          const current = i === idx;
          return (
            <React.Fragment key={stage.key}>
              <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
                <div
                  className={`flex items-center justify-center rounded-full border-2 transition-colors ${
                    compact ? 'w-7 h-7' : 'w-9 h-9'
                  } ${
                    done
                      ? 'bg-[#0F766E] border-[#0F766E] text-white'
                      : current
                        ? 'bg-white border-[#0F766E] text-[#0F766E] ring-4 ring-[#0F766E]/15'
                        : 'bg-[#F6F8FB] border-[#E6ECF2] text-[#94A3B8]'
                  }`}
                >
                  {done ? <Check className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} /> : (
                    <span className={`font-black ${compact ? 'text-[10px]' : 'text-xs'}`}>{i + 1}</span>
                  )}
                </div>
                <span
                  className={`text-center truncate w-full ${
                    compact ? 'text-[10px]' : 'text-xs'
                  } ${current ? 'font-black text-[#0F766E]' : done ? 'font-bold text-[#15202b]' : 'text-[#94A3B8]'}`}
                >
                  {stage.label}
                </span>
              </div>
              {i < ORDER_STAGES.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mb-5 rounded-full ${
                    i < idx ? 'bg-[#0F766E]' : 'bg-[#E6ECF2]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
