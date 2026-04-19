import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { receptionistApi } from '../../../infrastructure/api/receptionistApi';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Modal from '../../components/shared/Modal';
import toast from 'react-hot-toast';
import { formatDateTime, formatPrice } from '../../../shared/utils/dateUtils';
import type { DoctorListItem, ScheduleSlot } from '../../../core/types';
import { PaymentMethod, type PaymentMethod as PaymentMethodType } from '../../../core/constants/enums';

interface CreateOfflineAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PAYMENT_OPTIONS: Array<{
    value: PaymentMethodType;
    labelKey: string;
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
}> = [
        {
            value: PaymentMethod.CASH,
            labelKey: 'receptionist.cash',
            icon: '💵',
            color: 'text-green-700 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-500'
        },
        {
            value: PaymentMethod.MOMO,
            labelKey: 'receptionist.momo',
            icon: '🟣',
            color: 'text-purple-700 dark:text-purple-400',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            borderColor: 'border-purple-500'
        }
    ];

const CreateOfflineAppointmentModal = ({ isOpen, onClose, onSuccess }: CreateOfflineAppointmentModalProps) => {
    const { t, currentLanguage } = useAppTranslation();

    // States
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
    const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
    const [showQRModal, setShowQRModal] = useState(false);
    const [payUrl, setPayUrl] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED'>('PENDING');
    const [deeplink, setDeeplink] = useState<string | undefined>(undefined);

    // Form data
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [patientName, setPatientName] = useState('');
    const [phone, setPhone] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(PaymentMethod.CASH);

    // Polling refs
    const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            clearPolling();
        };
    }, []);

    // Fetch doctors when modal opens
    useEffect(() => {
        if (isOpen && step === 1) {
            fetchAvailableDoctors();
        }
    }, [isOpen, step]);

    const fetchAvailableDoctors = async () => {
        setLoading(true);
        try {
            const response = await receptionistApi.getAvailableDoctors(undefined, 30);
            setDoctors(response);
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
            toast.error(t('receptionist.loadDoctorsError'));
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedules = async (doctorId: string) => {
        setLoading(true);
        try {
            const doctorDetail = await receptionistApi.getDoctorSchedules(doctorId);
            const availableSchedules = doctorDetail.schedules.filter(
                (schedule: ScheduleSlot) => schedule.currentBookings < schedule.maxPatients
            );
            setSchedules(availableSchedules);
        } catch (error) {
            console.error('Failed to fetch schedules:', error);
            toast.error(t('receptionist.loadSchedulesError'));
        } finally {
            setLoading(false);
        }
    };

    const handleDoctorSelect = (doctorId: string) => {
        setSelectedDoctorId(doctorId);
        fetchSchedules(doctorId);
        setStep(2);
    };

    const handleSubmit = async () => {
        // Validation
        if (!patientName.trim()) {
            toast.error(t('receptionist.requiredPatientName'));
            return;
        }
        if (!phone.trim()) {
            toast.error(t('receptionist.requiredPhone'));
            return;
        }
        if (!selectedScheduleId) {
            toast.error(t('receptionist.requiredSchedule'));
            return;
        }

        setLoading(true);
        try {
            const response = await receptionistApi.createWalkInAppointment({
                patientName: patientName.trim(),
                patientPhone: phone.trim(),
                symptoms: symptoms.trim(),
                scheduleId: selectedScheduleId,
                paymentMethod
            });

            if (response.needPayment && response.qrCodeUrl && response.appointment?.id) {
                setQrCodeUrl(response.qrCodeUrl);
                setPayUrl(response.payUrl || '');
                setDeeplink(response.deeplink);
                setCurrentAppointmentId(response.appointment.id);
                setShowQRModal(true);
                setPaymentStatus('PENDING');
                startPolling(response.appointment.id);
                toast.success(`Đã tạo lịch cho bệnh nhân: ${patientName}`);
            } else {
                toast.success(response.message);
                onSuccess();
                handleClose();
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || t('receptionist.createAppointmentError');
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Polling functions
    const checkPaymentStatus = useCallback(async (appointmentId: string) => {
        try {
            const status = await receptionistApi.getPaymentStatus(appointmentId);
            if (status.paymentStatus === 'SUCCESS') {
                clearPolling();
                setPaymentStatus('SUCCESS');
                setShowQRModal(false);
                toast.success(t('payment.paymentSuccess'));
                onSuccess();
                handleClose();
            } else if (status.paymentStatus === 'FAILED') {
                clearPolling();
                setPaymentStatus('FAILED');
                toast.error(t('payment.paymentFailed'));
            }
        } catch (error) {
            console.error('Check payment status failed:', error);
        }
    }, [onSuccess, t]);

    const startPolling = useCallback((appointmentId: string) => {
        clearPolling();

        pollingIntervalRef.current = setInterval(() => {
            checkPaymentStatus(appointmentId);
        }, 3000);

        pollingTimeoutRef.current = setTimeout(() => {
            if (pollingIntervalRef.current) {
                clearPolling();
                setPaymentStatus('FAILED');
                toast.error(t('payment.paymentTimeout'));
                setShowQRModal(false);
            }
        }, 5 * 60 * 1000);
    }, [checkPaymentStatus, t]);

    const clearPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current);
            pollingTimeoutRef.current = null;
        }
    }, []);

    const handleManualCheckStatus = useCallback(async () => {
        if (!currentAppointmentId) return;

        try {
            const status = await receptionistApi.getPaymentStatus(currentAppointmentId);
            if (status.paymentStatus === 'SUCCESS') {
                clearPolling();
                toast.success(t('payment.paymentSuccess'));
                setShowQRModal(false);
                onSuccess();
                handleClose();
            } else if (status.paymentStatus === 'PENDING') {
                toast.loading(t('payment.stillWaiting'), { duration: 2000 });
            } else {
                toast.error(t('payment.paymentFailed'));
            }
        } catch (error) {
            toast.error(t('payment.checkStatusError'));
        }
    }, [currentAppointmentId, clearPolling, onSuccess, t]);

    const handleClose = useCallback(() => {
        clearPolling();
        setStep(1);
        setSelectedDoctorId('');
        setSelectedScheduleId('');
        setPatientName('');
        setPhone('');
        setSymptoms('');
        setPaymentMethod(PaymentMethod.CASH);
        setShowQRModal(false);
        setPayUrl('');
        setQrCodeUrl('');
        setCurrentAppointmentId(null);
        setPaymentStatus('PENDING');
        onClose();
    }, [clearPolling, onClose]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {step === 1 ? t('receptionist.selectDoctor') : t('receptionist.enterPatientInfo')}
                        </h2>
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                            ✕
                        </button>
                    </div>

                    <div className="p-4">
                        {step === 1 ? (
                            loading ? (
                                <div className="py-8 flex justify-center">
                                    <LoadingSpinner size="md" />
                                </div>
                            ) : doctors.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    {t('receptionist.noDoctorsAvailable')}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {doctors.map((doctor) => (
                                        <button
                                            key={doctor.id}
                                            onClick={() => handleDoctorSelect(doctor.id)}
                                            className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:shadow-md transition-all"
                                        >
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {doctor.fullName}
                                            </p>
                                            <p className="text-sm text-primary mt-0.5">
                                                {doctor.specialtyName}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                🏥 {doctor.hospitalName}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="space-y-4">
                                <Input
                                    label={t('receptionist.patientName')}
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    placeholder={t('receptionist.patientNamePlaceholder')}
                                    required
                                />

                                <Input
                                    label={t('receptionist.phone')}
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder={t('receptionist.phonePlaceholder')}
                                    required
                                />

                                {/* Chọn lịch */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('receptionist.selectSchedule')}
                                    </label>
                                    {loading ? (
                                        <div className="py-4 flex justify-center">
                                            <LoadingSpinner size="sm" />
                                        </div>
                                    ) : schedules.length === 0 ? (
                                        <div className="py-4 text-center text-gray-500">
                                            {t('receptionist.noSchedulesAvailable')}
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {schedules.map((schedule) => (
                                                <button
                                                    key={schedule.id}
                                                    onClick={() => setSelectedScheduleId(schedule.id)}
                                                    className={`w-full p-3 text-left border rounded-lg transition-all ${selectedScheduleId === schedule.id
                                                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                📅 {formatDateTime(schedule.date)}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                ⏰ {formatDateTime(schedule.startTime)} - {formatDateTime(schedule.endTime)}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                📊 {schedule.currentBookings}/{schedule.maxPatients} {t('receptionist.booked')}
                                                            </p>
                                                        </div>
                                                        <p className="text-lg font-bold text-primary">
                                                            {formatPrice(schedule.price)}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Chọn phương thức thanh toán */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('receptionist.paymentMethod')}
                                    </label>
                                    <div className="flex gap-3">
                                        {PAYMENT_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setPaymentMethod(option.value)}
                                                className={`flex-1 py-2.5 px-4 rounded-lg border-2 transition-all ${paymentMethod === option.value
                                                    ? `${option.bgColor} ${option.borderColor}`
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                    }`}
                                            >
                                                <span className="text-xl mr-2">{option.icon}</span>
                                                <span className={paymentMethod === option.value ? option.color : ''}>
                                                    {t(option.labelKey)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Input
                                    label={t('receptionist.symptoms')}
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder={t('receptionist.symptomsPlaceholder')}
                                />

                                <div className="flex gap-3 pt-4">
                                    <Button onClick={() => setStep(1)} variant="outline" fullWidth>
                                        ← {t('common.back')}
                                    </Button>
                                    <Button onClick={handleSubmit} variant="primary" fullWidth loading={loading}>
                                        {paymentMethod === PaymentMethod.CASH ? '💰 ' : '🟣 '}
                                        {t('receptionist.createAppointment')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* QR Modal cho MOMO */}
            <Modal
                isOpen={showQRModal}
                onClose={() => {
                    clearPolling();
                    setShowQRModal(false);
                }}
                title={t('payment.scanQRCode')}
                message={t('payment.pleaseScanQR')}
                showConfirm={false}
                showCancel={true}
                cancelText={t('common.close')}
                size="lg" 
            >
                <div className="flex flex-col items-center p-2">
                    <iframe
                        src={payUrl}
                        title="MoMo Payment"
                        className="w-full h-[500px] rounded-lg border-0"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                    />

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                        {paymentStatus === 'PENDING' ? '⏳ ' : '❌ '}
                        {t('payment.waitingForPayment')}
                    </p>

                    {/* Nút kiểm tra trạng thái */}
                    <Button
                        onClick={handleManualCheckStatus}
                        variant="outline"
                        className="mt-4"
                    >
                        🔄 {t('payment.checkStatus')}
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default CreateOfflineAppointmentModal;