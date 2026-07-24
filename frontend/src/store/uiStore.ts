import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ModalType =
  | 'CREATE_ORDER'
  | 'CREATE_CUSTOMER'
  | 'CREATE_DESIGN'
  | 'CREATE_MACHINE'
  | 'CREATE_MATERIAL'
  | 'CREATE_EMPLOYEE'
  | 'CREATE_INVOICE'
  | 'CREATE_PAYMENT'
  | 'CREATE_SUPPLIER'
  | 'CREATE_PURCHASE'
  | 'CREATE_TASK'
  | 'CONFIRM_ACTION'
  | null;
type DrawerType =
  | 'ENTITY_DETAILS'
  | 'ORDER_DETAILS'
  | 'CUSTOMER_DETAILS'
  | 'MACHINE_DETAILS'
  | 'DESIGN_DETAILS'
  | 'INVOICE_PREVIEW'
  | 'AI_ASSISTANT'
  | null;

type ThemeMode = 'light' | 'dark';

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  data: any;
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
}

interface DrawerState {
  isOpen: boolean;
  type: DrawerType;
  data: any;
  openDrawer: (type: DrawerType, data?: any) => void;
  closeDrawer: () => void;
}

interface ConfirmState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
  openConfirm: (config: Omit<ConfirmState, 'isOpen' | 'openConfirm' | 'closeConfirm'>) => void;
  closeConfirm: () => void;
}

interface UIStore {
  modal: ModalState;
  drawer: DrawerState;
  confirm: ConfirmState;
  /** Customer portal mobile sidebar */
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  /** ERP admin mobile sidebar (separate to avoid freeze cross-layouts) */
  isErpSidebarOpen: boolean;
  toggleErpSidebar: () => void;
  setErpSidebarOpen: (open: boolean) => void;
  theme: ThemeMode;
  isDarkMode: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleDarkMode: () => void;
}

/** Clear scroll/pointer locks left by Radix dialogs or mobile sidebars */
export function unlockDocumentUi() {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  const body = document.body;

  body.style.removeProperty('overflow');
  body.style.removeProperty('pointer-events');
  body.style.removeProperty('padding-right');
  body.style.removeProperty('padding-left');
  body.style.removeProperty('margin-right');
  html.style.removeProperty('overflow');
  html.style.removeProperty('pointer-events');
  body.removeAttribute('data-scroll-locked');
  html.removeAttribute('data-scroll-locked');
  body.removeAttribute('data-aria-hidden');

  // Radix RemoveScroll can leave nested locks
  document.querySelectorAll('[data-scroll-locked]').forEach((el) => {
    el.removeAttribute('data-scroll-locked');
    (el as HTMLElement).style?.removeProperty?.('pointer-events');
    (el as HTMLElement).style?.removeProperty?.('overflow');
  });
}

const applyThemeToDom = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
};

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      isSidebarOpen: false,
      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      setSidebarOpen: (open) => {
        if (get().isSidebarOpen === open) return;
        set({ isSidebarOpen: open });
      },

      isErpSidebarOpen: false,
      toggleErpSidebar: () => set((s) => ({ isErpSidebarOpen: !s.isErpSidebarOpen })),
      setErpSidebarOpen: (open) => {
        if (get().isErpSidebarOpen === open) return;
        set({ isErpSidebarOpen: open });
      },

      theme: 'light',
      isDarkMode: false,
      setTheme: (theme) => {
        applyThemeToDom(theme);
        set({ theme, isDarkMode: theme === 'dark' });
      },
      toggleDarkMode: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        applyThemeToDom(next);
        set({ theme: next, isDarkMode: next === 'dark' });
      },

      modal: {
        isOpen: false,
        type: null,
        data: null,
        openModal: (type, data = null) => {
          // Clear any leftover lock BEFORE opening (prevents frozen UI)
          unlockDocumentUi();
          set((state) => ({ modal: { ...state.modal, isOpen: true, type, data } }));
        },
        closeModal: () => {
          const m = get().modal;
          if (!m.isOpen && m.type === null && m.data === null) return;
          set((state) => ({
            modal: { ...state.modal, isOpen: false, type: null, data: null },
          }));
          queueMicrotask(() => unlockDocumentUi());
        },
      },
      drawer: {
        isOpen: false,
        type: null,
        data: null,
        openDrawer: (type, data = null) =>
          set((state) => ({ drawer: { ...state.drawer, isOpen: true, type, data } })),
        closeDrawer: () => {
          const d = get().drawer;
          if (!d.isOpen && d.type === null && d.data === null) return;
          set((state) => ({
            drawer: { ...state.drawer, isOpen: false, type: null, data: null },
          }));
          queueMicrotask(() => unlockDocumentUi());
        },
      },
      confirm: {
        isOpen: false,
        title: '',
        description: '',
        confirmText: 'تأكيد',
        cancelText: 'إلغاء',
        variant: 'danger',
        onConfirm: () => {},
        openConfirm: (config) =>
          set((state) => ({ confirm: { ...state.confirm, ...config, isOpen: true } })),
        closeConfirm: () => {
          if (!get().confirm.isOpen) return;
          set((state) => ({ confirm: { ...state.confirm, isOpen: false } }));
        },
      },
    }),
    {
      name: 'decozr-ui-prefs',
      partialize: (s) => ({ theme: s.theme, isDarkMode: s.isDarkMode }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyThemeToDom(state.theme);
        else applyThemeToDom('light');
      },
    }
  )
);

// Apply light theme immediately on first load (before rehydrate)
if (typeof document !== 'undefined') {
  const raw = localStorage.getItem('decozr-ui-prefs');
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    applyThemeToDom(parsed?.state?.theme === 'dark' ? 'dark' : 'light');
  } catch {
    applyThemeToDom('light');
  }
}
