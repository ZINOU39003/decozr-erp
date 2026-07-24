import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList, RefreshCw, Scissors, Printer, Sparkles, Send, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import {
  dispatchOrderProduction,
  getFollowUpBoard,
} from '../../services/api';
import { usePermission } from '../../lib/permissions';

type BoardOrder = any;

const Column = ({
  title,
  count,
  accent,
  children,
}: {
  title: string;
  count: number;
  accent: string;
  children: React.ReactNode;
}) => (
  <div className="min-w-[280px] flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-main)] overflow-hidden">
    <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between" style={{ borderTop: `3px solid ${accent}` }}>
      <h3 className="font-bold text-[var(--color-text-main)]">{title}</h3>
      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-[var(--color-border)]">{count}</span>
    </div>
    <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">{children}</div>
  </div>
);

export const FollowUpCenter = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const [assignees, setAssignees] = useState<Record<string, string>>({});

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['orders', 'follow-up-board'],
    queryFn: getFollowUpBoard,
    enabled: hasPermission('dispatch_production') || hasPermission('view_production'),
  });

  const board = data || {
    in_design: [],
    design_ready: [],
    in_cutting: [],
    awaiting_cut: [],
    needs_print: [],
    in_printing: [],
    operators: [],
  };

  const operators = useMemo(() => {
    const list = Array.isArray(board.operators) ? board.operators : [];
    return list;
  }, [board]);

  const cuttingOps = operators.filter((o: any) =>
    ['cutting_ops', 'cutting_status', 'worker'].includes(o.role),
  );
  const printingOps = operators.filter((o: any) =>
    ['printing_ops', 'worker'].includes(o.role),
  );

  const dispatchMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      target_stage: 'in_cutting' | 'in_printing';
      assignee_user_id?: string;
    }) =>
      dispatchOrderProduction(payload.id, {
        target_stage: payload.target_stage,
        assignee_user_id: payload.assignee_user_id || undefined,
      }),
    onSuccess: (res: any) => {
      toast.success(res?.message_ar || 'تم التوجيه');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر التوجيه');
    },
  });

  if (!hasPermission('dispatch_production') && !hasPermission('view_production')) {
    return (
      <div className="p-8 text-center text-[var(--color-text-muted)]" dir="rtl">
        هذه اللوحة لمسؤول المتابعة
      </div>
    );
  }

  const renderCard = (order: BoardOrder, mode: 'ready' | 'info') => {
    const route = order.route || {};
    const suggested = route.suggested === 'in_printing' ? 'in_printing' : 'in_cutting';
    const ops = suggested === 'in_printing' ? printingOps : cuttingOps;
    const assignee = assignees[order.id] || '';

    return (
      <Card key={order.id} className="border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-sm">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <button
                type="button"
                className="font-bold text-[#0F766E] hover:underline"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                {order.order_number}
              </button>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {order.customer?.name_ar || '—'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-[var(--color-text-main)] line-clamp-2">
            {order.items?.[0]?.design_name_snapshot || 'تصميم'}
          </p>

          {route.reason_ar && (
            <div className="rounded-lg bg-[#F0FDFA] border border-[#99F6E4] p-2 text-xs text-[#0F766E] flex gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                اقتراح: <strong>{suggested === 'in_cutting' ? 'قص' : 'طباعة'}</strong>
                {' — '}
                {route.reason_ar}
                {route.confidence != null && (
                  <span className="opacity-70"> ({Math.round(route.confidence * 100)}%)</span>
                )}
              </span>
            </div>
          )}

          {mode === 'ready' && hasPermission('dispatch_production') && (
            <div className="space-y-2 pt-1">
              <select
                className="w-full h-9 rounded-md border border-[var(--color-border)] bg-white px-2 text-xs"
                value={assignee}
                onChange={(e) =>
                  setAssignees((s) => ({ ...s, [order.id]: e.target.value }))
                }
              >
                <option value="">بدون تعيين موظف</option>
                {ops.map((op: any) => (
                  <option key={op.id} value={op.id}>
                    {op.full_name_ar} ({op.role_ar})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button
                  className="flex-1 h-9 text-xs bg-[#0F766E] text-white gap-1"
                  disabled={dispatchMutation.isPending}
                  onClick={() =>
                    dispatchMutation.mutate({
                      id: order.id,
                      target_stage: 'in_cutting',
                      assignee_user_id: assignee || undefined,
                    })
                  }
                >
                  <Scissors className="w-3.5 h-3.5" /> قص
                </Button>
                <Button
                  className="flex-1 h-9 text-xs bg-[#7C3AED] text-white gap-1"
                  disabled={dispatchMutation.isPending}
                  onClick={() =>
                    dispatchMutation.mutate({
                      id: order.id,
                      target_stage: 'in_printing',
                      assignee_user_id: assignee || undefined,
                    })
                  }
                >
                  <Printer className="w-3.5 h-3.5" /> طباعة
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full h-8 text-xs gap-1"
                disabled={dispatchMutation.isPending}
                onClick={() =>
                  dispatchMutation.mutate({
                    id: order.id,
                    target_stage: suggested,
                    assignee_user_id: assignee || undefined,
                  })
                }
              >
                <Send className="w-3.5 h-3.5" /> اعتماد الاقتراح الذكي
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#0F766E]" />
            مركز المتابعة والتوجيه
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            التصاميم المنجزة بانتظار أمرك — المصمم لا يطلق الإنتاج النهائي
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {isLoading ? (
        <p className="text-[var(--color-text-muted)]">جاري التحميل...</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          <Column title="تصميم جارٍ" count={board.in_design?.length || 0} accent="#EC4899">
            {(board.in_design || []).map((o: BoardOrder) => renderCard(o, 'info'))}
            {!board.in_design?.length && (
              <p className="text-xs text-center text-[var(--color-text-muted)] py-6">لا عناصر</p>
            )}
          </Column>
          <Column title="تصميم منجز (للتوجيه)" count={board.design_ready?.length || 0} accent="#0F766E">
            {(board.design_ready || []).map((o: BoardOrder) => renderCard(o, 'ready'))}
            {!board.design_ready?.length && (
              <p className="text-xs text-center text-[var(--color-text-muted)] py-6">لا عناصر</p>
            )}
          </Column>
          <Column title="تحتاج قص / لم تُقص" count={board.awaiting_cut?.length || 0} accent="#F59E0B">
            {(board.awaiting_cut || []).map((o: BoardOrder) => renderCard(o, 'ready'))}
            {!board.awaiting_cut?.length && (
              <p className="text-xs text-center text-[var(--color-text-muted)] py-6">لا عناصر</p>
            )}
          </Column>
          <Column title="في القص" count={board.in_cutting?.length || 0} accent="#FB923C">
            {(board.in_cutting || []).map((o: BoardOrder) => renderCard(o, 'info'))}
            {!board.in_cutting?.length && (
              <p className="text-xs text-center text-[var(--color-text-muted)] py-6">لا عناصر</p>
            )}
          </Column>
          <Column title="تحتاج طباعة" count={board.needs_print?.length || 0} accent="#8B5CF6">
            {(board.needs_print || []).map((o: BoardOrder) => renderCard(o, 'ready'))}
            {!board.needs_print?.length && (
              <p className="text-xs text-center text-[var(--color-text-muted)] py-6">لا عناصر</p>
            )}
          </Column>
          <Column title="في الطباعة" count={board.in_printing?.length || 0} accent="#A78BFA">
            {(board.in_printing || []).map((o: BoardOrder) => renderCard(o, 'info'))}
            {!board.in_printing?.length && (
              <p className="text-xs text-center text-[var(--color-text-muted)] py-6">لا عناصر</p>
            )}
          </Column>
        </div>
      )}
    </div>
  );
};
