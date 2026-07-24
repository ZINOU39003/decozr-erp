import { apiClient } from '../../../core/api/client';
import type { PaginatedResponse, Pagination, Filter, Sort, ID } from '../../../core/types/common';
import type { Order } from '../types';
import type { OrderDataSource } from './order.datasource';

interface ApiResult<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ApiPaginatedResult<T> extends ApiResult<T[]> {
  meta: {
    pagination: Pagination;
  }
}
export class RestOrderDataSource implements OrderDataSource {
  private readonly endpoint = '/orders';

  async findAll(filter?: Filter, sort?: Sort, pagination?: Partial<Pagination>): Promise<PaginatedResponse<Order>> {
    const params: Record<string, unknown> = { ...(filter || {}) };
    if (pagination?.page != null) params.page = pagination.page;
    if (pagination?.limit != null) params.limit = pagination.limit;
    if (sort?.field) params.sortBy = sort.field;
    if (sort?.order) params.sortOrder = sort.order;

    const response: any = await apiClient.get(this.endpoint, { params });
    // response is { data, meta }
    return {
      success: true,
      data: response.data || response,
      meta: response.meta
    };
  }

  async findById(id: ID): Promise<Order | null> {
    const response: any = await apiClient.get(`${this.endpoint}/${id}`);
    return response.data || response;
  }

  async create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const response: any = await apiClient.post(this.endpoint, data);
    return response.data || response;
  }

  async update(id: ID, data: Partial<Order>): Promise<Order> {
    const response: any = await apiClient.patch(`${this.endpoint}/${id}`, data);
    return response.data || response;
  }

  async delete(id: ID): Promise<boolean> {
    await apiClient.delete(`${this.endpoint}/${id}`);
    return true;
  }
}
