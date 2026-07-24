import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  Camera,
  Save,
  Shield,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { getPortalMe, mediaUrl, updatePortalProfile, uploadPortalReceipt } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/useAuthStore';

export const PortalProfile = () => {
  const qc = useQueryClient();
  const setCurrentUser = useAuthStore((s) => s.setCurrentUser);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal', 'me'],
    queryFn: getPortalMe,
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!data?.customer) return;
    const c = data.customer;
    setName(c.name_ar || '');
    setPhone(c.phone || '');
    setCity(c.city || '');
    setAddress(c.address_ar || '');
    setAvatarUrl(c.avatar_url || '');
  }, [data]);

  const saveMut = useMutation({
    mutationFn: () =>
      updatePortalProfile({
        name_ar: name,
        phone,
        city,
        address_ar: address,
        avatar_url: avatarUrl || undefined,
      }),
    onSuccess: (res: any) => {
      toast.success('تم تحديث الملف الشخصي');
      qc.invalidateQueries({ queryKey: ['portal', 'me'] });
      if (res?.user && currentUser) {
        setCurrentUser({ ...currentUser, ...res.user, full_name: res.user.full_name_ar });
      }
    },
    onError: () => toast.error('تعذر حفظ التعديلات'),
  });

  const onAvatar = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('اختر صورة فقط');
      return;
    }
    setUploading(true);
    try {
      const res: any = await uploadPortalReceipt(file);
      setAvatarUrl(res.url);
      toast.success('تم رفع الصورة');
    } catch {
      toast.error('تعذر رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return <div className="p-8 animate-pulse text-[#64748B]">جاري التحميل...</div>;
  if (isError || !data) {
    return <div className="p-8 text-red-600">تعذر تحميل الملف الشخصي</div>;
  }

  const c = data.customer || {};
  const u = data.user || {};
  const initials =
    (name || c.name_ar || 'ع')
      .split(/\s+/)
      .slice(0, 2)
      .map((p: string) => p[0])
      .join('') || 'ع';

  return (
    <div className="space-y-6 max-w-2xl overflow-x-hidden" dir="rtl">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0F766E] via-[#0D9488] to-[#14B8A6] p-6 text-white shadow-lg">
        <Sparkles className="absolute left-4 top-4 w-10 h-10 opacity-20" />
        <div className="flex items-end gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white/40 bg-white/20 shadow-xl">
              {avatarUrl ? (
                <img
                  src={mediaUrl(avatarUrl) || avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-black">
                  {initials}
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -left-2 w-10 h-10 rounded-xl bg-white text-[#0F766E] flex items-center justify-center shadow-md cursor-pointer">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onAvatar(e.target.files?.[0])}
              />
            </label>
          </div>
          <div className="pb-1 min-w-0 flex-1">
            <p className="text-xs font-bold text-white/70 flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" /> عميل موثّق
            </p>
            <h1 className="text-2xl font-black truncate mt-0.5">{name || 'الملف الشخصي'}</h1>
            <p className="text-sm text-white/80 font-mono">{c.code}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#E6ECF2] bg-white p-5 space-y-4 shadow-sm">
        <h2 className="font-bold text-[#15202b] flex items-center gap-2">
          <User className="w-4 h-4 text-[#0F766E]" /> بيانات الحساب
        </h2>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold mb-1 block">الاسم الكامل</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" /> الهاتف
            </label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className="text-xs font-bold mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3" /> البريد
            </label>
            <Input value={c.email || u.email || ''} disabled className="opacity-70" dir="ltr" />
          </div>
          <div>
            <label className="text-xs font-bold mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> الولاية / المدينة
            </label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold mb-1 block">العنوان</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1] p-3">
            <p className="text-[10px] font-bold text-[#0F766E]">نوع العميل</p>
            <p className="font-bold text-sm mt-1">
              {c.customer_type === 'company'
                ? 'شركة'
                : c.customer_type === 'distributor'
                  ? 'موزّع'
                  : 'فرد'}
            </p>
          </div>
          <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-3">
            <p className="text-[10px] font-bold text-amber-700">قائمة الأسعار</p>
            <p className="font-bold text-sm mt-1">{c.priceList?.name_ar || 'تجزئة'}</p>
          </div>
        </div>

        <Button
          className="w-full bg-[#0F766E] text-white gap-2 h-12"
          disabled={saveMut.isPending || uploading}
          onClick={() => saveMut.mutate()}
        >
          <Save className="w-4 h-4" />
          {saveMut.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </Button>
      </div>

      <div className="rounded-2xl border border-[#E6ECF2] bg-[#F8FAFC] p-4 text-sm text-[#64748B] flex gap-3">
        <Shield className="w-5 h-5 text-[#0F766E] shrink-0" />
        بياناتك محمية وتُستخدم فقط لمتابعة طلباتك ومدفوعاتك مع الورشة.
      </div>
    </div>
  );
};
