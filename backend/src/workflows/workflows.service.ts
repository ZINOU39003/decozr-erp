import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const DEFAULT_WORKFLOW_STAGES = [
  { slug: 'received', name_ar: 'استلام', sort_order: 1, color: '#94a3b8', is_terminal: false },
  { slug: 'pending_review', name_ar: 'مراجعة', sort_order: 2, color: '#60a5fa', is_terminal: false },
  { slug: 'pending_approval', name_ar: 'موافقة', sort_order: 3, color: '#a78bfa', is_terminal: false },
  { slug: 'in_design', name_ar: 'تصميم', sort_order: 4, color: '#f472b6', is_terminal: false },
  { slug: 'in_cutting', name_ar: 'قص', sort_order: 5, color: '#fb923c', is_terminal: false },
  { slug: 'in_printing', name_ar: 'طباعة', sort_order: 6, color: '#fbbf24', is_terminal: false },
  { slug: 'in_assembly', name_ar: 'تجميع', sort_order: 7, color: '#34d399', is_terminal: false },
  { slug: 'ready', name_ar: 'جاهز', sort_order: 8, color: '#22d3ee', is_terminal: false },
  { slug: 'delivered', name_ar: 'تسليم', sort_order: 9, color: '#4ade80', is_terminal: true },
];

@Injectable()
export class WorkflowsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaultTemplate();
  }

  async ensureDefaultTemplate() {
    const existing = await this.prisma.workflowTemplate.findUnique({
      where: { slug: 'default_workflow' },
    });
    if (existing) return existing;

    return this.prisma.workflowTemplate.create({
      data: {
        name_ar: 'مسار الإنتاج الافتراضي',
        slug: 'default_workflow',
        is_default: true,
        stages: {
          create: DEFAULT_WORKFLOW_STAGES,
        },
      },
      include: { stages: { orderBy: { sort_order: 'asc' } } },
    });
  }

  async findAllTemplates() {
    return this.prisma.workflowTemplate.findMany({
      include: { stages: { orderBy: { sort_order: 'asc' } } },
      orderBy: { name_ar: 'asc' },
    });
  }

  async findTemplateById(id: string) {
    const template = await this.prisma.workflowTemplate.findUnique({
      where: { id },
      include: { stages: { orderBy: { sort_order: 'asc' } } },
    });
    if (!template) throw new NotFoundException('Workflow template not found');
    return template;
  }

  async createTemplate(data: { name_ar: string; slug: string; is_default?: boolean }) {
    return this.prisma.workflowTemplate.create({
      data: {
        name_ar: data.name_ar,
        slug: data.slug,
        is_default: data.is_default ?? false,
      },
      include: { stages: true },
    });
  }

  async updateTemplate(id: string, data: Partial<{ name_ar: string; is_default: boolean }>) {
    await this.findTemplateById(id);
    return this.prisma.workflowTemplate.update({
      where: { id },
      data,
      include: { stages: { orderBy: { sort_order: 'asc' } } },
    });
  }

  async deleteTemplate(id: string) {
    await this.findTemplateById(id);
    return this.prisma.workflowTemplate.delete({ where: { id } });
  }

  async createStage(templateId: string, data: {
    slug: string;
    name_ar: string;
    sort_order?: number;
    color?: string;
    is_terminal?: boolean;
  }) {
    await this.findTemplateById(templateId);
    return this.prisma.workflowStage.create({
      data: {
        template_id: templateId,
        slug: data.slug,
        name_ar: data.name_ar,
        sort_order: data.sort_order ?? 0,
        color: data.color,
        is_terminal: data.is_terminal ?? false,
      },
    });
  }

  async updateStage(id: string, data: Partial<{
    slug: string;
    name_ar: string;
    sort_order: number;
    color: string;
    is_terminal: boolean;
  }>) {
    const stage = await this.prisma.workflowStage.findUnique({ where: { id } });
    if (!stage) throw new NotFoundException('Workflow stage not found');
    return this.prisma.workflowStage.update({ where: { id }, data });
  }

  async deleteStage(id: string) {
    const stage = await this.prisma.workflowStage.findUnique({ where: { id } });
    if (!stage) throw new NotFoundException('Workflow stage not found');
    return this.prisma.workflowStage.delete({ where: { id } });
  }

  async linkDesign(designId: string, templateId: string) {
    return this.prisma.designWorkflow.upsert({
      where: {
        design_id_template_id: { design_id: designId, template_id: templateId },
      },
      update: {},
      create: { design_id: designId, template_id: templateId },
    });
  }

  async unlinkDesign(designId: string, templateId: string) {
    return this.prisma.designWorkflow.delete({
      where: {
        design_id_template_id: { design_id: designId, template_id: templateId },
      },
    });
  }
}
