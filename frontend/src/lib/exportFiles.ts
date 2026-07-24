/** Client-side CSV / printable PDF helpers (no heavy deps). */

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportRowsToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const bom = '\uFEFF';
  const lines = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))];
  downloadBlob(filename, new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
}

export function printHtmlAsPdf(title: string, bodyHtml: string) {
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head>
    <meta charset="utf-8"/>
    <title>${title}</title>
    <style>
      body{font-family:Tahoma,Arial,sans-serif;padding:24px;color:#15202b}
      h1{font-size:20px;margin:0 0 8px}
      table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
      th,td{border:1px solid #E6ECF2;padding:8px;text-align:right}
      th{background:#F6F8FB}
      .muted{color:#64748B;font-size:12px}
      @media print{button{display:none}}
    </style>
  </head><body>
    <button onclick="window.print()" style="margin-bottom:12px;padding:8px 14px;border-radius:8px;border:1px solid #0F766E;background:#0F766E;color:#fff;cursor:pointer">طباعة / حفظ PDF</button>
    ${bodyHtml}
  </body></html>`);
  w.document.close();
}

export function invoiceToPrintHtml(inv: any) {
  const total = Number(inv.total_amount ?? inv.total ?? 0);
  const paid = Number(inv.paid_amount ?? 0);
  const remaining = Number(inv.remaining_amount ?? total - paid);
  const customer = inv.order?.customer?.name_ar || inv.customer?.name_ar || '—';
  const orderNo = inv.order?.order_number || '—';
  return `
    <h1>فاتورة ${inv.invoice_number || ''}</h1>
    <p class="muted">DecoZR · ${new Date(inv.issue_date || inv.createdAt || Date.now()).toLocaleDateString('ar-DZ')}</p>
    <table>
      <tr><th>العميل</th><td>${customer}</td></tr>
      <tr><th>الطلب</th><td>${orderNo}</td></tr>
      <tr><th>الحالة</th><td>${inv.status || '—'}</td></tr>
      <tr><th>الإجمالي</th><td>${total.toLocaleString()} د.ج</td></tr>
      <tr><th>المدفوع</th><td>${paid.toLocaleString()} د.ج</td></tr>
      <tr><th>المستحق</th><td>${remaining.toLocaleString()} د.ج</td></tr>
    </table>
  `;
}

export function orderSummaryToPrintHtml(order: any) {
  const items = (order.items || [])
    .map(
      (it: any) =>
        `<tr><td>${it.design_name_snapshot || '—'}</td><td>${it.quantity}</td><td>${Number(it.unit_price || 0).toLocaleString()}</td><td>${Number(it.line_total || 0).toLocaleString()}</td></tr>`,
    )
    .join('');
  return `
    <h1>ملخص الطلب ${order.order_number || ''}</h1>
    <p class="muted">${order.customer?.name_ar || ''} · ${new Date(order.created_at || Date.now()).toLocaleString('ar-DZ')}</p>
    <p>الحالة: <strong>${order.status || '—'}</strong> · الإجمالي: <strong>${Number(order.total || 0).toLocaleString()} د.ج</strong></p>
    <table>
      <thead><tr><th>البند</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead>
      <tbody>${items || '<tr><td colspan="4">لا بنود</td></tr>'}</tbody>
    </table>
  `;
}
