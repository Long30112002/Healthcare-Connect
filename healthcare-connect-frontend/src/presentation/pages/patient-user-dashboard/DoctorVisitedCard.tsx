import type { VisitedDoctor } from '../../../core/types';
import { getAvatarUrl, getSpecialtyIcon } from '../../../shared/utils/avatarUtils';

interface DoctorVisitedCardProps {
    doctor: VisitedDoctor;
    onBookAgain: (id: string) => void;
    bookAgainText?: string;
    yearsText?: string;
}

const DoctorVisitedCard = ({ 
    doctor, 
    onBookAgain,
    bookAgainText = 'Đặt lại lịch',
    yearsText = 'năm kinh nghiệm'
}: DoctorVisitedCardProps) => {
    const avatarUrl = doctor.avatar || getAvatarUrl(doctor.fullName, doctor.specialtyName);
    const specialtyIcon = getSpecialtyIcon(doctor.specialtyName);

    return (
        <div className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
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
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {doctor.fullName}
                        </h4>
                        <span className="text-sm">{specialtyIcon}</span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 truncate">
                        {doctor.specialtyName}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {doctor.experienceYears > 0 && (
                            <span>📅 {doctor.experienceYears} {yearsText}</span>
                        )}
                        {doctor.consultationFee && doctor.consultationFee > 0 && (
                            <span>💰 {doctor.consultationFee.toLocaleString('vi-VN')}đ</span>
                        )}
                        {doctor.rating > 0 && (
                            <span>⭐ {doctor.rating}</span>
                        )}
                    </div>
                </div>
                
                {/* Action */}
                <button
                    onClick={() => onBookAgain(doctor.id)}
                    className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg text-sm font-medium transition shadow-sm"
                >
                    {bookAgainText}
                </button>
            </div>
        </div>
    );
};

export default DoctorVisitedCard;