import { useQuery } from '@tanstack/react-query';
import { publicRepository } from '../repository/public.repository';
import { ProductFilters } from '../schemas/public.types';

export const publicKeys = {
  all: ['public'] as const,
  categories: () => [...publicKeys.all, 'categories'] as const,
  featuredProducts: (limit: number) => [...publicKeys.all, 'products', 'featured', limit] as const,
  products: (filters: ProductFilters) => [...publicKeys.all, 'products', filters] as const,
  productDetail: (id: string) => [...publicKeys.all, 'products', 'detail', id] as const,
  featuredProjects: (limit: number) => [...publicKeys.all, 'projects', 'featured', limit] as const,
  projects: (page: number, limit: number) => [...publicKeys.all, 'projects', page, limit] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: publicKeys.categories(),
    queryFn: () => publicRepository.getCategories(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useFeaturedProducts(limit: number = 8) {
  return useQuery({
    queryKey: publicKeys.featuredProducts(limit),
    queryFn: () => publicRepository.getFeaturedProducts(limit),
  });
}

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: publicKeys.products(filters),
    queryFn: () => publicRepository.getProducts(filters),
    placeholderData: (previousData) => previousData, // keep previous data while fetching new page
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: publicKeys.productDetail(id),
    queryFn: () => publicRepository.getProductById(id),
    enabled: !!id,
  });
}

export function useFeaturedProjects(limit: number = 6) {
  return useQuery({
    queryKey: publicKeys.featuredProjects(limit),
    queryFn: () => publicRepository.getFeaturedProjects(limit),
  });
}

export function useProjects(page: number = 1, limit: number = 12) {
  return useQuery({
    queryKey: publicKeys.projects(page, limit),
    queryFn: () => publicRepository.getProjects(page, limit),
    placeholderData: (previousData) => previousData,
  });
}
