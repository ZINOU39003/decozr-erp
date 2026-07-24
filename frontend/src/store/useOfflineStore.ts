import { create } from 'zustand';

interface OfflineState {
  isOffline: boolean;
  queuedActions: number;
  lastSync: Date | null;
  setOfflineStatus: (status: boolean) => void;
  addQueuedAction: () => void;
  processQueuedActions: () => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOffline: !navigator.onLine,
  queuedActions: 0,
  lastSync: new Date(),
  setOfflineStatus: (status) => set({ isOffline: status }),
  addQueuedAction: () => set((state) => ({ queuedActions: state.queuedActions + 1 })),
  processQueuedActions: () => set({ queuedActions: 0, lastSync: new Date() }),
}));

// Initialize listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineStore.getState().setOfflineStatus(false);
    useOfflineStore.getState().processQueuedActions();
  });
  window.addEventListener('offline', () => {
    useOfflineStore.getState().setOfflineStatus(true);
  });
}
