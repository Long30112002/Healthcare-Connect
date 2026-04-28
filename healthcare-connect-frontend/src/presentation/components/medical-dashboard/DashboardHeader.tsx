import React from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import Button from '../shared/Button';

interface DashboardHeaderProps {
    icon: string;
    title: string;
    subtitle: string;
    showHospital?: boolean;
    hospitalName?: string;
    showCreateButton?: boolean;      
    onCreateClick?: () => void;      
    createButtonText?: string;       
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    icon,
    title,
    subtitle,
    showHospital = false,
    hospitalName,
    showCreateButton = false,
    onCreateClick,
    createButtonText
}) => {
    const { t } = useAppTranslation();

    return (
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex justify-between items-start sm:items-center flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">{icon}</span>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">
                            {title}
                        </h1>
                        <p className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1">
                            {subtitle}
                        </p>
                    </div>
                </div>
                
                {/* 🟢 Nút tạo mới */}
                {showCreateButton && onCreateClick && (
                    <Button
                        variant="primary"
                        onClick={onCreateClick}
                        className="bg-white/20 text-white hover:bg-white/30"
                    >
                        ➕ {createButtonText || t('common.create')}
                    </Button>
                )}
                
                {/* Thông tin bệnh viện */}
                {showHospital && hospitalName && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-4 sm:py-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-base sm:text-lg">🏥</span>
                            <div className="hidden xs:block">
                                <p className="text-[10px] sm:text-xs text-blue-100">
                                    {t('receptionist.currentHospital')}
                                </p>
                                <p className="text-xs sm:text-sm font-semibold text-white line-clamp-1 max-w-[120px] sm:max-w-[200px]">
                                    {hospitalName}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardHeader;