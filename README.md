# DecoZR ERP

منصة إدارة ورش التصنيع — قص، طباعة، ديكور، وتصنيع حسب الطلب.

## المتطلبات

- Node.js 20+
- Docker Desktop (اختياري — للإنتاج مع PostgreSQL)

## التشغيل

```bash
# Backend
cd backend
npm install
npx prisma db push
npm run db:seed
npm run start:dev

# Frontend (نافذة أخرى)
cd frontend
npm install
npm run dev
```

| الخدمة | الرابط |
|--------|--------|
| الواجهة | http://localhost:5173 |
| API Health | http://localhost:3000/api/v1/health |
| Swagger | http://localhost:3000/api/docs |

### حساب تجريبي

- البريد: `admin@decozr.local`
- كلمة المرور: `admin123`

## حالة v3 (يوليو 2026)

- Schema: تصاميم + حقوق + Offcuts + Workflow + Seasons + Capacity + Workspace
- Seed عربي نظيف (F125، 7 فئات، 3 آلات، workflow 9 مراحل)
- صفحات ERP الحرجة مربوطة بالـ API
- بوابة الموزع / التقارير المالية / AI — قيد التحسين
- Docker/PostgreSQL عند تثبيت Docker Desktop

## الوثائق

راجع مجلد [`docs/`](./docs/README.md) للتصميم المعماري الكامل.
