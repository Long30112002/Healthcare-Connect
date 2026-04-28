import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import Button from '../../../presentation/components/shared/Button';
import Input from '../../../presentation/components/shared/Input';
import LoadingSpinner from '../../../presentation/components/shared/LoadingSpinner';
import { doctorApi } from '../../../infrastructure/api/doctorApi';
import { commonApi } from '../../../infrastructure/api/commonApi';
import toast from 'react-hot-toast';
import type { RoomResponse } from '../../../core/types/api.response';
import { formatTimeOnly } from '../../../shared/utils/dateUtils';

interface ScheduleFormData {
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    maxPatients: number;
    roomId: string;
}

const ScheduleEditPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { t } = useAppTranslation();
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState<RoomResponse[]>([]);
    const [formData, setFormData] = useState<ScheduleFormData>({
        date: '',
        startTime: '',
        endTime: '',
        price: 0,
        maxPatients: 0,
        roomId: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [scheduleData, roomsData] = await Promise.all([
                    doctorApi.getScheduleDetail(id!),
                    commonApi.getAvailableRooms()
                ]);

                // formatDateArray để lấy ngày dạng YYYY-MM-DD
                let dateStr = '';
                if (scheduleData.date && Array.isArray(scheduleData.date)) {
                    const [year, month, day] = scheduleData.date;
                    dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                }

                // formatTimeOnly để lấy giờ:phút từ mảng [year,month,day,hour,minute]
                const startTimeStr = formatTimeOnly(scheduleData.startTime);
                const endTimeStr = formatTimeOnly(scheduleData.endTime);

                setFormData({
                    date: dateStr,
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    price: scheduleData.price,
                    maxPatients: scheduleData.maxPatients,
                    roomId: scheduleData.roomId || ''
                });
                setRooms(roomsData);
            } catch (error) {
                toast.error(t('common.loadError'));
                navigate('/my-schedule');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate, t]);

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

    const timeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const hourStr = hour.toString().padStart(2, '0');
                const minuteStr = minute.toString().padStart(2, '0');
                options.push({ value: `${hourStr}:${minuteStr}`, label: `${hourStr}:${minuteStr}` });
            }
        }
        return options;
    };

    const roomOptions = rooms.map(room => ({
        value: room.id,
        label: `${room.roomNumber} - ${room.building || ''} (${room.status === 'AVAILABLE' ? t('schedule.available') : t('schedule.occupied')})`
    }));

    const { execute: updateSchedule, loading: submitting } = useMinLoadingAction({
        minLoadingTime: 1000,
        successMessage: t('schedule.updateSuccess'),
        errorMessage: (error) => error.response?.data?.message || t('schedule.updateError'),
        onSuccess: () => {
            setTimeout(() => {
                navigate('/my-schedule');
            }, 1500);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        await updateSchedule(() => doctorApi.updateSchedule(id!, formData));
    };

    const handleChange = (field: keyof ScheduleFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6 max-w-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">✏️</span>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {t('scheduleEdit.title')}
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">
                                {t('scheduleEdit.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Date */}
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

                        {/* Start Time & End Time */}
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
                                >
                                    <option value="">{t('schedule.selectTime')}</option>
                                    {timeOptions().map(opt => (
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
                                >
                                    <option value="">{t('schedule.selectTime')}</option>
                                    {timeOptions().map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.endTime && (
                                    <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>
                                )}
                            </div>
                        </div>

                        {/* Price & Max Patients */}
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

                        {/* Room */}
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

                        {/* Note */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                                <span className="text-lg">⚠️</span>
                                <span>{t('schedule.editNote')}</span>
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" variant="primary" loading={submitting} className="flex-1">
                                💾 {t('common.save')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ScheduleEditPage;