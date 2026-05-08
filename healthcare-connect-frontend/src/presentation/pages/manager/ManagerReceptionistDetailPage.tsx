import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useAuth } from '../../../application/context/AuthContext';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import Modal from '../../components/shared/Modal';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';
import { managerApi } from '../../../infrastructure/api/managerApi';
import { ReceptionistStatus, RejectionReason } from '../../../core/constants/enums';
import type { ReceptionistForManager } from '../../../core/types/api.response';
import toast from 'react-hot-toast';

const ManagerReceptionistDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { t } = useAppTranslation();
    const [loading, setLoading] = useState(true);
    const [receptionist, setReceptionist] = useState<ReceptionistForManager | null>(null);
    const [hospitalName, setHospitalName] = useState('');

    // Reject modal
    const [rejectModal, setRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState<RejectionReason>(RejectionReason.OTHER);
    const [rejectNote, setRejectNote] = useState('');
    const [rejecting, setRejecting] = useState(false);

    // Fetch receptionist data
    useEffect(() => {
        const fetchReceptionist = async () => {
            if (!id) {
                toast.error(t('common.invalidData'));
                navigate('/manager/receptionists');
                return;
            }
            setLoading(true);
            try {
                // TODO: Thêm API getReceptionistById vào managerApi
                // const data = await managerApi.getReceptionistById(id);
                // setReceptionist(data);

                // Tạm thời dùng mock data
                await new Promise(resolve => setTimeout(resolve, 500));
                setReceptionist({
                    id: id,
                    receptionistCode: 'REC-2024-001',
                    fullName: 'Nguyễn Thị B',
                    email: 'nguyenthib@email.com',
                    phone: '0912345678',
                    status: ReceptionistStatus.VERIFIED,
                    cvUrl: 'https://example.com/cv.pdf',
                    createdAt: '2024-04-15T10:30:00',
                    updatedAt: '2024-04-15T10:30:00',
                });
                setHospitalName('Bệnh viện Đa khoa Xuyên Á');
            } catch (error) {
                console.error('Failed to fetch receptionist:', error);
                toast.error(t('common.loadError'));
                navigate('/manager/receptionists');
            } finally {
                setLoading(false);
            }
        };
        fetchReceptionist();
    }, [id, navigate, t]);

    // Approve receptionist
    const { execute: handleApprove, loading: approving } = useMinLoadingAction({
        minLoadingTime: 500,
        successMessage: t('manager.approveReceptionistSuccess'),
        errorMessage: t('manager.approveReceptionistError'),
        onSuccess: () => {
            navigate('/manager/receptionists');
        },
    });

    const onApprove = () => {
        if (receptionist) {
            handleApprove(() => managerApi.approveReceptionist(receptionist.id));
        }
    };

    // Reject receptionist
    const handleConfirmReject = async () => {
        if (!receptionist) return;
        setRejecting(true);
        try {
            await managerApi.rejectReceptionist(receptionist.id, { reasonCode: rejectReason, note: rejectNote });
            toast.success(t('manager.rejectReceptionistSuccess'));
            navigate('/manager/receptionists');
        } catch (error) {
            toast.error(t('manager.rejectError'));
        } finally {
            setRejecting(false);
            setRejectModal(false);
        }
    };

    // Download CV
    const handleDownloadCV = () => {
        if (!receptionist?.cvUrl) {
            toast.error(t('manager.receptionistDetail.noCV'));
            return;
        }
        window.open(receptionist.cvUrl, '_blank');
    };

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case ReceptionistStatus.APPROVED:
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">✅ {t('receptionist.status.approved')}</span>;
            case ReceptionistStatus.VERIFIED:
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">🟡 {t('receptionist.status.verified')}</span>;
            case ReceptionistStatus.PENDING:
                return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">⏳ {t('receptionist.status.pending')}</span>;
            case ReceptionistStatus.REJECTED:
                return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">❌ {t('receptionist.status.rejected')}</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    if (!receptionist) {
        return null;
    }

    const isPending = receptionist.status === ReceptionistStatus.VERIFIED;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
                {/* Header with back button */}
                <div className="mb-6">
                    <DashboardHeader
                        icon="👩‍💼"
                        title={t('manager.receptionistDetail.title')}
                        subtitle={t('manager.receptionistDetail.subtitle', { name: receptionist.fullName })}
                        showHospital={true}
                        hospitalName={hospitalName}
                    />
                </div>

                {/* Personal Info Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            📋 {t('manager.receptionistDetail.personalInfo')}
                        </h2>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">{t('common.fullName')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{receptionist.fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('common.email')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{receptionist.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('common.phone')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{receptionist.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('manager.receptionistDetail.receptionistCode')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{receptionist.receptionistCode}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('manager.receptionistDetail.registeredDate')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(receptionist.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('common.status')}</p>
                                <div className="mt-1">{getStatusBadge(receptionist.status)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CV Document Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            📄 {t('manager.receptionistDetail.attachments')}
                        </h2>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📎</span>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">CV - {receptionist.fullName}</p>
                                    <p className="text-xs text-gray-500">
                                        {receptionist.cvUrl ? 'PDF' : t('manager.receptionistDetail.noCV')}
                                    </p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDownloadCV}
                                disabled={!receptionist.cvUrl}
                            >
                                📥 {t('common.download')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* History Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            📜 {t('manager.receptionistDetail.approvalHistory')}
                        </h2>
                    </div>
                    <div className="p-5">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 border-b border-gray-100 dark:border-gray-700">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{t('manager.receptionistDetail.submitted')}</p>
                                    <p className="text-sm text-gray-500">{t('manager.receptionistDetail.profileSubmitted')}</p>
                                </div>
                                <p className="text-sm text-gray-500">{formatDate(receptionist.createdAt)}</p>
                            </div>
                            {receptionist.status === ReceptionistStatus.VERIFIED && (
                                <div className="flex justify-between items-center p-2">
                                    <div>
                                        <p className="font-medium text-yellow-600 dark:text-yellow-400">{t('manager.receptionistDetail.pendingApproval')}</p>
                                        <p className="text-sm text-gray-500">{t('manager.receptionistDetail.waitingForManager')}</p>
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
                title={t('manager.rejectTitle', { name: receptionist?.fullName || '' })}
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
        </div>
    );
};

export default ManagerReceptionistDetailPage;