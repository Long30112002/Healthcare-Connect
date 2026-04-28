import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import Button from '../../../presentation/components/shared/Button';
import LoadingSpinner from '../../../presentation/components/shared/LoadingSpinner';
import EmptyState from '../../../presentation/components/shared/EmptyState';
import StatusBadge from '../../../presentation/components/shared/StatusBadge';
import { appointmentApi } from '../../../infrastructure/api/appointmentApi';
import { medicalRecordApi } from '../../../infrastructure/api/medicalRecordApi';
import { formatDateTime, formatDateShort, formatPrice } from '../../../shared/utils/dateUtils';
import toast from 'react-hot-toast';
import type { MedicalRecordResponse } from '../../../core/types/api.response';
import type { Appointment } from '../../../core/types';

interface PatientInfo {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
    // birthYear?: string;
    // address?: string;
}

const PatientDetailPage = () => {
    const navigate = useNavigate();
    const { patientId } = useParams<{ patientId: string }>();
    const { t } = useAppTranslation();
    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState<PatientInfo | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecordResponse[]>([]);

    useEffect(() => {
        const fetchPatientData = async () => {
            if (!patientId) return;
            setLoading(true);
            try {
                // Lấy thông tin bệnh nhân
                const patientInfo = await appointmentApi.getPatientById(patientId);
                setPatient(patientInfo);
                
                // Lấy danh sách lịch hẹn
                const apts = await appointmentApi.getPatientAppointments(patientId);
                setAppointments(apts);
                
                // Lấy danh sách bệnh án
                const records = await medicalRecordApi.getByPatientId(patientId);
                setMedicalRecords(records);
            } catch (error) {
                toast.error(t('common.loadError'));
            } finally {
                setLoading(false);
            }
        };
        fetchPatientData();
    }, [patientId]);

    const handleViewMedicalRecord = (appointmentId: string) => {
        navigate(`/doctor/medical-records/view/${appointmentId}`);
    };

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    if (!patient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <EmptyState title={t('common.notFound')} description={t('patient.notFound')} icon="❌" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">👤</span>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {patient.fullName}
                                </h1>
                                <p className="text-blue-100 text-sm mt-1">
                                    {t('patient.detailTitle')}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => navigate(-1)} className="bg-white/20 text-white hover:bg-white/30">
                            ← {t('common.back')}
                        </Button>
                    </div>
                </div>

                {/* Patient Info Card */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            📋 {t('patient.personalInfo')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">{t('common.fullName')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{patient.fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('common.phone')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">{patient.phone || '---'}</p>
                            </div>
                            {patient.email && (
                                <div>
                                    <p className="text-sm text-gray-500">{t('common.email')}</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{patient.email}</p>
                                </div>
                            )}
                            {/* {patient.birthYear && (
                                <div>
                                    <p className="text-sm text-gray-500">{t('common.birthYear')}</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{patient.birthYear}</p>
                                </div>
                            )}
                            {patient.address && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500">{t('common.address')}</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{patient.address}</p>
                                </div>
                            )} */}
                        </div>
                    </div>
                </div>

                {/* Appointments History */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            📅 {t('patient.appointmentHistory')}
                        </h2>
                        {appointments.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">{t('patient.noAppointments')}</p>
                        ) : (
                            <div className="space-y-3">
                                {appointments.map((apt) => (
                                    <div key={apt.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <div className="flex justify-between items-start flex-wrap gap-2">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {formatDateTime(apt.startTime, 'dd/mm/yyyy HH:MM')}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    👨‍⚕️ {apt.doctorName}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    💰 {formatPrice(apt.price)} • {apt.paid ? t('common.paid') : t('common.unpaid')}
                                                </p>
                                            </div>
                                            <StatusBadge status={apt.status} size="sm" />
                                        </div>
                                        {apt.symptoms && (
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                💬 {t('doctor.symptoms')}: {apt.symptoms}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Medical Records */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            📋 {t('patient.medicalRecords')}
                        </h2>
                        {medicalRecords.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">{t('patient.noMedicalRecords')}</p>
                        ) : (
                            <div className="space-y-3">
                                {medicalRecords.map((record) => (
                                    <div key={record.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <div className="flex justify-between items-start flex-wrap gap-2">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    📅 {formatDateShort(record.createdAt || '')}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {t('medicalRecord.diagnosis')}: {record.diagnosis}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    💊 {t('medicalRecord.prescriptionCount')}: {record.prescriptionCount}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewMedicalRecord(record.appointmentId)}
                                            >
                                                📄 {t('medicalRecord.viewDetail')}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailPage;