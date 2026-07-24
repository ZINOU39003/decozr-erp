import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  CreditCard,
  User,
  LogOut,
  Layers,
  MessageSquare,
  Bell,
  MessageCircle,
  X,
  CalendarDays,
  Star,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

type Props = { onNavigate?: () => void };

export const CustomerSidebar = ({ onNavigate }: Props) => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const currentUser = useAuthStore((s) => s.currentUser);
  const close = () => onNavigate?.();

  const groups = [
    {
      title: 'الرئيسية',
      items: [
        { name: 'لوحة التحكم', path: '/portal/dashboard', icon: LayoutDashboard },
        { name: 'طلباتي', path: '/portal/orders', icon: ShoppingCart },
        { name: 'الكتالوج', path: '/portal/catalog', icon: Layers },
        { name: 'طلب تصميم خاص', path: '/portal/custom-request', icon: Sparkles },
        { name: 'المفضلة', path: '/portal/favorites', icon: Star },
      ],
    },
    {
      title: 'المالية',
      items: [
        { name: 'الفواتير', path: '/portal/invoices', icon: FileText },
        { name: 'المدفوعات', path: '/portal/payments', icon: CreditCard },
      ],
    },
    {
      title: 'التواصل',
      items: [
        { name: 'الرسائل', path: '/portal/messages', icon: MessageSquare },
        { name: 'واتساب', path: '/portal/whatsapp', icon: MessageCircle },
        { name: 'التنبيهات', path: '/portal/notifications', icon: Bell },
        { name: 'المواعيد', path: '/portal/appointments', icon: CalendarDays },
      ],
    },
    {
      title: 'الحساب',
      items: [
        { name: 'الملف الشخصي', path: '/portal/profile', icon: User },
        { name: 'الإعدادات', path: '/portal/profile', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 h-full flex flex-col bg-[#0F766E] text-white overflow-hidden">
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <button
          type="button"
          className="flex items-center gap-2.5"
          onClick={() => {
            close();
            navigate('/portal/dashboard');
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-white text-[#0F766E] flex items-center justify-center font-black text-lg">
            D
          </div>
          <div className="text-right leading-tight">
            <p className="font-black text-sm">DecoZR</p>
            <p className="text-[10px] text-white/70">بوابة العميل</p>
          </div>
        </button>
        <button type="button" onClick={close} className="lg:hidden p-2 rounded-lg hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-white/50">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path + item.name}
                  to={item.path}
                  end={item.path === '/portal/profile' && item.name === 'الملف الشخصي'}
                  onClick={close}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? 'bg-white text-[#0F766E] shadow-sm' : 'text-white/85 hover:bg-white/10'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 space-y-3 shrink-0">
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-xs font-bold mb-1">تحتاج مساعدة؟</p>
          <button
            type="button"
            onClick={() => {
              close();
              navigate('/portal/whatsapp');
            }}
            className="w-full text-xs font-bold py-2 rounded-xl bg-white text-[#0F766E]"
          >
            تواصل معنا
          </button>
        </div>
        <div className="px-1">
          <p className="text-sm font-bold truncate">
            {currentUser?.full_name || currentUser?.full_name_ar || 'عميل'}
          </p>
          <p className="text-[11px] text-white/60 truncate" dir="ltr">
            {currentUser?.email}
          </p>
        </div>
        <button
          onClick={() => {
            close();
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-2 px-3 py-2.5 w-full rounded-xl text-red-200 hover:bg-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-bold text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};
