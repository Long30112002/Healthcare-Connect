import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import Button from '../shared/Button';
import Input from '../shared/Input';
import LoadingSpinner from '../shared/LoadingSpinner';
import { doctorApi } from '../../../infrastructure/api/doctorApi';
import { commonApi } from '../../../infrastructure/api/commonApi';
import { workingHoursApi } from '../../../infrastructure/api/workingHoursApi';
import toast from 'react-hot-toast';
import type { RoomResponse, WorkingHoursResponse } from '../../../core/types/api.response';
import { formatTimeOnly } from '../../../shared/utils/dateUtils';

interface ScheduleFormData {
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    maxPatients: number;
    roomId: string;
}

const CreateSchedulePage = () => {
    const navigate = useNavigate();
    const { t } = useAppTranslation();
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState<RoomResponse[]>([]);
    const [workingHours, setWorkingHours] = useState<WorkingHoursResponse[]>([]);
    const [availableStartTimes, setAvailableStartTimes] = useState<string[]>([]);
    const [availableEndTimes, setAvailableEndTimes] = useState<string[]>([]);
    const [minSlot, setMinSlot] = useState(15);
    const [maxSlot, setMaxSlot] = useState(120);

    const [formData, setFormData] = useState<ScheduleFormData>({
        date: '',
        startTime: '',
        endTime: '',
        price: 0,
        maxPatients: 10,
        roomId: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Helper: Chuyển đổi ngày (giống backend)
    const getDayOfWeekNumber = (date: Date): number => {
        const day = date.getDay(); // 0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7
        if (day === 0) return 7;      // Chủ nhật -> 7
        if (day === 1) return 8;      // Thứ 2 -> 8
        return day + 1;               // T3->2, T4->3, T5->4, T6->5, T7->6
    };

    // Tạo danh sách giờ hợp lệ dựa trên cấu hình
    const generateTimeSlots = (config?: WorkingHoursResponse) => {
        // FALLBACK MẶC ĐỊNH
        let startTime = '07:30';
        let endTime = '17:00';
        let lunchStart: string | null = '12:00';
        let lunchEnd: string | null = '13:30';
        let minSlot = 15;
        let maxSlot = 120;

        if (config) {
            startTime = formatTimeOnly(config.startTime as unknown as number[]);
            endTime = formatTimeOnly(config.endTime as unknown as number[]);
            lunchStart = config.lunchStart ? formatTimeOnly(config.lunchStart as unknown as number[]) : null;
            lunchEnd = config.lunchEnd ? formatTimeOnly(config.lunchEnd as unknown as number[]) : null;
            minSlot = config.minSlotMinutes;
            maxSlot = config.maxSlotMinutes;
        }

        // Kiểm tra startTime < endTime
        if (startTime >= endTime) {
            console.error('Invalid time range:', startTime, endTime);
            setAvailableStartTimes([]);
            setAvailableEndTimes([]);
            return;
        }

        const slots: string[] = [];
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const lunchStartTime = lunchStart ? new Date(`2000-01-01T${lunchStart}`) : null;
        const lunchEndTime = lunchEnd ? new Date(`2000-01-01T${lunchEnd}`) : null;

        let current = new Date(start);
        let count = 0;
        const maxSlots = 50;

        while (current < end && count < maxSlots) {
            const timeStr = current.toTimeString().slice(0, 5);

            // Bỏ qua giờ nghỉ trưa
            if (lunchStartTime && lunchEndTime && current >= lunchStartTime && current < lunchEndTime) {
                current = new Date(lunchEndTime);
                continue;
            }

            slots.push(timeStr);
            current = new Date(current.getTime() + 30 * 60000);
            count++;
        }

        setAvailableStartTimes(slots);
        setAvailableEndTimes(slots);
        setMinSlot(minSlot);
        setMaxSlot(maxSlot);
    };

    // Lấy danh sách phòng + cấu hình giờ làm việc
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [roomsData, workingHoursData] = await Promise.all([
                    commonApi.getAvailableRooms(),
                    workingHoursApi.getHospitalWorkingHours().catch(() => [])
                ]);
                setRooms(roomsData);
                setWorkingHours(workingHoursData);
            } catch (error) {
                toast.error(t('schedule.loadRoomsError'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Khi chọn ngày, cập nhật danh sách giờ hợp lệ
    useEffect(() => {
        if (!formData.date || workingHours.length === 0) {
            setAvailableStartTimes([]);
            setAvailableEndTimes([]);
            return;
        }

        const selectedDate = new Date(formData.date);
        const dayOfWeek = getDayOfWeekNumber(selectedDate);
        const config = workingHours.find(w => w.dayOfWeek === dayOfWeek);

        generateTimeSlots(config);

        // Reset giờ nếu không còn hợp lệ
        if (formData.startTime && !availableStartTimes.includes(formData.startTime)) {
            setFormData(prev => ({ ...prev, startTime: '', endTime: '' }));
        }
    }, [formData.date, workingHours]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.date) {
            newErrors.date = t('schedule.requiredDate');
        } else {
            const selectedDate = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                newErrors.date = t('schedule.dateCannotBePast');
            }
        }

        if (!formData.startTime) {
            newErrors.startTime = t('schedule.requiredStartTime');
        }

        if (!formData.endTime) {
            newErrors.endTime = t('schedule.requiredEndTime');
        }

        if (formData.startTime && formData.endTime) {
            if (formData.startTime >= formData.endTime) {
                newErrors.endTime = t('schedule.endTimeAfterStartTime');
            }

            const start = new Date(`2000-01-01T${formData.startTime}`);
            const end = new Date(`2000-01-01T${formData.endTime}`);
            const diffMinutes = (end.getTime() - start.getTime()) / 60000;

            if (diffMinutes < minSlot) {
                newErrors.endTime = t('schedule.slotTooShort', { min: minSlot });
            }
            if (diffMinutes > maxSlot) {
                newErrors.endTime = t('schedule.slotTooLong', { max: maxSlot });
            }
        }

        if (formData.price <= 0) {
            newErrors.price = t('schedule.pricePositive');
        }

        if (formData.maxPatients < 1) {
            newErrors.maxPatients = t('schedule.maxPatientsPositive');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const { execute: createSchedule, loading: submitting } = useMinLoadingAction({
        minLoadingTime: 1000,
        successMessage: t('schedule.createSuccess'),
        errorMessage: (error) => error.response?.data?.message || t('schedule.createError'),
        onSuccess: () => {
            setTimeout(() => {
                navigate('/doctor/dashboard');
            }, 1500);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        await createSchedule(() => doctorApi.createSchedule(formData));
    };

    const handleChange = (field: keyof ScheduleFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Nếu đổi startTime, tự động gợi ý endTime (+30 phút)
        if (field === 'startTime' && typeof value === 'string' && value) {
            const nextSlot = new Date(`2000-01-01T${value}`);
            nextSlot.setMinutes(nextSlot.getMinutes() + 30);
            const nextTimeStr = nextSlot.toTimeString().slice(0, 5);
            if (availableEndTimes.includes(nextTimeStr)) {
                setFormData(prev => ({ ...prev, endTime: nextTimeStr }));
            }
        }
    };

    // timeOptions chỉ lấy giờ hợp lệ
    const startTimeOptions = availableStartTimes.map(time => ({ value: time, label: time }));
    const endTimeOptions = availableEndTimes
        .filter(time => !formData.startTime || time > formData.startTime)
        .map(time => ({ value: time, label: time }));

    const roomOptions = rooms.map(room => ({
        value: room.id,
        label: `${room.roomNumber} - ${room.building || ''} (${room.status === 'AVAILABLE' ? t('schedule.available') : t('schedule.occupied')})`
    }));

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6 max-w-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">📅</span>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {t('schedule.title')}
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">
                                {t('schedule.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Ngày khám */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t('schedule.date')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.date
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                    }`}
                            />
                            {errors.date && (
                                <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                            )}
                        </div>

                        {/* Giờ bắt đầu và kết thúc */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    {t('schedule.startTime')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.startTime}
                                    onChange={(e) => handleChange('startTime', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.startTime
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                        }`}
                                    disabled={availableStartTimes.length === 0}
                                >
                                    <option value="">{t('schedule.selectTime')}</option>
                                    {startTimeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.startTime && (
                                    <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    {t('schedule.endTime')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.endTime}
                                    onChange={(e) => handleChange('endTime', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.endTime
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                        }`}
                                    disabled={!formData.startTime || endTimeOptions.length === 0}
                                >
                                    <option value="">{t('schedule.selectTime')}</option>
                                    {endTimeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.endTime && (
                                    <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>
                                )}
                            </div>
                        </div>

                        {/* Giá khám và số lượng bệnh nhân */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label={t('schedule.price')}
                                type="number"
                                value={formData.price.toString()}
                                onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
                                error={errors.price}
                                required
                                min={0}
                            />

                            <Input
                                label={t('schedule.maxPatients')}
                                type="number"
                                value={formData.maxPatients.toString()}
                                onChange={(e) => handleChange('maxPatients', parseInt(e.target.value) || 1)}
                                error={errors.maxPatients}
                                required
                                min={1}
                            />
                        </div>

                        {/* Phòng khám */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t('schedule.room')}
                            </label>
                            <select
                                value={formData.roomId}
                                onChange={(e) => handleChange('roomId', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800"
                            >
                                <option value="">{t('schedule.selectRoom')}</option>
                                {roomOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">{t('schedule.roomNote')}</p>
                        </div>

                        {/* Cảnh báo + Lưu ý gộp chung */}
                        <div className="space-y-3">
                            {/* Cảnh báo không có khung giờ khả dụng */}
                            {formData.date && availableStartTimes.length === 0 && workingHours.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                                    <p className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                                        <span className="text-lg">⚠️</span>
                                        <span>{t('schedule.noAvailableSlots') || 'Không có khung giờ khả dụng trong ngày này. Vui lòng chọn ngày khác hoặc liên hệ quản lý bệnh viện để cập nhật giờ làm việc.'}</span>
                                    </p>
                                </div>
                            )}

                            {/* Lưu ý chung */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                                    <span className="text-lg">⚠️</span>
                                    <span>{t('schedule.note')}</span>
                                </p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" variant="primary" loading={submitting} className="flex-1">
                                📅 {t('schedule.submit')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateSchedulePage;