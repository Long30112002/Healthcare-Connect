import React from 'react';
import StatusBadge from '../shared/StatusBadge';
import { formatDateTime, formatPrice } from '../../../shared/utils/dateUtils';
import type { Appointment } from '../../../core/types';

interface AppointmentCardProps {
    appointment: Appointment;
    warning?: React.ReactNode;
    actions: React.ReactNode;
    className?: string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment,
    warning,
    actions,
    className = ''
}) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                        👤 {appointment.patientName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        📅 {formatDateTime(appointment.startTime)} - {formatDateTime(appointment.endTime, 'HH:MM')}
                    </p>
                </div>
                <StatusBadge status={appointment.status} size="sm" showIcon={true} />
            </div>

            {/* Symptoms */}
            {appointment.symptoms && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    💬 {appointment.symptoms}
                </p>
            )}

            {/* Price */}
            <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-3">
                💰 {formatPrice(appointment.price)} • {appointment.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </p>

            <div className="flex justify-between items-center mt-3">
                {/* Warning bên trái */}
                {warning && <div>{warning}</div>}
                
                {/* Actions bên phải */}
                <div className="flex justify-end gap-2 ml-auto">
                    {actions}
                </div>
            </div>
        </div>
    );
};

export default AppointmentCard;