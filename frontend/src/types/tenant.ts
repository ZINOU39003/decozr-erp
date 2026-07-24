export interface TenantEntity {
  organizationId: string;
  branchId: string;
  departmentId?: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  currency: string;
  timezone: string;
  createdAt: string;
}

export interface Department {
  id: string;
  branchId: string;
  name: string;
}

export interface Warehouse {
  id: string;
  branchId: string;
  name: string;
  location: string;
}
