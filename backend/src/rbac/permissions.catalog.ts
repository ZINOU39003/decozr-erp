/** Canonical ERP permission slugs (shared by seed, API, and guards) */

export type PermissionDef = {
  slug: string;
  module: string;
  action: string;
  description_ar: string;
};

export const PERMISSION_CATALOG: PermissionDef[] = [
  // Orders
  { slug: 'view_orders', module: 'orders', action: 'view', description_ar: 'عرض الطلبات' },
  { slug: 'create_orders', module: 'orders', action: 'create', description_ar: 'إنشاء طلبات' },
  { slug: 'edit_orders', module: 'orders', action: 'edit', description_ar: 'تعديل الطلبات' },
  { slug: 'delete_orders', module: 'orders', action: 'delete', description_ar: 'حذف الطلبات' },
  { slug: 'approve_orders', module: 'orders', action: 'approve', description_ar: 'الموافقة على الطلبات' },
  // Customers
  { slug: 'view_customers', module: 'customers', action: 'view', description_ar: 'عرض العملاء' },
  { slug: 'create_customers', module: 'customers', action: 'create', description_ar: 'إضافة عملاء' },
  { slug: 'edit_customers', module: 'customers', action: 'edit', description_ar: 'تعديل العملاء' },
  { slug: 'delete_customers', module: 'customers', action: 'delete', description_ar: 'حذف العملاء' },
  // Inventory
  { slug: 'view_inventory', module: 'inventory', action: 'view', description_ar: 'عرض المخزون' },
  { slug: 'manage_inventory', module: 'inventory', action: 'manage', description_ar: 'إدارة المخزون' },
  { slug: 'transfer_stock', module: 'inventory', action: 'transfer', description_ar: 'تحويل مخزون' },
  { slug: 'view_purchases', module: 'purchases', action: 'view', description_ar: 'عرض المشتريات' },
  { slug: 'manage_purchases', module: 'purchases', action: 'manage', description_ar: 'إدارة المشتريات' },
  { slug: 'approve_purchases', module: 'purchases', action: 'approve', description_ar: 'اعتماد المشتريات' },
  // Production
  { slug: 'view_production', module: 'production', action: 'view', description_ar: 'عرض الإنتاج' },
  { slug: 'manage_production', module: 'production', action: 'manage', description_ar: 'إدارة الإنتاج' },
  { slug: 'assign_machines', module: 'production', action: 'assign', description_ar: 'إسناد الآلات' },
  // Designs
  { slug: 'view_designs', module: 'designs', action: 'view', description_ar: 'عرض التصاميم' },
  { slug: 'create_designs', module: 'designs', action: 'create', description_ar: 'إنشاء تصاميم' },
  { slug: 'edit_designs', module: 'designs', action: 'edit', description_ar: 'تعديل التصاميم' },
  { slug: 'approve_designs', module: 'designs', action: 'approve', description_ar: 'اعتماد التصاميم' },
  // Finance
  { slug: 'view_finance', module: 'finance', action: 'view', description_ar: 'عرض المالية' },
  { slug: 'manage_invoices', module: 'finance', action: 'invoices', description_ar: 'إدارة الفواتير' },
  { slug: 'manage_payments', module: 'finance', action: 'payments', description_ar: 'إدارة المدفوعات' },
  { slug: 'view_reports', module: 'finance', action: 'reports', description_ar: 'عرض التقارير' },
  // HR & Tasks
  { slug: 'view_employees', module: 'hr', action: 'view', description_ar: 'عرض الموظفين' },
  { slug: 'manage_employees', module: 'hr', action: 'manage', description_ar: 'إدارة الموظفين' },
  { slug: 'view_tasks', module: 'tasks', action: 'view', description_ar: 'عرض المهام' },
  { slug: 'manage_tasks', module: 'tasks', action: 'manage', description_ar: 'إدارة المهام' },
  // Workflow handoff
  { slug: 'finish_design', module: 'workflow', action: 'finish_design', description_ar: 'إنهاء التصميم وإبلاغ المتابعة' },
  { slug: 'dispatch_production', module: 'workflow', action: 'dispatch', description_ar: 'توجيه الطلبات للقص/الطباعة' },
  // System
  { slug: 'view_settings', module: 'settings', action: 'view', description_ar: 'عرض الإعدادات' },
  { slug: 'manage_settings', module: 'settings', action: 'manage', description_ar: 'إدارة الإعدادات' },
  { slug: 'manage_roles', module: 'settings', action: 'roles', description_ar: 'إدارة الأدوار والصلاحيات' },
];

export const ALL_PERMISSION_SLUGS = PERMISSION_CATALOG.map((p) => p.slug);

/** Default permission sets per workshop role slug */
export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  admin: [...ALL_PERMISSION_SLUGS],
  manager: [
    'view_orders', 'create_orders', 'edit_orders', 'approve_orders',
    'view_customers', 'create_customers', 'edit_customers',
    'view_inventory', 'manage_inventory', 'transfer_stock', 'view_purchases', 'manage_purchases', 'approve_purchases',
    'view_production', 'manage_production', 'assign_machines',
    'view_designs', 'create_designs', 'edit_designs', 'approve_designs',
    'view_finance', 'manage_invoices', 'manage_payments', 'view_reports',
    'view_employees', 'view_tasks', 'manage_tasks',
    'view_settings', 'finish_design', 'dispatch_production',
  ],
  designer: [
    'view_designs', 'create_designs', 'edit_designs',
    'view_orders', 'view_tasks', 'finish_design',
  ],
  accountant: [
    'view_finance', 'manage_invoices', 'manage_payments', 'view_reports',
    'view_orders', 'view_customers', 'view_purchases', 'view_tasks',
  ],
  sales: [
    'view_orders', 'create_orders', 'edit_orders',
    'view_customers', 'create_customers', 'edit_customers',
    'view_inventory', 'view_designs', 'view_tasks',
  ],
  seller: [
    'view_orders', 'create_orders', 'edit_orders',
    'view_customers', 'create_customers', 'edit_customers',
    'view_inventory', 'view_designs', 'view_tasks',
  ],
  cutting_ops: [
    'view_production', 'manage_production', 'assign_machines',
    'view_orders', 'view_tasks',
  ],
  printing_ops: [
    'view_production', 'manage_production', 'assign_machines',
    'view_orders', 'view_tasks',
  ],
  cutting_status: [
    'view_production', 'manage_production',
    'view_orders', 'view_tasks',
  ],
  follow_up: [
    'view_orders', 'edit_orders',
    'view_customers', 'view_tasks', 'manage_tasks',
    'view_production', 'dispatch_production', 'view_designs',
  ],
  worker: [
    'view_production', 'view_orders', 'view_tasks', 'view_designs',
  ],
  customer: [],
  distributor: [],
};

export const WORKSHOP_ROLES = [
  { name: 'Admin', name_ar: 'مدير النظام', slug: 'admin', is_system: true },
  { name: 'Manager', name_ar: 'مدير', slug: 'manager', is_system: true },
  { name: 'Designer', name_ar: 'مصمم', slug: 'designer', is_system: true },
  { name: 'Accountant', name_ar: 'محاسب', slug: 'accountant', is_system: true },
  { name: 'Sales', name_ar: 'مسؤول البيع', slug: 'sales', is_system: true },
  { name: 'Seller', name_ar: 'بائع', slug: 'seller', is_system: true },
  { name: 'Cutting Ops', name_ar: 'مسؤول آلات القطع', slug: 'cutting_ops', is_system: true },
  { name: 'Printing Ops', name_ar: 'مسؤول آلات الطباعة', slug: 'printing_ops', is_system: true },
  { name: 'Cutting Status', name_ar: 'مسؤول حالة القص', slug: 'cutting_status', is_system: true },
  { name: 'Follow Up', name_ar: 'مسؤول المتابعة', slug: 'follow_up', is_system: true },
  { name: 'Worker', name_ar: 'عامل', slug: 'worker', is_system: true },
  { name: 'Distributor', name_ar: 'موزع', slug: 'distributor', is_system: true },
  { name: 'Customer', name_ar: 'عميل', slug: 'customer', is_system: true },
] as const;
