import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FeatureFlags {
  enableAIAssistant: boolean;
  enableBarcode: boolean;
  enableWorkflowEngine: boolean;
  enableCRM: boolean;
  enableAccounting: boolean;
  enableAdvancedReports: boolean;
}

interface FeatureFlagState {
  flags: FeatureFlags;
  toggleFlag: (flag: keyof FeatureFlags) => void;
  setFlags: (flags: Partial<FeatureFlags>) => void;
}

export const useFeatureFlags = create<FeatureFlagState>()(
  persist(
    (set) => ({
      flags: {
        enableAIAssistant: false,
        enableBarcode: true,
        enableWorkflowEngine: true,
        enableCRM: true,
        enableAccounting: true,
        enableAdvancedReports: true,
      },
      toggleFlag: (flag) =>
        set((state) => ({
          flags: {
            ...state.flags,
            [flag]: !state.flags[flag],
          },
        })),
      setFlags: (newFlags) =>
        set((state) => ({
          flags: {
            ...state.flags,
            ...newFlags,
          },
        })),
    }),
    {
      name: 'decozr-feature-flags',
    }
  )
);
