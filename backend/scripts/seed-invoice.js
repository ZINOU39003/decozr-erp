const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const c = await p.customer.findFirst({
    where: { OR: [{ code: 'CUST-001' }, { email: 'customer@decozr.local' }] },
  });
  if (!c) {
    console.log('no customer');
    return;
  }
  const invCount = await p.invoice.count({ where: { order: { customer_id: c.id } } });
  console.log('invoices', invCount);
  if (invCount === 0) {
    const o = await p.order.findFirst({ where: { customer_id: c.id } });
    if (o) {
      await p.invoice.create({
        data: {
          invoice_number: 'INV-PORTAL-001',
          order_id: o.id,
          total_amount: o.total || 50000,
          status: 'unpaid',
        },
      });
      console.log('created invoice');
    } else {
      console.log('no order');
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await p.$disconnect();
  });
