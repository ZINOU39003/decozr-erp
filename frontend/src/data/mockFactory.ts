import type { TenantEntity } from '../types/tenant';

// Common Audit Fields
export interface AuditEntity extends TenantEntity {
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

const generateId = (prefix: string, index: number) => `${prefix}-${String(index).padStart(4, '0')}`;
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

const DEFAULT_ORG = 'ORG-0001';
const DEFAULT_BRANCH = 'BRN-0001';
const DEFAULT_USER = 'EMP-0001';

export const createAuditData = (): AuditEntity => {
  const date = new Date(Date.now() - randomInt(0, 31536000000)).toISOString();
  return {
    organizationId: DEFAULT_ORG,
    branchId: DEFAULT_BRANCH,
    createdBy: DEFAULT_USER,
    updatedBy: DEFAULT_USER,
    createdAt: date,
    updatedAt: date
  };
};

// Factory function to lazily generate specific entities on demand
// so we don't blow up the browser memory with 1000s of objects at init.

// Customers
export const generateCustomers = (count: number, startIndex = 1) => {
  const names = ['أحمد محمد', 'شركة الأفق', 'مؤسسة الرواد', 'سارة علي', 'مجموعة التطوير', 'خالد عبدالله'];
  return Array.from({ length: count }).map((_, i) => ({
    id: generateId('CUST', startIndex + i),
    name: `${randomItem(names)} ${startIndex + i}`,
    email: `customer${startIndex + i}@example.com`,
    phone: `055${randomInt(1000000, 9999999)}`,
    balance: randomItem([0, 1500, -500, 10000]),
    ...createAuditData()
  }));
};

// Orders
export const generateOrders = (count: number, startIndex = 1) => {
  const statuses = ['new', 'quotation', 'approved', 'design', 'material_prep', 'laser_cutting', 'printing', 'assembly', 'qc', 'packaging', 'ready', 'delivered'];
  const priorities = ['low', 'medium', 'high'];
  return Array.from({ length: count }).map((_, i) => ({
    id: generateId('ORD', startIndex + i),
    order_number: `ORD-2026-${String(startIndex + i).padStart(4, '0')}`,
    customer: { id: generateId('CUST', randomInt(1, 500)), name: `العميل ${randomInt(1, 500)}` },
    design: { id: `DES-${randomInt(1, 100)}`, name: `تصميم لوحة ${randomInt(1, 100)}` },
    totalAmount: randomInt(500, 20000),
    revenue: randomInt(500, 20000),
    remaining: randomItem([0, randomInt(100, 5000)]),
    status: randomItem(statuses),
    priority: randomItem(priorities),
    progress: randomInt(0, 100),
    assigned_employees: Array.from({ length: randomInt(0, 3) }).map((_, j) => ({ id: `EMP-${j}`, name: `موظف ${j}` })),
    assigned_machines: Array.from({ length: randomInt(0, 2) }).map((_, j) => ({ id: `MAC-${j}`, name: `آلة ${j}` })),
    delivery_date: new Date(Date.now() + randomInt(-7, 14) * 86400000).toISOString(),
    ...createAuditData()
  }));
};

// Inventory Items
export const generateInventory = (count: number, startIndex = 1) => {
  const categories = ['أخشاب', 'بلاستيكات', 'إكسسوارات', 'دهانات', 'مواد تغليف'];
  return Array.from({ length: count }).map((_, i) => ({
    id: generateId('INV', startIndex + i),
    name: `مادة خام ${startIndex + i}`,
    category: randomItem(categories),
    stock: randomInt(0, 500),
    minStock: randomInt(20, 100),
    unit: randomItem(['متر', 'لوح', 'علبة', 'كغ']),
    ...createAuditData()
  }));
};

// Tasks
export const generateTasks = (count: number, startIndex = 1) => {
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
  return Array.from({ length: count }).map((_, i) => ({
    id: generateId('TSK', startIndex + i),
    title: `مهمة ${startIndex + i} - تنفيذ العملية المطلوبة`,
    assigneeId: generateId('EMP', randomInt(1, 100)),
    priority: randomItem(priorities),
    status: randomItem(statuses),
    ...createAuditData()
  }));
};

// Database Store for Lazy Loading
export class MockDatabase {
  private static customers = null;
  private static orders = null;
  private static inventory = null;
  private static tasks = null;

  static getCustomers() {
    if (!this.customers) this.customers = generateCustomers(500);
    return this.customers;
  }

  static addCustomer(customer: any) {
    if (!this.customers) this.customers = generateCustomers(500);
    this.customers = [customer, ...this.customers];
    return customer;
  }

  static updateCustomer(id: string, updates: any) {
    if (!this.customers) this.customers = generateCustomers(500);
    this.customers = this.customers.map(c => c.id === id ? { ...c, ...updates } : c);
  }

  static deleteCustomer(id: string) {
    if (!this.customers) this.customers = generateCustomers(500);
    this.customers = this.customers.filter(c => c.id !== id);
  }

  static getOrders() {
    if (!this.orders) this.orders = generateOrders(1000);
    return this.orders;
  }

  static getInventory() {
    if (!this.inventory) this.inventory = generateInventory(2000);
    return this.inventory;
  }

  static getTasks() {
    if (!this.tasks) this.tasks = generateTasks(500);
    return this.tasks;
  }
}
