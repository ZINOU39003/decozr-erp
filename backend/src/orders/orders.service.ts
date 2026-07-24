import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DesignsService } from '../designs/designs.service';
import { MachinesService } from '../machines/machines.service';
import { randomBytes } from 'crypto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private designsService: DesignsService,
    private machinesService: MachinesService,
  ) {}

  private async resolveSystemUserId(preferred?: string) {
    if (preferred) {
      const u = await this.prisma.user.findUnique({ where: { id: preferred } });
      if (u) return u.id;
    }
    const admin = await this.prisma.user.findFirst({
      where: { email: 'admin@decozr.local' },
    });
    if (admin) return admin.id;
    const any = await this.prisma.user.findFirst();
    if (!any) throw new BadRequestException('لا يوجد مستخدم نظام لإنشاء الطلب');
    return any.id;
  }

  private normalizeBomSnapshot(bomCalc: any, quantity: number) {
    const qty = Math.max(1, Number(quantity) || 1);
    const materials = (bomCalc?.materials || []).map((m: any) => ({
      id: m.material_id || m.material?.id,
      material_id: m.material_id || m.material?.id,
      name: m.material?.name_ar || m.name || 'مادة',
      quantity: (Number(m.quantity) || 0) * qty,
      unit: m.material?.unit || m.unit || '',
      waste_pct: m.waste_pct || 0,
    }));
    const labor = (bomCalc?.labor || []).map((l: any) => ({
      id: l.id,
      machine_id: l.machine_id || l.machine?.id || null,
      machine_name: l.machine?.name_ar || null,
      production_stage: l.production_stage || 'cutting',
      minutes: l.minutes ?? l.time_minutes ?? 0,
      time_minutes: l.minutes ?? l.time_minutes ?? 0,
    }));
    return { materials, labor };
  }

  private async resolveVersionId(designId: string, versionId?: string) {
    if (versionId) {
      const v = await this.prisma.designVersion.findUnique({ where: { id: versionId } });
      if (v) return v.id;
    }
    const design = await this.prisma.design.findUnique({ where: { id: designId } });
    if (!design) throw new BadRequestException('تصميم غير صالح');
    if (design.current_version_id) return design.current_version_id;
    const latest = await this.prisma.designVersion.findFirst({
      where: { design_id: designId },
      orderBy: { version_number: 'desc' },
    });
    if (!latest) throw new BadRequestException('لا يوجد إصدار للتصميم');
    return latest.id;
  }

  async findAll(query?: any) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      status,
      customer_id,
    } = query ?? {};
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (customer_id) where.customer_id = customer_id;
    if (search) {
      where.OR = [
        { order_number: { contains: search } },
        { customer: { name_ar: { contains: search } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { customer: true, items: true },
        orderBy: { [sortBy]: sortOrder },
        skip: Number(skip),
        take: Number(limit),
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        creator: true,
        items: {
          include: {
            design: true,
            designVersion: true,
          },
        },
        statusHistory: {
          include: { changer: true },
          orderBy: { changed_at: 'desc' },
        },
        productionTasks: true,
        machineJobs: { include: { machine: true, worker: true } },
        invoices: true,
        payments: true,
        orderFiles: { include: { file: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByQr(token: string) {
    const order = await this.prisma.order.findUnique({
      where: { qr_code_token: token },
      include: {
        customer: true,
        items: true,
        machineJobs: {
          include: { machine: true },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found via QR');
    return order;
  }

  async startJobByQr(token: string, jobId: string) {
    const order = await this.findByQr(token);
    const job = order.machineJobs.find((j) => j.id === jobId);
    if (!job) throw new NotFoundException('المهمة غير تابعة لهذا الطلب');
    const systemUser = await this.resolveSystemUserId();
    return this.machinesService.startJob(jobId, systemUser);
  }

  async completeJobByQr(token: string, jobId: string, actualMinutes?: number) {
    const order = await this.findByQr(token);
    const job = order.machineJobs.find((j) => j.id === jobId);
    if (!job) throw new NotFoundException('المهمة غير تابعة لهذا الطلب');
    const minutes = actualMinutes ?? job.estimated_minutes ?? 0;
    return this.machinesService.completeJob(jobId, minutes);
  }

  async create(userId: string | undefined, data: any) {
    const creatorId = await this.resolveSystemUserId(userId);
    const { customer_id, items, notes } = data;

    if (!customer_id) throw new BadRequestException('customer_id مطلوب');
    if (!items?.length) throw new BadRequestException('يجب إضافة بند واحد على الأقل');

    const customer = await this.prisma.customer.findUnique({ where: { id: customer_id } });
    if (!customer) throw new NotFoundException('Customer not found');

    const price_list_id = data.price_list_id || customer.price_list_id;

    const count = await this.prisma.order.count();
    const order_number = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const qr_code_token = randomBytes(16).toString('hex');

    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      if (!item.design_id) throw new BadRequestException('design_id مطلوب لكل بند');
      const design_version_id = await this.resolveVersionId(item.design_id, item.design_version_id);
      const design = await this.prisma.design.findUnique({ where: { id: item.design_id } });
      const version = await this.prisma.designVersion.findUnique({ where: { id: design_version_id } });

      if (!design || !version) throw new BadRequestException('Invalid design or version');

      const options = item.options || {};
      const quantity = Math.max(1, Number(item.quantity) || 1);

      const priceCalc = await this.designsService.calculatePrice({
        design_version_id,
        price_list_id,
        options,
      });
      const unit_price = priceCalc.total_price;
      const line_total = unit_price * quantity;
      subtotal += line_total;

      const bomCalc = await this.designsService.calculateBom({
        design_version_id,
        options,
      });

      orderItemsData.push({
        design_id: item.design_id,
        design_version_id,
        design_code_snapshot: design.code,
        design_name_snapshot: design.name_ar,
        version_number_snapshot: version.version_number,
        quantity,
        options_snapshot: options,
        computed_bom_snapshot: this.normalizeBomSnapshot(bomCalc, quantity),
        unit_price,
        line_total,
      });
    }

    const order = await this.prisma.order.create({
      data: {
        order_number,
        customer_id,
        price_list_id,
        created_by: creatorId,
        qr_code_token,
        subtotal,
        total: subtotal,
        notes: notes || null,
        status: 'received',
        items: {
          create: orderItemsData,
        },
        statusHistory: {
          create: {
            to_status: 'received',
            changed_by: creatorId,
          },
        },
        activities: {
          create: {
            customer_id,
            activity_type: 'order_created',
            title_ar: `طلب جديد ${order_number}`,
            body_ar: `تم إنشاء الطلب بمبلغ ${subtotal} د.ج`,
            created_by: creatorId,
          },
        },
      },
      include: { items: true, customer: true },
    });

    return order;
  }

  async createPublic(data: any) {
    const { customer: customerInput, items, notes } = data || {};
    if (!customerInput?.name_ar || !customerInput?.phone) {
      throw new BadRequestException('اسم العميل ورقم الهاتف مطلوبان');
    }
    if (!items?.length) throw new BadRequestException('السلة فارغة');

    const creatorId = await this.resolveSystemUserId();
    const phone = String(customerInput.phone).trim();

    let customer = await this.prisma.customer.findFirst({
      where: { phone, deleted_at: null },
    });

    if (!customer) {
      const retail = await this.prisma.priceList.findFirst({
        where: { list_type: 'retail' },
      });
      if (!retail) throw new BadRequestException('قائمة أسعار التجزئة غير موجودة');

      const count = await this.prisma.customer.count();
      customer = await this.prisma.customer.create({
        data: {
          code: `WEB-${String(count + 1).padStart(4, '0')}`,
          name_ar: customerInput.name_ar.trim(),
          phone,
          email: customerInput.email || null,
          city: customerInput.city || null,
          address_ar: customerInput.address_ar || null,
          customer_type: 'individual',
          price_list_id: retail.id,
          created_by: creatorId,
          notes: 'عميل من الموقع العام',
        },
      });
    } else {
      customer = await this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          name_ar: customerInput.name_ar.trim() || customer.name_ar,
          email: customerInput.email ?? customer.email,
          city: customerInput.city ?? customer.city,
          address_ar: customerInput.address_ar ?? customer.address_ar,
        },
      });
    }

    return this.create(creatorId, {
      customer_id: customer.id,
      items,
      notes: notes || 'طلب من الموقع العام',
    });
  }

  async changeStatus(id: string, userId: string | undefined, toStatus: string, notes?: string) {
    const changerId = await this.resolveSystemUserId(userId);
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: toStatus,
        statusHistory: {
          create: {
            from_status: order.status,
            to_status: toStatus,
            changed_by: changerId,
            notes,
          },
        },
      },
    });
    return updated;
  }

  async reorder(id: string, userId: string | undefined) {
    const creatorId = await this.resolveSystemUserId(userId);
    const oldOrder = await this.findOne(id);
    if (!oldOrder) throw new NotFoundException('Original order not found');

    const count = await this.prisma.order.count();
    const order_number = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const qr_code_token = randomBytes(16).toString('hex');

    const itemsData = oldOrder.items.map((item) => ({
      design_id: item.design_id,
      design_version_id: item.design_version_id,
      design_code_snapshot: item.design_code_snapshot,
      design_name_snapshot: item.design_name_snapshot,
      version_number_snapshot: item.version_number_snapshot,
      quantity: item.quantity,
      options_snapshot: item.options_snapshot
        ? JSON.parse(JSON.stringify(item.options_snapshot))
        : {},
      computed_bom_snapshot: item.computed_bom_snapshot
        ? JSON.parse(JSON.stringify(item.computed_bom_snapshot))
        : {},
      unit_price: item.unit_price,
      line_total: item.line_total,
    }));

    const newOrder = await this.prisma.order.create({
      data: {
        order_number,
        customer_id: oldOrder.customer_id,
        price_list_id: oldOrder.price_list_id,
        created_by: creatorId,
        qr_code_token,
        subtotal: oldOrder.subtotal,
        total: oldOrder.total,
        status: 'received',
        reorder_from_order_id: id,
        items: {
          create: itemsData,
        },
        statusHistory: {
          create: {
            to_status: 'received',
            changed_by: creatorId,
            notes: `Reordered from ${oldOrder.order_number}`,
          },
        },
      },
      include: { items: true, customer: true },
    });

    return newOrder;
  }

  /**
   * Rule-based smart routing: cutting vs printing after design is ready.
   */
  suggestProductionRoute(order: any): {
    suggested: 'in_cutting' | 'in_printing';
    confidence: number;
    reason_ar: string;
    needs_cutting: boolean;
    needs_printing: boolean;
  } {
    const textParts: string[] = [];
    for (const item of order.items || []) {
      textParts.push(String(item.design_name_snapshot || ''));
      textParts.push(String(item.design_code_snapshot || ''));
      try {
        const opt = typeof item.options_snapshot === 'string'
          ? JSON.parse(item.options_snapshot)
          : item.options_snapshot || {};
        textParts.push(JSON.stringify(opt));
        const bom = typeof item.computed_bom_snapshot === 'string'
          ? JSON.parse(item.computed_bom_snapshot)
          : item.computed_bom_snapshot || {};
        textParts.push(JSON.stringify(bom));
      } catch {
        /* ignore */
      }
    }
    textParts.push(String(order.notes || ''));
    const blob = textParts.join(' ').toLowerCase();

    const printHints = ['طباعة', 'طبع', 'uv', 'print', 'ink', 'حبر', 'إيبوكسي طباعة'];
    const cutHints = ['قص', 'ليزر', 'laser', 'cnc', 'قطع', 'راوتر', 'نقش'];

    let printScore = 0;
    let cutScore = 0;
    for (const h of printHints) if (blob.includes(h)) printScore += 2;
    for (const h of cutHints) if (blob.includes(h)) cutScore += 2;

    // Default workshop flow: cut then print when unclear
    if (cutScore === 0 && printScore === 0) {
      cutScore = 1;
    }

    const needs_cutting = cutScore > 0;
    const needs_printing = printScore > 0;
    const suggested: 'in_cutting' | 'in_printing' =
      cutScore >= printScore ? 'in_cutting' : 'in_printing';
    const total = cutScore + printScore || 1;
    const confidence = Math.min(0.95, 0.45 + Math.max(cutScore, printScore) / (total + 2));

    let reason_ar = 'اقتراح افتراضي: البدء بالقص ثم الطباعة إن لزم.';
    if (needs_cutting && needs_printing) {
      reason_ar =
        suggested === 'in_cutting'
          ? 'الطلب يحتاج قص وطباعة — يُفضّل القص أولاً ثم الطباعة.'
          : 'إشارات الطباعة أقوى — يمكن بدء الطباعة مع متابعة القص لاحقاً.';
    } else if (needs_printing && !needs_cutting) {
      reason_ar = 'المؤشرات تدل على عملية طباعة دون قص.';
    } else if (needs_cutting && !needs_printing) {
      reason_ar = 'المؤشرات تدل على قص/ليزر دون طباعة.';
    }

    return { suggested, confidence, reason_ar, needs_cutting, needs_printing };
  }

  async getRouteSuggestion(id: string) {
    const order = await this.findOne(id);
    return {
      order_id: id,
      order_number: order.order_number,
      status: order.status,
      ...this.suggestProductionRoute(order),
    };
  }

  /** Designer finishes design → awaiting follow-up (no production command) */
  async finishDesign(id: string, userId: string | undefined, notes?: string) {
    const changerId = await this.resolveSystemUserId(userId);
    const order = await this.findOne(id);
    const allowedFrom = ['in_design', 'pending_approval', 'pending_review', 'received'];
    if (!allowedFrom.includes(order.status) && order.status !== 'design_ready') {
      throw new BadRequestException(
        `لا يمكن إنهاء التصميم من الحالة الحالية (${order.status})`,
      );
    }
    if (order.status === 'design_ready') {
      return {
        order,
        already_ready: true,
        route: this.suggestProductionRoute(order),
        message_ar: 'التصميم مُعلَم كجاهز مسبقاً — بانتظار توجيه المتابعة',
      };
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'design_ready',
        statusHistory: {
          create: {
            from_status: order.status,
            to_status: 'design_ready',
            changed_by: changerId,
            notes: notes || 'أنهى المصمم التصميم — بانتظار توجيه مسؤول المتابعة',
          },
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    const route = this.suggestProductionRoute(updated);
    await this.notifyFollowUpUsers(
      'design_ready',
      `تصميم جاهز: ${updated.order_number}`,
      `أنهى المصمم التصميم. اقتراح التوجيه: ${
        route.suggested === 'in_cutting' ? 'قص' : 'طباعة'
      }. ${route.reason_ar}`,
      { order_id: id, suggested: route.suggested },
    );

    return {
      order: updated,
      route,
      message_ar: 'تم إنهاء التصميم وإبلاغ مسؤول المتابعة — دون إطلاق أمر إنتاج نهائي',
    };
  }

  /** Follow-up dispatches to cutting or printing + optional assignee */
  async dispatchProduction(
    id: string,
    userId: string | undefined,
    body: {
      target_stage: 'in_cutting' | 'in_printing';
      assignee_user_id?: string;
      notes?: string;
      accept_suggestion?: boolean;
    },
  ) {
    const changerId = await this.resolveSystemUserId(userId);
    const order = await this.findOne(id);
    const target = body.target_stage;
    if (target !== 'in_cutting' && target !== 'in_printing') {
      throw new BadRequestException('المرحلة المستهدفة يجب أن تكون قص أو طباعة');
    }

    const fromOk = ['design_ready', 'in_design', 'in_cutting', 'in_printing', 'pending_approval'];
    if (!fromOk.includes(order.status)) {
      throw new BadRequestException('لا يمكن توجيه هذا الطلب من حالته الحالية');
    }

    let assignee = body.assignee_user_id || null;
    if (assignee) {
      const u = await this.prisma.user.findUnique({ where: { id: assignee } });
      if (!u) throw new BadRequestException('الموظف المعيَّن غير موجود');
    }

    const route = this.suggestProductionRoute(order);
    const noteParts = [
      body.notes || '',
      `توجيه إلى ${target === 'in_cutting' ? 'القص' : 'الطباعة'}`,
      route.suggested === target
        ? `(متوافق مع الاقتراح الذكي — ثقة ${Math.round(route.confidence * 100)}%)`
        : `(مخالف للاقتراح الذكي: كان ${route.suggested === 'in_cutting' ? 'قص' : 'طباعة'})`,
    ].filter(Boolean);

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: target,
        assigned_to: assignee,
        statusHistory: {
          create: {
            from_status: order.status,
            to_status: target,
            changed_by: changerId,
            notes: noteParts.join(' — '),
          },
        },
      },
      include: { items: true, customer: true, assignee: true },
    });

    if (assignee) {
      await this.prisma.notification.create({
        data: {
          user_id: assignee,
          notification_type: 'production_dispatch',
          title_ar: `أمر ${target === 'in_cutting' ? 'قص' : 'طباعة'}: ${updated.order_number}`,
          body_ar: `تم توجيه طلب إليك من مسؤول المتابعة.`,
          metadata: { order_id: id, stage: target },
        },
      });
    }

    return {
      order: updated,
      route,
      message_ar: `تم توجيه الطلب إلى ${target === 'in_cutting' ? 'القص' : 'الطباعة'}`,
    };
  }

  async getFollowUpBoard() {
    const orders = await this.prisma.order.findMany({
      where: {
        deletedAt: null,
        status: {
          in: [
            'in_design',
            'design_ready',
            'in_cutting',
            'in_printing',
            'in_assembly',
            'pending_approval',
          ],
        },
      },
      take: 200,
      orderBy: { updated_at: 'desc' },
      include: {
        customer: true,
        items: true,
        assignee: { select: { id: true, full_name_ar: true, email: true } },
      },
    });

    const enriched = orders.map((o) => ({
      ...o,
      route: this.suggestProductionRoute(o),
    }));

    const bucket = (pred: (o: any) => boolean) => enriched.filter(pred);

    return {
      in_design: bucket((o) => o.status === 'in_design' || o.status === 'pending_approval'),
      design_ready: bucket((o) => o.status === 'design_ready'),
      in_cutting: bucket((o) => o.status === 'in_cutting'),
      awaiting_cut: bucket(
        (o) =>
          o.status === 'design_ready' &&
          (o.route.needs_cutting || o.route.suggested === 'in_cutting'),
      ),
      needs_print: bucket(
        (o) =>
          o.status === 'design_ready' ||
          o.status === 'in_cutting' ||
          (o.status === 'in_printing' && false),
      ).filter(
        (o) =>
          o.route.needs_printing &&
          o.status !== 'in_printing' &&
          o.status !== 'in_assembly',
      ),
      in_printing: bucket((o) => o.status === 'in_printing'),
      operators: await this.listProductionOperators(),
    };
  }

  private async listProductionOperators() {
    const roles = await this.prisma.role.findMany({
      where: { slug: { in: ['cutting_ops', 'printing_ops', 'cutting_status', 'worker'] } },
    });
    const roleIds = roles.map((r) => r.id);
    if (!roleIds.length) return [];
    const links = await this.prisma.userRole.findMany({
      where: { role_id: { in: roleIds } },
      include: {
        user: { select: { id: true, full_name_ar: true, email: true, status: true } },
        role: true,
      },
    });
    return links
      .filter((l) => l.user?.status === 'active')
      .map((l) => ({
        id: l.user.id,
        full_name_ar: l.user.full_name_ar,
        email: l.user.email,
        role: l.role.slug,
        role_ar: l.role.name_ar,
      }));
  }

  private async notifyFollowUpUsers(
    type: string,
    title_ar: string,
    body_ar: string,
    metadata: any,
  ) {
    const role = await this.prisma.role.findUnique({ where: { slug: 'follow_up' } });
    const adminRole = await this.prisma.role.findUnique({ where: { slug: 'admin' } });
    const managerRole = await this.prisma.role.findUnique({ where: { slug: 'manager' } });
    const roleIds = [role?.id, adminRole?.id, managerRole?.id].filter(Boolean) as string[];
    if (!roleIds.length) return;

    const links = await this.prisma.userRole.findMany({
      where: { role_id: { in: roleIds } },
      select: { user_id: true },
    });
    const userIds = [...new Set(links.map((l) => l.user_id))];
    if (!userIds.length) return;

    await this.prisma.notification.createMany({
      data: userIds.map((user_id) => ({
        user_id,
        notification_type: type,
        title_ar,
        body_ar,
        metadata,
      })),
    });
  }
}
