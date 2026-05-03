import React from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import Button from '../../components/shared/Button';
import { getAvatarUrl, getSpecialtyIcon } from '../../../shared/utils/avatarUtils';
import { formatPrice } from '../../../shared/utils/dateUtils';
import type { VisitedDoctor } from '../../../core/types';

interface DoctorVisitedCardProps {
    doctor: VisitedDoctor;
    onBookAgain: (id: string) => void;
    bookAgainText?: string;
    yearsText?: string;
    showVisitCount?: boolean;
}

const DoctorVisitedCard: React.FC<DoctorVisitedCardProps> = ({
    doctor,
    onBookAgain,
    bookAgainText = 'Đặt lại lịch',
    yearsText = 'năm kinh nghiệm',
    showVisitCount = true
}) => {
    const { t } = useAppTranslation();
    const avatarUrl = getAvatarUrl(doctor.fullName, doctor.specialtyName);
    const specialtyIcon = getSpecialtyIcon(doctor.specialtyName);

    // Hiển thị số sao
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);

        return (
            <div className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="text-yellow-400 text-sm">★</span>
                ))}
                {hasHalfStar && (
                    <span className="text-yellow-400 text-sm">½</span>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="text-gray-300 dark:text-gray-600 text-sm">☆</span>
                ))}
            </div>
        );
    };

    return (
        <div className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <img
                        src={avatarUrl}
                        alt={doctor.fullName}
                        className="w-14 h-14 rounded-full object-cover shadow-md"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&background=0D8ABC&color=fff&bold=true`;
                        }}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {doctor.fullName}
                        </h4>
                        <span className="text-sm">{specialtyIcon}</span>
                    </div>
                    
                    <p className="text-sm text-blue-600 dark:text-blue-400 truncate">
                        {doctor.specialtyName}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-1">
                        {renderStars(doctor.rating)}
                        <span className="text-xs text-gray-500">
                            {doctor.rating.toFixed(1)}/5
                        </span>
                    </div>

                    {/* Experience & Price */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {doctor.experienceYears > 0 && (
                            <span className="flex items-center gap-1">
                                🎓 {doctor.experienceYears} {yearsText}
                            </span>
                        )}
                        {doctor.consultationFee && doctor.consultationFee > 0 && (
                            <span className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
                                💰 {formatPrice(doctor.consultationFee)}
                            </span>
                        )}
                    </div>

                    {/* Visit count (nếu có) */}
                    {showVisitCount && (doctor as any).visitCount && (
                        <div className="mt-2 text-xs text-gray-400">
                            📅 {t('visitedDoctors.visitedCount', { count: (doctor as any).visitCount })}
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <Button
                    onClick={() => onBookAgain(doctor.id)}
                    variant="primary"
                    size="sm"
                    className="flex-shrink-0"
                >
                    📅 {bookAgainText}
                </Button>
            </div>
        </div>
    );
};

export default DoctorVisitedCard;