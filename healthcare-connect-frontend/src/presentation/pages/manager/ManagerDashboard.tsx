import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useAuth } from '../../../application/context/AuthContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import Modal from '../../components/shared/Modal';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';
import toast from 'react-hot-toast';
import { RejectionReason } from '../../../core/constants/enums';
import type { ManagerDashboardStats, ReceptionistForManager, AppointmentTodayResponse, WeeklyStatResponse, TopDoctorResponse } from '../../../core/types';
import type { DoctorResponse } from '../../../core/types/api.response';
import { formatPrice } from '../../../shared/utils/dateUtils';
import { managerApi } from '../../../infrastructure/api/managerApi';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useAppTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // States
  const [stats, setStats] = useState<ManagerDashboardStats | null>(null);
  const [pendingDoctors, setPendingDoctors] = useState<DoctorResponse[]>([]);
  const [pendingReceptionists, setPendingReceptionists] = useState<ReceptionistForManager[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<AppointmentTodayResponse[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatResponse[]>([]);
  const [topDoctors, setTopDoctors] = useState<TopDoctorResponse[]>([]);

  // Modal states
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    type: 'doctor' | 'receptionist';
    id: string;
    name: string;
  }>({ open: false, type: 'doctor', id: '', name: '' });
  const [rejectReason, setRejectReason] = useState<RejectionReason>(RejectionReason.OTHER);
  const [rejectNote, setRejectNote] = useState('');

  // Loading states for actions
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          statsData,
          doctorsData,
          receptionistsData,
          appointmentsData,
          weeklyData,
          topDoctorsData,
        ] = await Promise.all([
          managerApi.getManagerDashboardStats(),
          managerApi.getPendingDoctors(),
          managerApi.getPendingReceptionists(),
          managerApi.getTodayAppointments(),
          managerApi.getWeeklyStatistics(),
          managerApi.getTopDoctors(5),
        ]);
        setStats(statsData);
        setPendingDoctors(doctorsData);
        setPendingReceptionists(receptionistsData);
        setTodayAppointments(appointmentsData);
        setWeeklyStats(weeklyData);
        setTopDoctors(topDoctorsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error(t('common.loadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  // Approve doctor
  const handleApproveDoctor = async (doctorId: string) => {
    setApprovingId(doctorId);
    try {
      await managerApi.approveDoctor(doctorId);
      toast.success(t('manager.approveDoctorSuccess'));
      setPendingDoctors(prev => prev.filter(d => d.id !== doctorId));
    } catch (error) {
      toast.error(t('manager.approveDoctorError'));
    } finally {
      setApprovingId(null);
    }
  };

  // Open reject modal
  const handleOpenRejectModal = (type: 'doctor' | 'receptionist', id: string, name: string) => {
    setRejectModal({ open: true, type, id, name });
    setRejectReason(RejectionReason.OTHER);
    setRejectNote('');
  };

  // Confirm reject
  const handleConfirmReject = async () => {
    const { type, id } = rejectModal;
    setRejectingId(id);
    try {
      if (type === 'doctor') {
        await managerApi.rejectDoctor(id, { reasonCode: rejectReason, note: rejectNote });
        toast.success(t('manager.rejectDoctorSuccess'));
        setPendingDoctors(prev => prev.filter(d => d.id !== id));
      } else {
        await managerApi.rejectReceptionist(id, { reasonCode: rejectReason, note: rejectNote });
        toast.success(t('manager.rejectReceptionistSuccess'));
        setPendingReceptionists(prev => prev.filter(r => r.id !== id));
      }
      setRejectModal({ open: false, type: 'doctor', id: '', name: '' });
    } catch (error) {
      toast.error(t('manager.rejectError'));
    } finally {
      setRejectingId(null);
    }
  };

  // Get max value for chart
  const maxWeeklyCount = Math.max(...weeklyStats.map(w => w.count), 0);

  if (loading) {
    return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <DashboardHeader
          icon="🏥"
          title={t('manager.dashboard.title')}
          subtitle={t('manager.dashboard.subtitle')}
          showHospital={true}
          hospitalName={user?.fullName?.includes('Manager') ? t('manager.yourHospital') : ''}
        />

        {/* 4 Stat Cards - dùng grid đơn giản */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">👨‍⚕️</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('manager.stats.totalDoctors')}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.totalDoctors || 0}
            </p>
            <p className={`text-sm mt-2 flex items-center gap-1 ${(stats?.totalDoctorsChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(stats?.totalDoctorsChange || 0) >= 0 ? '▲' : '▼'} {Math.abs(stats?.totalDoctorsChange || 0)}% {t('manager.stats.comparedToLastMonth')}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">👩‍💼</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('manager.stats.totalReceptionists')}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.totalReceptionists || 0}
            </p>
            <p className={`text-sm mt-2 flex items-center gap-1 ${(stats?.totalReceptionistsChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(stats?.totalReceptionistsChange || 0) >= 0 ? '▲' : '▼'} {Math.abs(stats?.totalReceptionistsChange || 0)}%
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📅</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('manager.stats.todayAppointments')}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.totalAppointmentsToday || 0}
            </p>
            <p className={`text-sm mt-2 flex items-center gap-1 ${(stats?.totalAppointmentsTodayChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(stats?.totalAppointmentsTodayChange || 0) >= 0 ? '▲' : '▼'} {Math.abs(stats?.totalAppointmentsTodayChange || 0)}% {t('manager.stats.comparedToYesterday')}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">💰</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('manager.stats.revenueThisMonth')}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
              {formatPrice(stats?.revenueThisMonth || 0)}
            </p>
            <p className={`text-sm mt-2 flex items-center gap-1 ${(stats?.revenueThisMonthChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(stats?.revenueThisMonthChange || 0) >= 0 ? '▲' : '▼'} {Math.abs(stats?.revenueThisMonthChange || 0)}% {t('manager.stats.comparedToLastMonth')}
            </p>
          </div>
        </div>

        {/* Two columns: Pending Approvals & Today Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pending Doctors */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                ⏳ {t('manager.pendingDoctors')} ({pendingDoctors.length})
              </h3>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {pendingDoctors.length === 0 ? (
                <p className="text-center text-gray-500 py-4">{t('manager.noPendingDoctors')}</p>
              ) : (
                <div className="space-y-3">
                  {pendingDoctors.map(doctor => (
                    <div key={doctor.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{doctor.fullName}</p>
                          <p className="text-sm text-gray-500">{doctor.specialtyName} - {doctor.departmentName}</p>
                          {/* <p className="text-xs text-gray-400">📅 {formatDate(doctor.createdAt)}</p> */}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleApproveDoctor(doctor.id)}
                            loading={approvingId === doctor.id}
                            className="px-3 py-1 text-sm"
                          >
                            ✅ {t('common.approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleOpenRejectModal('doctor', doctor.id, doctor.fullName)}
                            loading={rejectingId === doctor.id}
                            className="px-3 py-1 text-sm"
                          >
                            ❌ {t('common.reject')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {pendingDoctors.length > 0 && (
                <div className="mt-3 text-center">
                  <button
                    onClick={() => navigate('/manager/doctors?status=VERIFIED')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t('common.viewAll')} →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Today Appointments */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                📋 {t('manager.todayAppointments')} ({todayAppointments.length})
              </h3>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {todayAppointments.length === 0 ? (
                <p className="text-center text-gray-500 py-4">{t('manager.noAppointmentsToday')}</p>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.slice(0, 5).map(apt => (
                    <div key={apt.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-500">🕐 {apt.startTime} - {apt.endTime}</p>
                          <p className="font-medium text-gray-900 dark:text-white">👨‍⚕️ {apt.doctorName}</p>
                          <p className="text-sm text-gray-600">👤 {apt.patientName}</p>
                          <p className="text-xs text-gray-400">{apt.symptoms}</p>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={apt.status} size="sm" />
                          {/* <p className={`text-xs mt-1 font-medium ${apt.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                            {apt.isPaid ? t('payment.paid') : t('payment.unpaid')}
                          </p> */}
                          <p className={`text-xs mt-1 font-medium ${apt.paid ? 'text-green-600' : 'text-red-500'}`}>
                            {apt.paid ? t('payment.paid') : t('payment.unpaid')}
                          </p>
                          <p className="text-xs font-medium text-primary mt-1">{formatPrice(apt.price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {todayAppointments.length > 5 && (
                <div className="mt-3 text-center">
                  <button
                    onClick={() => navigate('/manager/appointments')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t('common.viewAll')} →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Chart */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              📊 {t('manager.weeklyStatistics')}
            </h3>
            <div className="flex items-end justify-between gap-2 h-48">
              {weeklyStats.map((stat, idx) => {
                const height = maxWeeklyCount > 0 ? (stat.count / maxWeeklyCount) * 150 : 0;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-blue-500 rounded-t-lg transition-all duration-500"
                      style={{ height: `${height}px` }}
                    />
                    <p className="text-xs text-gray-500 mt-2">{stat.day}</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{stat.count}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Doctors */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              👨‍⚕️ {t('manager.topDoctors')}
            </h3>
            <div className="space-y-3">
              {topDoctors.map(doctor => (
                <div key={doctor.doctorId} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-400 w-6">
                      {doctor.rank === 1 ? '🥇' : doctor.rank === 2 ? '🥈' : doctor.rank === 3 ? '🥉' : `${doctor.rank}.`}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{doctor.doctorName}</p>
                      <p className="text-xs text-gray-500">{doctor.specialtyName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{doctor.totalPatients} BN</p>
                    <p className="text-xs text-gray-500">{formatPrice(doctor.totalRevenue)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <button
                onClick={() => navigate('/manager/statistics')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('common.viewAll')} →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, type: 'doctor', id: '', name: '' })}
        onConfirm={handleConfirmReject}
        title={t('manager.rejectTitle', { name: rejectModal.name })}
        variant="danger"
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        loading={rejectingId !== null}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('manager.rejectReason')} <span className="text-red-500">*</span>
            </label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value as RejectionReason)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            >
              <option value={RejectionReason.INVALID_CERTIFICATE}>Bằng cấp không hợp lệ</option>
              <option value={RejectionReason.MISSING_DOCUMENTS}>Thiếu giấy tờ</option>
              <option value={RejectionReason.INSUFFICIENT_EXPERIENCE}>Chưa đủ kinh nghiệm</option>
              <option value={RejectionReason.PROFILE_MISMATCH}>Thông tin không khớp</option>
              <option value={RejectionReason.OTHER}>Lý do khác</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('manager.rejectNote')}
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              placeholder={t('manager.rejectNotePlaceholder')}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManagerDashboard;