import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import Button from '../../../presentation/components/shared/Button';
import Input from '../../../presentation/components/shared/Input';
import LoadingSpinner from '../../../presentation/components/shared/LoadingSpinner';
import { appointmentApi } from '../../../infrastructure/api/appointmentApi';
import toast from 'react-hot-toast';
import type { Appointment, VitalSigns } from '../../../core/types';
import type { CreateMedicalRecordRequest } from '../../../core/types/api.request';
import type { MedicineResponse } from '../../../core/types/api.response';
import { medicalRecordApi } from '../../../infrastructure/api/medicalRecordApi';
import { medicineApi } from '../../../infrastructure/api/medicineApi';

interface PrescriptionItemForm {
    id: string;
    medicineId: string;
    medicineName: string;
    quantity: number;
    dosage: string;
    frequency: string;
    duration: number;
    instructions: string;
}

interface PrescriptionForm {
    id: string;
    note: string;
    validUntil: string;
    items: PrescriptionItemForm[];
}

const CreateMedicalRecordPage: React.FC = () => {
    const navigate = useNavigate();
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const { t } = useAppTranslation();

    // States
    const [loading, setLoading] = useState(true);
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [medicines, setMedicines] = useState<MedicineResponse[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');

    // Form states
    const [diagnosis, setDiagnosis] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [notes, setNotes] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');

    // Vital signs
    const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
        bloodPressure: '',
        heartRate: undefined,
        temperature: undefined,
        weight: undefined,
        height: undefined,
        note: ''
    });

    // Prescriptions
    const [prescriptions, setPrescriptions] = useState<PrescriptionForm[]>([
        { id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, note: '', validUntil: '', items: [] }
    ]);

    // Search medicines
    const handleSearchMedicine = async () => {
        if (!searchKeyword.trim()) return;
        try {
            const result = await medicineApi.search(searchKeyword, 0, 10);
            setMedicines(result.content);
        } catch (error) {
            toast.error(t('medicine.searchError'));
        }
    };

    const addMedicineToPrescription = (prescriptionId: string, medicine: MedicineResponse) => {
        setPrescriptions(prev => prev.map(pres => {
            if (pres.id !== prescriptionId) return pres;

            const existingItem = pres.items.find(item => item.medicineId === medicine.id);
            if (existingItem) {
                toast.error(t('medicine.alreadyAdded'));
                return pres;
            }

            const newItem: PrescriptionItemForm = {
                id: crypto.randomUUID(),
                medicineId: medicine.id,
                medicineName: medicine.name,
                quantity: 1,
                dosage: '',
                frequency: '',
                duration: 0,
                instructions: ''
            };
            return { ...pres, items: [...pres.items, newItem] };
        }));
        setMedicines([]);
        setSearchKeyword('');
    };

    const removeMedicineFromPrescription = (prescriptionId: string, itemId: string) => {
        setPrescriptions(prev => prev.map(pres => {
            if (pres.id !== prescriptionId) return pres;
            return { ...pres, items: pres.items.filter(item => item.id !== itemId) };
        }));
    };

    const updatePrescriptionItem = (prescriptionId: string, itemId: string, field: keyof PrescriptionItemForm, value: any) => {
        setPrescriptions(prev => prev.map(pres => {
            if (pres.id !== prescriptionId) return pres;
            return {
                ...pres,
                items: pres.items.map(item =>
                    item.id === itemId ? { ...item, [field]: value } : item
                )
            };
        }));
    };

    const updatePrescription = (prescriptionId: string, field: keyof PrescriptionForm, value: any) => {
        setPrescriptions(prev => prev.map(pres =>
            pres.id === prescriptionId ? { ...pres, [field]: value } : pres
        ));
    };

    const addPrescription = () => {
        setPrescriptions(prev => [
            ...prev,
            { id: crypto.randomUUID(), note: '', validUntil: '', items: [] }
        ]);
    };

    const removePrescription = (prescriptionId: string) => {
        if (prescriptions.length === 1) {
            toast.error(t('medicalRecord.atLeastOnePrescription'));
            return;
        }
        setPrescriptions(prev => prev.filter(pres => pres.id !== prescriptionId));
    };

    // Calculate total amount for display
    const calculateTotalAmount = (items: PrescriptionItemForm[]) => {
        return items.reduce((total, item) => {
            const medicine = medicines.find(m => m.id === item.medicineId);
            const price = medicine?.price || 0;
            return total + (price * item.quantity);
        }, 0);
    };

    // Submit form
    const { execute: submitRecord, loading: submitting } = useMinLoadingAction({
        minLoadingTime: 1000,
        successMessage: t('medicalRecord.createSuccess'),
        errorMessage: (error) => error.response?.data?.message || t('medicalRecord.createError'),
        onSuccess: (_result) => {
            navigate(`/doctor/medical-records/view/${appointmentId}`);
        }
    });

    const handleSubmit = async () => {
        if (!diagnosis.trim()) {
            toast.error(t('medicalRecord.diagnosisRequired'));
            return;
        }

        const prescriptionData = prescriptions
            .filter(pres => pres.items.length > 0)
            .map(pres => ({
                note: pres.note,
                validUntil: pres.validUntil ? new Date(pres.validUntil).toISOString().split('T')[0] : undefined,
                items: pres.items.map(item => ({
                    medicineId: item.medicineId,
                    quantity: item.quantity,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    duration: item.duration,
                    instructions: item.instructions
                }))
            }));

        const request: CreateMedicalRecordRequest = {
            appointmentId: appointmentId!,
            diagnosis,
            symptoms: symptoms || undefined,
            notes: notes || undefined,
            followUpDate: followUpDate || undefined,
            vitalSigns: {
                bloodPressure: vitalSigns.bloodPressure || undefined,
                heartRate: vitalSigns.heartRate,
                temperature: vitalSigns.temperature,
                weight: vitalSigns.weight,
                height: vitalSigns.height,
                note: vitalSigns.note || undefined
            },
            prescriptions: prescriptionData.length > 0 ? prescriptionData : undefined
        };

        await submitRecord(() => medicalRecordApi.create(request));
    };

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [appointmentData, medicinesData] = await Promise.all([
                    appointmentApi.getAppointmentById(appointmentId!),
                    medicineApi.getAll(0, 100)
                ]);
                setAppointment(appointmentData);
                setMedicines(medicinesData.content);
            } catch (error) {
                toast.error(t('common.loadError'));
                navigate('/doctor/dashboard');
            } finally {
                setLoading(false);
            }
        };
        if (appointmentId) {
            loadData();
        }
    }, [appointmentId, navigate, t]);

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    if (!appointment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">{t('common.notFound')}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">📝</span>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {t('medicalRecord.createTitle')}
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">
                                {t('medicalRecord.createSubtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 space-y-6">
                        {/* Patient Info Card */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <span className="text-lg">👤</span>
                                {t('medicalRecord.patientInfo')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">{t('common.fullName')}</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {appointment.patientName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('common.phone')}</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {appointment.patientPhone || '---'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('common.doctorName')}</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {appointment.doctorName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('common.hospital')}</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {appointment.hospitalName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Diagnosis */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t('medicalRecord.diagnosis')} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder={t('medicalRecord.diagnosisPlaceholder')}
                            />
                        </div>

                        {/* Symptoms */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t('medicalRecord.symptoms')}
                            </label>
                            <textarea
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder={t('medicalRecord.symptomsPlaceholder')}
                            />
                        </div>

                        {/* Vital Signs */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <span className="text-lg">🩺</span>
                                {t('medicalRecord.vitalSigns')}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <Input
                                    label={t('medicalRecord.bloodPressure')}
                                    value={vitalSigns.bloodPressure || ''}
                                    onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                                    placeholder="120/80"
                                />
                                <Input
                                    label={t('medicalRecord.heartRate')}
                                    type="number"
                                    value={vitalSigns.heartRate?.toString() || ''}
                                    onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: parseInt(e.target.value) || undefined })}
                                    placeholder="bpm"
                                />
                                <Input
                                    label={t('medicalRecord.temperature')}
                                    type="number"
                                    step="0.1"
                                    value={vitalSigns.temperature?.toString() || ''}
                                    onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: parseFloat(e.target.value) || undefined })}
                                    placeholder="°C"
                                />
                                <Input
                                    label={t('medicalRecord.weight')}
                                    type="number"
                                    step="0.1"
                                    value={vitalSigns.weight?.toString() || ''}
                                    onChange={(e) => setVitalSigns({ ...vitalSigns, weight: parseFloat(e.target.value) || undefined })}
                                    placeholder="kg"
                                />
                                <Input
                                    label={t('medicalRecord.height')}
                                    type="number"
                                    step="0.1"
                                    value={vitalSigns.height?.toString() || ''}
                                    onChange={(e) => setVitalSigns({ ...vitalSigns, height: parseFloat(e.target.value) || undefined })}
                                    placeholder="cm"
                                />
                            </div>
                            <div className="mt-3">
                                <Input
                                    label={t('medicalRecord.vitalSignsNote')}
                                    value={vitalSigns.note || ''}
                                    onChange={(e) => setVitalSigns({ ...vitalSigns, note: e.target.value })}
                                    placeholder={t('medicalRecord.vitalSignsNotePlaceholder')}
                                />
                            </div>
                        </div>

                        {/* Follow Up Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t('medicalRecord.followUpDate')}
                            </label>
                            <input
                                type="date"
                                value={followUpDate}
                                onChange={(e) => setFollowUpDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t('medicalRecord.notes')}
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder={t('medicalRecord.notesPlaceholder')}
                            />
                        </div>

                        {/* Prescriptions Section */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <span className="text-lg">💊</span>
                                    {t('medicalRecord.prescriptions')}
                                </h3>
                                <Button variant="outline" size="sm" onClick={addPrescription}>
                                    + {t('medicalRecord.addPrescription')}
                                </Button>
                            </div>

                            {prescriptions.map((pres, presIndex) => (
                                <div key={pres.id} className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 mb-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-gray-700 dark:text-gray-300">
                                            {t('medicalRecord.prescription')} #{presIndex + 1}
                                        </h4>
                                        {prescriptions.length > 1 && (
                                            <Button variant="danger" size="sm" onClick={() => removePrescription(pres.id)}>
                                                🗑️ {t('common.remove')}
                                            </Button>
                                        )}
                                    </div>

                                    {/* Search Medicine */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {t('medicalRecord.searchMedicine')}
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={searchKeyword}
                                                onChange={(e) => setSearchKeyword(e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                                                placeholder={t('medicalRecord.searchMedicinePlaceholder')}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearchMedicine()}
                                            />
                                            <Button onClick={handleSearchMedicine} variant="primary" size="sm">
                                                🔍 {t('common.search')}
                                            </Button>
                                        </div>
                                        {medicines.length > 0 && searchKeyword && (
                                            <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                                                {medicines.map(med => (
                                                    <div
                                                        key={med.id}
                                                        onClick={() => addMedicineToPrescription(pres.id, med)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-700"
                                                    >
                                                        <p className="font-medium text-gray-900 dark:text-white">{med.name}</p>
                                                        <p className="text-xs text-gray-500">{med.formattedPrice} • {med.unit}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Medicine Items List */}
                                    {pres.items.length > 0 && (
                                        <div className="space-y-3">
                                            <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {t('medicalRecord.medicineList')}
                                            </h5>
                                            {pres.items.map(item => {
                                                const medicine = medicines.find(m => m.id === item.medicineId);
                                                return (
                                                    <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">{item.medicineName}</p>
                                                                <p className="text-xs text-gray-500">{medicine?.formattedPrice} / {medicine?.unit}</p>
                                                            </div>
                                                            <Button variant="danger" size="sm" onClick={() => removeMedicineFromPrescription(pres.id, item.id)}>
                                                                ✕
                                                            </Button>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                                            <Input
                                                                label={t('medicalRecord.quantity')}
                                                                type="number"
                                                                value={item.quantity.toString()}
                                                                onChange={(e) => updatePrescriptionItem(pres.id, item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                                min={1}
                                                            />
                                                            <Input
                                                                label={t('medicalRecord.dosage')}
                                                                value={item.dosage}
                                                                onChange={(e) => updatePrescriptionItem(pres.id, item.id, 'dosage', e.target.value)}
                                                                placeholder="1 viên/lần"
                                                            />
                                                            <Input
                                                                label={t('medicalRecord.frequency')}
                                                                value={item.frequency}
                                                                onChange={(e) => updatePrescriptionItem(pres.id, item.id, 'frequency', e.target.value)}
                                                                placeholder="3 lần/ngày"
                                                            />
                                                            <Input
                                                                label={t('medicalRecord.duration')}
                                                                type="number"
                                                                value={item.duration.toString()}
                                                                onChange={(e) => updatePrescriptionItem(pres.id, item.id, 'duration', parseInt(e.target.value) || 0)}
                                                                placeholder={t('medicalRecord.days')}
                                                                min={1}
                                                            />
                                                        </div>
                                                        <Input
                                                            label={t('medicalRecord.instructions')}
                                                            value={item.instructions}
                                                            onChange={(e) => updatePrescriptionItem(pres.id, item.id, 'instructions', e.target.value)}
                                                            placeholder={t('medicalRecord.instructionsPlaceholder')}
                                                            className="mt-2"
                                                        />
                                                        <div className="mt-2 text-right">
                                                            <p className="text-sm font-semibold text-primary">
                                                                {t('medicalRecord.subtotal')}: {(medicine?.price || 0) * item.quantity}đ
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div className="text-right pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <p className="text-base font-bold text-primary">
                                                    {t('medicalRecord.totalAmount')}: {calculateTotalAmount(pres.items).toLocaleString()}đ
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Prescription Note */}
                                    <div className="mt-4">
                                        <Input
                                            label={t('medicalRecord.prescriptionNote')}
                                            value={pres.note}
                                            onChange={(e) => updatePrescription(pres.id, 'note', e.target.value)}
                                            placeholder={t('medicalRecord.prescriptionNotePlaceholder')}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
                                {t('common.cancel')}
                            </Button>
                            <Button variant="primary" onClick={handleSubmit} loading={submitting} className="flex-1">
                                📝 {t('medicalRecord.submit')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateMedicalRecordPage;