import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderRepository } from '../repository/order.repository';
import { queryKeys } from '../../../core/queryKeys';
import type { Order } from '../types';
import { EventBus } from '../../../core/events/EventBus';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => orderRepository.create(data),
    onSuccess: (newOrder) => {
      // Invalidate the orders list cache to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      
      // Dispatch global event
      EventBus.emit('OrderCreated', newOrder);
    },
  });
};
