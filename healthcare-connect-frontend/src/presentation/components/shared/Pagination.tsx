import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import Button from './Button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    showJumpToPage?: boolean;        // Hiển thị ô nhập số trang
    showFirstLast?: boolean;         // Hiển thị nút First/Last
    showPrevNext?: boolean;          // Hiển thị nút Prev/Next
    showPageIndicator?: boolean;     // Hiển thị số trang hiện tại
    size?: 'sm' | 'md' | 'lg';       // Kích thước
    variant?: 'default' | 'simple';  // Kiểu hiển thị
    className?: string;
}

const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    showJumpToPage = true,
    showFirstLast = true,
    showPrevNext = true,
    showPageIndicator = true,
    size = 'md',
    variant = 'default',
    className = ''
}: PaginationProps) => {
    const { t } = useAppTranslation();
    const [jumpToPage, setJumpToPage] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    // 👉 KIỂM TRA KÍCH THƯỚC MÀN HÌNH
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (totalPages <= 1) return null;

    // Kích thước nút
    const sizeClasses = {
        sm: 'px-1.5 py-1 text-xs',
        md: 'px-2 py-1 text-sm',
        lg: 'px-3 py-2 text-base'
    };

    // NẾU LÀ MOBILE HOẶC VARIANT=SIMPLE -> HIỂN THỊ ĐƠN GIẢN
    if (isMobile || variant === 'simple') {
        return (
            <div className={`flex items-center justify-center gap-3 p-3 border-t border-gray-200 dark:border-gray-700 ${className}`}>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50"
                >
                    ←
                </button>
                <span className="text-sm font-medium">
                    {currentPage} / {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50"
                >
                    →
                </button>
            </div>
        );
    }

    return (
        <div className={`p-4 text-center border-t border-gray-200 dark:border-gray-700 ${className}`}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {/* Nút điều hướng */}
                <div className="flex items-center gap-1">
                    {/* First page */}
                    {showFirstLast && (
                        <Button
                            variant="outline"
                            size={size}
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                            className="px-2"
                            title={t('pagination.firstPage')}
                        >
                            ⏮
                        </Button>
                    )}

                    {/* Previous */}
                    {showPrevNext && (
                        <Button
                            variant="outline"
                            size={size}
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            title={t('pagination.previousPage')}
                        >
                            ← {t('common.previous')}
                        </Button>
                    )}

                    {/* Current page indicator */}
                    {showPageIndicator && (
                        <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-md font-medium mx-1">
                            {currentPage}
                        </span>
                    )}

                    {/* Next */}
                    {showPrevNext && (
                        <Button
                            variant="outline"
                            size={size}
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            title={t('pagination.nextPage')}
                        >
                            {t('common.next')} →
                        </Button>
                    )}

                    {/* Last page */}
                    {showFirstLast && (
                        <Button
                            variant="outline"
                            size={size}
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2"
                            title={t('pagination.lastPage')}
                        >
                            ⏭
                        </Button>
                    )}
                </div>

                {/* Jump to page */}
                {showJumpToPage && (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">|</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {t('pagination.goToPage')}
                            </span>
                            <input
                                type="number"
                                value={jumpToPage}
                                onChange={(e) => setJumpToPage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (() => {
                                    const pageNum = parseInt(jumpToPage);
                                    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                                        onPageChange(pageNum);
                                        setJumpToPage('');
                                    }
                                })()}
                                min={1}
                                max={totalPages}
                                className="w-16 px-2 py-1 text-center text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                                placeholder={t('pagination.pagePlaceholder')}
                            />
                            <Button
                                variant="outline"
                                size={size}
                                onClick={() => {
                                    const pageNum = parseInt(jumpToPage);
                                    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                                        onPageChange(pageNum);
                                        setJumpToPage('');
                                    }
                                }}
                                className="px-2"
                                title={t('pagination.jumpToPage')}
                            >
                                GO
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pagination;