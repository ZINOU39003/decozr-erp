import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  PERMISSION_CATALOG,
  ROLE_DEFAULT_PERMISSIONS,
  WORKSHOP_ROLES,
} from '../rbac/permissions.catalog';

const prisma = new PrismaClient();

const DEFAULT_STAGES = [
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

async function main() {
  console.log('🌱 بدء تعبئة قاعدة بيانات DecoZR ERP v3...');

  // 1. Roles + Permissions
  for (const r of WORKSHOP_ROLES) {
    await prisma.role.upsert({
      where: { slug: r.slug },
      update: { name_ar: r.name_ar, name: r.name, is_system: r.is_system },
      create: {
        name: r.name,
        name_ar: r.name_ar,
        slug: r.slug,
        is_system: r.is_system,
      },
    });
  }
  console.log('✓ الأدوار');

  const permMap = new Map<string, string>();
  for (const p of PERMISSION_CATALOG) {
    const row = await prisma.permission.upsert({
      where: { slug: p.slug },
      update: {
        module: p.module,
        action: p.action,
        description_ar: p.description_ar,
      },
      create: {
        slug: p.slug,
        module: p.module,
        action: p.action,
        description_ar: p.description_ar,
      },
    });
    permMap.set(p.slug, row.id);
  }
  console.log('✓ الصلاحيات');

  for (const [slug, permSlugs] of Object.entries(ROLE_DEFAULT_PERMISSIONS)) {
    const role = await prisma.role.findUnique({ where: { slug } });
    if (!role) continue;
    for (const ps of permSlugs) {
      const permission_id = permMap.get(ps);
      if (!permission_id) continue;
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: { role_id: role.id, permission_id },
        },
        update: {},
        create: { role_id: role.id, permission_id },
      });
    }
  }
  console.log('✓ ربط صلاحيات الأدوار');

  // 2. Admin user with manager role
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@decozr.local' },
    update: {
      full_name_ar: 'مدير النظام',
      password_hash: adminPassword,
      status: 'active',
    },
    create: {
      email: 'admin@decozr.local',
      full_name_ar: 'مدير النظام',
      password_hash: adminPassword,
      phone: '0550000000',
      status: 'active',
    },
  });

  for (const slug of ['admin', 'manager']) {
    const role = await prisma.role.findUnique({ where: { slug } });
    if (role) {
      await prisma.userRole.upsert({
        where: { user_id_role_id: { user_id: admin.id, role_id: role.id } },
        update: {},
        create: { user_id: admin.id, role_id: role.id },
      });
    }
  }
  console.log('✓ المستخدم admin@decozr.local / admin123');

  // 3. Categories
  const categories = [
    { name_ar: 'فوانيس', slug: 'fawanis', sort_order: 1 },
    { name_ar: 'رمضان', slug: 'ramadan', sort_order: 2 },
    { name_ar: 'مرايا', slug: 'maraya', sort_order: 3 },
    { name_ar: 'أسماء', slug: 'asma', sort_order: 4 },
    { name_ar: 'واجهات', slug: 'wajhat', sort_order: 5 },
    { name_ar: 'لوحات', slug: 'lawhat', sort_order: 6 },
    { name_ar: 'ديكور أطفال', slug: 'dekor-atfal', sort_order: 7 },
  ];

  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    const cat = await prisma.designCategory.upsert({
      where: { slug: c.slug },
      update: { name_ar: c.name_ar, sort_order: c.sort_order, is_active: true },
      create: { ...c, is_active: true },
    });
    categoryMap.set(c.slug, cat.id);
  }
  console.log('✓ التصنيفات');

  // 4. Price lists
  const priceLists = [
    { name_ar: 'تجزئة', list_type: 'retail', default_discount_pct: 0 },
    { name_ar: 'جملة', list_type: 'wholesale', default_discount_pct: 10 },
    { name_ar: 'موزع', list_type: 'distributor', default_discount_pct: 20 },
    { name_ar: 'VIP', list_type: 'vip', default_discount_pct: 15 },
  ];

  const priceListMap = new Map<string, string>();
  for (const pl of priceLists) {
    const row = await prisma.priceList.upsert({
      where: { list_type: pl.list_type },
      update: { name_ar: pl.name_ar, default_discount_pct: pl.default_discount_pct, is_active: true },
      create: { ...pl, currency: 'DZD', is_active: true },
    });
    priceListMap.set(pl.list_type, row.id);
  }
  console.log('✓ قوائم الأسعار');

  // 5. Machines
  const machines = [
    {
      code: 'LASER-01',
      name_ar: 'ليزر 01',
      machine_type: 'laser',
      cost_per_minute: 15,
      daily_capacity_minutes: 480,
      operational_status: 'operational',
    },
    {
      code: 'CNC-01',
      name_ar: 'سي إن سي 01',
      machine_type: 'cnc',
      cost_per_minute: 20,
      daily_capacity_minutes: 480,
      operational_status: 'operational',
    },
    {
      code: 'UV-01',
      name_ar: 'طباعة UV 01',
      machine_type: 'uv_printer',
      cost_per_minute: 12,
      daily_capacity_minutes: 480,
      operational_status: 'operational',
    },
  ];

  const machineMap = new Map<string, string>();
  for (const m of machines) {
    const row = await prisma.machine.upsert({
      where: { code: m.code },
      update: {
        name_ar: m.name_ar,
        cost_per_minute: m.cost_per_minute,
        daily_capacity_minutes: m.daily_capacity_minutes,
        operational_status: m.operational_status,
        is_active: true,
      },
      create: { ...m, is_active: true },
    });
    machineMap.set(m.code, row.id);
  }
  console.log('✓ الآلات');

  // 6. Materials
  const materials = [
    { sku: 'MAT-FOREX', name_ar: 'فوركس', unit: 'م²', unit_cost: 2500, current_stock: 100, min_stock_level: 10 },
    { sku: 'MAT-ALU', name_ar: 'ألمنيوم', unit: 'م²', unit_cost: 4500, current_stock: 50, min_stock_level: 5 },
    { sku: 'MAT-LED', name_ar: 'LED', unit: 'م', unit_cost: 800, current_stock: 200, min_stock_level: 20 },
    { sku: 'MAT-SCREW', name_ar: 'براغي', unit: 'قطعة', unit_cost: 5, current_stock: 5000, min_stock_level: 500 },
    { sku: 'MAT-GLUE', name_ar: 'غراء', unit: 'لتر', unit_cost: 600, current_stock: 30, min_stock_level: 5 },
  ];

  const materialMap = new Map<string, string>();
  for (const m of materials) {
    const row = await prisma.material.upsert({
      where: { sku: m.sku },
      update: {
        name_ar: m.name_ar,
        unit: m.unit,
        unit_cost: m.unit_cost,
        current_stock: m.current_stock,
        min_stock_level: m.min_stock_level,
        is_active: true,
      },
      create: { ...m, is_active: true },
    });
    materialMap.set(m.sku, row.id);
  }
  console.log('✓ المواد');

  // 7. Default workflow template (9 stages)
  let workflow = await prisma.workflowTemplate.findUnique({
    where: { slug: 'default_workflow' },
    include: { stages: true },
  });

  if (!workflow) {
    workflow = await prisma.workflowTemplate.create({
      data: {
        name_ar: 'مسار الإنتاج الافتراضي',
        slug: 'default_workflow',
        is_default: true,
        stages: { create: DEFAULT_STAGES },
      },
      include: { stages: true },
    });
  } else if (workflow.stages.length === 0) {
    for (const stage of DEFAULT_STAGES) {
      await prisma.workflowStage.create({
        data: { ...stage, template_id: workflow.id },
      });
    }
    workflow = await prisma.workflowTemplate.findUnique({
      where: { id: workflow.id },
      include: { stages: true },
    });
  }
  console.log('✓ مسار العمل الافتراضي (9 مراحل)');

  // 8. Sample customer
  const customer = await prisma.customer.upsert({
    where: { code: 'CUST-001' },
    update: {
      name_ar: 'محمد أحمد',
      phone: '0555123456',
      city: 'الجزائر',
      is_active: true,
    },
    create: {
      code: 'CUST-001',
      name_ar: 'محمد أحمد',
      phone: '0555123456',
      email: 'mohamed@example.com',
      address_ar: 'حي البدر، الجزائر العاصمة',
      city: 'الجزائر',
      customer_type: 'individual',
      price_list_id: priceListMap.get('retail')!,
      is_active: true,
      created_by: admin.id,
    },
  });
  console.log('✓ عميل تجريبي');

  // 8b. Portal customer account
  const customerPassword = await bcrypt.hash('customer123', 10);
  const portalUser = await prisma.user.upsert({
    where: { email: 'customer@decozr.local' },
    update: {
      full_name_ar: customer.name_ar,
      password_hash: customerPassword,
      customer_id: customer.id,
      status: 'active',
      phone: '0555123457',
    },
    create: {
      email: 'customer@decozr.local',
      full_name_ar: customer.name_ar,
      password_hash: customerPassword,
      phone: '0555123457',
      status: 'active',
      customer_id: customer.id,
    },
  });
  const customerRole = await prisma.role.findUnique({ where: { slug: 'customer' } });
  if (customerRole) {
    await prisma.userRole.upsert({
      where: { user_id_role_id: { user_id: portalUser.id, role_id: customerRole.id } },
      update: {},
      create: { user_id: portalUser.id, role_id: customerRole.id },
    });
  }
  console.log('✓ بوابة العميل customer@decozr.local / customer123');

  // 9. Sample design F125
  const design = await prisma.design.upsert({
    where: { code: 'F125' },
    update: {
      name_ar: 'فانوس رمضان F125',
      description_ar: 'فانوس رمضان كلاسيكي قابل للتخصيص',
      library_status: 'public',
      owner_type: 'workshop',
      visibility: 'public',
      sell_policy: 'everyone',
      is_active: true,
    },
    create: {
      code: 'F125',
      name_ar: 'فانوس رمضان F125',
      description_ar: 'فانوس رمضان كلاسيكي قابل للتخصيص',
      category_id: categoryMap.get('ramadan')!,
      library_status: 'public',
      owner_type: 'workshop',
      visibility: 'public',
      sell_policy: 'everyone',
      is_active: true,
      created_by: admin.id,
    },
  });

  let version = await prisma.designVersion.findFirst({
    where: { design_id: design.id, version_number: 1 },
  });

  if (!version) {
    version = await prisma.designVersion.create({
      data: {
        design_id: design.id,
        version_number: 1,
        changelog: 'الإصدار الأول',
        manufacturing_time_minutes: 45,
        requires_printing: false,
        requires_assembly: true,
        requires_led: true,
        size_customizable: true,
        color_customizable: true,
        status: 'active',
        created_by: admin.id,
      },
    });
  }

  await prisma.design.update({
    where: { id: design.id },
    data: { current_version_id: version.id },
  });

  // Customization options
  const existingOpts = await prisma.designCustomizationOption.count({
    where: { design_version_id: version.id },
  });
  if (existingOpts === 0) {
    await prisma.designCustomizationOption.createMany({
      data: [
        {
          design_version_id: version.id,
          option_key: 'material',
          label_ar: 'المادة',
          option_type: 'select',
          choices: ['فوركس', 'ألمنيوم', 'MDF'],
          default_value: 'فوركس',
          is_required: true,
          sort_order: 1,
        },
        {
          design_version_id: version.id,
          option_key: 'size',
          label_ar: 'المقاس (سم)',
          option_type: 'select',
          choices: ['30', '40', '50', '60'],
          default_value: '40',
          is_required: true,
          sort_order: 2,
        },
        {
          design_version_id: version.id,
          option_key: 'color',
          label_ar: 'اللون',
          option_type: 'color',
          choices: ['أبيض', 'أسود', 'ذهبي'],
          default_value: 'ذهبي',
          is_required: true,
          sort_order: 3,
        },
      ],
    });
  }

  // BOM materials
  const existingBomMat = await prisma.designBomMaterial.count({
    where: { design_version_id: version.id },
  });
  if (existingBomMat === 0) {
    await prisma.designBomMaterial.createMany({
      data: [
        {
          design_version_id: version.id,
          material_id: materialMap.get('MAT-FOREX')!,
          quantity: 0.7,
          unit: 'م²',
          waste_pct: 10,
        },
        {
          design_version_id: version.id,
          material_id: materialMap.get('MAT-LED')!,
          quantity: 1.5,
          unit: 'م',
          waste_pct: 5,
        },
        {
          design_version_id: version.id,
          material_id: materialMap.get('MAT-SCREW')!,
          quantity: 8,
          unit: 'قطعة',
          waste_pct: 0,
        },
        {
          design_version_id: version.id,
          material_id: materialMap.get('MAT-GLUE')!,
          quantity: 0.05,
          unit: 'لتر',
          waste_pct: 0,
        },
      ],
    });
  }

  // BOM labor
  const existingBomLabor = await prisma.designBomLabor.count({
    where: { design_version_id: version.id },
  });
  if (existingBomLabor === 0) {
    await prisma.designBomLabor.create({
      data: {
        design_version_id: version.id,
        machine_id: machineMap.get('LASER-01')!,
        production_stage: 'cutting',
        minutes: 15,
      },
    });
    await prisma.designBomLabor.create({
      data: {
        design_version_id: version.id,
        production_stage: 'assembly',
        minutes: 20,
      },
    });
  }

  // Price rules for all lists
  for (const [listType, listId] of priceListMap.entries()) {
    const baseByType: Record<string, number> = {
      retail: 8500,
      wholesale: 7200,
      distributor: 6500,
      vip: 7000,
    };
    await prisma.designPriceRule.upsert({
      where: {
        design_version_id_price_list_id: {
          design_version_id: version.id,
          price_list_id: listId,
        },
      },
      update: {
        base_price: baseByType[listType] ?? 8500,
        margin_pct: 25,
        price_per_sqm: 3500,
        price_per_cut_meter: 200,
      },
      create: {
        design_version_id: version.id,
        price_list_id: listId,
        base_price: baseByType[listType] ?? 8500,
        margin_pct: 25,
        price_per_sqm: 3500,
        price_per_cut_meter: 200,
        option_modifiers: {
          size: { '30': 0, '40': 500, '50': 1200, '60': 2000 },
          material: { فوركس: 0, ألمنيوم: 2500, MDF: -500 },
        },
      },
    });
  }

  // Link design to default workflow
  if (workflow) {
    await prisma.designWorkflow.upsert({
      where: {
        design_id_template_id: {
          design_id: design.id,
          template_id: workflow.id,
        },
      },
      update: {},
      create: {
        design_id: design.id,
        template_id: workflow.id,
      },
    });
  }

  console.log('✓ تصميم F125 (إصدار + خيارات + BOM + تسعير)');
  console.log('✅ اكتملت التعبئة بنجاح');
}

main()
  .catch((e) => {
    console.error('❌ فشل التعبئة:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
