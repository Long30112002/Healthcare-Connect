import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useAuth } from '../../../application/context/AuthContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import toast from 'react-hot-toast';
import { commonApi } from '../../../infrastructure/api/commonApi';
import type { ApplicationResponse } from '../../../core/types/api.response';
import { UserRole, type RejectionReason } from '../../../core/constants/enums';


const ApplyStatusPage = () => {
    const { t } = useAppTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [applications, setApplications] = useState<ApplicationResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await commonApi.getMyApplications();
            setApplications(response);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
            toast.error(t('applyStatus.loadError'));
        } finally {
            setLoading(false);
        }
    };

    // MAP ENUM SANG HIỂN THỊ
    const getStatusConfig = (status: string) => {
        const config: Record<string, { color: string; bgColor: string; icon: string; label: string }> = {
            PENDING: {
                color: 'text-yellow-700 dark:text-yellow-400',
                bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                icon: '⏳',
                label: t('applyStatus.statusPending')
            },
            VERIFIED: {
                color: 'text-blue-700 dark:text-blue-400',
                bgColor: 'bg-blue-100 dark:bg-blue-900/30',
                icon: '✅',
                label: t('applyStatus.statusVerified')
            },
            APPROVED: {
                color: 'text-green-700 dark:text-green-400',
                bgColor: 'bg-green-100 dark:bg-green-900/30',
                icon: '🎉',
                label: t('applyStatus.statusApproved')
            },
            REJECTED: {
                color: 'text-red-700 dark:text-red-400',
                bgColor: 'bg-red-100 dark:bg-red-900/30',
                icon: '❌',
                label: t('applyStatus.statusRejected')
            }
        };
        return config[status] || config.PENDING;
    };

    // MAP REJECTION REASON
    const getRejectionReasonText = (reason: RejectionReason): string => {
        const reasonMap: Record<RejectionReason, string> = {
            INVALID_CERTIFICATE: t('applyStatus.reasonInvalidCertificate'),
            MISSING_DOCUMENTS: t('applyStatus.reasonMissingDocuments'),
            INSUFFICIENT_EXPERIENCE: t('applyStatus.reasonInsufficientExperience'),
            PROFILE_MISMATCH: t('applyStatus.reasonProfileMismatch'),
            OTHER: t('applyStatus.reasonOther')
        };
        return reasonMap[reason] || reason;
    };

    const getTypeIcon = (type: string) => {
        return type === UserRole.DOCTOR ? '👨‍⚕️' : '👩‍💼';
    };

    const getTypeLabel = (type: string) => {
        return type === UserRole.DOCTOR ? t('applyStatus.doctor') : t('applyStatus.receptionist');
    };

    const getTimelineSteps = (status: string) => {
        const steps = [
            { key: 'SUBMIT', label: t('applyStatus.stepSubmit'), icon: '📝' },
            { key: 'VERIFY', label: t('applyStatus.stepVerify'), icon: '🔍' },
            { key: 'APPROVE', label: t('applyStatus.stepApprove'), icon: '✅' }
        ];

        const statusMap: Record<string, number> = {
            PENDING: 0,
            VERIFIED: 1,
            APPROVED: 2,
            REJECTED: -1
        };

        const currentStep = statusMap[status] ?? 0;

        return steps.map((step, index) => ({
            ...step,
            isCompleted: index <= currentStep && status !== 'REJECTED',
            isActive: index === currentStep && status !== 'REJECTED'
        }));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">📋</span>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{t('applyStatus.title')}</h1>
                            <p className="text-blue-100 text-sm mt-1">{t('applyStatus.subtitle')}</p>
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg">
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{user?.fullName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                {applications.length === 0 ? (
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-12 text-center">
                        <span className="text-6xl mb-4 block">📭</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {t('applyStatus.noApplications')}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('applyStatus.noApplicationsDesc')}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button variant="primary" onClick={() => navigate('/apply/doctor')}>
                                👨‍⚕️ {t('applyStatus.applyDoctor')}
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/apply/receptionist')}>
                                👩‍💼 {t('applyStatus.applyReceptionist')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => {
                            const statusConfig = getStatusConfig(app.status);
                            const timelineSteps = getTimelineSteps(app.status);
                            const isRejected = app.status === 'REJECTED';

                            return (
                                <div key={app.id} className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-5 shadow-sm hover:shadow-md transition">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{getTypeIcon(app.type)}</span>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {getTypeLabel(app.type)}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <span>🏥</span> {app.hospitalName}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                                            {statusConfig.icon} {statusConfig.label}
                                        </span>
                                    </div>

                                    {/* Rejection Reason */}
                                    {isRejected && app.rejectionReason && (
                                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                                                {t('applyStatus.rejectionReason')}:
                                            </p>
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {getRejectionReasonText(app.rejectionReason)}
                                                {app.rejectionNote && <span className="block text-xs mt-1">({app.rejectionNote})</span>}
                                            </p>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    {!isRejected && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between">
                                                {timelineSteps.map((step, idx) => (
                                                    <div key={step.key} className="flex-1 text-center">
                                                        <div className="relative">
                                                            {idx > 0 && (
                                                                <div className={`absolute top-4 left-0 w-full h-0.5 ${step.isCompleted ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                                                                    }`} />
                                                            )}
                                                            <div className={`relative z-10 inline-flex items-center justify-center w-8 h-8 rounded-full ${step.isCompleted
                                                                ? 'bg-primary text-white'
                                                                : step.isActive
                                                                    ? 'bg-primary/20 text-primary border-2 border-primary'
                                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                                                }`}>
                                                                {step.isCompleted ? '✓' : step.icon}
                                                            </div>
                                                        </div>
                                                        <p className={`text-xs mt-2 ${step.isActive ? 'text-primary font-medium' : 'text-gray-500 dark:text-gray-400'
                                                            }`}>
                                                            {step.label}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Date Info */}
                                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>{t('applyStatus.submitted')}: {formatDate(app.createdAt)}</span>
                                        <span>{t('applyStatus.updated')}: {formatDate(app.updatedAt)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplyStatusPage;