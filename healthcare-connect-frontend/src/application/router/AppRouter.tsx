import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../../presentation/pages/LoginPage';
import AppointmentListPage from '../../presentation/pages/AppointmentListPage';
import Layout from '../../presentation/components/layout/Layout';
import PublicHomePage from '../../presentation/pages/PublicHomePage';
import SettingsPage from '../../presentation/pages/SettingsPage';
import RegisterPage from '../../presentation/pages/RegisterPage';
import ForgotPasswordPage from '../../presentation/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../presentation/pages/ResetPasswordPage';
import VerifyEmailPage from '../../presentation/pages/VerifyEmailPage';
import PatientDashboard from '../../presentation/components/dashboard/PatientDashboard';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes - có Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <PublicHomePage />
        } />
        <Route path="/about" element={<div>Về chúng tôi</div>} />
        <Route path="/privacy-policy" element={<div>Chính sách bảo mật</div>} />
        <Route path="/terms" element={<div>Điều khoản sử dụng</div>} />
        <Route path="/contact" element={<div>Liên hệ</div>} />
        <Route path="/doctors/public" element={<div>Danh sách bác sĩ</div>} />

        {/* <Route path="/doctors" element={
          <PrivateRoute>
            <DoctorsPage />
          </PrivateRoute>
        } /> */}

        {/* Private routes */}
        <Route path="/appointments" element={
          <PrivateRoute>
            <AppointmentListPage />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <PatientDashboard />
          </PrivateRoute>
        } />
      </Route>

      {/* Auth routes (không có Layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify" element={<VerifyEmailPage />} />
    </Routes>
  );
};