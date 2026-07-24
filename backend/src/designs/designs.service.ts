import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';

@Injectable()
export class DesignsService {
  constructor(private prisma: PrismaService) {}

  // --- Categories ---

  async findAllCategories() {
    return this.prisma.designCategory.findMany({
      include: { children: true },
      orderBy: { sort_order: 'asc' },
    });
  }

  async findCategoryById(id: string) {
    const category = await this.prisma.designCategory.findUnique({
      where: { id },
      include: { children: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async createCategory(data: any) {
    const name = String(data.name_ar || 'تصنيف جديد');
    const slug = data.slug || (name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now());
    return this.prisma.designCategory.create({
      data: {
        name_ar: name,
        slug: slug,
        is_active: true,
      },
    });
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    return this.prisma.designCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.designCategory.delete({
      where: { id },
    });
  }

  // --- Designs ---

  async findAllDesigns(filters?: {
    catalog?: boolean | string;
    library_status?: string;
    owner_customer_id?: string;
  }) {
    const where: any = { deleted_at: null };
    const isCatalog = filters?.catalog === true || filters?.catalog === 'true';

    if (isCatalog) {
      where.library_status = 'public';
    } else if (filters?.library_status) {
      where.library_status = filters.library_status;
    }

    if (filters?.owner_customer_id) {
      where.owner_customer_id = filters.owner_customer_id;
    }

    // Catalog needs a light payload; admin list can include fuller relations
    if (isCatalog) {
      return this.prisma.design.findMany({
        where,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          code: true,
          name_ar: true,
          description_ar: true,
          image_url: true,
          gallery_images: true,
          library_status: true,
          category_id: true,
          category: { select: { id: true, name_ar: true } },
          versions: {
            where: { deletedAt: null },
            take: 1,
            orderBy: { version_number: 'desc' },
            select: {
              id: true,
              version_number: true,
              priceRules: {
                take: 1,
                select: { base_price: true },
              },
            },
          },
        },
      });
    }

    return this.prisma.design.findMany({
      where,
      include: {
        category: true,
        versions: true,
        ownerCustomer: true,
      },
    });
  }

  async findDesignById(id: string) {
    const design = await this.prisma.design.findUnique({
      where: { id },
      include: {
        category: true,
        versions: {
          include: {
            customizationOptions: true,
            bomMaterials: { include: { material: true } },
            bomLabor: { include: { machine: true } },
            priceRules: true,
          },
        },
      },
    });
    if (!design) throw new NotFoundException('Design not found');
    return design;
  }

  async createDesign(userId: string, data: any) {
    let cat = null;
    if (data.category_id && !String(data.category_id).startsWith('cat-')) {
      cat = await this.prisma.designCategory.findUnique({
        where: { id: data.category_id },
      });
    }

    if (!cat) {
      cat = await this.prisma.designCategory.findFirst();
      if (!cat) {
        cat = await this.prisma.designCategory.create({
          data: {
            name_ar: 'عام',
            slug: 'general-' + Date.now(),
          },
        });
      }
    }

    let creator = userId
      ? await this.prisma.user.findUnique({ where: { id: userId } })
      : null;
    if (!creator) {
      creator = await this.prisma.user.findUnique({
        where: { email: 'admin@decozr.local' },
      });
    }
    if (!creator) {
      creator = await this.prisma.user.findFirst();
    }
    if (!creator) {
      throw new BadRequestException('لا يوجد مستخدم لإنشاء التصميم — سجّل الدخول أولاً');
    }

    const gallery = Array.isArray(data.gallery_images)
      ? data.gallery_images.slice(0, 8)
      : data.image_url
        ? [data.image_url]
        : [];

    const design = await this.prisma.design.create({
      data: {
        code: data.code || `DSN-${Math.floor(1000 + Math.random() * 9000)}`,
        name_ar: data.name_ar || 'تصميم جديد',
        description_ar: data.description_ar || data.description || null,
        category_id: cat.id,
        created_by: creator.id,
        library_status: data.library_status || 'public',
        visibility: data.visibility || 'public',
        sell_policy: data.sell_policy || 'everyone',
        owner_type: data.owner_type || 'workshop',
        image_url: data.image_url || gallery[0] || null,
        gallery_images: gallery,
      },
    });

    // Create initial version + optional retail price
    const version = await this.prisma.designVersion.create({
      data: {
        design_id: design.id,
        version_number: 1,
        status: 'active',
        created_by: creator.id,
        changelog: 'إصدار أولي',
      },
    });

    await this.prisma.design.update({
      where: { id: design.id },
      data: { current_version_id: version.id },
    });

    const retailPrice = Number(data.retail_price);
    if (!Number.isNaN(retailPrice) && retailPrice > 0) {
      const retailList = await this.prisma.priceList.findUnique({
        where: { list_type: 'retail' },
      });
      if (retailList) {
        await this.prisma.designPriceRule.create({
          data: {
            design_version_id: version.id,
            price_list_id: retailList.id,
            base_price: retailPrice,
            margin_pct: 25,
          },
        });
      }
    }

    const wholesalePrice = Number(data.wholesale_price);
    if (!Number.isNaN(wholesalePrice) && wholesalePrice > 0) {
      const wholesaleList = await this.prisma.priceList.findUnique({
        where: { list_type: 'wholesale' },
      });
      if (wholesaleList) {
        await this.prisma.designPriceRule.create({
          data: {
            design_version_id: version.id,
            price_list_id: wholesaleList.id,
            base_price: wholesalePrice,
            margin_pct: 20,
          },
        });
      }
    }

    return this.findDesignById(design.id);
  }

  async updateDesign(id: string, data: any) {
    const patch: any = {};
    if (data.name_ar != null) patch.name_ar = data.name_ar;
    if (data.code != null) patch.code = data.code;
    if (data.description_ar != null || data.description != null) {
      patch.description_ar = data.description_ar ?? data.description;
    }
    if (data.category_id) {
      const cat = await this.prisma.designCategory.findUnique({
        where: { id: data.category_id },
      });
      if (cat) patch.category_id = cat.id;
    }
    if (data.library_status != null) patch.library_status = data.library_status;
    if (data.visibility != null) patch.visibility = data.visibility;
    if (data.sell_policy != null) patch.sell_policy = data.sell_policy;
    if (data.image_url != null) patch.image_url = data.image_url;
    if (data.gallery_images != null) {
      const gallery = Array.isArray(data.gallery_images)
        ? data.gallery_images.slice(0, 8)
        : [];
      patch.gallery_images = gallery;
      if (!patch.image_url && gallery[0]) patch.image_url = gallery[0];
    }

    await this.prisma.design.update({
      where: { id },
      data: patch,
    });

    return this.findDesignById(id);
  }

  async deleteDesign(id: string) {
    // Soft delete via deleted_at (from Prisma schema)
    return this.prisma.design.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  // --- Calculations ---

  async calculateBom(data: { design_version_id: string; options: any }) {
    if (!data?.design_version_id) {
      throw new BadRequestException('design_version_id مطلوب');
    }

    const version = await this.prisma.designVersion.findUnique({
      where: { id: data.design_version_id },
      include: {
        bomMaterials: { include: { material: true } },
        bomLabor: { include: { machine: true } },
      },
    });

    if (!version) throw new NotFoundException('Design version not found');

    // A simple evaluator for the conditional BOM
    const evaluateCondition = (expr: string | null, options: any) => {
      if (!expr) return true;
      try {
        // Warning: in production use a safe expression evaluator
        // Using Function constructor for MVP simplicity
        const keys = Object.keys(options);
        const values = Object.values(options);
        const evaluator = new Function(...keys, `return ${expr.replace(/options\./g, '')}`);
        return evaluator(...values);
      } catch (e) {
        return false;
      }
    };

    const materials = version.bomMaterials.filter((m) => evaluateCondition(m.condition_expr, data.options));
    const labor = version.bomLabor.filter((l) => evaluateCondition(l.condition_expr, data.options));

    return { materials, labor };
  }

  async calculatePrice(data: { design_version_id: string; options: any; price_list_id: string }) {
    const options = data.options || {};
    const bom = await this.calculateBom({
      design_version_id: data.design_version_id,
      options,
    });

    const priceRule = await this.prisma.designPriceRule.findUnique({
      where: {
        design_version_id_price_list_id: {
          design_version_id: data.design_version_id,
          price_list_id: data.price_list_id,
        },
      },
    });

    // Materials cost from BOM (qty * unit_cost * waste)
    let materials_cost = 0;
    for (const m of bom.materials) {
      const wasteFactor = 1 + (m.waste_pct || 0) / 100;
      materials_cost += m.quantity * (m.material?.unit_cost || 0) * wasteFactor;
    }

    // Labor / machine cost from BOM minutes * cost_per_minute
    let labor_cost = 0;
    let machine_cost = 0;
    for (const l of bom.labor) {
      const rate = l.machine?.cost_per_minute || 0;
      const cost = l.minutes * rate;
      if (l.machine_id) {
        machine_cost += cost;
      } else {
        labor_cost += cost;
      }
    }

    // Area-based pricing when size/width/height present
    let area_cost = 0;
    let cut_cost = 0;
    const width = this.readOptionNumber(options, ['width', 'width_cm', 'عرض']);
    const height = this.readOptionNumber(options, ['height', 'height_cm', 'ارتفاع']);
    const size = this.readOptionNumber(options, ['size', 'size_cm', 'مقاس']);

    let areaSqm = 0;
    if (width && height) {
      areaSqm = (width * height) / 10000; // cm² → m²
    } else if (size) {
      areaSqm = (size * size) / 10000;
    }

    if (priceRule?.price_per_sqm && areaSqm > 0) {
      area_cost = areaSqm * priceRule.price_per_sqm;
    }

    if (priceRule?.price_per_cut_meter && width && height) {
      const perimeterM = (2 * (width + height)) / 100;
      cut_cost = perimeterM * priceRule.price_per_cut_meter;
    }

    const print_cost = priceRule?.print_cost || 0;

    // Option modifiers (legacy additive)
    const modifiersApplied: Array<{ option: string; value: any; modifier: number }> = [];
    let modifiers_total = 0;
    const optionModifiers = (priceRule?.option_modifiers || {}) as Record<string, any>;
    for (const [key, value] of Object.entries(options)) {
      if (optionModifiers[key] && optionModifiers[key][String(value)] != null) {
        const mod = Number(optionModifiers[key][String(value)]) || 0;
        modifiers_total += mod;
        modifiersApplied.push({ option: key, value, modifier: mod });
      }
    }

    const subtotal =
      materials_cost +
      labor_cost +
      machine_cost +
      area_cost +
      cut_cost +
      print_cost +
      modifiers_total +
      (priceRule?.base_price || 0);

    const margin_pct = priceRule?.margin_pct ?? 25;
    const margin = subtotal * (margin_pct / 100);
    const total_price = Math.round((subtotal + margin) * 100) / 100;

    return {
      materials_cost: round2(materials_cost),
      labor_cost: round2(labor_cost),
      machine_cost: round2(machine_cost),
      area_cost: round2(area_cost),
      cut_cost: round2(cut_cost),
      print_cost: round2(print_cost),
      base_price: priceRule?.base_price || 0,
      modifiers_applied: modifiersApplied,
      margin_pct,
      margin: round2(margin),
      total_price,
    };
  }

  private readOptionNumber(options: Record<string, any>, keys: string[]): number | null {
    for (const key of keys) {
      if (options[key] != null && options[key] !== '') {
        const n = parseFloat(String(options[key]));
        if (!Number.isNaN(n)) return n;
      }
    }
    return null;
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
