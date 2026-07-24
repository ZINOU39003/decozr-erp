const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  await p.systemSettings.upsert({
    where: { key: 'baridi_mob' },
    create: {
      key: 'baridi_mob',
      description_ar: 'حساب بريدي موب للورشة',
      value: {
        account_name: 'ورشة DecoZR',
        rip: '00799999001234567890',
        phone: '0555123456',
        note_ar: 'حوّل عبر بريدي موب ثم ارفع صورة الوصل من صفحة المدفوعات',
      },
    },
    update: {
      value: {
        account_name: 'ورشة DecoZR',
        rip: '00799999001234567890',
        phone: '0555123456',
        note_ar: 'حوّل عبر بريدي موب ثم ارفع صورة الوصل من صفحة المدفوعات',
      },
    },
  });
  await p.systemSettings.upsert({
    where: { key: 'whatsapp_phone' },
    create: {
      key: 'whatsapp_phone',
      value: { phone: '213555000000' },
      description_ar: 'واتساب الورشة',
    },
    update: {},
  });
  console.log('baridi_mob seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await p.$disconnect();
  });
