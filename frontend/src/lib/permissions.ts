import { type UserRole, useAuthStore, normalizeRole } from '../store/useAuthStore';

export type Permission =
  | 'view_orders'
  | 'create_orders'
  | 'edit_orders'
  | 'delete_orders'
  | 'approve_orders'
  | 'view_customers'
  | 'create_customers'
  | 'edit_customers'
  | 'delete_customers'
  | 'view_inventory'
  | 'manage_inventory'
  | 'transfer_stock'
  | 'view_purchases'
  | 'manage_purchases'
  | 'approve_purchases'
  | 'view_production'
  | 'manage_production'
  | 'assign_machines'
  | 'view_designs'
  | 'create_designs'
  | 'edit_designs'
  | 'approve_designs'
  | 'view_finance'
  | 'manage_invoices'
  | 'manage_payments'
  | 'view_reports'
  | 'view_employees'
  | 'manage_employees'
  | 'view_tasks'
  | 'manage_tasks'
  | 'finish_design'
  | 'dispatch_production'
  | 'view_settings'
  | 'manage_settings'
  | 'manage_roles';

/** Fallback matrix when server permissions are empty (legacy / offline) */
const rolePermissions: Record<string, Permission[]> = {
  Admin: [
    'view_orders', 'create_orders', 'edit_orders', 'delete_orders', 'approve_orders',
    'view_customers', 'create_customers', 'edit_customers', 'delete_customers',
    'view_inventory', 'manage_inventory', 'transfer_stock', 'view_purchases', 'manage_purchases', 'approve_purchases',
    'view_production', 'manage_production', 'assign_machines',
    'view_designs', 'create_designs', 'edit_designs', 'approve_designs',
    'view_finance', 'manage_invoices', 'manage_payments', 'view_reports',
    'view_employees', 'manage_employees', 'view_tasks', 'manage_tasks',
    'finish_design', 'dispatch_production',
    'view_settings', 'manage_settings', 'manage_roles',
  ],
  Manager: [
    'view_orders', 'create_orders', 'edit_orders', 'approve_orders',
    'view_customers', 'create_customers', 'edit_customers',
    'view_inventory', 'manage_inventory', 'transfer_stock', 'view_purchases', 'manage_purchases', 'approve_purchases',
    'view_production', 'manage_production', 'assign_machines',
    'view_designs', 'create_designs', 'edit_designs', 'approve_designs',
    'view_finance', 'manage_invoices', 'manage_payments', 'view_reports',
    'view_employees', 'view_tasks', 'manage_tasks',
    'finish_design', 'dispatch_production',
    'view_settings',
  ],
  Sales: [
    'view_orders', 'create_orders', 'edit_orders',
    'view_customers', 'create_customers', 'edit_customers',
    'view_inventory', 'view_designs', 'view_tasks',
    'view_production', 'dispatch_production', 'manage_tasks',
  ],
  Designer: [
    'view_designs', 'create_designs', 'edit_designs',
    'view_orders', 'view_tasks', 'finish_design',
  ],
  Production: [
    'view_production', 'manage_production',
    'view_orders', 'view_designs', 'view_inventory', 'view_tasks',
  ],
  Warehouse: [
    'view_inventory', 'manage_inventory', 'transfer_stock',
    'view_purchases', 'manage_purchases', 'view_orders', 'view_tasks',
  ],
  Finance: [
    'view_finance', 'manage_invoices', 'manage_payments', 'view_reports',
    'view_orders', 'view_customers', 'view_purchases', 'view_tasks',
  ],
  HR: [
    'view_employees', 'manage_employees', 'view_tasks', 'manage_tasks', 'view_reports',
  ],
  Driver: ['view_orders', 'view_tasks'],
};

export const PERMISSION_GROUPS: { module: string; label: string; permissions: { slug: Permission; label: string }[] }[] = [
  {
    module: 'orders',
    label: 'الطلبات',
    permissions: [
      { slug: 'view_orders', label: 'عرض' },
      { slug: 'create_orders', label: 'إنشاء' },
      { slug: 'edit_orders', label: 'تعديل' },
      { slug: 'delete_orders', label: 'حذف' },
      { slug: 'approve_orders', label: 'موافقة' },
    ],
  },
  {
    module: 'customers',
    label: 'العملاء',
    permissions: [
      { slug: 'view_customers', label: 'عرض' },
      { slug: 'create_customers', label: 'إضافة' },
      { slug: 'edit_customers', label: 'تعديل' },
      { slug: 'delete_customers', label: 'حذف' },
    ],
  },
  {
    module: 'designs',
    label: 'التصاميم',
    permissions: [
      { slug: 'view_designs', label: 'عرض' },
      { slug: 'create_designs', label: 'إنشاء' },
      { slug: 'edit_designs', label: 'تعديل' },
      { slug: 'approve_designs', label: 'اعتماد' },
    ],
  },
  {
    module: 'production',
    label: 'الإنتاج',
    permissions: [
      { slug: 'view_production', label: 'عرض' },
      { slug: 'manage_production', label: 'إدارة' },
      { slug: 'assign_machines', label: 'إسناد آلات' },
    ],
  },
  {
    module: 'inventory',
    label: 'المخزون',
    permissions: [
      { slug: 'view_inventory', label: 'عرض' },
      { slug: 'manage_inventory', label: 'إدارة' },
      { slug: 'transfer_stock', label: 'تحويل' },
      { slug: 'view_purchases', label: 'عرض مشتريات' },
      { slug: 'manage_purchases', label: 'إدارة مشتريات' },
      { slug: 'approve_purchases', label: 'اعتماد مشتريات' },
    ],
  },
  {
    module: 'finance',
    label: 'المالية',
    permissions: [
      { slug: 'view_finance', label: 'عرض' },
      { slug: 'manage_invoices', label: 'فواتير' },
      { slug: 'manage_payments', label: 'مدفوعات' },
      { slug: 'view_reports', label: 'تقارير' },
    ],
  },
  {
    module: 'hr',
    label: 'الموارد البشرية',
    permissions: [
      { slug: 'view_employees', label: 'عرض موظفين' },
      { slug: 'manage_employees', label: 'إدارة موظفين' },
      { slug: 'view_tasks', label: 'عرض مهام' },
      { slug: 'manage_tasks', label: 'إدارة مهام' },
    ],
  },
  {
    module: 'workflow',
    label: 'مسار العمل',
    permissions: [
      { slug: 'finish_design', label: 'إنهاء تصميم' },
      { slug: 'dispatch_production', label: 'توجيه إنتاج' },
    ],
  },
  {
    module: 'settings',
    label: 'النظام',
    permissions: [
      { slug: 'view_settings', label: 'عرض إعدادات' },
      { slug: 'manage_settings', label: 'إدارة إعدادات' },
      { slug: 'manage_roles', label: 'إدارة الأدوار' },
    ],
  },
];

export const usePermission = () => {
  const rawRole = useAuthStore((s) => s.role);
  const roles = useAuthStore((s) => s.roles);
  const permissions = useAuthStore((s) => s.permissions);
  const storeHas = useAuthStore((s) => s.hasPermission);
  const role = normalizeRole(rawRole);

  const hasPermission = (permission: Permission | string): boolean => {
    if (roles.includes('admin') || role === 'Admin') return true;
    if (permissions.length > 0) return storeHas(permission);
    return rolePermissions[role]?.includes(permission as Permission) || false;
  };

  const hasAnyPermission = (list: (Permission | string)[]): boolean =>
    list.some((p) => hasPermission(p));

  const hasAllPermissions = (list: (Permission | string)[]): boolean =>
    list.every((p) => hasPermission(p));

  return { hasPermission, hasAnyPermission, hasAllPermissions, role, permissions, roles };
};
