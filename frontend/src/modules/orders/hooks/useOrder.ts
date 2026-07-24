import { useQuery } from '@tanstack/react-query';
import { orderRepository } from '../repository/order.repository';
import { queryKeys } from '../../../core/queryKeys';

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => orderRepository.findById(id),
    enabled: !!id, // Only run if ID exists
  });
};
