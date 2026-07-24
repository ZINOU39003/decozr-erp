import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Ruler,
  Upload,
  Sparkles,
  Hammer,
  TreePine,
  Scan,
  Sofa,
  Layers,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createPortalCustomRequest,
  getPortalCustomRequests,
  mediaUrl,
  uploadPortalReceipt,
} from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const TYPES = [
  { id: 'design', label: 'تصميم', icon: Sparkles },
  { id: 'cnc', label: 'فوركاسا / CNC', icon: Scan },
  { id: 'wood', label: 'خشب', icon: TreePine },
  { id: 'laser', label: 'ليزر', icon: Layers },
  { id: 'furniture', label: 'أثاث', icon: Sofa },
  { id: 'other', label: 'أخرى', icon: Hammer },
];

const statusLabel: Record<string, string> = {
  new: 'جديد',
  reviewing: 'مراجعة',
  quoted: 'عُرض سعر',
  accepted: 'مقبول',
  rejected: 'مرفوض',
};

export const PortalCustomRequest = () => {
  const qc = useQueryClient();
  const listQ = useQuery({
    queryKey: ['portal', 'custom-requests'],
    queryFn: getPortalCustomRequests,
  });

  const [requestType, setRequestType] = useState('design');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [depth, setDepth] = useState('');
  const [material, setMaterial] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const list = useMemo(
    () => (Array.isArray(listQ.data) ? listQ.data : []),
    [listQ.data]
  );

  const createMut = useMutation({
    mutationFn: () =>
      createPortalCustomRequest({
        request_type: requestType,
        title_ar: title,
        description_ar: description,
        width_cm: width ? Number(width) : undefined,
        height_cm: height ? Number(height) : undefined,
        depth_cm: depth ? Number(depth) : undefined,
        material_hint: material || undefined,
        reference_image: imageUrl || undefined,
      }),
    onSuccess: () => {
      toast.success('تم إرسال طلب التصميم الخاص');
      setTitle('');
      setDescription('');
      setWidth('');
      setHeight('');
      setDepth('');
      setMaterial('');
      setImageUrl('');
      qc.invalidateQueries({ queryKey: ['portal', 'custom-requests'] });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || 'تعذر إرسال الطلب'),
  });

  const onImage = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const res: any = await uploadPortalReceipt(file);
      setImageUrl(res.url);
      toast.success('تم رفع الصورة المرجعية');
    } catch {
      toast.error('تعذر رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden max-w-3xl" dir="rtl">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#134E4A] to-[#0F766E] p-6 text-white shadow-lg">
        <Hammer className="absolute -left-3 -bottom-3 w-28 h-28 opacity-15" />
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Sparkles className="w-6 h-6" /> طلب تصميم خاص
        </h1>
        <p className="text-sm text-white/80 mt-2 max-w-lg">
          ليس في الكتالوج؟ صفّ طلبك (نوع، أبعاد، تفاصيل) وأرفق صورة مشابهة إن وُجدت — الورشة ترد
          بعرض سعر.
        </p>
      </div>

      <div className="rounded-3xl border border-[#E6ECF2] bg-white p-5 space-y-4 shadow-sm">
        <p className="text-xs font-bold text-[#64748B]">نوع الطلب</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setRequestType(t.id)}
              className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold border transition ${
                requestType === t.id
                  ? 'bg-[#0F766E] text-white border-[#0F766E]'
                  : 'bg-[#F8FAFC] text-[#334155] border-[#E6ECF2]'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs font-bold mb-1 block">عنوان الطلب</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: طاولة قهوة حسب المقاس"
          />
        </div>
        <div>
          <label className="text-xs font-bold mb-1 block">التفاصيل</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="اكتب وصفاً واضحاً للشكل، الخامة، اللون، الاستخدام..."
            className="w-full rounded-2xl border border-[#E6ECF2] bg-[#F8FAFC] px-4 py-3 text-sm resize-none"
          />
        </div>

        <div>
          <p className="text-xs font-bold mb-2 flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5" /> الأبعاد (سم)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="العرض"
            />
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="الارتفاع"
            />
            <Input
              type="number"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              placeholder="العمق"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold mb-1 block">خامة مقترحة (اختياري)</label>
          <Input
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="خشب، MDF، أكريليك..."
          />
        </div>

        <div>
          <label className="text-xs font-bold mb-2 block">صورة مشابهة إن وُجدت</label>
          <label className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0F766E]/35 bg-[#F0FDFA] p-4 cursor-pointer text-sm font-bold text-[#0F766E]">
            <Upload className="w-4 h-4" />
            {uploading ? 'جاري الرفع...' : imageUrl ? 'تم رفع الصورة — تغيير' : 'رفع صورة مرجعية'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onImage(e.target.files?.[0])}
            />
          </label>
          {imageUrl && (
            <img
              src={mediaUrl(imageUrl) || imageUrl}
              alt="مرجع"
              className="mt-3 h-36 w-full object-cover rounded-2xl border border-[#E6ECF2]"
            />
          )}
        </div>

        <Button
          className="w-full bg-[#0F766E] text-white gap-2 h-12"
          disabled={createMut.isPending || uploading}
          onClick={() => {
            if (!title.trim() || !description.trim()) {
              return toast.error('أكمل العنوان والوصف');
            }
            createMut.mutate();
          }}
        >
          <Send className="w-4 h-4" />
          {createMut.isPending ? 'جاري الإرسال...' : 'إرسال الطلب للورشة'}
        </Button>
      </div>

      <div className="space-y-3">
        <h2 className="font-bold text-[#15202b]">طلباتك السابقة</h2>
        {listQ.isLoading && <p className="text-[#64748B] animate-pulse">جاري التحميل...</p>}
        {!listQ.isLoading && list.length === 0 && (
          <div className="rounded-2xl border border-[#E6ECF2] bg-white p-8 text-center text-[#94A3B8]">
            لا طلبات خاصة بعد
          </div>
        )}
        {list.map((r: any) => (
          <div key={r.id} className="rounded-2xl border border-[#E6ECF2] bg-white p-4 flex gap-3">
            {r.reference_image ? (
              <img
                src={mediaUrl(r.reference_image) || r.reference_image}
                alt=""
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <p className="font-bold text-[#15202b] truncate">{r.title_ar}</p>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] shrink-0">
                  {statusLabel[r.status] || r.status}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{r.description_ar}</p>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                {[r.width_cm && `عرض ${r.width_cm}`, r.height_cm && `ارتفاع ${r.height_cm}`, r.depth_cm && `عمق ${r.depth_cm}`]
                  .filter(Boolean)
                  .join(' · ') || TYPES.find((t) => t.id === r.request_type)?.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
