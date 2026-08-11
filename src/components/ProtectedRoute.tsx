import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import { PageLoader } from './ui';

/**
 * Rola görə giriş qoruması. Rol uyğun gəlmirsə istifadəçi
 * öz panelinə yönləndirilir — "icazə yoxdur" səhifəsi göstərmək əvəzinə.
 */
export function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Sessiya yoxlanılır..." />;

  if (!user) {
    return <Navigate to="/daxil-ol" state={{ from: location.pathname }} replace />;
  }

  if (user.role !== role) {
    return <Navigate to={user.role === 'ORG_OWNER' ? '/teskilat' : '/panel'} replace />;
  }

  return <>{children}</>;
}
