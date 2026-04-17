import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../../presentation/components/layout/Layout';
import LoadingSpinner from '../../presentation/components/shared/LoadingSpinner';
import { UserRole } from '../../core/constants/enums';
import { routes, type RouteConfig } from './routes';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (roles && !roles.includes(user?.role as UserRole)) {
    switch (user?.role) {
      case UserRole.PATIENT:
        return <Navigate to="/dashboard" replace />;
      case UserRole.DOCTOR:
        return <Navigate to="/doctor/dashboard" replace />;
      case UserRole.RECEPTIONIST:
        return <Navigate to="/receptionist/dashboard" replace />;
      case UserRole.ADMIN:
        return <Navigate to="/admin/dashboard" replace />;
      case UserRole.HOSPITAL_MANAGER:
        return <Navigate to="/manager/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

const RouteElement = ({ route }: { route: RouteConfig }) => {
  const content = route.isPublic ? (
    route.element
  ) : (
    <ProtectedRoute roles={route.roles}>{route.element}</ProtectedRoute>
  );

  return route.layout ? <Layout>{content}</Layout> : content;
};

export const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<RouteElement route={route} />}
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};