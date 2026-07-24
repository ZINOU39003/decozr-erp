import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WidgetType = 
  | 'KPI_REVENUE'
  | 'KPI_ORDERS'
  | 'KPI_TASKS'
  | 'KPI_INVENTORY'
  | 'MACHINE_STATUS'
  | 'CALENDAR'
  | 'APPROVALS_PENDING'
  | 'RECENT_ACTIVITY';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  isHidden: boolean;
  isCollapsed: boolean;
  isPinned: boolean;
  w: number; // grid columns span (1 to 4)
  h: number; // grid rows span (1 to 4)
  order: number;
}

interface DashboardState {
  widgets: WidgetConfig[];
  toggleVisibility: (id: string) => void;
  toggleCollapse: (id: string) => void;
  togglePin: (id: string) => void;
  reorderWidgets: (startIndex: number, endIndex: number) => void;
  resetToDefault: () => void;
}

const defaultWidgets: WidgetConfig[] = [
  { id: 'w1', type: 'KPI_REVENUE', title: 'إجمالي الإيرادات', isHidden: false, isCollapsed: false, isPinned: true, w: 1, h: 1, order: 1 },
  { id: 'w2', type: 'KPI_ORDERS', title: 'الطلبات النشطة', isHidden: false, isCollapsed: false, isPinned: true, w: 1, h: 1, order: 2 },
  { id: 'w3', type: 'KPI_TASKS', title: 'المهام المعلقة', isHidden: false, isCollapsed: false, isPinned: false, w: 1, h: 1, order: 3 },
  { id: 'w4', type: 'KPI_INVENTORY', title: 'نواقص المخزون', isHidden: false, isCollapsed: false, isPinned: false, w: 1, h: 1, order: 4 },
  { id: 'w5', type: 'MACHINE_STATUS', title: 'أفضل التصاميم', isHidden: false, isCollapsed: false, isPinned: false, w: 2, h: 2, order: 5 },
  // Hidden until features ship — avoids "غير مدعوم" empty shells
  { id: 'w6', type: 'CALENDAR', title: 'التقويم', isHidden: true, isCollapsed: false, isPinned: false, w: 2, h: 2, order: 6 },
  { id: 'w7', type: 'APPROVALS_PENDING', title: 'موافقات قيد الانتظار', isHidden: true, isCollapsed: false, isPinned: false, w: 2, h: 1, order: 7 },
  { id: 'w8', type: 'RECENT_ACTIVITY', title: 'أحدث النشاطات', isHidden: false, isCollapsed: false, isPinned: false, w: 2, h: 2, order: 8 },
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: defaultWidgets,
      toggleVisibility: (id) => set((state) => ({
        widgets: state.widgets.map(w => w.id === id ? { ...w, isHidden: !w.isHidden } : w)
      })),
      toggleCollapse: (id) => set((state) => ({
        widgets: state.widgets.map(w => w.id === id ? { ...w, isCollapsed: !w.isCollapsed } : w)
      })),
      togglePin: (id) => set((state) => ({
        widgets: state.widgets.map(w => w.id === id ? { ...w, isPinned: !w.isPinned } : w)
      })),
      reorderWidgets: (startIndex, endIndex) => set((state) => {
        const result = Array.from(state.widgets);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return { widgets: result.map((w, index) => ({ ...w, order: index })) };
      }),
      resetToDefault: () => set({ widgets: defaultWidgets })
    }),
    {
      // bump key so previous layouts with unsupported widgets reset
      name: 'decozr-dashboard-layout-v2',
    }
  )
);
