import { z } from 'zod';

export const OrderItemSchema = z.object({
  id: z.string(),
  description: z.string().min(3, 'الوصف يجب أن يكون 3 أحرف على الأقل'),
  quantity: z.number().positive('الكمية يجب أن تكون أكبر من 0'),
  unitPrice: z.number().min(0, 'السعر يجب أن يكون رقماً موجباً'),
  total: z.number().min(0)
});

export const OrderSchema = z.object({
  id: z.string(),
  customerId: z.string().min(1, 'العميل مطلوب'),
  designId: z.string().optional(),
  totalAmount: z.number().min(0),
  paidAmount: z.number().min(0),
  status: z.enum(['PENDING', 'APPROVED', 'IN_PRODUCTION', 'COMPLETED', 'DELIVERED', 'CANCELLED']).or(z.string()),
  dueDate: z.string(),
  items: z.array(OrderItemSchema).min(1, 'يجب إضافة عنصر واحد على الأقل للطلب'),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional()
});

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
