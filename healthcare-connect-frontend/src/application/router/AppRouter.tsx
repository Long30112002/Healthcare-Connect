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

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes - vẫn dùng Layout (Header tự ẩn menu private) */}
      <Route element={<Layout />}>
        <Route path="/" element={<PublicHomePage />} />
        <Route path="/about" element={<div>Về chúng tôi</div>} />
        <Route path="/privacy-policy" element={<div>Chính sách bảo mật</div>} />
        <Route path="/terms" element={<div>Điều khoản sử dụng</div>} />
        <Route path="/contact" element={<div>Liên hệ</div>} />
        <Route path="/doctors/public" element={<div>Danh sách bác sĩ</div>} />

        {/* Private routes */}
        <Route path="/appointments" element={
          <PrivateRoute> <AppointmentListPage /> </PrivateRoute>
        }

        />
        <Route path="/settings" element={
          <PrivateRoute> <SettingsPage /> </PrivateRoute>
        }
        />



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