import { getMockDb } from './mockDataFactory';
import { ProductFilters, PaginatedResponse, Product, Category, Project } from '../schemas/public.types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class PublicRepository {
  private async simulateNetwork() {
    await delay(300 + Math.random() * 500); // 300-800ms
  }

  async getCategories(): Promise<Category[]> {
    await this.simulateNetwork();
    return getMockDb().categories;
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    await this.simulateNetwork();
    return getMockDb().products.filter(p => p.isFeatured).slice(0, limit);
  }

  async getProducts(filters: ProductFilters): Promise<PaginatedResponse<Product>> {
    await this.simulateNetwork();
    let data = [...getMockDb().products];

    // Apply filters
    if (filters.category) {
      data = data.filter(p => p.categoryId === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (filters.minPrice !== undefined) {
      data = data.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      data = data.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters.material) {
      data = data.filter(p => p.materials.includes(filters.material!));
    }

    // Sort
    switch (filters.sort) {
      case 'price_asc':
        data.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        data.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // Mock sorting by ID to represent newest
        data.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'popular':
        data.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    
    const paginatedData = data.slice(offset, offset + limit);

    return {
      data: paginatedData,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    await this.simulateNetwork();
    const product = getMockDb().products.find(p => p.id === id);
    return product || null;
  }

  async getFeaturedProjects(limit: number = 6): Promise<Project[]> {
    await this.simulateNetwork();
    return getMockDb().projects.filter(p => p.isFeatured).slice(0, limit);
  }

  async getProjects(page: number = 1, limit: number = 12): Promise<PaginatedResponse<Project>> {
    await this.simulateNetwork();
    const data = getMockDb().projects;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    return {
      data: data.slice(offset, offset + limit),
      meta: { total, page, limit, totalPages }
    };
  }
}

export const publicRepository = new PublicRepository();
