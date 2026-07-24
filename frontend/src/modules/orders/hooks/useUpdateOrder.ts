import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderRepository } from '../repository/order.repository';
import { queryKeys } from '../../../core/queryKeys';
import type { Order } from '../types';
import { EventBus } from '../../../core/events/EventBus';
import type { ID } from '../../../core/types/common';

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: ID; data: Partial<Order> }) => orderRepository.update(id, data),
    onSuccess: (updatedOrder) => {
      // Invalidate both the list and the specific order detail
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(updatedOrder.id as string) });
      
      // Dispatch global event
      EventBus.emit('OrderUpdated', updatedOrder);
    },
  });
};
