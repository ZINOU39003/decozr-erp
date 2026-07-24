import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, MapPin } from 'lucide-react';
import { getPortalAppointments } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const PortalAppointments = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal', 'appointments'],
    queryFn: getPortalAppointments,
  });
  const list = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 overflow-x-hidden" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#15202b] flex items-center gap-2">
            <CalendarDays className="text-[#0F766E]" /> المواعيد
          </h1>
          <p className="text-sm text-[#64748B] mt-1">زيارات، تسليم، وتركيب مرتبطة بطلباتك</p>
        </div>
        <Button
          className="bg-[#0F766E] text-white"
          onClick={() => navigate('/portal/messages')}
        >
          طلب موعد عبر الدردشة
        </Button>
      </div>

      {isLoading && <p className="animate-pulse text-[#64748B]">جاري التحميل...</p>}
      {isError && <p className="text-red-500">تعذر تحميل المواعيد</p>}

      <div className="space-y-3">
        {list.map((a: any) => (
          <div
            key={a.id}
            className="rounded-2xl border border-[#E6ECF2] bg-white p-4 flex gap-3 items-start"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[#15202b]">{a.title_ar}</p>
              <p className="text-sm text-[#64748B] mt-1">
                {new Date(a.starts_at).toLocaleString('ar-DZ', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {a.notes && <p className="text-xs text-[#94A3B8] mt-1">{a.notes}</p>}
              {a.location_ar && (
                <p className="text-xs text-[#0F766E] mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {a.location_ar}
                </p>
              )}
            </div>
            <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
              {a.status === 'done' ? 'منجز' : a.status === 'cancelled' ? 'ملغى' : 'مجدول'}
            </span>
          </div>
        ))}
        {!isLoading && list.length === 0 && (
          <div className="rounded-2xl border border-[#E6ECF2] bg-white p-10 text-center text-[#94A3B8]">
            لا مواعيد حالياً
          </div>
        )}
      </div>
    </div>
  );
};
