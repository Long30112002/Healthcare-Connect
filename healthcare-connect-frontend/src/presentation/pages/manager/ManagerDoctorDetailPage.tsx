import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';
import { managerApi } from '../../../infrastructure/api/managerApi';
import { DoctorStatus, RejectionReason } from '../../../core/constants/enums';
import type { DoctorResponse } from '../../../core/types/api.response';
import toast from 'react-hot-toast';
import { formatDate, formatPrice } from '../../../shared/utils/dateUtils';

const ManagerDoctorDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { t } = useAppTranslation();
    const [loading, setLoading] = useState(true);
    const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
    const [hospitalName, setHospitalName] = useState('');

    // Reject modal
    const [rejectModal, setRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState<RejectionReason>(RejectionReason.OTHER);
    const [rejectNote, setRejectNote] = useState('');
    const [rejecting, setRejecting] = useState(false);

    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');

    // Fetch doctor data
    useEffect(() => {
        const fetchDoctor = async () => {
            if (!id) {
                toast.error(t('common.invalidData'));
                navigate('/manager/doctors');
                return;
            }
            setLoading(true);
            try {
                // TODO: Thêm API getDoctorById vào managerApi
                const data = await managerApi.getDoctorById(id);
                setDoctor(data);
                setHospitalName(data.hospitalName);
            } catch (error) {
                console.error('Failed to fetch doctor:', error);
                toast.error(t('common.loadError'));
                navigate('/manager/doctors');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [id, navigate, t]);

    // Approve doctor
    const { execute: handleApprove, loading: approving } = useMinLoadingAction({
        minLoadingTime: 500,
        successMessage: t('manager.approveDoctorSuccess'),
        errorMessage: t('manager.approveDoctorError'),
        onSuccess: () => {
            navigate('/manager/doctors');
        },
    });


    const handleViewCV = () => {
        if (!doctor?.cvUrl) {
            toast.error(t('manager.doctorDetail.noCV'));
            return;
        }
        setPdfUrl(doctor.cvUrl);
        setShowPdfModal(true);
    };

    const onApprove = () => {
        if (doctor) {
            handleApprove(() => managerApi.approveDoctor(doctor.id));
        }
    };

    // Reject doctor
    const handleConfirmReject = async () => {
        if (!doctor) return;
        setRejecting(true);
        try {
            await managerApi.rejectDoctor(doctor.id, { reasonCode: rejectReason, note: rejectNote });
            toast.success(t('manager.rejectDoctorSuccess'));
            navigate('/manager/doctors');
        } catch (error) {
            toast.error(t('manager.rejectError'));
        } finally {
            setRejecting(false);
            setRejectModal(false);
        }
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case DoctorStatus.APPROVED:
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">✅ {t('doctor.status.approved')}</span>;
            case DoctorStatus.VERIFIED:
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">🟡 {t('doctor.status.verified')}</span>;
            case DoctorStatus.PENDING:
                return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">⏳ {t('doctor.status.pending')}</span>;
            case DoctorStatus.REJECTED:
                return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">❌ {t('doctor.status.rejected')}</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    if (!doctor) {
        return null;
    }

    const isPending = doctor.status === DoctorStatus.VERIFIED;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
                {/* Header with back button */}
                <div className="mb-6">
                    <DashboardHeader
                        icon="👨‍⚕️"
                        title={t('manager.doctorDetail.title')}
                        subtitle={t('manager.doctorDetail.subtitle', { name: doctor.fullName })}
                        showHospital={true}
                        hospitalName={hospitalName}
                    />
                </div>

                {/* Personal Info Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            📋 {t('manager.doctorDetail.personalInfo')}
                        </h2>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">{t('common.fullName')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{doctor.fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('common.email')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{doctor.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('common.phone')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{doctor.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('manager.doctorDetail.doctorCode')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{doctor.doctorCode}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('manager.doctorDetail.registeredDate')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(doctor.createdAt || new Date().toISOString())}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('common.status')}</p>
                                <div className="mt-1">{getStatusBadge(doctor.status)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Info Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            🎓 {t('manager.doctorDetail.professionalInfo')}
                        </h2>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">{t('applyDoctor.department')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{doctor.departmentName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('applyDoctor.specialty')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{doctor.specialtyName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('applyDoctor.degree')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{doctor.degree}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('applyDoctor.experienceYears')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{doctor.experienceYears} {t('doctor.yearsExperience')}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">{t('schedule.price')}</p>
                                <p className="font-medium text-green-600 dark:text-green-400">{formatPrice(doctor.consultationFee)}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">{t('applyDoctor.biography')}</p>
                                <p className="text-gray-700 dark:text-gray-300">{doctor.biography || t('common.notAvailable')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CV Document Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            📄 {t('manager.doctorDetail.attachments')}
                        </h2>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📎</span>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">CV - {doctor.fullName}</p>
                                    <p className="text-xs text-gray-500">
                                        {doctor.cvUrl ? 'PDF' : t('manager.doctorDetail.noCV')}
                                    </p>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={handleViewCV}>
                                📄 {t('common.view')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* History Card (mock for now) */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            📜 {t('manager.doctorDetail.approvalHistory')}
                        </h2>
                    </div>
                    <div className="p-5">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 border-b border-gray-100 dark:border-gray-700">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{t('manager.doctorDetail.submitted')}</p>
                                    <p className="text-sm text-gray-500">{t('manager.doctorDetail.profileSubmitted')}</p>
                                </div>
                                <p className="text-sm text-gray-500">15/04/2024 14:30</p>
                            </div>
                            {doctor.status === DoctorStatus.VERIFIED && (
                                <div className="flex justify-between items-center p-2">
                                    <div>
                                        <p className="font-medium text-yellow-600 dark:text-yellow-400">{t('manager.doctorDetail.pendingApproval')}</p>
                                        <p className="text-sm text-gray-500">{t('manager.doctorDetail.waitingForManager')}</p>
                                    </div>
                                    <p className="text-sm text-gray-500">{formatDate(new Date().toISOString())}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons (only show if pending) */}
                {isPending && (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                🔘 {t('common.actions')}
                            </h2>
                        </div>
                        <div className="p-5 flex flex-wrap gap-3 justify-center">
                            <Button variant="primary" onClick={onApprove} loading={approving}>
                                ✅ {t('common.approve')}
                            </Button>
                            <Button variant="danger" onClick={() => setRejectModal(true)}>
                                ❌ {t('common.reject')}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            <Modal
                isOpen={rejectModal}
                onClose={() => setRejectModal(false)}
                onConfirm={handleConfirmReject}
                title={t('manager.rejectTitle', { name: doctor?.fullName || '' })}
                variant="danger"
                confirmText={t('common.confirm')}
                cancelText={t('common.cancel')}
                loading={rejecting}
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
                            <option value={RejectionReason.INVALID_CERTIFICATE}>{t('rejectionReason.invalidCertificate')}</option>
                            <option value={RejectionReason.MISSING_DOCUMENTS}>{t('rejectionReason.missingDocuments')}</option>
                            <option value={RejectionReason.INSUFFICIENT_EXPERIENCE}>{t('rejectionReason.insufficientExperience')}</option>
                            <option value={RejectionReason.PROFILE_MISMATCH}>{t('rejectionReason.profileMismatch')}</option>
                            <option value={RejectionReason.OTHER}>{t('rejectionReason.other')}</option>
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

            {/* PDF Viewer Modal */}
            <Modal
                isOpen={showPdfModal}
                onClose={() => setShowPdfModal(false)}
                title={t('manager.doctorDetail.viewCV')}
                size="lg"
                showConfirm={false}
                showCancel={true}
                cancelText={t('common.close')}
            >
                <div className="w-full h-[70vh]">
                    <iframe
                        src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`}
                        className="w-full h-full rounded-lg"
                        title="CV"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default ManagerDoctorDetailPage;