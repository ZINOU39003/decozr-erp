import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../services/apiClient';

export type UserRole =
  | 'Admin'
  | 'Manager'
  | 'Sales'
  | 'Designer'
  | 'Production'
  | 'Warehouse'
  | 'Finance'
  | 'HR'
  | 'Driver'
  | 'Customer'
  | 'Distributor'
  | 'admin'
  | 'manager'
  | 'seller'
  | 'sales'
  | 'designer'
  | 'accountant'
  | 'cutting_ops'
  | 'printing_ops'
  | 'cutting_status'
  | 'follow_up'
  | 'customer'
  | 'distributor'
  | 'worker';

interface AuthState {
  role: UserRole;
  roles: string[];
  permissions: string[];
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: any | null;
  setRole: (role: UserRole) => void;
  setTokens: (access: string, refresh: string) => void;
  setCurrentUser: (user: any) => void;
  logout: () => void;
  isPortalUser: () => boolean;
  hasPermission: (permission: string) => boolean;
  applyUserSession: (user: any, access?: string, refresh?: string) => void;
  refreshMe: () => Promise<void>;
  devLogin: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
}

const ROLE_ALIASES: Record<string, UserRole> = {
  admin: 'Admin',
  Admin: 'Admin',
  manager: 'Manager',
  Manager: 'Manager',
  seller: 'Sales',
  sales: 'Sales',
  Sales: 'Sales',
  customer: 'Customer',
  Customer: 'Customer',
  distributor: 'Distributor',
  Distributor: 'Distributor',
  worker: 'Production',
  Production: 'Production',
  designer: 'Designer',
  Designer: 'Designer',
  accountant: 'Finance',
  Finance: 'Finance',
  cutting_ops: 'Production',
  printing_ops: 'Production',
  cutting_status: 'Production',
  follow_up: 'Sales',
  Warehouse: 'Warehouse',
  HR: 'HR',
  Driver: 'Driver',
};

export const normalizeRole = (raw?: string | null): UserRole => {
  if (!raw) return 'Admin';
  return ROLE_ALIASES[raw] || ROLE_ALIASES[String(raw).toLowerCase()] || (raw as UserRole);
};

const mapPrimaryRole = (user: any): UserRole => {
  const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];
  if (roles.includes('admin')) return 'Admin';
  if (user?.role) return normalizeRole(user.role);
  if (roles.includes('manager')) return 'Manager';
  if (roles.includes('customer')) return 'Customer';
  if (roles.includes('distributor')) return 'Distributor';
  if (roles.includes('seller') || roles.includes('sales')) return 'Sales';
  if (roles.includes('designer')) return 'Designer';
  if (roles.includes('accountant')) return 'Finance';
  if (
    roles.includes('worker') ||
    roles.includes('cutting_ops') ||
    roles.includes('printing_ops') ||
    roles.includes('cutting_status')
  ) {
    return 'Production';
  }
  if (roles.includes('follow_up')) return 'Sales';
  return normalizeRole(roles[0]);
};

const extractPermissions = (user: any): string[] =>
  Array.isArray(user?.permissions) ? user.permissions.map(String) : [];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      role: 'Admin',
      roles: [],
      permissions: [],
      accessToken: null,
      refreshToken: null,
      currentUser: null,
      setRole: (role) => set({ role }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setCurrentUser: (currentUser) =>
        set({
          currentUser,
          roles: Array.isArray(currentUser?.roles) ? currentUser.roles : [],
          permissions: extractPermissions(currentUser),
          role: mapPrimaryRole(currentUser),
        }),
      applyUserSession: (user, access, refresh) =>
        set({
          ...(access ? { accessToken: access } : {}),
          ...(refresh ? { refreshToken: refresh } : {}),
          currentUser: user,
          roles: Array.isArray(user?.roles) ? user.roles : [],
          permissions: extractPermissions(user),
          role: mapPrimaryRole(user),
        }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          currentUser: null,
          role: 'Admin',
          roles: [],
          permissions: [],
        }),
      isPortalUser: () => {
        const user = get().currentUser;
        const roles: string[] = Array.isArray(user?.roles) ? user.roles : get().roles;
        return (
          !!user?.is_portal ||
          !!user?.customer_id ||
          roles.includes('customer') ||
          roles.includes('distributor')
        );
      },
      hasPermission: (permission: string) => {
        const { roles, permissions, role } = get();
        if (roles.includes('admin') || role === 'Admin') return true;
        return permissions.includes(permission);
      },
      refreshMe: async () => {
        try {
          const user: any = await apiClient.get('/auth/me');
          get().setCurrentUser(user);
        } catch (e) {
          console.error('refreshMe failed', e);
        }
      },
      devLogin: async () => {
        try {
          if (get().accessToken) return;
          const res: any = await apiClient.post('/auth/login', {
            email: 'admin@decozr.local',
            password: 'admin123',
          });
          const { access_token, refresh_token, user } = res;
          if (access_token) get().applyUserSession(user, access_token, refresh_token);
        } catch (error) {
          console.error('Dev login failed', error);
        }
      },
      login: async (email, password) => {
        try {
          const res: any = await apiClient.post('/auth/login', { email, password });
          const { access_token, refresh_token, user } = res;
          if (access_token) {
            get().applyUserSession(user, access_token, refresh_token);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login failed', error);
          return false;
        }
      },
    }),
    {
      name: 'decozr-auth-storage',
      partialize: (s) => ({
        role: s.role,
        roles: s.roles,
        permissions: s.permissions,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        currentUser: s.currentUser,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.role) state.role = normalizeRole(state.role);
        if (!Array.isArray(state?.permissions)) {
          if (state) state.permissions = [];
        }
      },
    },
  ),
);
