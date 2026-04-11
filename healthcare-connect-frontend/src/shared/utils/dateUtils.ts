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

// 👇 THÊM HÀM NÀY
/**
 * Định dạng ngày từ string ISO hoặc Date object sang định dạng tiếng Việt
 * @param dateString Chuỗi ngày (VD: "2026-05-15" hoặc "2026-05-15T00:00:00")
 * @param language Ngôn ngữ ('vi' hoặc 'en')
 * @returns Chuỗi ngày đã định dạng
 * 
 * @example
 * formatDateToVietnam("2026-05-15", 'vi') 
 * // "Ngày 15 tháng 5 năm 2026"
 * 
 * formatDateToVietnam("2026-05-15", 'en')
 * // "May 15, 2026"
 */
export const formatDateToVietnam = (dateString: string, language: 'vi' | 'en' = 'vi'): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    if (language === 'vi') {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `Ngày ${day} tháng ${month} năm ${year}`;
    }
    
    // Tiếng Anh
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

/**
 * Format ngày hiển thị ngắn gọn
 * @param dateString Chuỗi ngày
 * @param language Ngôn ngữ
 * @returns Chuỗi ngày ngắn
 * 
 * @example
 * formatDateShort("2026-05-15", 'vi') // "15/05/2026"
 * formatDateShort("2026-05-15", 'en') // "05/15/2026"
 */
export const formatDateShort = (dateString: string, language: 'vi' | 'en' = 'vi'): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    if (language === 'vi') {
        return `${day}/${month}/${year}`;
    }
    return `${month}/${day}/${year}`;
};