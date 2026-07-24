import { useQuery } from '@tanstack/react-query';
import { orderRepository } from '../repository/order.repository';
import { queryKeys } from '../../../core/queryKeys';
import type { Filter, Sort, Pagination } from '../../../core/types/common';

export const useOrdersList = (
  filter?: Filter,
  sort?: Sort,
  pagination?: Partial<Pagination>
) => {
  return useQuery({
    queryKey: queryKeys.orders.list(filter),
    queryFn: () => orderRepository.findAll(filter, sort, pagination),
    // Optional: Keep previous data while fetching new pages for smoother UI
    placeholderData: (previousData) => previousData,
  });
};
