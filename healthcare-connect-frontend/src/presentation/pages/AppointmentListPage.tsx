// import { useAuth } from '../../application/context/AuthContext';
import useFetch from '../../application/hooks/useFetch';
import DataWrapper from '../components/shared/DataWrapper';
import type { PaginatedResponse } from '../../core/types/api.response';
import { formatDateTime, formatPrice } from '../../shared/utils/dateUtils';
import { useAppTranslation } from '../../application/hooks/useAppTranslation';

interface Appointment {
    id: string;
    patientName: string;
    doctorName: string;
    hospitalName: string;
    startTime: number[];
    endTime: number[];
    symptoms: string;
    status: string;
    price: number;
    paid: boolean;
}

const AppointmentListPage = () => {
    // const { user } = useAuth();
    const { t, getStatus } = useAppTranslation();
    
    const { 
        data: appointmentsData, 
        loading, 
        error,
        execute: refreshAppointments 
    } = useFetch<PaginatedResponse<Appointment>>('/appointments/my-bookings', 'GET', {
        immediate: true,
    });

    const appointments = appointmentsData?.content ?? [];

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, string> = {
            'AWAITING_PAYMENT': 'bg-yellow-100 text-yellow-800',
            'CONFIRMED': 'bg-blue-100 text-blue-800',
            'IN_PROGRESS': 'bg-purple-100 text-purple-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('page.appointments.title')}
                </h2>
                <button
                    onClick={refreshAppointments}
                    className="text-primary hover:text-blue-700 text-sm"
                >
                    🔄 {t('common.refresh')}
                </button>
            </div>

            {appointmentsData && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {t('page.appointments.total')}: {appointmentsData.totalElements}
                </p>
            )}
            
            <DataWrapper
                loading={loading}
                error={error}
                data={appointments}
                onRetry={refreshAppointments}
                emptyMessage={t('page.appointments.empty')}
            >
                {(data) => (
                    <div className="space-y-3">
                        {data.map((apt) => (
                            <div key={apt.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            🏥 {apt.hospitalName}
                                        </p>
                                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                                            👨‍⚕️ {apt.doctorName}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            📅 {formatDateTime(apt.startTime)} - {formatDateTime(apt.endTime, 'HH:MM')}
                                        </p>
                                        {apt.symptoms && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                💬 {apt.symptoms}
                                            </p>
                                        )}
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                                            💰 {formatPrice(apt.price)}
                                            {apt.paid ? ' • Đã thanh toán' : ' • Chưa thanh toán'}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(apt.status)}`}>
                                        {getStatus(apt.status)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DataWrapper>
        </div>
    );
};

export default AppointmentListPage;