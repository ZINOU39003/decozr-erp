import type { PaginatedResponse, Pagination, Filter, Sort, ID } from '../../../core/types/common';
import type { Order } from '../types';
import type { OrderDataSource } from './order.datasource';
import { RestOrderDataSource } from './order.rest.datasource';

export class OrderRepository {
  private dataSource: OrderDataSource;

  constructor(dataSource: OrderDataSource = new RestOrderDataSource()) {
    this.dataSource = dataSource;
  }

  async findAll(filter?: Filter, sort?: Sort, pagination?: Partial<Pagination>): Promise<PaginatedResponse<Order>> {
    return this.dataSource.findAll(filter, sort, pagination);
  }

  async findById(id: ID): Promise<Order | null> {
    return this.dataSource.findById(id);
  }

  async create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    return this.dataSource.create(data);
  }

  async update(id: ID, data: Partial<Order>): Promise<Order> {
    return this.dataSource.update(id, data);
  }

  async delete(id: ID): Promise<boolean> {
    return this.dataSource.delete(id);
  }
}

// Export singleton instance
export const orderRepository = new OrderRepository();
