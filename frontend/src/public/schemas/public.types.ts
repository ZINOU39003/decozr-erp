export type ID = string;

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export interface Product {
  id: ID;
  name: string;
  slug: string;
  categoryId: ID;
  categoryName: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  materials: string[];
  colors: { name: string; hex: string }[];
  dimensions: string;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  features: string[];
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface Project {
  id: ID;
  title: string;
  slug: string;
  category: string;
  description: string;
  client: string;
  location: string;
  completionDate: string;
  images: string[];
  beforeImage?: string;
  afterImage?: string;
  features: string[];
  isFeatured?: boolean;
}

export interface Review {
  id: ID;
  author: string;
  rating: number;
  date: string;
  content: string;
  productName?: string;
}

export interface Service {
  id: ID;
  title: string;
  icon: string; // lucide icon name
  description: string;
  features: string[];
}

export interface FAQ {
  id: ID;
  question: string;
  answer: string;
  category: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  category?: ID;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  material?: string;
  color?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
}
