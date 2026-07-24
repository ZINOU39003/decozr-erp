import type { Filter } from './types/common';

export const queryKeys = {
  orders: {
    all: ['orders'] as const,
    list: (filters?: Filter) => ['orders', 'list', filters] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (filters?: Filter) => ['customers', 'list', filters] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    list: (filters?: Filter) => ['inventory', 'list', filters] as const,
    detail: (id: string) => ['inventory', 'detail', id] as const,
  },
  machines: {
    all: ['machines'] as const,
    list: (filters?: Filter) => ['machines', 'list', filters] as const,
    detail: (id: string) => ['machines', 'detail', id] as const,
  },
  finance: {
    invoices: {
      all: ['invoices'] as const,
      list: (filters?: Filter) => ['invoices', 'list', filters] as const,
      detail: (id: string) => ['invoices', 'detail', id] as const,
    },
    payments: {
      all: ['payments'] as const,
      list: (filters?: Filter) => ['payments', 'list', filters] as const,
    }
  }
};
