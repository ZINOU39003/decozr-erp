// DecoZR Enterprise Mock Database Generator
// Generates relational mock data for the entire ERP system.

const generateId = (prefix: string, index: number) => `${prefix}-${String(index).padStart(4, '0')}`;
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
const randomPhone = () => `055${randomInt(1000000, 9999999)}`;

// --- Customers (300) ---
const customerNames = ['مؤسسة الإبداع', 'شركة الأفق', 'وكالة الأهرام', 'مدارس الرواد', 'الشركة الهندسية', 'مطاعم النور', 'مستشفى الشفاء', 'فندق ريتز', 'مركز التدريب', 'مجموعة العز'];
export let mockCustomers = Array.from({ length: 300 }).map((_, i) => ({
  id: generateId('CUST', i + 1),
  name_ar: `${randomItem(customerNames)} ${i + 1}`,
  phone: randomPhone(),
  email: `info${i}@example.com`,
  balance: randomItem([0, 0, 0, 15000, -5000, 45000, -12000]),
  type: randomItem(['شركة', 'فرد', 'حكومي']),
  status: randomItem(['نشط', 'نشط', 'نشط', 'محظور']),
  created_at: randomDate(new Date(2023, 0, 1), new Date()),
}));

// --- Suppliers (80) ---
const supplierNames = ['مورد الأكريليك', 'الشركة الصينية', 'مصنع الخشب', 'مورد الأحبار', 'شركة الزجاج', 'مورد الليزر'];
export let mockSuppliers = Array.from({ length: 80 }).map((_, i) => ({
  id: generateId('SUP', i + 1),
  name_ar: `${randomItem(supplierNames)} ${i + 1}`,
  phone: randomPhone(),
  balance: randomItem([0, 0, -25000, 50000]),
  category: randomItem(['مواد خام', 'آلات', 'صيانة', 'أدوات مكتبية']),
}));

// --- Materials (250) ---
const materialTypes = ['أكريليك شفاف', 'أكريليك ملون', 'MDF', 'زجاج', 'أحبار UV', 'معدن'];
export let mockMaterials = Array.from({ length: 250 }).map((_, i) => ({
  id: generateId('MAT', i + 1),
  name_ar: `${randomItem(materialTypes)} ${randomInt(2, 10)}mm - ${i + 1}`,
  sku: `SKU-${randomInt(1000, 9999)}`,
  quantity: randomInt(0, 500),
  min_quantity: randomInt(10, 50),
  unit: randomItem(['لوح', 'لتر', 'قطعة', 'متر']),
  cost_price: randomInt(1000, 15000),
  supplier_id: randomItem(mockSuppliers).id,
}));

// --- Designs (250) ---
const designCategories = ['دروع تذكارية', 'لوحات إعلانية', 'أختام', 'ميداليات', 'مجسمات 3D'];
export let mockDesigns = Array.from({ length: 250 }).map((_, i) => ({
  id: generateId('DSN', i + 1),
  name_ar: `تصميم ${randomItem(designCategories)} ${i + 1}`,
  category: randomItem(designCategories),
  file_url: 'https://placehold.co/400', // Mock image
  status: randomItem(['معتمد', 'قيد المراجعة', 'مسودة']),
  created_at: randomDate(new Date(2023, 0, 1), new Date()),
}));

// --- Machines (75) ---
const machineTypes = ['Laser CO2', 'UV Printer', 'CNC Router', 'Fiber Laser'];
export let mockMachines = Array.from({ length: 75 }).map((_, i) => ({
  id: generateId('MAC', i + 1),
  name: `${randomItem(machineTypes)} Model X${i}`,
  status: randomItem(['متاحة', 'متاحة', 'متاحة', 'تعمل', 'صيانة']),
  oee: randomInt(60, 98),
  maintenance_due: randomDate(new Date(), new Date(2027, 0, 1)),
}));

// --- Employees (150) ---
const employeeRoles = ['مشغل آلة', 'مصمم', 'مندوب مبيعات', 'مدير إنتاج', 'محاسب'];
export let mockEmployees = Array.from({ length: 150 }).map((_, i) => ({
  id: generateId('EMP', i + 1),
  name_ar: `موظف ${i + 1}`,
  role: randomItem(employeeRoles),
  department: randomItem(['الإنتاج', 'المبيعات', 'الإدارة', 'التصميم']),
  status: randomItem(['حاضر', 'غائب', 'إجازة']),
  performance_score: randomInt(70, 100),
}));

// --- Orders (800) ---
const orderStatuses = ['مسودة', 'مؤكد', 'تصميم', 'إنتاج', 'تجميع', 'جودة', 'جاهز', 'مُسلم', 'مغلق', 'ملغى'];
export let mockOrders = Array.from({ length: 800 }).map((_, i) => {
  const customer = randomItem(mockCustomers);
  const total = randomInt(5000, 500000);
  const paid = randomItem([0, total * 0.5, total]);
  return {
    id: generateId('ORD', i + 1),
    customer_id: customer.id,
    customer_name: customer.name_ar,
    design_id: randomItem(mockDesigns).id,
    status: randomItem(orderStatuses),
    priority: randomItem(['عادية', 'عاجلة', 'قصوى']),
    total_amount: total,
    paid_amount: paid,
    remaining_amount: total - paid,
    progress: randomInt(0, 100),
    delivery_date: randomDate(new Date(), new Date(2026, 11, 31)),
    created_at: randomDate(new Date(2023, 0, 1), new Date()),
    sales_rep: randomItem(mockEmployees.filter(e => e.role === 'مندوب مبيعات')).name_ar,
  };
});

// --- Invoices (450) ---
export let mockInvoices = Array.from({ length: 450 }).map((_, i) => {
  const order = randomItem(mockOrders);
  return {
    id: generateId('INV', i + 1),
    order_id: order.id,
    customer_id: order.customer_id,
    customer_name: order.customer_name,
    amount: order.total_amount,
    status: order.remaining_amount === 0 ? 'مدفوعة' : 'غير مدفوعة',
    issue_date: order.created_at,
    due_date: order.delivery_date,
  };
});

// --- Payments (900) ---
export let mockPayments = Array.from({ length: 900 }).map((_, i) => {
  const invoice = randomItem(mockInvoices);
  return {
    id: generateId('PAY', i + 1),
    invoice_id: invoice.id,
    customer_id: invoice.customer_id,
    amount: randomInt(1000, invoice.amount),
    payment_method: randomItem(['نقدي', 'تحويل بنكي', 'شيك']),
    payment_date: randomDate(new Date(invoice.issue_date), new Date()),
    status: 'مكتمل',
  };
});

// --- Portal Data ---

// Portal Notifications (200)
export let mockPortalNotifications = Array.from({ length: 200 }).map((_, i) => ({
  id: generateId('NOTIF', i + 1),
  customer_id: randomItem(mockCustomers).id,
  title: randomItem(['تم تحديث حالة الطلب', 'فاتورة جديدة بانتظار الدفع', 'تم اعتماد التصميم', 'مرحلة إنتاج جديدة']),
  message: `هذا إشعار تلقائي رقم ${i + 1} بخصوص آخر التحديثات في حسابك.`,
  is_read: randomItem([true, false, true, true]),
  created_at: randomDate(new Date(2023, 0, 1), new Date()),
  type: randomItem(['order', 'invoice', 'design', 'system']),
}));

// Portal Files (150)
export let mockPortalFiles = Array.from({ length: 150 }).map((_, i) => {
  const order = randomItem(mockOrders);
  return {
    id: generateId('FILE', i + 1),
    customer_id: order.customer_id,
    order_id: order.id,
    name: `ملف_مشروع_${i + 1}.${randomItem(['pdf', 'dxf', 'png', 'ai'])}`,
    size: `${randomInt(1, 50)} MB`,
    uploaded_at: randomDate(new Date(order.created_at), new Date()),
    uploaded_by: randomItem(['العميل', 'المصمم']),
  };
});

// Portal Messages (100)
export let mockPortalMessages = Array.from({ length: 100 }).map((_, i) => {
  const order = randomItem(mockOrders);
  const sender = randomItem(['customer', 'support']);
  return {
    id: generateId('MSG', i + 1),
    customer_id: order.customer_id,
    order_id: order.id,
    sender: sender,
    content: sender === 'customer' ? `استفسار بخصوص الطلب ${order.id}، متى سيتم التسليم؟` : `مرحباً، طلبك قيد التنفيذ حالياً.`,
    created_at: randomDate(new Date(order.created_at), new Date()),
    is_read: true,
  };
});

// Portal Tickets (40)
export let mockPortalTickets = Array.from({ length: 40 }).map((_, i) => ({
  id: generateId('TKT', i + 1),
  customer_id: randomItem(mockCustomers).id,
  subject: randomItem(['مشكلة في الدفع', 'تعديل على التصميم', 'تأخير في التسليم', 'استفسار عام']),
  status: randomItem(['مفتوحة', 'قيد المعالجة', 'مغلقة']),
  priority: randomItem(['عادية', 'عاجلة', 'قصوى']),
  created_at: randomDate(new Date(2023, 0, 1), new Date()),
  last_reply: randomDate(new Date(2023, 0, 1), new Date()),
}));

export const getMockStats = () => ({
  totalRevenue: mockPayments.reduce((sum, p) => sum + p.amount, 0),
  totalOrders: mockOrders.length,
  activeOrders: mockOrders.filter(o => o.status !== 'مغلق' && o.status !== 'مُسلم' && o.status !== 'ملغى').length,
  totalCustomers: mockCustomers.length,
  productionEfficiency: 87, // Mock OEE average
});
