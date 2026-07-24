import React from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Download } from 'lucide-react';

export const ItemsTab = ({ order }: { order: any }) => (
  <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
    <CardHeader>
      <CardTitle>المنتجات والتفاصيل (Items)</CardTitle>
    </CardHeader>
    <CardContent>
      <table className="w-full text-sm text-right text-[var(--color-text-main)]">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
            <th className="pb-2 font-bold">التصميم</th>
            <th className="pb-2 font-bold">الكمية</th>
            <th className="pb-2 font-bold">السعر</th>
            <th className="pb-2 font-bold">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {(order.items || []).map((item: any) => (
            <tr key={item.id} className="border-b border-[var(--color-border)]/50">
              <td className="py-2">
                {item.design_name_snapshot || item.design?.name_ar || '—'}
                <div className="text-xs text-[var(--color-text-muted)] font-mono">
                  {item.design_code_snapshot}
                </div>
              </td>
              <td className="py-2">{item.quantity}</td>
              <td className="py-2">{Number(item.unit_price || 0).toLocaleString()}</td>
              <td className="py-2 font-bold">{Number(item.line_total || 0).toLocaleString()}</td>
            </tr>
          ))}
          {(order.items || []).length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-[var(--color-text-muted)]">
                لا توجد بنود
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </CardContent>
  </Card>
);

export const MaterialsTab = ({ order }: { order: any }) => {
  const materials: any[] = [];
  for (const item of order.items || []) {
    for (const m of item.computed_bom_snapshot?.materials || []) {
      materials.push({
        ...m,
        from: item.design_name_snapshot,
      });
    }
  }

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <CardHeader>
        <CardTitle>المواد الخام (Materials)</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm text-right text-[var(--color-text-main)]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <th className="pb-2 font-bold">المادة</th>
              <th className="pb-2 font-bold">من بند</th>
              <th className="pb-2 font-bold">الكمية المطلوبة</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m, i) => (
              <tr key={i} className="border-b border-[var(--color-border)]/40">
                <td className="py-2">{m.name || m.material?.name_ar || 'مادة'}</td>
                <td className="py-2 text-[var(--color-text-muted)]">{m.from}</td>
                <td className="py-2">
                  {m.quantity} {m.unit || ''}
                </td>
              </tr>
            ))}
            {materials.length === 0 && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-[var(--color-text-muted)]">
                  لا توجد مواد في لقطة BOM
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export const MachinesTab = ({ order }: { order: any }) => {
  const jobs = order.machineJobs || [];
  const names = [
    ...new Set(jobs.map((j: any) => j.machine?.name_ar).filter(Boolean)),
  ] as string[];

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <CardHeader>
        <CardTitle>الآلات (Machines)</CardTitle>
      </CardHeader>
      <CardContent>
        {names.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            لا توجد آلات مرتبطة بعد — ابدأ الإنتاج لتوليد المهام.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {names.map((name) => (
              <Badge
                key={name}
                variant="outline"
                className="border-[var(--color-primary-500)] text-[var(--color-primary-500)]"
              >
                {name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const EmployeesTab = ({ order }: { order: any }) => {
  const workers = (order.machineJobs || [])
    .map((j: any) => j.worker)
    .filter(Boolean);
  const unique = Array.from(
    new Map(workers.map((w: any) => [w.id, w])).values()
  );

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <CardHeader>
        <CardTitle>العمال (Employees)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {unique.length === 0 ? (
            <div className="text-[var(--color-text-muted)]">لا يوجد عمال معيّنون بعد</div>
          ) : (
            unique.map((emp: any) => (
              <div
                key={emp.id}
                className="flex justify-between border-b border-[var(--color-border)] pb-2 last:border-0 text-sm"
              >
                <span className="text-[var(--color-text-main)] font-bold">
                  {emp.full_name_ar || emp.name}
                </span>
                <span className="text-[var(--color-text-muted)]">{emp.role || ''}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const NotesTab = ({ order }: { order: any }) => (
  <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
    <CardHeader>
      <CardTitle>الملاحظات (Notes)</CardTitle>
    </CardHeader>
    <CardContent>
      <textarea
        className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-md p-3 text-[var(--color-text-main)]"
        rows={4}
        placeholder="أضف ملاحظة..."
        defaultValue={order.notes || ''}
        readOnly
      />
      <div className="flex justify-end mt-2">
        <Button size="sm" onClick={() => toast.info('حفظ الملاحظات سيُفعّل في التحديث القادم')}>
          حفظ الملاحظة
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const FinanceTab = ({ order }: { order: any }) => {
  const total = Number(order.total || 0);
  const paid = Number(order.paid_amount || 0);
  const remaining = total - paid;

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>المالية (Finance)</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => toast.info('تصدير الفاتورة قريبًا')}
        >
          <Download className="w-4 h-4 mr-2" /> تصدير الفاتورة
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--color-bg-main)] p-4 rounded-lg border border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">الإجمالي</p>
            <p className="text-2xl font-bold text-[var(--color-text-main)]">
              {total.toLocaleString()} د.ج
            </p>
          </div>
          <div className="bg-[var(--color-bg-main)] p-4 rounded-lg border border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">المدفوع</p>
            <p className="text-2xl font-bold text-[var(--color-success)]">
              {paid.toLocaleString()} د.ج
            </p>
          </div>
          <div className="bg-[var(--color-bg-main)] p-4 rounded-lg border border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">المتبقي</p>
            <p className="text-2xl font-bold text-[var(--color-danger)]">
              {remaining.toLocaleString()} د.ج
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-bold mb-2">الفواتير</p>
          {(order.invoices || []).length === 0 && (
            <p className="text-[var(--color-text-muted)]">لا توجد فواتير بعد</p>
          )}
          {(order.invoices || []).map((inv: any) => (
            <div
              key={inv.id}
              className="flex justify-between p-3 rounded-lg border border-[var(--color-border)]"
            >
              <span>{inv.invoice_number || inv.id}</span>
              <span>{Number(inv.total || 0).toLocaleString()} د.ج</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const FilesTab = ({ order }: { order: any }) => (
  <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
    <CardHeader>
      <CardTitle>الملفات</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {(order.orderFiles || []).length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">لا توجد ملفات مرفوعة</p>
      ) : (
        (order.orderFiles || []).map((f: any) => (
          <div
            key={f.id}
            className="flex justify-between p-3 rounded-lg border border-[var(--color-border)] text-sm"
          >
            <span>{f.file?.original_name || f.file_id}</span>
            <span className="text-[var(--color-text-muted)]">{f.file_purpose}</span>
          </div>
        ))
      )}
    </CardContent>
  </Card>
);

export const TasksTab = ({ order }: { order: any }) => (
  <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
    <CardHeader>
      <CardTitle>مهام الإنتاج</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {(order.productionTasks || []).length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">لا توجد مهام مسجّلة</p>
      ) : (
        (order.productionTasks || []).map((t: any) => (
          <div
            key={t.id}
            className="flex justify-between p-3 rounded-lg border border-[var(--color-border)] text-sm"
          >
            <span>{t.stage}</span>
            <span>{t.task_status}</span>
          </div>
        ))
      )}
    </CardContent>
  </Card>
);
