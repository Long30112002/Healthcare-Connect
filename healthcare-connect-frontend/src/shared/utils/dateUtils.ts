/**
 * Định dạng mảng ngày tháng từ BE thành chuỗi hiển thị
 * @param dateArray Mảng số [year, month, day, hour, minute] từ BE
 * @param format Định dạng mong muốn (mặc định: 'dd/mm/yyyy HH:MM')
 * @returns Chuỗi ngày giờ đã định dạng
 * 
 * @example
 * formatDateTime([2026, 8, 10, 8, 30]) 
 * // "10/08/2026 08:30"
 * 
 * formatDateTime([2026, 8, 10, 8, 30], 'yyyy-mm-dd')
 * // "2026-08-10"
 */
export const formatDateTime = (
    dateArray: number[], 
    format: 'dd/mm/yyyy HH:MM' | 'dd/mm/yyyy' | 'yyyy-mm-dd' | 'HH:MM' = 'dd/mm/yyyy HH:MM'
): string => {
    if (!dateArray || dateArray.length < 5) return 'N/A';
    
    const [year, month, day, hour, minute] = dateArray;
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    switch (format) {
        case 'dd/mm/yyyy':
            return `${pad(day)}/${pad(month)}/${year}`;
        case 'yyyy-mm-dd':
            return `${year}-${pad(month)}-${pad(day)}`;
        case 'HH:MM':
            return `${pad(hour)}:${pad(minute)}`;
        default: // 'dd/mm/yyyy HH:MM'
            return `${pad(day)}/${pad(month)}/${year} ${pad(hour)}:${pad(minute)}`;
    }
};

/**
 * Format giá tiền sang VND
 */
export const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN') + 'đ';
};

/**
 * Lấy thời gian từ mảng [hour, minute]
 */
export const formatTimeOnly = (hour: number, minute: number): string => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};