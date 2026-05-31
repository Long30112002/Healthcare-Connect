import { useEffect, useState } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useAuth } from '../../../application/context/AuthContext';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';
import { workingHoursApi } from '../../../infrastructure/api/workingHoursApi';
import toast from 'react-hot-toast';
import type { WorkingHoursResponse } from '../../../core/types/api.response';
import type { WorkingHoursRequest } from '../../../core/types/api.request';
import { formatTimeOnly } from '../../../shared/utils/dateUtils';

const DAYS = [
  { value: 8, label: 'Thứ 2', order: 1 },
  { value: 2, label: 'Thứ 3', order: 2 },
  { value: 3, label: 'Thứ 4', order: 3 },
  { value: 4, label: 'Thứ 5', order: 4 },
  { value: 5, label: 'Thứ 6', order: 5 },
  { value: 6, label: 'Thứ 7', order: 6 },
  { value: 7, label: 'Chủ nhật', order: 7 },
].sort((a, b) => a.order - b.order);

const TIME_OPTIONS = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      options.push(`${hourStr}:${minuteStr}`);
    }
  }
  return options;
};

const HospitalWorkingHoursPage = () => {
  const { t } = useAppTranslation();
  const { user } = useAuth();
  
  const [tableLoading, setTableLoading] = useState(true);
  const [workingHours, setWorkingHours] = useState<WorkingHoursResponse[]>([]);
  const [selectedDay, setSelectedDay] = useState<typeof DAYS[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<WorkingHoursRequest>({
    dayOfWeek: 0,
    startTime: '07:30',
    endTime: '17:00',
    lunchStart: '12:00',
    lunchEnd: '13:30',
    minSlotMinutes: 15,
    maxSlotMinutes: 120,
    isActive: true,
  });
  const [hasLunch, setHasLunch] = useState(true);

  const timeOptions = TIME_OPTIONS();

  // Lấy dữ liệu
  const fetchData = async () => {
    setTableLoading(true);
    try {
      const data = await workingHoursApi.getAllForManager();
      setWorkingHours(data);
    } catch (error) {
      toast.error(t('common.loadError'));
    } finally {
      setTableLoading(false);
    }
  };

  const getTimeOptionsInRange = (startTime: string, endTime: string) => {
    const options = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    let current = new Date(start);
    while (current <= end) {
      const hourStr = current.getHours().toString().padStart(2, '0');
      const minuteStr = current.getMinutes().toString().padStart(2, '0');
      options.push(`${hourStr}:${minuteStr}`);
      current.setMinutes(current.getMinutes() + 30);
    }
    return options;
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lấy config theo ngày
  const getConfigByDay = (dayValue: number): WorkingHoursResponse | undefined => {
    return workingHours.find(w => w.dayOfWeek === dayValue);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (day: typeof DAYS[0]) => {
    const config = getConfigByDay(day.value);
    setSelectedDay(day);

    if (config) {
      setFormData({
        dayOfWeek: config.dayOfWeek,
        startTime: formatTimeOnly(config.startTime as unknown as number[]),
        endTime: formatTimeOnly(config.endTime as unknown as number[]),
        lunchStart: config.lunchStart ? formatTimeOnly(config.lunchStart as unknown as number[]) : null,
        lunchEnd: config.lunchEnd ? formatTimeOnly(config.lunchEnd as unknown as number[]) : null,
        minSlotMinutes: config.minSlotMinutes,
        maxSlotMinutes: config.maxSlotMinutes,
        isActive: config.isActive,
      });
      setHasLunch(config.lunchStart !== null && config.lunchEnd !== null);
    } else {
      // Giá trị mặc định
      const isWeekend = day.value === 6 || day.value === 7;
      setFormData({
        dayOfWeek: day.value,
        startTime: isWeekend ? '07:30' : '07:30',
        endTime: isWeekend ? '12:00' : '17:00',
        lunchStart: isWeekend ? null : '12:00',
        lunchEnd: isWeekend ? null : '13:30',
        minSlotMinutes: 15,
        maxSlotMinutes: 120,
        isActive: true,
      });
      setHasLunch(!isWeekend);
    }
    setModalOpen(true);
  };

  // Lưu cấu hình
  const { execute: saveConfig, loading: saving } = useMinLoadingAction({
    minLoadingTime: 500,
    successMessage: t('workingHours.saveSuccess'),
    errorMessage: (error) => error.response?.data?.message || t('workingHours.saveError'),
    onSuccess: () => {
      setModalOpen(false);
      fetchData();
    },
  });

  const handleSave = async () => {
    // Validate
    if (formData.startTime >= formData.endTime) {
      toast.error(t('workingHours.invalidTime'));
      return;
    }
    if (hasLunch && formData.lunchStart && formData.lunchEnd) {
      if (formData.lunchStart >= formData.lunchEnd) {
        toast.error(t('workingHours.invalidLunch'));
        return;
      }
      if (formData.lunchStart < formData.startTime || formData.lunchEnd > formData.endTime) {
        toast.error(t('workingHours.lunchOutsideWorkingHours'));
        return;
      }
    }
    if (formData.minSlotMinutes >= formData.maxSlotMinutes) {
      toast.error(t('workingHours.invalidSlotDuration'));
      return;
    }

    const submitData = {
      ...formData,
      lunchStart: hasLunch ? formData.lunchStart : null,
      lunchEnd: hasLunch ? formData.lunchEnd : null,
    };

    await saveConfig(() => workingHoursApi.save(submitData));
  };

  // Xóa cấu hình
  const { execute: deleteConfig, loading: deleting } = useMinLoadingAction({
    minLoadingTime: 500,
    successMessage: t('workingHours.deleteSuccess'),
    errorMessage: t('common.error'),
    onSuccess: () => fetchData(),
  });

  const handleDelete = (dayValue: number) => {
    if (window.confirm(t('workingHours.deleteConfirm'))) {
      deleteConfig(() => workingHoursApi.delete(dayValue));
    }
  };

  // Reset mặc định
  const { execute: resetDefault, loading: resetting } = useMinLoadingAction({
    minLoadingTime: 500,
    successMessage: t('workingHours.resetSuccess'),
    errorMessage: t('common.error'),
    onSuccess: () => fetchData(),
  });

  const renderTableContent = () => {
    if (tableLoading) {
      return (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" text={t('common.loading')} />
        </div>
      );
    }

    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('workingHours.day')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('workingHours.startTime')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('workingHours.endTime')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('workingHours.lunchBreak')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('workingHours.slotDuration')}
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {DAYS.map((day) => {
                const config = getConfigByDay(day.value);
                const hasConfig = !!config;

                const startTime = config?.startTime
                  ? formatTimeOnly(config.startTime as unknown as number[])
                  : (day.value === 7 ? '08:00' : '07:30');

                const endTime = config?.endTime
                  ? formatTimeOnly(config.endTime as unknown as number[])
                  : (day.value === 6 ? '12:00' : day.value === 7 ? '11:00' : '17:00');

                const hasLunchBreak = config?.lunchStart && config?.lunchEnd;

                const lunchDisplay = hasLunchBreak
                  ? `${formatTimeOnly(config.lunchStart as unknown as number[])} - ${formatTimeOnly(config.lunchEnd as unknown as number[])}`
                  : t('workingHours.noLunchBreak');

                const slotDisplay = config
                  ? `${config.minSlotMinutes} - ${config.maxSlotMinutes} ${t('workingHours.minutes')}`
                  : `15 - 120 ${t('workingHours.minutes')}`;

                return (
                  <tr key={day.value} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {day.label}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {startTime}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {endTime}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {lunchDisplay}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {slotDisplay}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(day)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          title={t('common.edit')}
                        >
                          ✏️
                        </button>
                        {hasConfig && (
                          <button
                            onClick={() => handleDelete(day.value)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            title={t('common.delete')}
                            disabled={deleting}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header - LUÔN HIỂN THỊ */}
        <DashboardHeader
          icon="⏰"
          title={t('workingHours.title')}
          subtitle={t('workingHours.subtitle')}
          showHospital={true}
          hospitalName={user?.fullName?.includes('Manager') ? 'Bệnh viện của bạn' : ''}
        />

        {/* Note - LUÔN HIỂN THỊ */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>{t('workingHours.note')}</span>
          </p>
        </div>

        {/* Bảng giờ làm việc - CHỈ PHẦN NÀY LOADING */}
        {renderTableContent()}

        {/* Reset button - LUÔN HIỂN THỊ */}
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={() => resetDefault(() => workingHoursApi.resetToDefault())}
            loading={resetting}
          >
            🔄 {t('workingHours.resetDefault')}
          </Button>
        </div>
      </div>

      {/* Modal chỉnh sửa */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleSave}
        title={`${t('workingHours.edit')} - ${selectedDay?.label || ''}`}
        confirmText={t('common.save')}
        cancelText={t('common.cancel')}
        loading={saving}
      >
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('workingHours.startTime')}
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              >
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('workingHours.endTime')}
              </label>
              <select
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              >
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasLunch"
              checked={hasLunch}
              onChange={(e) => setHasLunch(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasLunch" className="text-sm text-gray-700 dark:text-gray-300">
              {t('workingHours.hasLunch')}
            </label>
          </div>

          {hasLunch && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('workingHours.lunchStart')}
                </label>
                <select
                  value={formData.lunchStart || '12:00'}
                  onChange={(e) => setFormData({ ...formData, lunchStart: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                >
                  {getTimeOptionsInRange(formData.startTime, formData.lunchEnd || '23:30').map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('workingHours.lunchEnd')}
                </label>
                <select
                  value={formData.lunchEnd || '13:30'}
                  onChange={(e) => setFormData({ ...formData, lunchEnd: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                >
                  {getTimeOptionsInRange(formData.lunchStart || '00:00', formData.endTime).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('workingHours.minSlot')} ({t('workingHours.minutes')})
              </label>
              <input
                type="number"
                value={formData.minSlotMinutes}
                onChange={(e) => setFormData({ ...formData, minSlotMinutes: parseInt(e.target.value) || 15 })}
                min={5}
                max={formData.maxSlotMinutes - 1}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('workingHours.maxSlot')} ({t('workingHours.minutes')})
              </label>
              <input
                type="number"
                value={formData.maxSlotMinutes}
                onChange={(e) => setFormData({ ...formData, maxSlotMinutes: parseInt(e.target.value) || 120 })}
                min={formData.minSlotMinutes + 1}
                max={240}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HospitalWorkingHoursPage;