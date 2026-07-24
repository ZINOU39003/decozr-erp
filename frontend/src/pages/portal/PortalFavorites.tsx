import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPortalFavorites, mediaUrl, togglePortalFavorite } from '../../services/api';
import { Button } from '../../components/ui/Button';

export const PortalFavorites = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal', 'favorites'],
    queryFn: getPortalFavorites,
  });
  const list = Array.isArray(data) ? data : [];

  const removeMut = useMutation({
    mutationFn: (designId: string) => togglePortalFavorite(designId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'favorites'] });
      toast.success('تمت الإزالة من المفضلة');
    },
  });

  return (
    <div className="space-y-6 overflow-x-hidden" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#15202b] flex items-center gap-2">
            <Star className="text-[#0F766E]" /> المفضلة
          </h1>
          <p className="text-sm text-[#64748B] mt-1">التصاميم التي حفظتها للطلب لاحقاً</p>
        </div>
        <Button className="bg-[#0F766E] text-white" onClick={() => navigate('/portal/catalog')}>
          تصفح الكتالوج
        </Button>
      </div>

      {isLoading && <p className="animate-pulse text-[#64748B]">جاري التحميل...</p>}
      {isError && <p className="text-red-500">تعذر تحميل المفضلة</p>}
      {!isLoading && list.length === 0 && (
        <div className="rounded-2xl border border-[#E6ECF2] bg-white p-10 text-center text-[#94A3B8]">
          لا عناصر في المفضلة بعد
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((f: any) => {
          const d = f.design;
          if (!d) return null;
          return (
            <div
              key={f.id}
              className="rounded-2xl border border-[#E6ECF2] bg-white overflow-hidden"
            >
              <button
                type="button"
                className="block w-full text-right"
                onClick={() => navigate('/portal/catalog')}
              >
                <div className="aspect-[4/3] bg-[#F1F5F9]">
                  <img
                    src={
                      mediaUrl(d.image_url) ||
                      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600'
                    }
                    alt={d.name_ar}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-mono text-[#94A3B8]">{d.code}</p>
                  <h3 className="font-bold mt-1">{d.name_ar}</h3>
                  <p className="text-xs text-[#64748B] mt-1">{d.category?.name_ar || 'عام'}</p>
                </div>
              </button>
              <div className="px-4 pb-4">
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 gap-2"
                  onClick={() => removeMut.mutate(d.id)}
                >
                  <Trash2 className="w-4 h-4" /> إزالة
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
