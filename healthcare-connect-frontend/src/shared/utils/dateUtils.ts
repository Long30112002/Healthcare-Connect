/**
 * Chuyển đổi đầu vào thành Date object
 * Hỗ trợ: string ISO, mảng [year, month, day, hour, minute], hoặc Date object
 */
const parseToDate = (input: string | number[] | Date): Date => {
    if (input instanceof Date) return input;
    
    if (Array.isArray(input)) {
        const [year, month, day, hour = 0, minute = 0] = input;
        return new Date(year, month - 1, day, hour, minute);
    }
    
    return new Date(input);
};

/**
 * Định dạng ngày giờ từ nhiều kiểu dữ liệu
 * @param input Mảng số [year, month, day, hour, minute] hoặc string ISO
 * @param format Định dạng mong muốn
 * @returns Chuỗi ngày giờ đã định dạng
 */
export const formatDateTime = (
    input: string | number[], 
    format: 'dd/mm/yyyy HH:MM' | 'dd/mm/yyyy' | 'yyyy-mm-dd' | 'HH:MM' | 'HH:MM:ss' | 'dd/MM/yyyy' = 'dd/mm/yyyy HH:MM'
): string => {
    if (!input) return 'N/A';
    
    const date = parseToDate(input);
    if (isNaN(date.getTime())) return 'N/A';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    
    switch (format) {
        case 'dd/mm/yyyy':
            return `${day}/${month}/${year}`;
        case 'dd/MM/yyyy':
            return `${day}/${month}/${year}`;
        case 'yyyy-mm-dd':
            return `${year}-${month}-${day}`;
        case 'HH:MM':
            return `${hour}:${minute}`;
        case 'HH:MM:ss':
            return `${hour}:${minute}:${second}`;
        default: // 'dd/mm/yyyy HH:MM'
            return `${day}/${month}/${year} ${hour}:${minute}`;
    }
};

/**
 * @param dateArray Mảng [year, month, day] hoặc [year, month, day, hour, minute]
 * @param format 'date' | 'datetime'
 * @returns Chuỗi ngày đã format
 */
export const formatDateArray = (
    dateArray: number[] | undefined, 
    format: 'date' | 'datetime' = 'date'
): string => {
    if (!dateArray || dateArray.length < 3) return '---';
    
    if (format === 'datetime' && dateArray.length >= 5) {
        const [year, month, day, hour, minute] = dateArray;
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    const [year, month, day] = dateArray;
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
};

/**
 * Format giá tiền sang VND
 */
export const formatPrice = (price: number): string => {
    if (!price && price !== 0) return '0đ';
    return price.toLocaleString('vi-VN') + 'đ';
};

/**
 * Lấy thời gian từ nhiều kiểu dữ liệu
 * Hỗ trợ: mảng [hour, minute], string ISO, hoặc 2 số riêng
 */
export const formatTimeOnly = (input: number | number[] | string, minute?: number): string => {
    // Trường hợp 1: input là mảng [year, month, day, hour, minute] (từ BE)
    if (Array.isArray(input) && input.length >= 5) {
        const hour = input[3];
        const min = input[4];
        return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    }
    
    // Trường hợp 2: input là mảng [hour, minute] (cũ)
    if (Array.isArray(input) && input.length === 2) {
        const [hour, min] = input;
        return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    }
    
    // Trường hợp 3: input là string ISO
    if (typeof input === 'string') {
        const date = new Date(input);
        if (!isNaN(date.getTime())) {
            const hour = date.getHours().toString().padStart(2, '0');
            const min = date.getMinutes().toString().padStart(2, '0');
            return `${hour}:${min}`;
        }
        return 'N/A';
    }
    
    // Trường hợp 4: input là hour (number), minute là number riêng
    if (typeof input === 'number' && minute !== undefined) {
        return `${input.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    return 'N/A';
};

/**
 * Định dạng ngày dạng "Ngày 15 tháng 5 năm 2026" (tiếng Việt)
 */
export const formatDateToVietnam = (input: string | number[], language: 'vi' | 'en' = 'vi'): string => {
    if (!input) return '';
    
    const date = parseToDate(input);
    if (isNaN(date.getTime())) return '';
    
    if (language === 'vi') {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `Ngày ${day} tháng ${month} năm ${year}`;
    }
    
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

/**
 * Format ngày ngắn gọn
 */
export const formatDateShort = (input: string | number[], language: 'vi' | 'en' = 'vi'): string => {
    if (!input) return '';
    
    const date = parseToDate(input);
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    if (language === 'vi') {
        return `${day}/${month}/${year}`;
    }
    return `${month}/${day}/${year}`;
};