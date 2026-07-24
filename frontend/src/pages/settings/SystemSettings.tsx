import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings, Globe, Save, Store, Phone, Image as ImageIcon, Loader2, Shield,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { usePermission } from '../../lib/permissions';
import { toast } from 'sonner';
import { Input } from '../../components/ui/Input';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSystemSettings, saveSystemSettingsBulk } from '../../services/api';

type StorefrontForm = {
  brand_name: string;
  tagline_ar: string;
  hero_title_ar: string;
  hero_subtitle_ar: string;
  hero_image_url: string;
  logo_url: string;
  phone: string;
  whatsapp: string;
  email: string;
  address_ar: string;
  city: string;
  facebook: string;
  instagram: string;
  about_ar: string;
  working_hours_ar: string;
};

type GeneralForm = {
  company_name: string;
  currency: string;
  timezone: string;
  tax_rate: string;
};

const defaultStorefront: StorefrontForm = {
  brand_name: 'DecoZR',
  tagline_ar: 'نظام متكامل لإدارة صناعة الأثاث والديكور',
  hero_title_ar: 'نصنع ديكورك باحتراف',
  hero_subtitle_ar: 'تصاميم ليزر، CNC، وطباعة حسب الطلب',
  hero_image_url: '',
  logo_url: '',
  phone: '',
  whatsapp: '',
  email: 'contact@decozr.com',
  address_ar: '',
  city: 'الجزائر',
  facebook: '',
  instagram: '',
  about_ar: '',
  working_hours_ar: 'السبت – الخميس · 9:00 – 18:00',
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="text-sm font-medium text-[var(--color-text-main)] mb-1.5 block">{label}</label>
    {children}
  </div>
);

export const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('storefront');
  const { hasPermission } = usePermission();
  const queryClient = useQueryClient();

  const [general, setGeneral] = useState<GeneralForm>({
    company_name: 'DecoZR للصناعات',
    currency: 'DZD',
    timezone: 'Africa/Algiers',
    tax_rate: '0',
  });
  const [storefront, setStorefront] = useState<StorefrontForm>(defaultStorefront);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await getSystemSettings();
      return ((res as any).data || res) as Record<string, unknown>;
    },
    enabled: hasPermission('view_settings'),
  });

  useEffect(() => {
    if (!settings) return;
    const g = (settings.general as any) || {};
    setGeneral({
      company_name: g.company_name || 'DecoZR للصناعات',
      currency: g.currency || 'DZD',
      timezone: g.timezone || 'Africa/Algiers',
      tax_rate: String(g.tax_rate ?? '0'),
    });
    setStorefront({ ...defaultStorefront, ...((settings.storefront as object) || {}) });
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () =>
      saveSystemSettingsBulk({
        general,
        storefront,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('تم حفظ الإعدادات بنجاح');
    },
    onError: () => toast.error('تعذر حفظ الإعدادات'),
  });

  if (!hasPermission('view_settings')) {
    return (
      <div className="p-8 text-center text-[var(--color-danger)] font-bold text-xl">
        ليس لديك صلاحية للوصول إلى هذه الصفحة.
      </div>
    );
  }

  const tabs = [
    { id: 'storefront', label: 'واجهة المتجر والتواصل', icon: Store },
    { id: 'general', label: 'إعدادات المصنع', icon: Globe },
    { id: 'appearance', label: 'المظهر', icon: ImageIcon },
  ];

  const inputCls = 'bg-[var(--color-bg-main)] border-[var(--color-border)]';

  return (
    <div className="flex flex-col h-full space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#0F766E]" />
            إعدادات النظام
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            معلومات الواجهة، التواصل، والصفحة الرئيسية للزبون
          </p>
          {hasPermission('manage_roles') && (
            <Link
              to="/settings/roles"
              className="inline-flex items-center gap-2 mt-3 text-sm font-bold text-[#0F766E] hover:underline"
            >
              <Shield className="w-4 h-4" /> إدارة الأدوار والصلاحيات
            </Link>
          )}
        </div>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || isLoading}
          className="gap-2 bg-[#0F766E] text-white hover:bg-[#0D9488]"
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ التغييرات
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1">
        <div className="w-full md:w-64 space-y-2 shrink-0">
          {tabs.map((t) => (
            <Button
              key={t.id}
              variant={activeTab === t.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(t.id)}
              className={`w-full justify-start ${
                activeTab === t.id
                  ? 'bg-[#0F766E]/10 text-[#0F766E]'
                  : 'text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]'
              }`}
            >
              <t.icon className="w-4 h-4 ml-2" /> {t.label}
            </Button>
          ))}
        </div>

        <div className="flex-1">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardHeader className="border-b border-[var(--color-border)]">
              <CardTitle>
                {activeTab === 'storefront' && 'واجهة المتجر ومعلومات التواصل'}
                {activeTab === 'general' && 'إعدادات المصنع الأساسية'}
                {activeTab === 'appearance' && 'ملاحظات المظهر'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <p className="text-[var(--color-text-muted)] animate-pulse">جاري التحميل...</p>
              ) : activeTab === 'storefront' ? (
                <div className="space-y-8 max-w-3xl">
                  <section className="space-y-4">
                    <h3 className="font-bold text-[var(--color-text-main)] flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#0F766E]" /> الهوية والصفحة الرئيسية
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="اسم العلامة">
                        <Input className={inputCls} value={storefront.brand_name} onChange={(e) => setStorefront({ ...storefront, brand_name: e.target.value })} />
                      </Field>
                      <Field label="الشعار المختصر">
                        <Input className={inputCls} value={storefront.tagline_ar} onChange={(e) => setStorefront({ ...storefront, tagline_ar: e.target.value })} />
                      </Field>
                      <Field label="عنوان الصفحة الرئيسية">
                        <Input className={inputCls} value={storefront.hero_title_ar} onChange={(e) => setStorefront({ ...storefront, hero_title_ar: e.target.value })} />
                      </Field>
                      <Field label="وصف مختصر تحت العنوان">
                        <Input className={inputCls} value={storefront.hero_subtitle_ar} onChange={(e) => setStorefront({ ...storefront, hero_subtitle_ar: e.target.value })} />
                      </Field>
                      <Field label="رابط صورة الخلفية / الهيرو">
                        <Input className={inputCls} placeholder="https://..." value={storefront.hero_image_url} onChange={(e) => setStorefront({ ...storefront, hero_image_url: e.target.value })} />
                      </Field>
                      <Field label="رابط الشعار (Logo)">
                        <Input className={inputCls} placeholder="https://..." value={storefront.logo_url} onChange={(e) => setStorefront({ ...storefront, logo_url: e.target.value })} />
                      </Field>
                    </div>
                    <Field label="نبذة عنّا (تظهر في من نحن / الصفحة الرئيسية)">
                      <textarea
                        className={`w-full min-h-[110px] rounded-md border px-3 py-2 text-sm ${inputCls}`}
                        value={storefront.about_ar}
                        onChange={(e) => setStorefront({ ...storefront, about_ar: e.target.value })}
                      />
                    </Field>
                  </section>

                  <section className="space-y-4">
                    <h3 className="font-bold text-[var(--color-text-main)] flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#0F766E]" /> معلومات التواصل واتصل بنا
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="الهاتف">
                        <Input className={inputCls} value={storefront.phone} onChange={(e) => setStorefront({ ...storefront, phone: e.target.value })} />
                      </Field>
                      <Field label="واتساب">
                        <Input className={inputCls} value={storefront.whatsapp} onChange={(e) => setStorefront({ ...storefront, whatsapp: e.target.value })} />
                      </Field>
                      <Field label="البريد">
                        <Input className={inputCls} value={storefront.email} onChange={(e) => setStorefront({ ...storefront, email: e.target.value })} />
                      </Field>
                      <Field label="ساعات العمل">
                        <Input className={inputCls} value={storefront.working_hours_ar} onChange={(e) => setStorefront({ ...storefront, working_hours_ar: e.target.value })} />
                      </Field>
                      <Field label="المدينة">
                        <Input className={inputCls} value={storefront.city} onChange={(e) => setStorefront({ ...storefront, city: e.target.value })} />
                      </Field>
                      <Field label="العنوان">
                        <Input className={inputCls} value={storefront.address_ar} onChange={(e) => setStorefront({ ...storefront, address_ar: e.target.value })} />
                      </Field>
                      <Field label="فيسبوك">
                        <Input className={inputCls} value={storefront.facebook} onChange={(e) => setStorefront({ ...storefront, facebook: e.target.value })} />
                      </Field>
                      <Field label="إنستغرام">
                        <Input className={inputCls} value={storefront.instagram} onChange={(e) => setStorefront({ ...storefront, instagram: e.target.value })} />
                      </Field>
                    </div>
                  </section>
                </div>
              ) : activeTab === 'general' ? (
                <div className="space-y-4 max-w-2xl">
                  <Field label="اسم المصنع / الشركة">
                    <Input className={inputCls} value={general.company_name} onChange={(e) => setGeneral({ ...general, company_name: e.target.value })} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="العملة">
                      <select
                        className={`w-full h-10 rounded-md border px-3 text-sm ${inputCls}`}
                        value={general.currency}
                        onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
                      >
                        <option value="DZD">دينار جزائري (DZD)</option>
                        <option value="USD">دولار أمريكي (USD)</option>
                      </select>
                    </Field>
                    <Field label="المنطقة الزمنية">
                      <select
                        className={`w-full h-10 rounded-md border px-3 text-sm ${inputCls}`}
                        value={general.timezone}
                        onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                      >
                        <option value="Africa/Algiers">أفريقيا / الجزائر (GMT+1)</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="نسبة الضريبة %">
                    <Input className={inputCls} value={general.tax_rate} onChange={(e) => setGeneral({ ...general, tax_rate: e.target.value })} />
                  </Field>
                </div>
              ) : (
                <p className="text-[var(--color-text-muted)] text-sm leading-relaxed max-w-xl">
                  ألوان الواجهة العامة تُدار من ثيم النظام الحالي. لتغيير صورة الخلفية والشعار والنصوص الظاهرة للزبون استخدم تبويب «واجهة المتجر والتواصل».
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
