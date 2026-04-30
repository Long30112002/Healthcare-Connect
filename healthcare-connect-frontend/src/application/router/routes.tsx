import { lazy } from 'react';
import { UserRole } from '../../core/constants/enums';
import ReceptionistDashboard from '../../presentation/pages/receptionist/ReceptionistDashboard';
import ReceptionistStatistics from '../../presentation/pages/receptionist/ReceptionistStatistics';
import ApplyDoctorPage from '../../presentation/pages/apply/ApplyDoctorPage';
import ApplyReceptionistPage from '../../presentation/pages/apply/ApplyReceptionistPage';
import ApplyStatusPage from '../../presentation/pages/apply/ApplyStatusPage';
import CreateMedicalRecordPage from '../../presentation/pages/doctor/CreateMedicalRecordPage';
import ViewMedicalRecordPage from '../../presentation/pages/doctor/ViewMedicalRecordPage';
import PatientDetailPage from '../../presentation/pages/doctor/PatientDetailPage';
import MyPatientsPage from '../../presentation/pages/doctor/MyPatientsPage';
import CreateSchedulePage from '../../presentation/components/medical-dashboard/CreateSchedulePage';
import MySchedulePage from '../../presentation/pages/doctor/MySchedulePage';
import PatientDashboard from '../../presentation/pages/patient-user-dashboard/PatientDashboard';
import ScheduleDetailPage from '../../presentation/pages/doctor/ScheduleDetailPage';
import ScheduleEditPage from '../../presentation/pages/doctor/ScheduleEditPage';
import DoctorReviewsPage from '../../presentation/pages/doctor/DoctorReviewsPage';
// import AppointmentDetailPage from '../../presentation/pages/doctor/AppointmentDetailPage';

// Lazy load components để tối ưu performance
const PublicHomePage = lazy(() => import('../../presentation/pages/PublicHomePage'));
const LoginPage = lazy(() => import('../../presentation/pages/LoginPage'));
const RegisterPage = lazy(() => import('../../presentation/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../../presentation/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../../presentation/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('../../presentation/pages/VerifyEmailPage'));
const AppointmentListPage = lazy(() => import('../../presentation/pages/patient/AppointmentListPage'));
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
  { path: '/receptionist/statistics', element: <ReceptionistStatistics />, layout: true, roles: [UserRole.RECEPTIONIST] },

  // Apply routes
  { path: '/apply/doctor', element: <ApplyDoctorPage />, layout: true, roles: ['PATIENT'] },
  { path: '/apply/receptionist', element: <ApplyReceptionistPage />, layout: true, roles: ['PATIENT'] },
  { path: '/apply/status', element: <ApplyStatusPage />, layout: true, isPublic: false },

  // Doctor routes
  { path: '/doctor/medical-records/create/:appointmentId', element: <CreateMedicalRecordPage />, layout: true, roles: [UserRole.DOCTOR] },
  { path: '/doctor/medical-records/create/:appointmentId', element: <CreateMedicalRecordPage />, layout: true, roles: [UserRole.DOCTOR] },
  { path: '/doctor/medical-records/view/:appointmentId', element: <ViewMedicalRecordPage />, layout: true, roles: [UserRole.DOCTOR] },

  { path: '/doctor/medical-records/view/:appointmentId', element: <ViewMedicalRecordPage />, layout: true, roles: [UserRole.DOCTOR, UserRole.PATIENT] },
  { path: '/my-patients', element: <MyPatientsPage />, layout: true, roles: [UserRole.DOCTOR] },
  { path: '/my-patients/:patientId', element: <PatientDetailPage />, layout: true, roles: [UserRole.DOCTOR] },
  { path: '/doctor/medical-records/create/:appointmentId', element: <CreateMedicalRecordPage />, layout: true, roles: [UserRole.DOCTOR] },
  { path: '/doctor/medical-records/view/:appointmentId', element: <ViewMedicalRecordPage />, layout: true, roles: [UserRole.DOCTOR] },
  { path: '/doctor/schedules/create', element: <CreateSchedulePage />, layout: true, roles: [UserRole.DOCTOR] },
  { path: '/my-schedule', element: <MySchedulePage />, layout: true, roles: [UserRole.DOCTOR] },
  { path: '/doctor/schedules/:id/detail', element: <ScheduleDetailPage />, layout: true, roles: [UserRole.DOCTOR] },
  { path: '/doctor/schedules/:id/edit', element: <ScheduleEditPage />, layout: true, roles: [UserRole.DOCTOR] },
  { path: '/doctor/reviews', element: <DoctorReviewsPage />, layout: true, roles: [UserRole.DOCTOR] }
  // { path: '/doctor/appointments/:appointmentId/detail', element: <AppointmentDetailPage />, layout: true, roles: [UserRole.DOCTOR] }
];