import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderRepository } from '../repository/order.repository';
import { queryKeys } from '../../../core/queryKeys';
import { EventBus } from '../../../core/events/EventBus';
import type { ID } from '../../../core/types/common';

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: ID) => orderRepository.delete(id),
    onSuccess: (_, id) => {
      // Invalidate the orders list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      
      // Dispatch global event
      EventBus.emit('OrderDeleted', { id });
    },
  });
};
