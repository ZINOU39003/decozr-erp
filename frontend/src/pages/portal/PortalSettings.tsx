import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bell, Shield, Moon, Monitor, Save, Key, Globe, EyeOff, FileLock2 } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export const PortalSettings = () => {
  const { isDarkMode, toggleDarkMode } = useUIStore();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: false,
    language: 'ar',
    twoFactor: false
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-main)]">الإعدادات</h1>
          <p className="text-sm text-[var(--color-text-muted)]">تخصيص تفضيلات حسابك وإعدادات الإشعارات والأمان.</p>
        </div>
        <Button className="bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] shadow-lg shadow-[var(--color-primary-500)]/20 px-8" onClick={() => toast.success('تم حفظ الإعدادات بنجاح')}>
          <Save className="w-4 h-4 mr-2" />
          حفظ التغييرات
        </Button>
      </div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-0">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3">
              <Monitor className="w-5 h-5 text-[var(--color-primary-500)]" />
              <h2 className="font-bold text-[var(--color-text-main)]">المظهر والتخصيص</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[var(--color-text-main)] flex items-center gap-2 mb-1">
                    <Moon className="w-4 h-4 text-[var(--color-text-muted)]" />
                    الوضع الليلي
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">تفعيل أو إيقاف الوضع الليلي لواجهة المستخدم.</p>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDarkMode ? 'bg-[var(--color-primary-500)]' : 'bg-[var(--color-border)]'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? '-translate-x-1' : '-translate-x-6'
                  }`} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-0">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3">
              <Bell className="w-5 h-5 text-[var(--color-primary-500)]" />
              <h2 className="font-bold text-[var(--color-text-main)]">إعدادات الإشعارات</h2>
            </div>
            <div className="p-6 space-y-6">
              {[
                { id: 'emailNotifications', label: 'الإشعارات عبر البريد الإلكتروني', desc: 'تلقي تحديثات الطلبات والفواتير عبر البريد.' },
                { id: 'smsNotifications', label: 'الإشعارات عبر الرسائل القصيرة (SMS)', desc: 'تلقي رسائل نصية قصيرة عند اكتمال الطلب أو الشحن.' },
                { id: 'orderUpdates', label: 'تحديثات حالة الطلب', desc: 'تلقي إشعارات فورية عند تغيير حالة طلبك في مراحل الإنتاج.' },
                { id: 'promotions', label: 'العروض الترويجية والأخبار', desc: 'تلقي إشعارات حول أحدث التصاميم والعروض الخاصة.' }
              ].map(setting => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[var(--color-text-main)] mb-1">{setting.label}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{setting.desc}</p>
                  </div>
                  <button 
                    onClick={() => toggleSetting(setting.id as keyof typeof settings)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings[setting.id as keyof typeof settings] ? 'bg-[var(--color-primary-500)]' : 'bg-[var(--color-border)]'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings[setting.id as keyof typeof settings] ? '-translate-x-1' : '-translate-x-6'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-0">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3">
              <Shield className="w-5 h-5 text-[var(--color-primary-500)]" />
              <h2 className="font-bold text-[var(--color-text-main)]">الأمان والخصوصية</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-[var(--color-border)]">
                <div>
                  <h3 className="font-bold text-[var(--color-text-main)] flex items-center gap-2 mb-1">
                    <Key className="w-4 h-4 text-[var(--color-text-muted)]" />
                    المصادقة الثنائية (2FA)
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">إضافة طبقة حماية إضافية لحسابك عند تسجيل الدخول.</p>
                </div>
                <button 
                  onClick={() => toggleSetting('twoFactor')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.twoFactor ? 'bg-[var(--color-primary-500)]' : 'bg-[var(--color-border)]'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.twoFactor ? '-translate-x-1' : '-translate-x-6'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between pb-6 border-b border-[var(--color-border)]">
                <div>
                  <h3 className="font-bold text-[var(--color-text-main)] flex items-center gap-2 mb-1">
                    <EyeOff className="w-4 h-4 text-[var(--color-text-muted)]" />
                    الجلسات النشطة
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">تم تسجيل الدخول حالياً من متصفح Chrome على نظام Windows.</p>
                </div>
                <Button variant="outline" className="border-[var(--color-border)] text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 hover:border-[var(--color-danger)]" onClick={() => toast.info('تم تسجيل الخروج من الأجهزة الأخرى')}>
                  تسجيل الخروج من الأجهزة الأخرى
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[var(--color-danger)] flex items-center gap-2 mb-1">
                    <FileLock2 className="w-4 h-4" />
                    حذف الحساب
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">حذف حسابك وجميع بياناتك نهائياً من نظامنا.</p>
                </div>
                <Button variant="outline" className="border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white" onClick={() => toast.error('هذا الإجراء لا يمكن التراجع عنه')}>
                  حذف الحساب نهائياً
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
