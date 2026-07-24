// This file re-exports types inferred from Zod schemas for the orders module
export type { Order, OrderItem } from '../schemas/order.schema';
export type OrderStatus = 'PENDING' | 'APPROVED' | 'IN_PRODUCTION' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED' | string;
