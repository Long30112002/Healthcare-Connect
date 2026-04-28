import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import Button from '../../../presentation/components/shared/Button';
import Input from '../../../presentation/components/shared/Input';
import LoadingSpinner from '../../../presentation/components/shared/LoadingSpinner';
import { doctorApi } from '../../../infrastructure/api/doctorApi';
import { commonApi } from '../../../infrastructure/api/commonApi';
import toast from 'react-hot-toast';
import type { RoomResponse } from '../../../core/types/api.response';

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
    
    const [formData, setFormData] = useState<ScheduleFormData>({
        date: '',
        startTime: '',
        endTime: '',
        price: 0,
        maxPatients: 10,
        roomId: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Lấy danh sách phòng khám
    useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true);
            try {
                const roomsData = await commonApi.getAvailableRooms();
                setRooms(roomsData);
            } catch (error) {
                toast.error(t('schedule.loadRoomsError'));
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

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
        // Xóa lỗi của field đó khi người dùng sửa
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Tạo options cho thời gian (từ 00:00 đến 23:30, mỗi 30 phút)
    const timeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const hourStr = hour.toString().padStart(2, '0');
                const minuteStr = minute.toString().padStart(2, '0');
                const value = `${hourStr}:${minuteStr}`;
                options.push({ value, label: value });
            }
        }
        return options;
    };

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
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                                    errors.date 
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
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                                        errors.startTime 
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
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                                        errors.endTime 
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

                        {/* Lưu ý */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                                <span className="text-lg">⚠️</span>
                                <span>{t('schedule.note')}</span>
                            </p>
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