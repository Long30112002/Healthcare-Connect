import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { receptionistApi } from '../../../infrastructure/api/receptionistApi';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import toast from 'react-hot-toast';

interface Doctor {
    id: string;
    fullName: string;
    specialtyName: string;
}

interface Schedule {
    id: string;
    startTime: number[];
    endTime: number[];
    price: number;
}

interface CreateOfflineAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateOfflineAppointmentModal = ({ isOpen, onClose, onSuccess }: CreateOfflineAppointmentModalProps) => {
    const { t } = useAppTranslation();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    
    // Form data
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [patientName, setPatientName] = useState('');
    const [phone, setPhone] = useState('');
    const [symptoms, setSymptoms] = useState('');
    
    // Fetch danh sách bác sĩ có lịch trống
    useEffect(() => {
        if (isOpen && step === 1) {
            fetchAvailableDoctors();
        }
    }, [isOpen, step]);
    
    const fetchAvailableDoctors = async () => {
        setLoading(true);
        try {
            // TODO: Gọi API lấy bác sĩ có lịch trống
            // const response = await receptionistApi.getAvailableDoctors();
            // setDoctors(response);
            
            // Mock data tạm thời
            setDoctors([
                { id: '1', fullName: 'BS. Nguyễn Văn An', specialtyName: 'Tim mạch' },
                { id: '2', fullName: 'BS. Trần Thị Bình', specialtyName: 'Nhi khoa' },
                { id: '3', fullName: 'BS. Lê Văn Cường', specialtyName: 'Thần kinh' },
            ]);
        } catch (error) {
            toast.error(t('receptionist.loadDoctorsError'));
        } finally {
            setLoading(false);
        }
    };
    
    const fetchSchedules = async (doctorId: string) => {
        setLoading(true);
        try {
            // TODO: Gọi API lấy lịch trống của bác sĩ
            // const response = await receptionistApi.getDoctorSchedules(doctorId);
            // setSchedules(response);
            
            // Mock data tạm thời
            setSchedules([
                { id: 's1', startTime: [2026, 4, 16, 8, 0], endTime: [2026, 4, 16, 8, 30], price: 500000 },
                { id: 's2', startTime: [2026, 4, 16, 9, 0], endTime: [2026, 4, 16, 9, 30], price: 500000 },
                { id: 's3', startTime: [2026, 4, 16, 10, 0], endTime: [2026, 4, 16, 10, 30], price: 500000 },
            ]);
        } catch (error) {
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
            await receptionistApi.createOfflineAppointment({
                patientName,
                phone,
                symptoms,
                doctorId: selectedDoctorId,
                scheduleId: selectedScheduleId,
            });
            toast.success(t('receptionist.createAppointmentSuccess'));
            onSuccess();
            handleClose();
        } catch (error) {
            toast.error(t('receptionist.createAppointmentError'));
        } finally {
            setLoading(false);
        }
    };
    
    const handleClose = () => {
        setStep(1);
        setSelectedDoctorId('');
        setSelectedScheduleId('');
        setPatientName('');
        setPhone('');
        setSymptoms('');
        onClose();
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {step === 1 ? t('receptionist.selectDoctor') : t('receptionist.enterPatientInfo')}
                    </h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                
                <div className="p-4">
                    {step === 1 ? (
                        // Bước 1: Chọn bác sĩ
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
                                        className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary transition"
                                    >
                                        <p className="font-semibold text-gray-900 dark:text-white">{doctor.fullName}</p>
                                        <p className="text-sm text-gray-500">{doctor.specialtyName}</p>
                                    </button>
                                ))}
                            </div>
                        )
                    ) : (
                        // Bước 2: Nhập thông tin bệnh nhân
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
                                ) : (
                                    <div className="space-y-2">
                                        {schedules.map((schedule) => (
                                            <button
                                                key={schedule.id}
                                                onClick={() => setSelectedScheduleId(schedule.id)}
                                                className={`w-full p-3 text-left border rounded-lg transition ${
                                                    selectedScheduleId === schedule.id
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-gray-200 dark:border-gray-700'
                                                }`}
                                            >
                                                <p className="font-medium">
                                                    {t('receptionist.time')}: {schedule.startTime[3]}:{String(schedule.startTime[4]).padStart(2, '0')} - {schedule.endTime[3]}:{String(schedule.endTime[4]).padStart(2, '0')}
                                                </p>
                                                <p className="text-sm text-primary">{schedule.price.toLocaleString()}đ</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <Input
                                label={t('receptionist.symptoms')}
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                placeholder={t('receptionist.symptomsPlaceholder')}
                            />
                            
                            <div className="flex gap-3 pt-4">
                                <Button onClick={() => setStep(1)} variant="outline" fullWidth>
                                    {t('common.back')}
                                </Button>
                                <Button onClick={handleSubmit} variant="primary" fullWidth loading={loading}>
                                    {t('receptionist.createAppointment')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateOfflineAppointmentModal;