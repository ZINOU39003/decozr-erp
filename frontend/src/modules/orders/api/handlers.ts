import { http, HttpResponse } from 'msw';
import { mockOrders } from '../../../data/mockDatabase';
import { withArtificialLatency } from '../../../mocks/handlers';

export const orderHandlers = [
  // GET /api/v1/orders
  http.get('/api/v1/orders', async ({ request }) => {
    await withArtificialLatency(0.02); // 2% chance of 500
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    let data = [...mockOrders];

    if (search) {
      data = data.filter(order => 
        order.id.toLowerCase().includes(search.toLowerCase()) || 
        order.customer_id?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      data = data.filter(order => order.status === status);
    }

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = data.slice((page - 1) * limit, page * limit);

    return HttpResponse.json({
      success: true,
      data: paginatedData,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    });
  }),

  // GET /api/v1/orders/:id
  http.get('/api/v1/orders/:id', async ({ params }) => {
    await withArtificialLatency();
    const { id } = params;
    
    // Simulate 400 Bad Request
    if (id === 'invalid-id') {
      return HttpResponse.json({ success: false, message: 'معرف غير صالح' }, { status: 400 });
    }

    const order = mockOrders.find(o => o.id === id);

    if (!order) {
      return HttpResponse.json({ success: false, message: 'الطلب غير موجود' }, { status: 404 });
    }

    return HttpResponse.json({ success: true, data: order });
  }),

  // POST /api/v1/orders
  http.post('/api/v1/orders', async ({ request }) => {
    await withArtificialLatency();
    const newOrder = await request.json() as any;

    if (!newOrder.customerId) {
      return HttpResponse.json({ 
        success: false, 
        message: 'خطأ في التحقق من البيانات',
        errors: { customerId: 'العميل مطلوب' }
      }, { status: 422 });
    }

    return HttpResponse.json({ success: true, data: { ...newOrder, id: `ORD-${Date.now()}` } });
  }),

  // PUT /api/v1/orders/:id
  http.put('/api/v1/orders/:id', async ({ params, request }) => {
    await withArtificialLatency();
    const { id } = params;
    const updates = await request.json();
    return HttpResponse.json({ success: true, data: { id, ...(updates as any) } });
  }),

  // DELETE /api/v1/orders/:id
  http.delete('/api/v1/orders/:id', async ({ params }) => {
    await withArtificialLatency();
    const { id } = params;

    // Simulate 403 Forbidden
    if (id === 'protected-id') {
      return HttpResponse.json({ success: false, message: 'عذراً، ليس لديك الصلاحيات الكافية لحذف هذا الطلب.' }, { status: 403 });
    }

    return HttpResponse.json({ success: true, message: 'تم الحذف بنجاح' });
  }),
];
