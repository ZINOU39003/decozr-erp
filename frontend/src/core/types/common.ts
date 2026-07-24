export type ID = string | number;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

export interface Filter {
  [key: string]: string | number | boolean | null | undefined | string[] | number[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    pagination: Pagination;
  };
}

export interface Entity {
  id: ID;
}

export interface AuditEntity extends Entity {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}
