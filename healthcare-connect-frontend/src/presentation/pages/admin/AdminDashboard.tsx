import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';
import toast from 'react-hot-toast';
import { formatPrice } from '../../../shared/utils/dateUtils';
import { RejectionReason } from '../../../core/constants/enums';
import type { DoctorResponse } from '../../../core/types/api.response';
import { adminApi } from '../../../infrastructure/api/adminApi';
import type { DashboardStats, TopHospital, UserTrend } from '../../../core/types';

const AdminDashboard = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingDoctors, setPendingDoctors] = useState<DoctorResponse[]>([]);
  const [topHospitals, setTopHospitals] = useState<TopHospital[]>([]);
  const [userTrend, setUserTrend] = useState<UserTrend[]>([]);

  // Modal states
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    doctorId: string;
    doctorName: string;
  }>({ open: false, doctorId: '', doctorName: '' });
  const [rejectReason, setRejectReason] = useState<RejectionReason>(RejectionReason.OTHER);
  const [rejectNote, setRejectNote] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, doctorsData, hospitalsData, trendData] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getPendingDoctors(),
          adminApi.getTopHospitals(3),
          adminApi.getUserTrend(),
        ]);
        setStats(statsData);
        setPendingDoctors(doctorsData);
        setTopHospitals(hospitalsData);
        setUserTrend(trendData);
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
      await adminApi.approveDoctor(doctorId);
      toast.success(t('admin.approveDoctorSuccess'));
      setPendingDoctors(prev => prev.filter(d => d.id !== doctorId));
    } catch (error) {
      toast.error(t('admin.approveDoctorError'));
    } finally {
      setApprovingId(null);
    }
  };

  // Open reject modal
  const handleOpenRejectModal = (doctorId: string, doctorName: string) => {
    setRejectModal({ open: true, doctorId, doctorName });
    setRejectReason(RejectionReason.OTHER);
    setRejectNote('');
  };

  // Confirm reject
  const handleConfirmReject = async () => {
    const { doctorId } = rejectModal;
    setRejectingId(doctorId);
    try {
      await adminApi.rejectDoctor(doctorId, { reasonCode: rejectReason, note: rejectNote });
      toast.success(t('admin.rejectDoctorSuccess'));
      setPendingDoctors(prev => prev.filter(d => d.id !== doctorId));
      setRejectModal({ open: false, doctorId: '', doctorName: '' });
    } catch (error) {
      toast.error(t('admin.rejectError'));
    } finally {
      setRejectingId(null);
    }
  };

  // Get max value for chart
  const maxTrendCount = Math.max(...userTrend.map(t => t.count), 0);

  if (loading) {
    return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        
        {/* Header */}
        <DashboardHeader
          icon="👑"
          title={t('admin.dashboard.title')}
          subtitle={t('admin.dashboard.subtitle')}
          showHospital={false}
        />

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">👥</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.stats.totalUsers')}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.totalUsers || 0}
            </p>
            <p className={`text-sm mt-2 flex items-center gap-1 ${(stats?.totalUsersChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(stats?.totalUsersChange || 0) >= 0 ? '▲' : '▼'} {Math.abs(stats?.totalUsersChange || 0)}%
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">👨‍⚕️</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.stats.totalDoctors')}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.totalDoctors || 0}
            </p>
            <p className={`text-sm mt-2 flex items-center gap-1 ${(stats?.totalDoctorsChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(stats?.totalDoctorsChange || 0) >= 0 ? '▲' : '▼'} {Math.abs(stats?.totalDoctorsChange || 0)}%
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🏥</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.stats.totalHospitals')}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.totalHospitals || 0}
            </p>
            <p className={`text-sm mt-2 flex items-center gap-1 ${(stats?.totalHospitalsChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(stats?.totalHospitalsChange || 0) >= 0 ? '▲' : '▼'} {Math.abs(stats?.totalHospitalsChange || 0)}%
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📅</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.stats.totalBookings')}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.totalBookings || 0}
            </p>
            <p className={`text-sm mt-2 flex items-center gap-1 ${(stats?.totalBookingsChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(stats?.totalBookingsChange || 0) >= 0 ? '▲' : '▼'} {Math.abs(stats?.totalBookingsChange || 0)}%
            </p>
          </div>
        </div>

        {/* Two columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Left column: Pending Doctors */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                ⏳ {t('admin.pendingDoctors')} ({pendingDoctors.length})
              </h3>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {pendingDoctors.length === 0 ? (
                <p className="text-center text-gray-500 py-4">{t('admin.noPendingDoctors')}</p>
              ) : (
                <div className="space-y-3">
                  {pendingDoctors.slice(0, 5).map((doctor) => (
                    <div key={doctor.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{doctor.fullName}</p>
                          <p className="text-sm text-gray-500">{doctor.specialtyName} - {doctor.departmentName}</p>
                          <p className="text-xs text-gray-400">🏥 {doctor.hospitalName}</p>
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
                            onClick={() => handleOpenRejectModal(doctor.id, doctor.fullName)}
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
              {pendingDoctors.length > 5 && (
                <div className="mt-3 text-center">
                  <button
                    onClick={() => navigate('/admin/doctors?status=PENDING')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t('common.viewAll')} →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Booking Overview */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                📊 {t('admin.bookingOverview')}
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">📅 {t('admin.todayBookings')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats?.todayBookings || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">📆 {t('admin.weekBookings')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats?.weekBookings || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">📅 {t('admin.monthBookings')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats?.monthBookings || 0}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">✅ {t('admin.paymentRate')}</span>
                  <span className="text-sm font-semibold text-green-600">{stats?.paymentRate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats?.paymentRate || 0}%` }} />
                </div>
                
                <div className="flex justify-between items-center mt-3 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">❌ {t('admin.cancelRate')}</span>
                  <span className="text-sm font-semibold text-red-600">{stats?.cancelRate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${stats?.cancelRate || 0}%` }} />
                </div>
                
                <div className="flex justify-between items-center mt-3 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">⏰ {t('admin.noShowRate')}</span>
                  <span className="text-sm font-semibold text-yellow-600">{stats?.noShowRate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${stats?.noShowRate || 0}%` }} />
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/admin/reports')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('admin.viewDetailedReport')} →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Top Hospitals Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              🏆 {t('admin.topHospitals')}
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {topHospitals.map((hospital) => (
                <div key={hospital.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {hospital.rank === 1 ? '🥇' : hospital.rank === 2 ? '🥈' : '🥉'}
                        </span>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{hospital.name}</h4>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">📍 {hospital.address}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">👨‍⚕️ {hospital.doctorCount} {t('admin.doctors')}</span>
                        <span className="text-gray-600 dark:text-gray-400">📅 {hospital.bookingCount} {t('admin.bookings')}</span>
                        <span className="text-green-600 font-medium">💰 {formatPrice(hospital.revenue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <button
                onClick={() => navigate('/admin/hospitals')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('admin.manageHospitals')} →
              </button>
            </div>
          </div>
        </div>

        {/* User Trend Chart */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            📈 {t('admin.userTrend')}
          </h3>
          <div className="flex items-end justify-between gap-2 h-48">
            {userTrend.map((item, idx) => {
              const height = maxTrendCount > 0 ? (item.count / maxTrendCount) * 150 : 0;
              return (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-blue-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${height}px` }}
                  />
                  <p className="text-xs text-gray-500 mt-2">T{item.month}</p>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.count}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, doctorId: '', doctorName: '' })}
        onConfirm={handleConfirmReject}
        title={t('admin.rejectTitle', { name: rejectModal.doctorName })}
        variant="danger"
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        loading={rejectingId !== null}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.rejectReason')} <span className="text-red-500">*</span>
            </label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value as RejectionReason)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            >
              <option value={RejectionReason.INVALID_CERTIFICATE}>{t('rejectionReason.invalidCertificate')}</option>
              <option value={RejectionReason.MISSING_DOCUMENTS}>{t('rejectionReason.missingDocuments')}</option>
              <option value={RejectionReason.INSUFFICIENT_EXPERIENCE}>{t('rejectionReason.insufficientExperience')}</option>
              <option value={RejectionReason.PROFILE_MISMATCH}>{t('rejectionReason.profileMismatch')}</option>
              <option value={RejectionReason.OTHER}>{t('rejectionReason.other')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.rejectNote')}
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              placeholder={t('admin.rejectNotePlaceholder')}
            />
          </div>
        </div>
      </Modal>
      
    </div>
  );
};

export default AdminDashboard;