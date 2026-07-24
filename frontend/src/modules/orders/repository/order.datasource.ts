import type { PaginatedResponse, Pagination, Filter, Sort, ID } from '../../../core/types/common';
import type { Order } from '../types';

export interface OrderDataSource {
  findAll(filter?: Filter, sort?: Sort, pagination?: Partial<Pagination>): Promise<PaginatedResponse<Order>>;
  findById(id: ID): Promise<Order | null>;
  create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  update(id: ID, data: Partial<Order>): Promise<Order>;
  delete(id: ID): Promise<boolean>;
}
