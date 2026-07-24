import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PenTool,
  Activity,
  Users,
  ShoppingCart,
  FileText,
  CreditCard,
  UserCircle,
  Settings,
  Layers,
  Inbox,
  X,
  LogOut,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePermission, type Permission } from '../../lib/permissions';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarItem {
  name: string;
  path: string;
  icon: any;
  permission?: Permission;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    title: 'الرئيسية',
    items: [
      { name: 'لوحة التحكم', path: '/dashboard', icon: LayoutDashboard },
      { name: 'التنبيهات', path: '/alerts', icon: AlertTriangle },
      { name: 'الطلبات', path: '/orders', icon: Package, permission: 'view_orders' },
      { name: 'العملاء', path: '/customers', icon: Users, permission: 'view_customers' },
      { name: 'رسائل البوابة', path: '/admin/portal', icon: Inbox, permission: 'view_customers' },
    ],
  },
  {
    title: 'الإنتاج',
    items: [
      { name: 'التصاميم', path: '/designs', icon: PenTool, permission: 'view_designs' },
      { name: 'الإنتاج', path: '/production', icon: Activity, permission: 'view_production' },
      { name: 'المتابعة', path: '/follow-up', icon: ClipboardList, permission: 'dispatch_production' },
    ],
  },
  {
    title: 'المخزون',
    items: [
      { name: 'المواد', path: '/materials', icon: Layers, permission: 'view_inventory' },
      { name: 'الموردون', path: '/suppliers', icon: ShoppingCart, permission: 'view_purchases' },
    ],
  },
  {
    title: 'المالية',
    items: [
      { name: 'الفواتير', path: '/invoices', icon: FileText, permission: 'view_finance' },
      { name: 'المدفوعات', path: '/payments', icon: CreditCard, permission: 'view_finance' },
    ],
  },
  {
    title: 'الإدارة',
    items: [
      { name: 'الموظفون', path: '/employees', icon: UserCircle, permission: 'view_employees' },
      { name: 'الأدوار والصلاحيات', path: '/settings/roles', icon: Settings, permission: 'manage_roles' },
      { name: 'الإعدادات', path: '/settings', icon: Settings, permission: 'view_settings' },
    ],
  },
];

type Props = { onNavigate?: () => void };

export function Sidebar({ onNavigate }: Props) {
  const { hasPermission, role } = usePermission();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const currentUser = useAuthStore((s) => s.currentUser);
  const close = () => onNavigate?.();

  const roleLabel: Record<string, string> = {
    Admin: 'مدير النظام',
    Manager: 'مدير',
    Sales: 'مبيعات',
    Designer: 'مصمم',
    Production: 'إنتاج',
    Warehouse: 'مستودع',
    Finance: 'مالية',
    HR: 'موارد بشرية',
    Driver: 'سائق',
  };

  return (
    <aside className="w-64 h-full flex flex-col bg-[#0F766E] text-white overflow-hidden">
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <button
          type="button"
          className="flex items-center gap-2.5"
          onClick={() => {
            close();
            navigate('/dashboard');
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-white text-[#0F766E] flex items-center justify-center font-black text-lg">
            D
          </div>
          <div className="text-right leading-tight">
            <p className="font-black text-sm">DecoZR</p>
            <p className="text-[10px] text-white/70">لوحة الورشة</p>
          </div>
        </button>
        <button
          type="button"
          onClick={close}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        {sidebarGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.permission || hasPermission(item.permission)
          );
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.title}>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-white/50">
                {group.title}
              </p>
              <div className="space-y-1">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={close}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                        isActive
                          ? 'bg-white text-[#0F766E] shadow-sm'
                          : 'text-white/85 hover:bg-white/10'
                      )
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10 space-y-3 shrink-0">
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-xs font-bold mb-0.5 truncate">
            {currentUser?.full_name || currentUser?.full_name_ar || 'مرحباً بك'}
          </p>
          <p className="text-[11px] text-white/60 truncate">{roleLabel[role] || role}</p>
        </div>
        <button
          type="button"
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
}
