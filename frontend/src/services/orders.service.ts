import { apiClient } from './apiClient';
import { mockOrders } from '../data/mockDatabase';

export const ordersService = {
  getAll: async () => {
    return apiClient.get('/api/orders', mockOrders);
  },
  
  getById: async (id: string) => {
    const order = mockOrders.find(o => o.id === id);
    return apiClient.get(`/api/orders/${id}`, order);
  },

  create: async (data: any) => {
    const newOrder = { id: `ORD-${Math.floor(Math.random() * 10000)}`, ...data };
    return apiClient.post('/api/orders', data, newOrder);
  },

  update: async (id: string, data: any) => {
    return apiClient.put(`/api/orders/${id}`, data, { id, ...data });
  },

  delete: async (id: string) => {
    return apiClient.delete(`/api/orders/${id}`);
  }
};
