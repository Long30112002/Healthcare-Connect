import { AppointmentStatus } from '../../../core/constants/enums';
import { formatDateTime, formatPrice } from '../../../shared/utils/dateUtils';

interface Appointment {
    id: string;
    patientName: string;
    doctorName: string;
    hospitalName: string;
    specialtyName?: string;
    startTime: number[];
    endTime: number[];
    symptoms: string;
    status: AppointmentStatus;
    price: number;
    isPaid: boolean;
}

interface UpcomingAppointmentCardProps {
    appointment: Appointment;
    onPay?: (id: string) => void;
    onCancel?: (id: string) => void;
    onView?: (id: string) => void;
    payText?: string;
    cancelText?: string;
    detailText?: string;
    paidText?: string;
    unpaidText?: string;
}

const getStatusBadge = (status: AppointmentStatus) => {
    const statusMap: Record<AppointmentStatus, { color: string; text: string; bgLight: string }> = {
        [AppointmentStatus.AWAITING_PAYMENT]: { 
            color: 'text-yellow-700', 
            text: 'Chờ thanh toán',
            bgLight: 'bg-yellow-50'
        },
        [AppointmentStatus.CONFIRMED]: { 
            color: 'text-blue-700', 
            text: 'Đã xác nhận',
            bgLight: 'bg-blue-50'
        },
        [AppointmentStatus.IN_PROGRESS]: { 
            color: 'text-purple-700', 
            text: 'Đang khám',
            bgLight: 'bg-purple-50'
        },
        [AppointmentStatus.COMPLETED]: { 
            color: 'text-green-700', 
            text: 'Hoàn thành',
            bgLight: 'bg-green-50'
        },
        [AppointmentStatus.CANCELLED]: { 
            color: 'text-red-700', 
            text: 'Đã hủy',
            bgLight: 'bg-red-50'
        },
        [AppointmentStatus.RESCHEDULED]: { 
            color: 'text-orange-700', 
            text: 'Đã dời lịch',
            bgLight: 'bg-orange-50'
        },
        [AppointmentStatus.NO_SHOW]: { 
            color: 'text-gray-700', 
            text: 'Không đến',
            bgLight: 'bg-gray-50'
        },
    };
    return statusMap[status] || { color: 'text-gray-700', text: status, bgLight: 'bg-gray-50' };
};

const UpcomingAppointmentCard = ({ 
    appointment, 
    onPay, 
    onCancel, 
    onView,
    payText = 'Thanh toán',
    cancelText = 'Hủy lịch',
    detailText = 'Chi tiết',
    paidText = 'Đã thanh toán',
    unpaidText = 'Chưa thanh toán'
}: UpcomingAppointmentCardProps) => {
    const statusBadge = getStatusBadge(appointment.status);

    return (
        <div className={`p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${statusBadge.bgLight} dark:bg-gray-800 border border-gray-100 dark:border-gray-700`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">🏥</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {appointment.hospitalName}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge.bgLight} ${statusBadge.color} border border-current/20`}>
                            {statusBadge.text}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-gray-700 dark:text-gray-300">
                        <span>👨‍⚕️</span>
                        <span className="font-medium">{appointment.doctorName}</span>
                        {appointment.specialtyName && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                • {appointment.specialtyName}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span>{formatDateTime(appointment.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>💰</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                                {formatPrice(appointment.price)}
                            </span>
                            <span className="text-xs">
                                {appointment.isPaid ? `• ${paidText}` : `• ${unpaidText}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    {appointment.status === AppointmentStatus.AWAITING_PAYMENT && onPay && (
                        <button
                            onClick={() => onPay(appointment.id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
                        >
                            {payText}
                        </button>
                    )}
                    {appointment.status === AppointmentStatus.CONFIRMED && onCancel && (
                        <button
                            onClick={() => onCancel(appointment.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition shadow-sm"
                        >
                            {cancelText}
                        </button>
                    )}
                    {onView && (
                        <button
                            onClick={() => onView(appointment.id)}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition"
                        >
                            {detailText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpcomingAppointmentCard;