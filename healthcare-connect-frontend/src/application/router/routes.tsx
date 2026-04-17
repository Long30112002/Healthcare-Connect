import { lazy } from 'react';
import { UserRole } from '../../core/constants/enums';
import ReceptionistDashboard from '../../presentation/pages/receptionist/ReceptionistDashboard';

// Lazy load components để tối ưu performance
const PublicHomePage = lazy(() => import('../../presentation/pages/PublicHomePage'));
const LoginPage = lazy(() => import('../../presentation/pages/LoginPage'));
const RegisterPage = lazy(() => import('../../presentation/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../../presentation/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../../presentation/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('../../presentation/pages/VerifyEmailPage'));
const AppointmentListPage = lazy(() => import('../../presentation/pages/patient/AppointmentListPage'));
const PatientDashboard = lazy(() => import('../../presentation/components/dashboard/PatientDashboard'));
const DoctorDashboard = lazy(() => import('../../presentation/pages/doctor/DoctorDashboard'));
const DoctorsPage = lazy(() => import('../../presentation/pages/patient/DoctorsPage'));
const DoctorDetailPage = lazy(() => import('../../presentation/pages/patient/DoctorDetailPage'));
const SettingsPage = lazy(() => import('../../presentation/pages/SettingsPage'));
const PaymentPage = lazy(() => import('../../presentation/pages/payment/PaymentPage'));
const PaymentResultPage = lazy(() => import('../../presentation/pages/payment/PaymentResultPage'));

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  roles?: UserRole[];      // Required roles (undefined = all roles allowed)
  layout?: boolean;        // Use Layout or not
  isPublic?: boolean;      // No login required
}

export const routes: RouteConfig[] = [
  // Public routes (no login, no layout)
  { path: '/login', element: <LoginPage />, layout: false, isPublic: true },
  { path: '/register', element: <RegisterPage />, layout: false, isPublic: true },
  { path: '/forgot-password', element: <ForgotPasswordPage />, layout: false, isPublic: true },
  { path: '/reset-password', element: <ResetPasswordPage />, layout: false, isPublic: true },
  { path: '/verify', element: <VerifyEmailPage />, layout: false, isPublic: true },

  // Public routes (with layout)
  { path: '/', element: <PublicHomePage />, layout: true, isPublic: true },
  { path: '/about', element: <div>Về chúng tôi</div>, layout: true, isPublic: true },
  { path: '/privacy-policy', element: <div>Chính sách bảo mật</div>, layout: true, isPublic: true },
  { path: '/terms', element: <div>Điều khoản sử dụng</div>, layout: true, isPublic: true },
  { path: '/contact', element: <div>Liên hệ</div>, layout: true, isPublic: true },
  { path: '/doctors/public', element: <div>Danh sách bác sĩ</div>, layout: true, isPublic: true },

  // Private routes (require login)
  { path: '/dashboard', element: <PatientDashboard />, layout: true, roles: [UserRole.PATIENT] },
  { path: '/doctor/dashboard', element: <DoctorDashboard />, layout: true, roles: [UserRole.DOCTOR] },
  { path: '/appointments', element: <AppointmentListPage />, layout: true, roles: [UserRole.PATIENT, UserRole.DOCTOR] },
  { path: '/doctors', element: <DoctorsPage />, layout: true, roles: [UserRole.PATIENT] },
  { path: '/doctors/:id', element: <DoctorDetailPage />, layout: true, roles: [UserRole.PATIENT] },
  { path: '/settings', element: <SettingsPage />, layout: true, roles: Object.values(UserRole) },
  { path: '/payment/:appointmentId', element: <PaymentPage />, layout: true, roles: [UserRole.PATIENT] },
  { path: '/payment-result', element: <PaymentResultPage />, layout: true, roles: [UserRole.PATIENT] },
  { path: '/receptionist/dashboard', element: <ReceptionistDashboard />, layout: true, roles: [UserRole.RECEPTIONIST] },
];