import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { usePermission, type Permission } from '../../lib/permissions';

/** Protects /portal/* — requires login + customer portal account */
export const PortalGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isPortalUser = useAuthStore((s) => s.isPortalUser);

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isPortalUser()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/** Protects ERP routes — portal-only users go to /portal */
export const ErpGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isPortalUser = useAuthStore((s) => s.isPortalUser);

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isPortalUser()) {
    return <Navigate to="/portal/dashboard" replace />;
  }

  return <>{children}</>;
};

/** Require at least one of the given permissions */
export const RequirePermission = ({
  anyOf,
  children,
  fallback = '/dashboard',
}: {
  anyOf: (Permission | string)[];
  children: React.ReactNode;
  fallback?: string;
}) => {
  const { hasAnyPermission } = usePermission();
  if (!hasAnyPermission(anyOf)) {
    return <Navigate to={fallback} replace />;
  }
  return <>{children}</>;
};
