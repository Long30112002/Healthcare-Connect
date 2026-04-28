import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import LoadingSpinner from '../../../presentation/components/shared/LoadingSpinner';
import Button from '../../../presentation/components/shared/Button';
import StatusBadge from '../../../presentation/components/shared/StatusBadge';
import { formatDateArray, formatPrice } from '../../../shared/utils/dateUtils';
import toast from 'react-hot-toast';
import type { MedicalRecordResponse } from '../../../core/types/api.response';
import { medicalRecordApi } from '../../../infrastructure/api/medicalRecordApi';
import { exportMedicalRecordPDF } from '../../../shared/utils/pdfExport';
import axiosClient from '../../../infrastructure/api/axiosClient';

const ViewMedicalRecordPage: React.FC = () => {
    const navigate = useNavigate();
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const { t, currentLanguage } = useAppTranslation();

    const [loading, setLoading] = useState(true);
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecordResponse | null>(null);

    const handleExportPDF = async () => {
        if (!medicalRecord) return;

        try {
            const hospitalResponse = await axiosClient.get(`/hospitals/${medicalRecord.hospitalId}`);
            const hospitalData = hospitalResponse.data.data;

            const hospitalInfo = {
                name: hospitalData.name,
                address: hospitalData.address,
                phone: hospitalData.hotline,
                email: hospitalData.email,
                website: hospitalData.website
            };

            exportMedicalRecordPDF(medicalRecord, hospitalInfo, currentLanguage as 'vi' | 'en');
        } catch (error) {
            console.error('Failed to fetch hospital info:', error);
            exportMedicalRecordPDF(medicalRecord, undefined, currentLanguage as 'vi' | 'en');
        }
    };

    // Load medical record
    useEffect(() => {
        const loadMedicalRecord = async () => {
            if (!appointmentId) {
                toast.error(t('common.invalidData'));
                navigate('/doctor/dashboard');
                return;
            }

            setLoading(true);
            try {
                const record = await medicalRecordApi.getByAppointmentId(appointmentId);
                setMedicalRecord(record);
            } catch (error: any) {
                if (error.response?.status === 404) {
                    toast.error(t('medicalRecord.notFound'));
                } else {
                    toast.error(error.response?.data?.message || t('common.loadError'));
                }
                navigate('/doctor/dashboard');
            } finally {
                setLoading(false);
            }
        };

        loadMedicalRecord();
    }, [appointmentId, navigate, t]);

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    if (!medicalRecord) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">📋</span>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {t('medicalRecord.viewTitle')}
                                </h1>
                                <p className="text-blue-100 text-sm mt-1">
                                    {t('medicalRecord.viewSubtitle')}
                                </p>
                            </div>
                        </div>
                        {/* <div className="flex gap-2">
                            <Button variant="outline" onClick={handlePrint} className="bg-white/20 text-white hover:bg-white/30">
                                🖨️ {t('common.print')}
                            </Button>
                            <Button variant="outline" onClick={() => navigate(-1)} className="bg-white/20 text-white hover:bg-white/30">
                                ← {t('common.back')}
                            </Button>
                        </div> */}
                    </div>
                </div>

                {/* Medical Record Content - Printable */}
                <div className="print:bg-white print:p-0" id="medical-record-print">
                    {/* Header Info */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start flex-wrap gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {t('medicalRecord.medicalRecord')}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        #{medicalRecord.id.substring(0, 8).toUpperCase()}
                                    </p>
                                </div>
                                <StatusBadge status={medicalRecord.status} size="md" />
                            </div>
                        </div>

                        {/* Patient & Doctor Info */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <span className="text-lg">👤</span>
                                    {t('medicalRecord.patientInfo')}
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
                                    <p><span className="text-gray-500">{t('common.fullName')}:</span> <span className="font-medium">{medicalRecord.patientName}</span></p>
                                    <p><span className="text-gray-500">{t('common.phone')}:</span> {medicalRecord.patientPhone || '---'}</p>
                                    {medicalRecord.patientEmail && (
                                        <p><span className="text-gray-500">{t('common.email')}:</span> {medicalRecord.patientEmail}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <span className="text-lg">👨‍⚕️</span>
                                    {t('medicalRecord.doctorInfo')}
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
                                    <p><span className="text-gray-500">{t('common.doctorName')}:</span> <span className="font-medium">{medicalRecord.doctorName}</span></p>
                                    <p><span className="text-gray-500">{t('medicalRecord.doctorCode')}:</span> {medicalRecord.doctorCode}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Diagnosis & Symptoms */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                                    <span className="text-lg">📝</span>
                                    {t('medicalRecord.diagnosis')}
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                        {medicalRecord.diagnosis}
                                    </p>
                                </div>
                            </div>

                            {medicalRecord.symptoms && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                                        <span className="text-lg">💬</span>
                                        {t('medicalRecord.symptoms')}
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                            {medicalRecord.symptoms}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {medicalRecord.notes && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                                        <span className="text-lg">📌</span>
                                        {t('medicalRecord.notes')}
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                            {medicalRecord.notes}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Vital Signs */}
                    {medicalRecord.vitalSigns && (
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                            <div className="p-6">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-4">
                                    <span className="text-lg">🩺</span>
                                    {t('medicalRecord.vitalSigns')}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {medicalRecord.vitalSigns.bloodPressure && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                                            <p className="text-xs text-gray-500">{t('medicalRecord.bloodPressure')}</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {medicalRecord.vitalSigns.bloodPressure}
                                            </p>
                                        </div>
                                    )}
                                    {medicalRecord.vitalSigns.heartRate && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                                            <p className="text-xs text-gray-500">{t('medicalRecord.heartRate')}</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {medicalRecord.vitalSigns.heartRate} <span className="text-xs">bpm</span>
                                            </p>
                                        </div>
                                    )}
                                    {medicalRecord.vitalSigns.temperature && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                                            <p className="text-xs text-gray-500">{t('medicalRecord.temperature')}</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {medicalRecord.vitalSigns.temperature} <span className="text-xs">°C</span>
                                            </p>
                                        </div>
                                    )}
                                    {medicalRecord.vitalSigns.weight && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                                            <p className="text-xs text-gray-500">{t('medicalRecord.weight')}</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {medicalRecord.vitalSigns.weight} <span className="text-xs">kg</span>
                                            </p>
                                        </div>
                                    )}
                                    {medicalRecord.vitalSigns.height && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                                            <p className="text-xs text-gray-500">{t('medicalRecord.height')}</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {medicalRecord.vitalSigns.height} <span className="text-xs">cm</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {medicalRecord.vitalSigns.bmi && (
                                    <div className="mt-3 text-center">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                                BMI: {medicalRecord.vitalSigns.bmi}
                                            </span>
                                        </span>
                                    </div>
                                )}
                                {medicalRecord.vitalSigns.note && (
                                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 italic">
                                        📝 {medicalRecord.vitalSigns.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Prescriptions */}
                    {medicalRecord.prescriptions && medicalRecord.prescriptions.length > 0 && (
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                            <div className="p-6">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-4">
                                    <span className="text-lg">💊</span>
                                    {t('medicalRecord.prescriptions')}
                                </h3>

                                {medicalRecord.prescriptions.map((pres, idx) => (
                                    <div key={pres.id} className="mb-6 last:mb-0">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                            <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {t('medicalRecord.prescription')} #{idx + 1}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {t('medicalRecord.prescriptionDate')}: {formatDateArray(pres.prescriptionDate, 'date')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${pres.valid
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {pres.valid ? `✅ ${t('medicalRecord.valid')}` : `❌ ${t('medicalRecord.expired')}`}
                                                    </span>
                                                </div>
                                            </div>

                                            {pres.note && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">
                                                    📌 {pres.note}
                                                </p>
                                            )}

                                            {pres.validUntil && (
                                                <p className="text-xs text-gray-500 mb-3">
                                                    {t('medicalRecord.validUntil')}: {formatDateArray(pres.validUntil, 'date')}
                                                </p>
                                            )}

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-100 dark:bg-gray-600/50">
                                                        <tr>
                                                            <th className="p-2 text-left">{t('medicalRecord.medicine')}</th>
                                                            <th className="p-2 text-center">{t('medicalRecord.quantity')}</th>
                                                            <th className="p-2 text-left">{t('medicalRecord.dosage')}</th>
                                                            <th className="p-2 text-left">{t('medicalRecord.frequency')}</th>
                                                            <th className="p-2 text-right">{t('medicalRecord.price')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {pres.items.map((item) => (
                                                            <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                                                                <td className="p-2">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900 dark:text-white">{item.medicineName}</p>
                                                                        <p className="text-xs text-gray-500">{item.medicineCode}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="p-2 text-center">{item.quantity}</td>
                                                                <td className="p-2">{item.dosage}</td>
                                                                <td className="p-2">{item.frequency}</td>
                                                                <td className="p-2 text-right">{formatPrice(item.totalPrice)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <td colSpan={4} className="p-2 text-right font-semibold">
                                                                {t('medicalRecord.totalAmount')}:
                                                            </td>
                                                            <td className="p-2 text-right font-bold text-primary">
                                                                {formatPrice(pres.totalAmount)}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>

                                            {pres.items.some(item => item.instructions) && (
                                                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                    <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                                                        {t('medicalRecord.instructions')}:
                                                    </p>
                                                    {pres.items.map((item) => item.instructions && (
                                                        <p key={item.id} className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                                                            • {item.medicineName}: {item.instructions}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Follow Up Date */}
                    {medicalRecord.followUpDate && (
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                            <div className="p-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                        📅 {t('medicalRecord.followUpDate')}: {formatDateArray(medicalRecord.followUpDate, 'date')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-4 print:mt-4">
                        <p>{t('medicalRecord.generatedBy')} Healthcare Connect - {new Date().toLocaleString(currentLanguage === 'vi' ? 'vi-VN' : 'en-US')}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleExportPDF}>
                        🖨️ {t('common.pdf')}
                    </Button>
                    <Button variant="primary" onClick={() => navigate(-1)}>
                        ← {t('common.back')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ViewMedicalRecordPage;